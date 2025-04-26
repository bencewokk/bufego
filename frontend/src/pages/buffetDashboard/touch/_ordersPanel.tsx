// src/components/OrdersPanel.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListAlt, faUtensils, faKey, faClock } from "@fortawesome/free-solid-svg-icons";
import { Order } from "../../../types";

interface OrdersPanelProps {
  currentTime: Date;
  updateOrderStatus: (orderId: string, newStatus: Order["status"]) => void;
  NEW_ORDER_THRESHOLD_MS: number;
}

const OrdersPanel = ({
  currentTime,
  updateOrderStatus,
  NEW_ORDER_THRESHOLD_MS,
}: OrdersPanelProps) => {
  // --- Use state to hold real orders fetched from the backend ---
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/orders");
        // Convert pickupTime and createdAt from strings to Date objects,
        // and assign _id to id so that each order has a unique identifier.
        const convertedOrders: Order[] = response.data.map((order: any) => ({
          ...order,
          id: order._id, // Ensure a unique id is set from _id
          pickupTime: new Date(order.pickupTime),
          createdAt: new Date(order.createdAt),
        }));
        setOrders(convertedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
  
    // Initial fetch
    fetchOrders();
  
    // Optionally refresh the orders every 30 seconds:
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // --- This helper performs an optimistic update before calling the parent update ---
  const handleOrderUpdate = async (orderId: string, newStatus: Order["status"]) => {
    console.log("Updating order status", { orderId, newStatus });
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, { status: newStatus });
      // Refetch orders to ensure the state is up-to-date
      const response = await axios.get("http://localhost:3000/api/orders");
      setOrders(response.data.map((order: any) => ({
        ...order,
        id: order._id,
        pickupTime: new Date(order.pickupTime),
        createdAt: new Date(order.createdAt),
      })));
    } catch (error: any) {
      console.error("Error updating order status:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to update order status: ${error.response.data.message}`);
      } else {
        alert("Failed to update order status. Please try again.");
      }
    }
  };

  // --- Sorting logic remains unchanged ---
  const sortedOrders = [...orders].sort((a, b) => {
    // Completed orders go last
    const aCompleted = a.status === "completed";
    const bCompleted = b.status === "completed";
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    if (aCompleted && bCompleted) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    const now = currentTime.getTime();
    const aRemaining = a.pickupTime.getTime() - now;
    const bRemaining = b.pickupTime.getTime() - now;
    const TEN_MINUTES = 10 * 60 * 1000;
    const aWithin10 = aRemaining <= TEN_MINUTES;
    const bWithin10 = bRemaining <= TEN_MINUTES;
    if (aWithin10 && bWithin10) return aRemaining - bRemaining;
    if (aWithin10) return -1;
    if (bWithin10) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  // --- Helper to format the remaining time ---
  const formatRemainingTime = (
    order: Order
  ): { text: string; color: string; urgent: boolean } => {
    if (order.status === "completed") {
      return { text: "Picked Up", color: "text-gray-200", urgent: false };
    }
    const now = currentTime.getTime();
    const remainingMs = Math.max(0, order.pickupTime.getTime() - now);
    if (remainingMs <= 0) {
      return { text: "Ready for Pickup", color: "text-red-600 font-bold animate-pulse", urgent: true };
    }
    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    const timeString = `${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    let color = "text-gray-600";
    if (order.status === "pending") color = "text-yellow-700";
    else if (order.status === "preparing") color = "text-blue-700";
    else if (order.status === "ready") color = "text-green-700";

    if (remainingMinutes < 1) {
      return { text: `Pickup in: ${timeString}`, color: "text-orange-600 font-semibold", urgent: true };
    }
    if (remainingMinutes < 3) {
      return { text: `Pickup in: ${timeString}`, color: "text-yellow-600 font-semibold", urgent: false };
    }
    return { text: `Pickup in: ${timeString}`, color, urgent: false };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col overflow-hidden">
      <h2 className="text-4xl font-bold mb-4 p-2 text-blue-700 flex items-center shrink-0">
        <FontAwesomeIcon icon={faListAlt} className="mr-4" />
        Incoming Orders
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-2">
        {sortedOrders.map((order) => {
          const nextStatusMap = {
            pending: "preparing",
            preparing: "ready",
            ready: "completed",
            completed: "completed",
          } as const;
          let cardStyles = "";
          let itemTextColor = "text-gray-900";
          let secondaryTextColor = "text-gray-600";
          let iconColor = "text-gray-600";
          let statusTextColor = "text-gray-700";

          switch (order.status) {
            case "pending":
              cardStyles = "bg-yellow-100 hover:bg-yellow-200 border-yellow-200";
              itemTextColor = "text-yellow-900";
              secondaryTextColor = "text-yellow-700";
              iconColor = "text-yellow-700";
              statusTextColor = "text-yellow-800";
              break;
            case "preparing":
              cardStyles = "bg-blue-100 hover:bg-blue-200 border-blue-200";
              itemTextColor = "text-blue-900";
              secondaryTextColor = "text-blue-700";
              iconColor = "text-blue-700";
              statusTextColor = "text-blue-800";
              break;
            case "ready":
              cardStyles = "bg-green-100 hover:bg-green-200 border-green-200";
              itemTextColor = "text-green-900";
              secondaryTextColor = "text-green-700";
              iconColor = "text-green-700";
              statusTextColor = "text-green-800";
              break;
            case "completed":
              cardStyles = "bg-gray-500 text-white border-gray-600 opacity-70 cursor-default";
              itemTextColor = "text-gray-100";
              secondaryTextColor = "text-gray-200";
              iconColor = "text-gray-200";
              statusTextColor = "text-gray-100";
              break;
          }

          const { text: pickupTimeDisplay, color: pickupTimeColor, urgent: isUrgent } = formatRemainingTime(order);
          const orderAgeMs = currentTime.getTime() - order.createdAt.getTime();
          const isNew = orderAgeMs < NEW_ORDER_THRESHOLD_MS && order.status !== "completed";

          return (
            <div
              key={order.id}
              onClick={() =>
                order.status !== "completed" &&
                handleOrderUpdate(order.id, nextStatusMap[order.status])
              }
              className={`relative p-4 rounded-xl flex items-start border ${
                order.status !== "completed" ? "cursor-pointer active:scale-[0.98]" : ""
              } transition-all duration-150 ${cardStyles} ${
                isUrgent && order.status !== "completed" ? "ring-2 ring-offset-1 ring-orange-500" : ""
              }`}
            >
              {isNew && (
                <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow z-10">
                  NEW
                </span>
              )}

              <FontAwesomeIcon icon={faUtensils} className={`text-3xl mr-4 mt-1 shrink-0 ${iconColor}`} />
              <div className="flex-1 mr-4 min-w-0">
                <div className="mb-2">
                  {order.items.map((item, index) => (
                    <div key={index} className={`text-2xl font-semibold ${itemTextColor} break-words`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div className={`text-lg font-medium ${secondaryTextColor} flex items-center mt-1`}>
                  <FontAwesomeIcon icon={faKey} className="mr-2 text-xs" />
                  Code: <span className="font-bold ml-1 tracking-wider">{order.pickupCode}</span>
                </div>
                <div className={`text-lg ${pickupTimeColor} flex items-center mt-1 font-medium`}>
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-xs" />
                  {pickupTimeDisplay}
                </div>
              </div>
              <div className={`text-xl font-bold uppercase whitespace-nowrap ${statusTextColor} self-center ml-auto pl-4 pt-1`}>
                {order.status}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 text-xl mt-10">No active orders.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPanel;
