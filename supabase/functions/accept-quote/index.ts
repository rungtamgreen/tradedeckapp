import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find quote by accept_token
    const { data: quote, error: findError } = await supabase
      .from("quotes")
      .select("*, customers(name, email)")
      .eq("accept_token", token)
      .single();

    if (findError || !quote) {
      return new Response(
        JSON.stringify({ error: "Quote not found or invalid link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (quote.status === "accepted") {
      return new Response(
        JSON.stringify({ success: true, already: true, quote }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (quote.status === "declined") {
      return new Response(
        JSON.stringify({ error: "This quote has been declined" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update quote status
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: "accepted" })
      .eq("id", quote.id);

    if (updateError) throw updateError;

    // Create job from quote
    const { error: jobError } = await supabase.from("jobs").insert({
      user_id: quote.user_id,
      customer_id: quote.customer_id,
      quote_id: quote.id,
      description: quote.description,
      price: quote.price,
      status: "scheduled",
    });

    if (jobError) throw jobError;

    return new Response(
      JSON.stringify({ success: true, quote }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Accept quote error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
