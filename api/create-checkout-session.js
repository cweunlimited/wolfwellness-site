import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

export default async function handler(req, res) {
  try {
    const baseUrl = process.env.BASE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/reset.html?canceled=1`,
      allow_promotion_codes: false,
      billing_address_collection: "auto",
    });

    // Redirect customer to Stripe Checkout
    res.writeHead(303, { Location: session.url });
    res.end();
  } catch (err) {
    res.status(500).send(`Checkout error: ${err.message}`);
  }
}
