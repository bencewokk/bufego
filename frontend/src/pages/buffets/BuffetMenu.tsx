import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCheck, faPlusCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";

interface BuffetMenuProps {
  inventoryByCategory: Record<string, InventoryItem[]>;
  cart: InventoryItem[];
  addToCart: (item: InventoryItem) => void;
  isAnyItemAvailable: boolean;
}

const BuffetMenu: React.FC<BuffetMenuProps> = ({ inventoryByCategory, cart, addToCart, isAnyItemAvailable }) => (
  <div className="p-6 md:p-8 border-t border-gray-100">
    <div className="flex items-center mb-5">
      <div className="p-2.5 rounded-lg mr-3 icon-bg">
        <FontAwesomeIcon icon={faBoxOpen} className="text-white text-lg" />
      </div>
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
        Menu & Availability
      </h2>
    </div>
    {isAnyItemAvailable ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(inventoryByCategory).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>
                {category} ({items.length})
              </h3>
            </div>
            <div className="p-3 flex-grow">
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.uniqueId} className="flex justify-between items-center group text-sm">
                    <span className="transition-colors group-hover:text-primary-dark mr-2" style={{ color: "var(--text)" }}>
                      {item.name}
                    </span>
                    {item.available ? (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={cart.some(cartItem => cartItem.uniqueId === item.uniqueId)}
                        className={`px-2 py-0.5 rounded transition ${
                          cart.some(cartItem => cartItem.uniqueId === item.uniqueId)
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                        }`}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <FontAwesomeIcon icon={cart.some(cartItem => cartItem.uniqueId === item.uniqueId) ? faCheck : faPlusCircle} className="mr-1 text-xs"/>
                        {cart.some(cartItem => cartItem.uniqueId === item.uniqueId) ? 'Added' : 'Add'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        Out
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-6 px-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="font-medium text-orange-700">It looks like all items are currently unavailable.</p>
        <p className="text-sm text-orange-600 mt-1">Please check back later!</p>
      </div>
    )}
  </div>
);

export default BuffetMenu;
