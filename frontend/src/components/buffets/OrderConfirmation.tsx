import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faTicketAlt, faBell, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import OrderStatusTracker from './OrderStatusTracker';

interface OrderConfirmationProps {
  pickupCode: string;
  buffetName: string;
  onClose: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ pickupCode, buffetName, onClose }) => {
  const [showTracker, setShowTracker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Notifications enabled!", {
          body: `We'll notify you when your order is ready for pickup.`,
          icon: '/vite.svg'
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="p-6 md:p-8 bg-green-50 border border-green-200 rounded-lg text-center relative"
    >
      {showTracker ? (
        <div className="p-2">
          <button
            onClick={() => setShowTracker(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Back to confirmation"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <OrderStatusTracker pickupCode={pickupCode} />
        </div>
      ) : (
        <>
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

          <p className="text-sm text-gray-600 mb-4">
            Kérjük, mutasd be ezt a kódot az átvételkor. Hamarosan elkészül a rendelésed!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={() => setShowTracker(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Rendelés Követése
            </button>
            
            {!notificationsEnabled && Notification && Notification.permission !== "denied" && (
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faBell} className="mr-2" />
                Értesítések Engedélyezése
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors"
          >
            Bezárás és Kosár Ürítése
          </button>
        </>
      )}
    </motion.div>
  );
};

export default OrderConfirmation;
