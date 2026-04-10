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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller's identity using the anon-key client with the user's token
    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { quoteId } = await req.json();
    if (!quoteId) {
      return new Response(JSON.stringify({ error: "Missing quoteId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    // Fetch business profile
    const { data: profile } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const bp = profile || {};

    // Build logo URL if exists
    let businessLogo = '';
    if (bp.logo_url) {
      businessLogo = bp.logo_url;
    }

    // Format expiry date
    let expiryDate = '';
    if (quote.expires_at) {
      expiryDate = new Date(quote.expires_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    }

    // Build accept URL
    const origin = req.headers.get("origin") || "https://jobdeck.app";
    const acceptUrl = `${origin}/accept-quote?token=${quote.accept_token}`;

    // Build template data
    const templateData: Record<string, any> = {
      customerName: quote.customers.name,
      quoteDescription: quote.description,
      quoteAmount: `£${Number(quote.price).toFixed(2)}`,
      viewQuoteUrl: acceptUrl,
      businessName: bp.business_name || '',
      businessAddress: bp.address || '',
      businessPhone: bp.phone || '',
      businessEmail: bp.email || '',
      businessLogo,
      defaultQuoteNotes: bp.default_quote_notes || '',
      expiryDate,
    };
    if (bp.vat_number) {
      templateData.vatNumber = bp.vat_number;
    }

    // Helper to call send-transactional-email via direct fetch
    async function sendEmail(body: Record<string, any>) {
      const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": anonKey,
        },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("send-transactional-email failed:", resp.status, text);
        throw new Error(`Email send failed: ${resp.status}`);
      }
      return resp.json();
    }

    // Send quote email to customer
    await sendEmail({
      templateName: "quote-confirmation",
      recipientEmail: customerEmail,
      idempotencyKey: `quote-confirm-${quoteId}`,
      templateData,
    });

    // Notify tradesperson if preference is on
    if (bp.notify_quote_accepted !== false) {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      const tradeEmail = bp.email || authUser?.user?.email;
      if (tradeEmail) {
        try {
          await sendEmail({
            templateName: "quote-sent-notification",
            recipientEmail: tradeEmail,
            idempotencyKey: `quote-sent-notif-${quoteId}`,
            templateData: {
              customerName: quote.customers.name,
              quoteDescription: quote.description,
              quoteAmount: `£${Number(quote.price).toFixed(2)}`,
            },
          });
        } catch (e) {
          console.error("Failed to send tradesperson notification:", e);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send quote error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
