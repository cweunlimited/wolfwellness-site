// /api/stripe-webhook.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Resend (email)
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

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

      // Buyer email
      const email =
        session.customer_details?.email ||
        session.customer_email;

      if (!email) {
        console.warn("⚠️ No customer email found on session:", session.id);
        return res.status(200).json({ received: true });
      }

      const downloadUrl = process.env.DOWNLOAD_URL;

      // Send the email
      await resend.emails.send({
        from: "W.O.L.F. Wellness <support@wolfwellness.life>", // change if needed
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
