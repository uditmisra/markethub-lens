import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GartnerReview {
  reviewer_name: string;
  company: string;
  job_title?: string;
  rating: number;
  title: string;
  content: string;
  date?: string;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'gartner_' + Math.abs(hash).toString(36);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let integrationId: string | undefined;

  try {
    const body = await req.json();
    integrationId = body.integrationId;
    const reviews: GartnerReview[] = body.reviews;

    if (!integrationId) {
      throw new Error('Missing integrationId');
    }
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      throw new Error('No reviews provided');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // Update sync status to running
    await supabase
      .from('integrations')
      .update({ last_sync_status: 'running' })
      .eq('id', integrationId);

    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const review of reviews) {
      try {
        const externalId = hashString(
          `${review.reviewer_name}_${review.title}_${review.date || ''}`
        );

        const evidenceData = {
          customer_name: review.reviewer_name || 'Anonymous',
          company: review.company || 'Not specified',
          email: 'imported@gartner.com',
          job_title: review.job_title || null,
          evidence_type: 'review' as const,
          product: 'platform' as const,
          title: review.title || 'Gartner Peer Insights Review',
          content: review.content,
          results: `⭐ ${review.rating}/5 stars on Gartner Peer Insights`,
          status: 'pending' as const,
          integration_source: 'gartner',
          external_id: externalId,
          imported_at: new Date().toISOString(),
          created_by: integration.config?.created_by || null,
          rating: review.rating,
          review_date: review.date || null,
        };

        const { error: insertError } = await supabase
          .from('evidence')
          .insert(evidenceData);

        if (insertError) {
          if (insertError.code === '23505') {
            skippedCount++;
          } else {
            failedCount++;
            errors.push(`${review.title}: ${insertError.message}`);
          }
        } else {
          importedCount++;
        }
      } catch (error) {
        failedCount++;
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    const syncStatus = importedCount === 0 && reviews.length > 0 ? 'failed' : 'completed';
    const syncError = syncStatus === 'failed'
      ? `Failed to import: ${errors.slice(0, 3).join('; ')}`
      : (failedCount > 0 ? `Partial: ${failedCount} failed` : null);

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
        message: `Imported ${importedCount}, skipped ${skippedCount}, failed ${failedCount}`,
        imported: importedCount,
        skipped: skippedCount,
        failed: failedCount,
        total: reviews.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in import-gartner-reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (integrationId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await supabase
        .from('integrations')
        .update({ last_sync_status: 'failed', last_sync_error: errorMessage })
        .eq('id', integrationId);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
