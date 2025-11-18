import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CapterraReview {
  id: string;
  title: string;
  review: string;
  rating: number;
  reviewer: {
    name?: string;
    company?: string;
    role?: string;
  };
  url: string;
  date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integrationId } = await req.json();
    
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
      throw new Error('API key not configured');
    }

    // Fetch reviews from Capterra API
    const capterraResponse = await fetch(
      `https://api.capterra.com/v1/products/${integration.product_id}/reviews?page=1&per_page=50`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!capterraResponse.ok) {
      throw new Error(`Capterra API error: ${capterraResponse.statusText}`);
    }

    const reviewsData = await capterraResponse.json();
    const reviews: CapterraReview[] = reviewsData.reviews || [];

    console.log(`Fetched ${reviews.length} reviews from Capterra`);

    let importedCount = 0;
    let skippedCount = 0;

    // Transform and import each review
    for (const review of reviews) {
      try {
        const evidenceData = {
          customer_name: review.reviewer?.name || 'Anonymous',
          company: review.reviewer?.company || 'Not specified',
          email: 'imported@capterra.com',
          job_title: review.reviewer?.role || null,
          evidence_type: 'review' as const,
          product: 'platform' as const, // Map to your product types
          title: review.title || review.review.substring(0, 100),
          content: review.review,
          results: `⭐ ${review.rating}/5 stars on Capterra`,
          use_cases: null,
          status: 'pending' as const,
          integration_source: 'capterra',
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

    console.log(`Capterra sync completed: ${importedCount} imported, ${skippedCount} skipped`);

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
    console.error('Error in sync-capterra-reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update sync status to failed
    const { integrationId } = await req.json().catch(() => ({}));
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
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
