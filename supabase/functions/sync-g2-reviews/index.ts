import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface G2Review {
  id: string;
  title: string;
  text: string;
  star_rating: number;
  user: {
    name?: string;
    company_name?: string;
  };
  url: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let integrationId: string | undefined;
  
  try {
    const body = await req.json();
    integrationId = body.integrationId;
    
    if (!integrationId) {
      throw new Error('Missing integrationId in request body');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get integration config
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    if (!integration.is_active) {
      return new Response(
        JSON.stringify({ message: 'Integration is not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update sync status to running
    await supabase
      .from('integrations')
      .update({ last_sync_status: 'running' })
      .eq('id', integrationId);

    // Get API key from config
    const apiKey = integration.config?.api_key;
    if (!apiKey) {
      throw new Error('G2 API key not configured. Please add your API key in the integration settings.');
    }

    // Get product UUID from config, or resolve from slug if needed
    let productUuid = integration.config?.product_uuid;
    const productSlug = integration.product_id;

    if (!productUuid) {
      console.log(`Product UUID not found in config, attempting to resolve slug: ${productSlug}`);
      
      // Call resolve-g2-product function to get UUID
      const resolveResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/resolve-g2-product`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productSlug, apiKey }),
        }
      );

      if (!resolveResponse.ok) {
        const errorText = await resolveResponse.text();
        throw new Error(`Failed to resolve product slug: ${errorText}`);
      }

      const resolveData = await resolveResponse.json();
      productUuid = resolveData.productUuid;
      
      // Cache the UUID back to integration config
      await supabase
        .from('integrations')
        .update({
          config: {
            ...integration.config,
            product_uuid: productUuid,
            product_slug: productSlug,
            product_name: resolveData.productName,
          },
        })
        .eq('id', integrationId);

      console.log(`Resolved and cached product UUID: ${productUuid}`);
    }
    
    console.log(`Starting G2 sync for product: ${productSlug} (UUID: ${productUuid})`);

    // Fetch reviews from G2 API using UUID with JSON:API pagination
    const pageNumber = 1;
    const pageSize = 50;
    const apiUrl = `https://data.g2.com/api/v2/products/${productUuid}/reviews?page[number]=${pageNumber}&page[size]=${pageSize}`;
    console.log(`Fetching from G2 API: ${apiUrl}`);
    console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
    
    const g2Response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
      },
    });

    console.log(`G2 API response status: ${g2Response.status} ${g2Response.statusText}`);
    
    if (!g2Response.ok) {
      const errorBody = await g2Response.text();
      console.error(`G2 API error response: ${errorBody}`);
      throw new Error(`G2 API error (${g2Response.status}): ${g2Response.statusText}. Response: ${errorBody}`);
    }

    const reviewsData = await g2Response.json();
    console.log(`G2 API raw response structure:`, JSON.stringify(reviewsData).substring(0, 500));
    
    // Parse JSON:API format response
    const items = Array.isArray(reviewsData.data) ? reviewsData.data : [];
    const reviews: G2Review[] = items.map((item: any) => {
      const attrs = item.attributes || {};
      
      return {
        id: item.id,
        title: attrs.title || attrs.slug || 'G2 Review',
        text: attrs.comment_answers?.value || attrs.answers?.overall_experience || '',
        star_rating: attrs.star_rating || 0,
        user: {
          name: attrs.user_name || undefined,
          company_name: attrs.user_current_company_name || undefined,
        },
        url: attrs.url || `https://www.g2.com/products/${productSlug}/reviews`,
        created_at: attrs.submitted_at || attrs.created_at || new Date().toISOString(),
      };
    });

    console.log(`Fetched ${reviews.length} reviews from G2`);

    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Transform and import each review
    for (const review of reviews) {
      try {
        const evidenceData = {
          customer_name: review.user?.name || 'Anonymous',
          company: review.user?.company_name || 'Not specified',
          email: 'imported@g2.com',
          job_title: null,
          evidence_type: 'review' as const,
          product: 'platform' as const, // Map to your product types
          title: review.title || review.text.substring(0, 100),
          content: review.text,
          results: `⭐ ${review.star_rating}/5 stars on G2`,
          use_cases: null,
          status: 'pending' as const,
          integration_source: 'g2',
          external_id: review.id,
          external_url: review.url,
          imported_at: new Date().toISOString(),
          created_by: integration.config?.created_by || null,
        };

        const { error: insertError } = await supabase
          .from('evidence')
          .insert(evidenceData);

        if (insertError) {
          if (insertError.code === '23505') {
            // Duplicate, skip
            skippedCount++;
            console.log(`Skipped duplicate review: ${review.id}`);
          } else {
            failedCount++;
            const errorMsg = `Review ${review.id}: ${insertError.message || 'Unknown error'}`;
            console.error(`Error inserting review ${review.id}:`, insertError);
            errors.push(errorMsg);
          }
        } else {
          importedCount++;
        }
      } catch (error) {
        failedCount++;
        const errorMsg = `Review ${review.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`Error processing review ${review.id}:`, error);
        errors.push(errorMsg);
      }
    }

    console.log(`G2 sync completed: ${importedCount} imported, ${skippedCount} skipped, ${failedCount} failed`);

    // Determine sync status based on results
    const syncStatus = importedCount === 0 && reviews.length > 0 ? 'failed' : 'completed';
    const syncError = syncStatus === 'failed' 
      ? `Failed to import any reviews. ${failedCount} errors occurred: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? '...' : ''}`
      : (failedCount > 0 ? `Partial success: ${failedCount} reviews failed to import` : null);

    // Update sync status with detailed metrics
    await supabase
      .from('integrations')
      .update({
        last_sync_status: syncStatus,
        last_sync_at: new Date().toISOString(),
        last_sync_error: syncError,
        last_sync_total: reviews.length,
        last_sync_imported: importedCount,
        last_sync_skipped: skippedCount,
        last_sync_failed: failedCount,
      })
      .eq('id', integrationId);

    return new Response(
      JSON.stringify({
        success: syncStatus === 'completed',
        message: syncStatus === 'completed' 
          ? `Successfully imported ${importedCount} reviews, skipped ${skippedCount} duplicates${failedCount > 0 ? `, ${failedCount} failed` : ''}`
          : `Sync failed: ${syncError}`,
        imported: importedCount,
        skipped: skippedCount,
        failed: failedCount,
        total: reviews.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: syncStatus === 'completed' ? 200 : 500,
      }
    );
  } catch (error) {
    console.error('Error in sync-g2-reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update sync status to failed using the stored integrationId
    if (integrationId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('integrations')
        .update({
          last_sync_status: 'failed',
          last_sync_error: errorMessage,
        })
        .eq('id', integrationId);
      
      console.log(`Updated sync status to failed for integration ${integrationId}`);
    } else {
      console.error('Cannot update sync status: integrationId not available');
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
