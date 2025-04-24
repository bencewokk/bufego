import React, { useState } from "react";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { InventoryItem } from "../../types";

interface StripePaymentFormProps {
  total: number;
  cart: InventoryItem[];
  onPaymentSuccess: () => void;
  ordering: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ total, cart, onPaymentSuccess, ordering }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      // Call backend to create PaymentIntent
      const res = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          cart: cart.map(item => ({ name: item.name, price: item.price })),
        })
      });
      const { clientSecret } = await res.json();
      if (!clientSecret) throw new Error("No client secret returned");
      // Confirm card payment
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement! }
      });
      if (result.error) {
        setError(result.error.message || "Payment failed");
        setProcessing(false);
        return;
      }
      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        onPaymentSuccess();
      } else {
        setError("Payment not successful");
      }
    } catch (err: any) {
      setError(err.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <CardElement options={{ hidePostalCode: true }} className="p-2 border rounded bg-white" />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || ordering || processing}
        className="w-full px-4 py-2 bg-primary text-white rounded mt-2 disabled:bg-gray-400"
      >
        {processing ? "Processing..." : `Fizetés ${total} Ft`}
      </button>
    </form>
  );
};

export default StripePaymentForm;
