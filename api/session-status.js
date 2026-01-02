import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
    status: session.status,                 // "complete" or "open"
    payment_status: session.payment_status, // "paid" when successful
    customer_email: session.customer_details?.email || null,

    // ✅ add these so success.html can use Stripe's real price
    amount_total: session.amount_total ?? null, // cents
    currency: session.currency ?? null          // e.g. "usd"
  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
