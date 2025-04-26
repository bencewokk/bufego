import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faClock, faCreditCard, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

// Define step structure
export const cartSteps = [
  { label: "Cart", icon: faShoppingCart },
  { label: "Email", icon: faCheckCircle },
  { label: "Pickup Time", icon: faClock },
  { label: "Payment", icon: faCreditCard },
  { label: "Done", icon: faCheckCircle },
];

interface CartStepIndicatorProps {
  currentStep: number;
}

const CartStepIndicator: React.FC<CartStepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="relative flex flex-col justify-between mr-6 min-h-[340px] w-30 bg-gray-50 rounded-lg shadow-sm p-4">
      {/* Vertical line connecting all steps */}
      <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-[var(--primary)] to-[var(--primary-light)] opacity-30 z-0" style={{ transform: 'translateX(-50%)' }} />
      
      {/* Steps container with equal spacing */}
      <div className="relative h-full flex flex-col justify-between py-4 z-10">
        {cartSteps.map((step, idx) => (
          <div key={step.label} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: currentStep === idx ? 1.15 : 1,
                opacity: currentStep >= idx ? 1 : 0.5,
                backgroundColor: currentStep >= idx ? 'var(--primary)' : '#e5e7eb',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-4 h-4 rounded-full mb-2 ${currentStep >= idx ? 'bg-[var(--primary)]' : 'bg-gray-200'} shadow`}
            />
            <span className={`text-xs font-medium ${currentStep >= idx ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartStepIndicator;