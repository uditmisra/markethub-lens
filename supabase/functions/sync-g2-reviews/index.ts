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

    // Fetch reviews from G2 API using UUID
    const apiUrl = `https://data.g2.com/api/v2/products/${productUuid}/reviews?page=1&per_page=50`;
    console.log(`Fetching from G2 API: ${apiUrl}`);
    console.log(`Using API key: ${apiKey.substring(0, 8)}...`);
    
    const g2Response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`G2 API response status: ${g2Response.status} ${g2Response.statusText}`);
    
    if (!g2Response.ok) {
      const errorBody = await g2Response.text();
      console.error(`G2 API error response: ${errorBody}`);
      throw new Error(`G2 API error (${g2Response.status}): ${g2Response.statusText}. Response: ${errorBody}`);
    }

    const reviewsData = await g2Response.json();
    const reviews: G2Review[] = reviewsData.reviews || [];

    console.log(`Fetched ${reviews.length} reviews from G2`);

    let importedCount = 0;
    let skippedCount = 0;

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
            console.error(`Error inserting review ${review.id}:`, insertError);
          }
        } else {
          importedCount++;
        }
      } catch (error) {
        console.error(`Error processing review ${review.id}:`, error);
      }
    }

    // Update sync status to completed
    await supabase
      .from('integrations')
      .update({
        last_sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq('id', integrationId);

    console.log(`G2 sync completed: ${importedCount} imported, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: reviews.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
