// src/components/BuffetTouch.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OrdersPanel from "./_ordersPanel";
import InventoryPanel from "./_inventoryPanel";
import { Buffet, InventoryItem, Order } from "../../../types";

const NEW_ORDER_THRESHOLD_MS = 60 * 1000; // 60 seconds

export const generatePickupCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const number = Math.floor(Math.random() * 10);
  return `${letter1}${letter2}${number}`;
};


const BuffetTouch = () => {
  // --- State ---
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemPurchases, setItemPurchases] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // --- Data Fetching ---
  const fetchBuffetData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get("http://localhost:3000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuffet(response.data.user);
      if (response.data.user?.id) {
        fetchInventory(response.data.user.id, token);
      }
    } catch (error) {
      console.error("Error fetching buffet data:", error);
      navigate("/login");
    }
  };

  const fetchInventory = async (buffetId: string, token: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/buffets/inventory/${buffetId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventory([]);
    }
  };

  // --- Event Handlers ---
  const handleToggleAvailability = async (itemId: string) => {
    if (!buffet) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    const originalInventory = [...inventory];
    setInventory((prev) =>
      prev.map(item =>
        item._id === itemId ? { ...item, available: !item.available } : item
      )
    );
    try {
      await axios.put(
        `http://localhost:3000/api/buffets/inventory/${buffet.id}/toggle/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error toggling availability:", error);
      setInventory(originalInventory);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!buffet || inventory.length === 0) return;
    let timeoutId: NodeJS.Timeout | null = null;

    const generateRandomOrder = () => {
      const availableItems = inventory.filter((item) => item.available);
      if (availableItems.length > 0) {
        const maxItems = Math.min(3, availableItems.length);
        const itemCount = Math.floor(Math.random() * maxItems) + 1;
        const shuffledItems = availableItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffledItems.slice(0, itemCount);
        const createdAt = new Date();
        const pickupDelayMinutes = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
        const pickupTime = new Date(createdAt.getTime() + pickupDelayMinutes * 60000);

        const newOrder: Order = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          items: selectedItems.map(item => item.name),
          status: "pending",
          createdAt,
          pickupCode: generatePickupCode(),
          pickupTime,
        };

        setOrders(prev => [newOrder, ...prev].slice(0, 50));
        setItemPurchases(prev => {
          const updated = { ...prev };
          selectedItems.forEach(item => {
            updated[item._id] = (updated[item._id] || 0) + 1;
          });
          return updated;
        });
      }
      const delay = Math.floor(Math.random() * 10000) + 5000;
      timeoutId = setTimeout(generateRandomOrder, delay);
    };
    timeoutId = setTimeout(generateRandomOrder, 1000);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [buffet, inventory]);

  useEffect(() => {
    fetchBuffetData();
  }, []);

  // --- Render the Child Components ---
  // Pass necessary props to the panels.
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 font-sans">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        <OrdersPanel
          orders={orders}
          currentTime={currentTime}
          updateOrderStatus={updateOrderStatus}
          NEW_ORDER_THRESHOLD_MS={NEW_ORDER_THRESHOLD_MS}
        />
        <InventoryPanel
          inventory={inventory}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          itemPurchases={itemPurchases}
          onToggleAvailability={handleToggleAvailability}
        />
      </div>
    </div>
  );
};

export default BuffetTouch;
