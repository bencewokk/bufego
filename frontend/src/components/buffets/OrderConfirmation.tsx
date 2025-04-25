import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faTicketAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface OrderConfirmationProps {
  pickupCode: string;
  buffetName: string;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ pickupCode, buffetName, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-6 md:p-8 bg-green-50 border border-green-200 rounded-lg text-center relative"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close confirmation"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl mb-4" />

      <h3 className="text-xl font-semibold text-green-800 mb-2">Sikeres Fizetés!</h3>
      <p className="text-gray-700 mb-4">
        A rendelésedet sikeresen fogadtuk a(z) <strong>{buffetName}</strong> büfében.
      </p>

      <div className="bg-white p-4 rounded-md border border-gray-200 inline-block mb-5">
        <p className="text-sm text-gray-600 mb-1">Átvételi Kódod:</p>
        <div className="flex items-center justify-center space-x-2">
          <FontAwesomeIcon icon={faTicketAlt} className="text-primary" />
          <strong className="text-2xl font-bold text-primary tracking-wider">{pickupCode}</strong>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Kérjük, mutasd be ezt a kódot az átvételkor. Hamarosan elkészül a rendelésed!
      </p>

      <button
        onClick={onClose}
        className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors"
      >
        Bezárás és Kosár Ürítése
      </button>
    </motion.div>
  );
};

export default OrderConfirmation;
