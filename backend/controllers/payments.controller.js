import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    // Stripe expects amount in the smallest currency unit (e.g., cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // assuming amount is in HUF
      currency: "huf",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
