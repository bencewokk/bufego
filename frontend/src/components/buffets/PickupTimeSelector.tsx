import React, { useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

interface PickupTimeSelectorProps {
  pickupHour: string;
  setPickupHour: (hour: string) => void;
  pickupMinute: string;
  setPickupMinute: (minute: string) => void;
  pickupAccepted: boolean;
  setPickupAccepted: (accepted: boolean) => void;
  isPickupValid: boolean;
  paymentStatus: string;
}

const PickupTimeSelector: React.FC<PickupTimeSelectorProps> = ({
  pickupHour,
  setPickupHour,
  pickupMinute,
  setPickupMinute,
  pickupAccepted,
  setPickupAccepted,
  isPickupValid,
  paymentStatus
}) => {
  // Get the minimum pickup time (10 minutes from now)
  const getMinPickupTime = () => {
    const now = new Date();
    const minPickup = new Date(now.getTime() + 10 * 60000);
    return `${minPickup.getHours().toString().padStart(2, "0")}:${minPickup.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
        <FontAwesomeIcon icon={faClock} className="text-primary mr-2" />
        Átvételi időpont (Ma)
      </label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white p-2 rounded-md border border-gray-200">
          <input
            type="number"
            min={new Date().getHours()}
            max={23}
            className="w-16 p-2 border border-[#9f9f9f] rounded focus:outline-none focus:ring-0 hover:border-[#4f4f4f] focus:border-[#4f4f4f] transition-all duration-300"
            placeholder="HH"
            value={pickupHour}
            onChange={e => setPickupHour(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            disabled={paymentStatus === 'success'}
          />
          <span className="text-gray-400">:</span>
          <input
            type="number"
            min={0}
            max={59}
            className="w-16 p-2 border border-[#9f9f9f] rounded focus:outline-none focus:ring-0 hover:border-[#4f4f4f] focus:border-[#4f4f4f] transition-all duration-300"
            placeholder="MM"
            value={pickupMinute}
            onChange={e => setPickupMinute(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            disabled={paymentStatus === 'success'}
          />
        </div>
        <div className="text-xs px-3 py-2 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-700">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          Minimum: {getMinPickupTime()} (10 perc múlva)
        </div>
      </div>

      {!pickupAccepted && paymentStatus !== 'success' && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 w-full px-4 py-2 bg-primary text-white rounded-md font-medium cursor-pointer
                    hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setPickupAccepted(true)}
          disabled={!isPickupValid}
        >
          Elfogadom az átvételi időpontot
        </motion.button>
      )}

      {pickupAccepted && paymentStatus !== 'success' && (
        <div className="mt-3 flex items-center justify-between bg-green-50 px-4 py-2 rounded-md border border-green-100">
          <div className="flex items-center text-green-700">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            <span className="text-sm">Átvételi időpont elfogadva</span>
          </div>
          <button
            type="button"
            className="text-sm px-3 py-1 bg-white text-gray-600 rounded-md hover:bg-gray-50 border border-gray-200"
            onClick={() => setPickupAccepted(false)}
          >
            Módosítás
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupTimeSelector;