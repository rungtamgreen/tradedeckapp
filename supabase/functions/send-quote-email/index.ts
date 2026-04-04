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

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
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
      Deno.env.get("SUPABASE_URL")!,
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email sending not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build accept URL
    const siteUrl = Deno.env.get("SUPABASE_URL")!.replace(".supabase.co", "");
    // Use the app's origin for the accept link
    const origin = req.headers.get("origin") || "https://tradedeckapp.lovable.app";
    const acceptUrl = `${origin}/accept-quote?token=${quote.accept_token}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#1e40af;border-radius:12px;padding:12px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;">JobDeck</span>
      </div>
    </div>
    
    <h1 style="font-size:24px;font-weight:700;color:#111827;margin:0 0 8px;">You've received a quote</h1>
    <p style="font-size:16px;color:#6b7280;margin:0 0 24px;">Hi ${quote.customers.name},</p>
    
    <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="font-size:14px;color:#6b7280;margin:0 0 4px;">Job description</p>
      <p style="font-size:16px;color:#111827;font-weight:600;margin:0 0 16px;">${quote.description}</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 4px;">Quoted price</p>
      <p style="font-size:32px;color:#111827;font-weight:700;margin:0;">£${Number(quote.price).toFixed(2)}</p>
    </div>
    
    <a href="${acceptUrl}" style="display:block;background:#16a34a;color:#ffffff;text-decoration:none;text-align:center;padding:16px 24px;border-radius:12px;font-size:18px;font-weight:700;margin-bottom:16px;">
      ✅ Accept Quote
    </a>
    
    <p style="font-size:13px;color:#9ca3af;text-align:center;">
      If you have questions, reply directly to your tradesperson.
    </p>
    
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;" />
    <p style="font-size:11px;color:#d1d5db;text-align:center;">Sent via JobDeck</p>
  </div>
</body>
</html>`;

    // Send via Lovable email API
    const emailRes = await fetch("https://api.lovable.dev/v1/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        to: customerEmail,
        subject: `Quote for: ${quote.description}`,
        html: emailHtml,
        purpose: "transactional",
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Email send failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email. Check email domain setup." }),
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
