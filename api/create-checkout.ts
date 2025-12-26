import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Allow only POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Safety check
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
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
            unit_amount: 104000, // $1,040.00
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

    return res.status(200).json({
      url: session.url,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);

    return res.status(500).json({
      error: "Failed to create Stripe Checkout session",
      details: error?.message || "Unknown error",
    });
  }
}
