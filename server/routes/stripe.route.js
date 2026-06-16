import express from "express";
import Stripe from "stripe";
import { db } from "../libs/dbConnect.js";
import { ObjectId } from "mongodb";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const collection = db.collection("users");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;

      console.log("Payment success for user:", userId);

      await collection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            isPremium: true,
            premiumActivatedAt: new Date(),
          },
        }
      );
    }

    res.json({ received: true });
  }
);

export default router;