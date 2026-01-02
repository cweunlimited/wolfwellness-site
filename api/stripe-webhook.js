// /api/stripe-webhook.js
const Stripe = require("stripe");
const crypto = require("crypto");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Resend (email)
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Helpers ---
function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function sendMetaCapiPurchase({ session, req }) {
  const pixelId = process.env.META_PIXEL_ID; // e.g. "1542150893596407" (often same as Pixel ID)
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN; // Generate in Events Manager (Conversions API)
  if (!pixelId || !accessToken) {
    console.warn("⚠️ Meta CAPI not configured: missing META_PIXEL_ID or META_CAPI_ACCESS_TOKEN");
    return;
  }

  // Only send if we have an email (best match quality)
  const email =
    session.customer_details?.email ||
    session.customer_email;

  if (!email) {
    console.warn("⚠️ No email on session, skipping CAPI:", session.id);
    return;
  }

  // Stripe amounts are usually in cents
  const value = typeof session.amount_total === "number" ? session.amount_total / 100 : 49.00;
  const currency = (session.currency || "usd").toUpperCase();

  // Event ID MUST match browser Pixel eventID for dedup
  const eventId = session.id; // "cs_..."

  // Best-effort client info (improves match quality)
  const ip =
    (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    undefined;

  const userAgent = req.headers["user-agent"] || undefined;

  // Required/commonly recommended fields per Meta docs
  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: event.created,
        action_source: "website",
        event_id: eventId,
        event_source_url: `${process.env.SITE_URL || "https://wolfwellness.life"}/success.html?session_id=${encodeURIComponent(session.id)}`,
        user_data: {
          em: [sha256(normalizeEmail(email))],
          client_ip_address: ip,
          client_user_agent: userAgent,
        },
        custom_data: {
          currency,
          value,
          content_name: "7-Day Executive Reset",
        },
      },
    ],
  };

  // Optional: Test Event Code (ONLY for testing inside Events Manager Test Events)
  // If you set this env var, Meta will show the server event in "Test Events".
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    console.error("❌ Meta CAPI error:", resp.status, json);
  } else {
    console.log("✅ Meta CAPI Purchase sent:", { session: session.id, meta: json });
  }
}

// IMPORTANT for Stripe webhooks on Vercel:
// We must read the RAW body to verify the signature
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let event;

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks);

    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // We only care about successful checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Stripe Checkout completed doesn’t always mean paid for async methods.
      // For typical card payments it will be "paid".
      if (session.payment_status && session.payment_status !== "paid") {
        console.log("ℹ️ checkout.session.completed but not paid yet:", session.id, session.payment_status);
        return res.status(200).json({ received: true });
      }

      // 1) Send Meta CAPI Purchase (server-side)
      await sendMetaCapiPurchase({ session, req });

      // 2) Send the email (your existing logic)
      const email =
        session.customer_details?.email ||
        session.customer_email;

      if (!email) {
        console.warn("⚠️ No customer email found on session:", session.id);
        return res.status(200).json({ received: true });
      }

      const downloadUrl = process.env.DOWNLOAD_URL;

      await resend.emails.send({
        from: "W.O.L.F. Wellness <support@wolfwellness.life>",
        to: email,
        subject: "Your 7-Day Executive Reset Download",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Your download is ready</h2>
            <p>Thanks for your purchase — here’s your instant download link:</p>
            <p><a href="${downloadUrl}" target="_blank" rel="noreferrer">${downloadUrl}</a></p>
            <p><strong>Tip:</strong> Bookmark the link so you can access it anytime.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">
              If you have any issues, reply to this email and we’ll help you.
            </p>
          </div>
        `,
      });

      console.log("✅ Download email sent to:", email);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return res.status(500).send("Webhook handler failed.");
  }
};
