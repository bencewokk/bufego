import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";

interface BuffetCartProps {
  cart: InventoryItem[];
  removeFromCart: (item: InventoryItem) => void;
  ordering: boolean;
  orderSuccess: string | null;
  orderError: string | null;
  placeOrder: () => void;
}

const BuffetCart: React.FC<BuffetCartProps> = ({ cart, removeFromCart, ordering, orderSuccess, orderError, placeOrder }) => (
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
    <div className="mt-4">
      {orderSuccess && <div className="mb-3 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{orderSuccess}</div>}
      {orderError && <div className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{orderError}</div>}
      <button
        onClick={placeOrder}
        disabled={ordering || cart.length === 0}
        className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          (ordering || cart.length === 0)
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

export default BuffetCart;
