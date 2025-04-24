import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

interface BuffetCartProps {
  cart: InventoryItem[];
  removeFromCart: (item: InventoryItem) => void;
  ordering: boolean;
  orderSuccess: string | null;
  orderError: string | null;
  placeOrder: (pickupTime: string) => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

const BuffetCart: React.FC<BuffetCartProps> = ({ cart, removeFromCart, ordering, orderSuccess, orderError, placeOrder }) => {
  const [pickupHour, setPickupHour] = useState<string>("");
  const [pickupMinute, setPickupMinute] = useState<string>("");
  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  // Helper to get today's date in yyyy-mm-dd
  const today = new Date().toISOString().slice(0, 10);
  const isPickupValid = pickupHour !== "" && pickupMinute !== "";

  const handlePlaceOrder = () => {
    if (!isPickupValid) return;
    // Compose ISO string for today with selected hour and minute
    const pickupTime = `${today}T${pickupHour.padStart(2, "0")}:${pickupMinute.padStart(2, "0")}:00`;
    placeOrder(pickupTime);
  };

  return (
    <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 rounded-b-xl">
      <div className="flex items-center mb-4">
        <div className="p-2.5 rounded-lg mr-3 icon-bg">
          <FontAwesomeIcon icon={faShoppingCart} className="text-white text-lg" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
          Your Order Cart ({cart.length})
        </h2>
      </div>
      {cart.length > 0 ? (
        <div className="mb-5 space-y-2 max-h-48 overflow-y-auto pr-2">
          {cart.map(item => (
            <div key={item.uniqueId} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-gray-100">
              <span className="text-gray-800 text-sm">{item.name}</span>
              <span className="text-gray-700 text-sm ml-2">{item.price} Ft</span>
              <button
                onClick={() => removeFromCart(item)}
                className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-50"
                aria-label={`Remove ${item.name} from cart`}
              >
                <FontAwesomeIcon icon={faTrashAlt} size="sm" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 mb-5 text-sm text-center py-3 bg-white rounded border border-gray-100">Your cart is empty. Add items from the menu above.</p>
      )}
      {cart.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">{total} Ft</span>
          </div>
          {/* Stripe Payment Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Pay securely with card</label>
            <Elements stripe={stripePromise}>
              <StripePaymentForm total={total} cart={cart} onPaymentSuccess={handlePlaceOrder} ordering={ordering} />
            </Elements>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Pickup Time (Today)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={new Date().getHours()}
                max={23}
                className="w-16 p-2 border rounded"
                placeholder="HH"
                value={pickupHour}
                onChange={e => setPickupHour(e.target.value.replace(/[^0-9]/g, "").slice(0,2))}
              />
              <span className="self-center">:</span>
              <input
                type="number"
                min={0}
                max={59}
                className="w-16 p-2 border rounded"
                placeholder="MM"
                value={pickupMinute}
                onChange={e => setPickupMinute(e.target.value.replace(/[^0-9]/g, "").slice(0,2))}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-4">
        {orderSuccess && <div className="mb-3 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{orderSuccess}</div>}
        {orderError && <div className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{orderError}</div>}
        <button
          onClick={handlePlaceOrder}
          disabled={ordering || cart.length === 0 || !isPickupValid}
          className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
            (ordering || cart.length === 0 || !isPickupValid)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {ordering ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Placing Order...
            </div>
          ) : `Place Order (${cart.length} Item${cart.length !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  );
};

export default BuffetCart;
