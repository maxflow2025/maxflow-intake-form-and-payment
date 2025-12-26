import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  try {
    const origin =
      req.headers.origin ||
      "https://maxflow-intake-form-and-payment.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Traffic Control Deposit",
              description: "Non-refundable mobilization & equipment deposit",
            },
            unit_amount: 104000,
          },
          quantity: 1,
        },
      ],
      metadata: {
        source: "maxflow-intake-form",
        deposit_type: "traffic-control",
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return res.status(500).json({
      error: "Failed to create Stripe Checkout session",
    });
  }
}
