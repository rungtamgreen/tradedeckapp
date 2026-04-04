import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { quoteId } = await req.json();
    if (!quoteId) {
      return new Response(JSON.stringify({ error: "Missing quoteId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch quote with customer
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*, customers(name, email)")
      .eq("id", quoteId)
      .eq("user_id", userId)
      .single();

    if (quoteError || !quote) {
      return new Response(JSON.stringify({ error: "Quote not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerEmail = quote.customers?.email;
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "Customer has no email address. Add their email first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build accept URL
    const origin = req.headers.get("origin") || "https://jobdeck.app";
    const acceptUrl = `${origin}/accept-quote?token=${quote.accept_token}`;

    // Send via the transactional email system (queue-based with retries)
    const { error: invokeError } = await supabase.functions.invoke(
      "send-transactional-email",
      {
        body: {
          templateName: "quote-confirmation",
          recipientEmail: customerEmail,
          idempotencyKey: `quote-confirm-${quoteId}`,
          templateData: {
            customerName: quote.customers.name,
            quoteDescription: quote.description,
            quoteAmount: `£${Number(quote.price).toFixed(2)}`,
            viewQuoteUrl: acceptUrl,
          },
        },
      }
    );

    if (invokeError) {
      console.error("Failed to send quote email:", invokeError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send quote error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
