import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface G2Product {
  id: string;
  type: string;
  attributes: {
    name: string;
    slug: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productSlug, apiKey } = await req.json();

    if (!productSlug || !apiKey) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing productSlug or apiKey' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Resolving G2 product slug: ${productSlug}`);

    // Call G2 API to search for product by slug
    const apiUrl = `https://data.g2.com/api/v2/products?filter[slug]=${encodeURIComponent(productSlug)}`;
    console.log(`Fetching from G2 API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`G2 API error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key or insufficient permissions' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `G2 API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`G2 API response:`, JSON.stringify(data, null, 2));

    if (!data.data || data.data.length === 0) {
      console.error(`No product found with slug: ${productSlug}`);
      return new Response(
        JSON.stringify({ error: `Product not found with slug: ${productSlug}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const product = data.data[0] as G2Product;
    const productUuid = product.id;
    const productName = product.attributes.name;

    console.log(`Successfully resolved product: ${productName} (UUID: ${productUuid})`);

    return new Response(
      JSON.stringify({ 
        productUuid, 
        productSlug: product.attributes.slug,
        productName 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in resolve-g2-product function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
