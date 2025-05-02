import Stripe from "stripe";

// Load API key from environment variable or use fallback for development
const stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RHqKGEEXxREI3LsIHOwusnbJYYaHlRdrOmDVjA6xNJ8YK01grs1rUC6eJnI5F92AW9cnd9NRBHCVeZVbpzXK5yX00j0za9vm2';

const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2023-10-16",
});

const MINIMUM_AMOUNT = {
  huf: 175 // minimum amount in HUF
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "huf" } = req.body;
    const lowerCaseCurrency = currency.toLowerCase();
    
    // Check minimum amount - amount is already in the main currency unit
    if (lowerCaseCurrency === 'huf' && amount < MINIMUM_AMOUNT.huf) {
      return res.status(400).json({ 
        error: `Amount must be at least ${MINIMUM_AMOUNT.huf}.00 Ft for HUF currency` 
      });
    }

    // Convert amount to smallest currency unit (fillér for HUF)
    const amountInSmallestUnit = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: lowerCaseCurrency,
      payment_method_types: ["card"],
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a function to retrieve payment intent info for debugging
export const getPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required" });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(404).json({ 
      error: error.message,
      type: error.type,
      code: error.code
    });
  }
};

// Add a function to refresh an expired payment intent
export const refreshPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment Intent ID is required" });
    }
    
    // First try to retrieve the payment intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (retrieveError) {
      // If not found or expired, create a new one with the same parameters
      const { amount, currency = "huf" } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: "Amount is required to create a new payment intent" });
      }
      
      const amountInSmallestUnit = Math.round(amount * 100);
      
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        payment_method_types: ["card"],
      });
      
      return res.json({ 
        refreshed: true, 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    }
    
    // If payment intent exists but can be updated
    if (paymentIntent.status === 'requires_payment_method' || 
        paymentIntent.status === 'requires_confirmation') {
      // Update the expiration time
      const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {});
      
      return res.json({ 
        refreshed: true, 
        clientSecret: updatedIntent.client_secret,
        paymentIntentId: updatedIntent.id
      });
    }
    
    // If payment intent is in a state that cannot be modified
    return res.json({ 
      refreshed: false,
      message: "Cannot refresh payment intent in current state",
      status: paymentIntent.status
    });
    
  } catch (error) {
    console.error('Refresh payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add Stripe Checkout session creation
export const createCheckoutSession = async (req, res) => {
  try {
    const { cart, currency = "huf", successUrl, cancelUrl } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is required and cannot be empty" });
    }
    // Map cart items to Stripe line items
    const line_items = cart.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));
    // Fallback URLs if not provided
    const defaultSuccess = "http://localhost:5173/payment-success";
    const defaultCancel = "http://localhost:5173/payment-cancel";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl || defaultSuccess,
      cancel_url: cancelUrl || defaultCancel,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};
