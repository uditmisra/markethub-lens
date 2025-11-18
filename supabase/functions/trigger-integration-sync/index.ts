import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*')
      .eq('is_active', true);

    if (integrationsError) {
      throw integrationsError;
    }

    console.log(`Found ${integrations?.length || 0} active integrations`);

    const results = [];

    // Trigger sync for each integration
    for (const integration of integrations || []) {
      try {
        const functionName = integration.integration_type === 'g2' 
          ? 'sync-g2-reviews' 
          : 'sync-capterra-reviews';

        console.log(`Triggering ${functionName} for integration ${integration.id}`);

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: { integrationId: integration.id },
        });

        if (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error syncing ${integration.integration_type}:`, error);
          results.push({
            integrationId: integration.id,
            type: integration.integration_type,
            success: false,
            error: errorMessage,
          });
        } else {
          console.log(`Successfully synced ${integration.integration_type}:`, data);
          results.push({
            integrationId: integration.id,
            type: integration.integration_type,
            success: true,
            ...data,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing integration ${integration.id}:`, error);
        results.push({
          integrationId: integration.id,
          type: integration.integration_type,
          success: false,
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalIntegrations: integrations?.length || 0,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in trigger-integration-sync:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
