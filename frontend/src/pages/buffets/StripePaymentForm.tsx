import React, { useState, useEffect } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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
  currency = "HUF",
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
  const [cardCvcError, setCardCvcError] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);

  // Check if Stripe is initialized
  useEffect(() => {
    setIsClientReady(!!stripe && !!elements);
  }, [stripe, elements]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCardNumberChange = (event: any) => {
    setCardNumberComplete(event.complete);
    setCardNumberError(event.error ? event.error.message : null);
  };

  const handleCardExpiryChange = (event: any) => {
    setCardExpiryComplete(event.complete);
    setCardExpiryError(event.error ? event.error.message : null);
  };

  const handleCardCvcChange = (event: any) => {
    setCardCvcComplete(event.complete);
    setCardCvcError(event.error ? event.error.message : null);
  };

  const allCardFieldsComplete =
    cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !allCardFieldsComplete) {
      setError("Please complete all card details before proceeding");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Always create a new PaymentIntent right before confirmation
      const response = await fetch(
        "http://localhost:3000/api/payments/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            amount: total,
            currency: currency.toLowerCase(),
            cart: cart.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: 1, // Assuming quantity is always 1 per cart item for payment intent
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const clientSecret = data.clientSecret;

      if (!clientSecret) {
        console.error("Backend did not return a client secret.", data); // Log the response data
        throw new Error(
          "Failed to retrieve payment client secret from server."
        );
      }

      console.log("Received clientSecret:", clientSecret); // Log the client secret

      // Confirm card payment with the newly obtained client secret
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error("Card number element not found");
      }

      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            // Add billing details if needed/collected
          },
        },
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message || "Payment failed");
      }

      if (paymentResult.paymentIntent?.status === "succeeded") {
        onPaymentSuccess();
      } else {
        throw new Error(
          `Payment status: ${paymentResult.paymentIntent?.status || "unknown"}`
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Payment processing error";
      console.error("Payment error:", err);
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
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kártyaadatok
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Kártyaszám</label>
            <div className="p-2 rounded-md bg-white">
              <CardNumberElement
                options={CARD_ELEMENT_OPTIONS}
                onChange={handleCardNumberChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all hover:border-[var(--primary)]"
                />
            </div>
            {cardNumberError && (
              <div className="text-red-600 text-xs mt-1">{cardNumberError}</div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-600">Lejárat</label>
              <div className="p-2 rounded-md bg-white">
                <CardExpiryElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardExpiryChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all hover:border-[var(--primary)]"
                />
              </div>
              {cardExpiryError && (
                <div className="text-red-600 text-xs mt-1">
                  {cardExpiryError}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600">CVC</label>
              <div className="p-2 rounded-md bg-white">
                <CardCvcElement
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardCvcChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all hover:border-[var(--primary)]"
                />
              </div>
              {cardCvcError && (
                <div className="text-red-600 text-xs mt-1">{cardCvcError}</div>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center py-2 border-t border-gray-200">
        <span className="font-medium">Végösszeg:</span>
        <span className="font-bold text-lg">{formatCurrency(total)}</span>
      </div>

      <button
        type="submit"
        disabled={
          !isClientReady || ordering || processing || !allCardFieldsComplete
        }
        className="w-full px-4 py-3 bg-primary text-white rounded-md font-medium transition-colors cursor-pointer
                 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label={
          processing ? "Processing payment" : `Pay ${formatCurrency(total)}`
        }
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Feldolgozás...
          </span>
        ) : (
          `Fizetés (${formatCurrency(total)})`
        )}
      </button>

      <div className="mt-2 flex justify-center text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Biztonságos fizetés SSL-titkosítással</span>
        </div>
      </div>
    </form>
  );
};

export default StripePaymentForm;
