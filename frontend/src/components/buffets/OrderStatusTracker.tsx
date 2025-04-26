import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheck, 
  faClipboard, 
  faUtensils, 
  faCheckCircle, 
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { motion } from 'framer-motion';

interface OrderStatusTrackerProps {
  pickupCode: string;
  onClose?: () => void;
}

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

interface OrderData {
  _id: string;
  items: string[];
  status: OrderStatus;
  createdAt: string;
  pickupTime: string;
  pickupCode: string;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ pickupCode, onClose }) => {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Show notification when order becomes ready
  useEffect(() => {
    if (order?.status === 'ready') {
      // Try to show a browser notification if permission is granted
      if (Notification && Notification.permission === 'granted') {
        new Notification('Your order is ready! 🎉', {
          body: `Order with pickup code ${pickupCode} is ready for pickup!`,
          icon: '/vite.svg' // You can replace with your app icon
        });
      }
    }
  }, [order?.status, pickupCode]);

  const fetchOrderStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/orders/pickup/${pickupCode}`);
      setOrder(response.data);
      setLastRefreshed(new Date());
      setError(null);
      
      // If order is ready, slow down the refresh rate
      if (response.data.status === 'ready' || response.data.status === 'completed') {
        setRefreshInterval(60); // Check once per minute once ready
      } else {
        setRefreshInterval(15); // Check every 15 seconds while preparing
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      setError('Could not fetch order status. Please check your pickup code.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrderStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCode]);

  // Setup polling interval to check for status updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrderStatus();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCode, refreshInterval]);

  const statusIcons = {
    pending: <FontAwesomeIcon icon={faClipboard} className="text-yellow-500" />,
    preparing: <FontAwesomeIcon icon={faUtensils} className="text-blue-500 animate-pulse" />,
    ready: <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 animate-bounce" />,
    completed: <FontAwesomeIcon icon={faCheck} className="text-gray-500" />
  };

  const statusMessages = {
    pending: 'Your order has been received and is waiting to be prepared.',
    preparing: 'The buffet is currently preparing your order.',
    ready: 'Your order is ready for pickup! Please show your code at the counter.',
    completed: 'Your order has been picked up. Thank you!'
  };

  const renderStatusProgress = () => {
    const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = order ? statuses.indexOf(order.status) : -1;
    // Medium size: width 320px, circles w-7 h-7, move circles a bit further down
    return (
      <div className="w-full mt-6 flex justify-center">
        <div className="relative flex items-center justify-between" style={{height: 56, width: 700, minWidth: 0}}>
          {/* Progress bar background */}
          <div className="absolute left-0 right-0 top-[70%] h-1 bg-gray-200 rounded-full" style={{transform: 'translateY(-50%)'}} />
          {/* Progress bar foreground */}
          <div className="absolute left-0 top-[70%] h-1 bg-[var(--primary)] rounded-full transition-all duration-500" style={{width: `${(currentIndex/(statuses.length-1))*100}%`, transform: 'translateY(-50%)'}} />
          {/* Steps */}
          {statuses.map((status, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            // Calculate left position as a percentage of the new, medium width
            const left = `${(idx/(statuses.length-1))*100}%`;
            return (
              <div
                key={status}
                className="absolute flex flex-col items-center z-10"
                style={{left, top: '90%', transform: 'translate(-50%, -50%)'}}
              >
                <div className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-base ${
                  isCompleted ? 'bg-[var(--primary)] border-[var(--primary)] text-white' :
                  isCurrent ? 'bg-white border-[var(--primary)] text-[var(--primary)] font-bold' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <FontAwesomeIcon icon={faCheck} /> : idx+1}
                </div>
                <span className={`mt-1 text-xs ${isCurrent ? 'text-[var(--primary)] font-semibold' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && !order) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary mb-4" />
        <p className="text-gray-600">Fetching your order status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-amber-500 mr-4" />
          <h3 className="text-lg font-semibold">Error Loading Order</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchOrderStatus}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Order Not Found</h3>
        <p className="text-gray-600">We couldn't find an order with the code: {pickupCode}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Order Status</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Order Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Pickup Code</div>
            <div className="text-2xl font-mono font-bold tracking-wider">{order.pickupCode}</div>
          </div>
          <div className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${order.status === 'ready' ? 'bg-green-100 text-green-800' :
              order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
              order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'}
          `}>
            {order.status.toUpperCase()}
          </div>
        </div>
        
        <div className="mt-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">Order Items</div>
          <ul className="list-disc list-inside text-gray-800">
            {order.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Status Visual */}
      {renderStatusProgress()}

      {/* Status Details */}
      <div className="mt-6 p-4 rounded-lg border border-gray-100 bg-gray-50">
        <div className="flex items-center mb-2">
          {statusIcons[order.status]}
          <h3 className="font-semibold ml-2">Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h3>
        </div>
        <p className="text-gray-600">{statusMessages[order.status]}</p>
        {order.status === 'ready' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 text-green-700 rounded-md">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
            Your order is ready! Please go to the buffet counter and show your pickup code.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center text-xs text-gray-500">
        <span>Last updated: {lastRefreshed.toLocaleTimeString()}</span>
        <button 
          onClick={fetchOrderStatus}
          className="flex items-center text-primary hover:underline"
        >
          <FontAwesomeIcon icon={faSpinner} className="mr-1" />
          Refresh Status
        </button>
      </div>
    </motion.div>
  );
};

export default OrderStatusTracker;