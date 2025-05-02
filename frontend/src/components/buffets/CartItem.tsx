import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem } from "../../types";
import { motion } from "framer-motion";

interface CartItemProps {
  item: InventoryItem;
  removeFromCart: (item: InventoryItem) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, removeFromCart }) => {
  return (
    <motion.div
      key={item.uniqueId}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all duration-200"
    >
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.price} Ft</p>
      </div>
      <button
        onClick={() => removeFromCart(item)}
        className="h-8 w-8 rounded text-red-500 hover:bg-red-300 hover:text-red-600 transition-colors duration-200 bg-red-200 items-center justify-center flex cursor-pointer"
        aria-label={`${item.name} törlése a kosárból`}
      >
        <FontAwesomeIcon icon={faTrashAlt} size="sm" />
      </button>
    </motion.div>
  );
};

export default CartItem;