/**
 * TRINITY FAT LOSS - Send Notification Email Edge Function
 * Supabase Edge Function per l'invio di email di notifica
 */

// @ts-expect-error - Deno import in edge functions
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// @ts-expect-error - Deno global in edge functions
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  from?: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const emailData: EmailRequest = await req.json();

    if (!emailData.to || !emailData.subject || !emailData.htmlContent) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, htmlContent",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Default sender
    const fromEmail =
      emailData.from || "Trinity Fat Loss <noreply@trinity-fat-loss.com>";

    // TEMP: Test mode - log email instead of sending
    if (!RESEND_API_KEY || RESEND_API_KEY === "re_test_key") {
      console.log("📧 TEST MODE - Email would be sent:", {
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
      });

      return new Response(
        JSON.stringify({
          success: true,
          emailId: "test_email_id",
          message: "Email sent successfully (TEST MODE)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);

      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: errorData,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: result.id,
        message: "Email sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
