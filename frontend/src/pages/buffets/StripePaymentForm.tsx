import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { InventoryItem } from "../../types";

interface StripePaymentFormProps {
  total: number;
  cart: InventoryItem[];
  onPaymentSuccess: () => void;
  onPaymentError?: (error: string) => void;
  ordering: boolean;
  currency?: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  total,
  cart,
  onPaymentSuccess,
  onPaymentError,
  ordering,
  currency = "HUF"
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  // Check if Stripe is initialized
  useEffect(() => {
    setIsClientReady(!!stripe && !!elements);
  }, [stripe, elements]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!stripe || !elements || !cardComplete) {
      setError("Please complete card details before proceeding");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Call backend to create PaymentIntent
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          amount: total,
          currency: currency.toLowerCase(),
          // Backend expects an array of items with name, price, and optional quantity
          cart: cart.map(item => ({ 
            name: item.name, 
            price: item.price,
            quantity: 1
          })),
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const { clientSecret } = await response.json();
      if (!clientSecret) throw new Error("No client secret returned");

      // Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { 
          card: cardElement,
          billing_details: {
            // You could collect these from the user if needed
            // name: billingName
          }
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message || "Payment failed");
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        onPaymentSuccess();
      } else {
        throw new Error(`Payment status: ${paymentResult.paymentIntent?.status || "unknown"}`);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Payment processing error";
      setError(errorMessage);
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
          Kártyaadatok
        </label>
        <div className="p-3 border rounded-md bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <CardElement 
            id="card-element"
            options={CARD_ELEMENT_OPTIONS} 
            onChange={handleCardChange}
            className="w-full" 
          />
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center py-2 border-t border-gray-200">
        <span className="font-medium">Végösszeg:</span>
        <span className="font-bold text-lg">{formatCurrency(total)}</span>
      </div>

      <button
        type="submit"
        disabled={!isClientReady || ordering || processing || !cardComplete}
        className="w-full px-4 py-3 bg-primary text-white rounded-md font-medium transition-colors 
                 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label={processing ? "Processing payment" : `Pay ${formatCurrency(total)}`}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Feldolgozás...
          </span>
        ) : (
          `Fizetés (${formatCurrency(total)})`
        )}
      </button>

      <div className="mt-2 flex justify-center text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Biztonságos fizetés SSL-titkosítással</span>
        </div>
      </div>
    </form>
  );
};

export default StripePaymentForm;
