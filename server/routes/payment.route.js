import express from "express";
import Stripe from "stripe";

const router = express.Router();

// ✅ initialize Stripe properly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // safe stable version
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Creating Stripe session..."); // debug log

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Premium Plan",
            },
            unit_amount: 50000, // ₹500
          },
          quantity: 1,
        },
      ],

      // ✅ VERY IMPORTANT
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    console.log("Stripe session created:", session.id);

    // ✅ send URL for redirect (NEW METHOD)
    res.status(200).json({
      id: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error("Stripe error:", error.message);

    res.status(500).json({
      error: "Payment session failed",
      details: error.message,
    });
  }
});

export default router;