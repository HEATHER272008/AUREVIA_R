import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use ExchangeRate.host API for live exchange rates
    const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=USD,PHP,JPY,CAD,EUR');
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch exchange rates from API');
    }

    // Return the rates with timestamp
    return new Response(
      JSON.stringify({ rates: data.rates, timestamp: data.date }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
