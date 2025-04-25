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

    return (
      <div className="w-full mt-6">
        <div className="flex justify-between mb-2">
          {statuses.map((status, index) => (
            <div 
              key={status} 
              className={`flex flex-col items-center ${index <= currentIndex ? 'text-primary' : 'text-gray-400'}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentIndex 
                    ? 'bg-primary text-white' 
                    : index === currentIndex 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index < currentIndex ? (
                  <FontAwesomeIcon icon={faCheck} className="text-sm" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span className="text-xs mt-1 capitalize">{status}</span>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-500 ease-in-out"
            style={{ width: currentIndex >= 0 ? `${(currentIndex / (statuses.length - 1)) * 100}%` : '0%' }}
          ></div>
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