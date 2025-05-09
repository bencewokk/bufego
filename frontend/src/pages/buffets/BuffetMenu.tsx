import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCheck,
  faPlusCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";

interface BuffetMenuProps {
  inventoryByCategory: Record<string, InventoryItem[]>;
  cart: InventoryItem[];
  addToCart: (item: InventoryItem) => void;
  isAnyItemAvailable: boolean;
}

const BuffetMenu: React.FC<BuffetMenuProps> = ({
  inventoryByCategory,
  cart,
  addToCart,
  isAnyItemAvailable,
}) => (
  <div className="p-6 md:p-8 border-t border-gray-100">
    <div className="flex items-center mb-5">
      <div className="p-2.5 rounded-lg mr-3 icon-bg">
        <FontAwesomeIcon icon={faBoxOpen} className="text-white text-lg" />
      </div>
      <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
        Menü & Elérhető termékek
      </h2>
    </div>
    {isAnyItemAvailable ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(inventoryByCategory).map(([category, items]) => (
          <div
            key={category}
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="p-3 border-b border-gray-100">
              <h3
                className="font-semibold text-base"
                style={{ color: "var(--text)" }}
              >
                {category} ({items.length})
              </h3>
            </div>
            <div className="p-3 flex-grow">
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li
                    key={item.uniqueId}
                    className="flex justify-between items-center group text-sm border-b border-[#e0e0e0] pb-2"
                  >
                    <div className="flex flex-col flex-grow mr-4">
                      <span className="font-medium text-[var(--text)]">
                        {item.name}
                      </span>
                      <span className="text-[var(--primary)] font-bold mt-0.5">
                        {item.price.toLocaleString("hu-HU")} Ft
                      </span>
                    </div>
                    
                    {item.available ? (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={cart.some(
                          (cartItem) => cartItem.uniqueId === item.uniqueId
                        )}
                        className={`px-2 py-0.5 rounded transition ${
                          cart.some(
                            (cartItem) => cartItem.uniqueId === item.uniqueId
                          )
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 cursor-pointer"
                        }`}
                        aria-label={`${item.name} hozzáadása a kosárhoz`}
                      >
                        <FontAwesomeIcon
                          icon={
                            cart.some(
                              (cartItem) => cartItem.uniqueId === item.uniqueId
                            )
                              ? faCheck
                              : faPlusCircle
                          }
                          className="mr-1 text-xs"
                        />
                        {cart.some(
                          (cartItem) => cartItem.uniqueId === item.uniqueId
                        )
                          ? "Hozzáadva"
                          : "Hozzáadás"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        Elfogyott
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
        <p className="font-medium text-orange-700">
          Úgy néz ki, hogy nincs jelenleg elérhető termék.
        </p>
        <p className="text-sm text-orange-600 mt-1">Nézz vissza később!</p>
      </div>
    )}
  </div>
);

export default BuffetMenu;
