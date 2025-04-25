import React from 'react';
import { motion } from "framer-motion";

const EmptyCart: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 px-4 rounded-lg bg-gray-50 border border-dashed border-gray-200"
    >
      <p className="text-gray-500 mb-2">Your cart is empty</p>
      <p className="text-sm text-gray-400">Add items from the menu above to get started</p>
    </motion.div>
  );
};

export default EmptyCart;