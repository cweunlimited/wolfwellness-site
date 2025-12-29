import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).send("Missing session_id");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(403).send("Payment not verified.");
    }

    // If paid, redirect to the Drive direct download URL
    res.writeHead(302, { Location: process.env.DRIVE_DIRECT_URL });
    res.end();
  } catch (err) {
    res.status(500).send(err.message);
  }
}
