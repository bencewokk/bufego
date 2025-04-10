import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faBox,
  faListAlt,
  faUtensils,
  faKey,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// --- Interfaces ---
interface InventoryItem {
  _id: string;
  name: string;
  available: boolean;
  category: string;
  stockLevel: number;
  lastRestocked?: Date;
  lowStockThreshold: number;
}

interface Buffet {
  id: string;
  name: string;
  email: string;
  location: string;
  openingHours: string;
  image: string;
  tags?: string[];
  currentCapacity: number;
  maxCapacity: number;
}

interface Order {
  id: string;
  items: string[];
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: Date;
  pickupCode: string;
  pickupTime: Date;
}

// --- Helper Function ---
const generatePickupCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
  const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
  const number = Math.floor(Math.random() * 10);
  return `${letter1}${letter2}${number}`;
};

// --- Component ---
export const BuffetTouch = () => {
  // --- State ---
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemPurchases, setItemPurchases] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // --- Constants ---
  const NEW_ORDER_THRESHOLD_MS = 60 * 1000; // 60 seconds for "NEW" label

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
    // ... (no changes needed here)
    if (!buffet) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    const originalInventory = [...inventory];
    setInventory(prev =>
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
    // ... (no changes needed here)
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // --- Effects ---
  useEffect(() => {
    // Timer to update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate random orders
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
          createdAt: createdAt,
          pickupCode: generatePickupCode(),
          pickupTime: pickupTime,
        };

        setOrders(prev => [newOrder, ...prev].slice(0, 50)); // Keep prepending new orders
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

  useEffect(() => { fetchBuffetData(); }, []);

  // --- Filtering & Sorting ---
  const filteredInventory = inventory.filter((item) =>
    selectedCategory === "all" || item.category === selectedCategory
  );
  const getTopItems = () => [...inventory]
    .sort((a, b) => (itemPurchases[b._id] || 0) - (itemPurchases[a._id] || 0))
    .slice(0, 5);
  const topItemsInFilter = getTopItems().filter(item => filteredInventory.includes(item));
  const otherItemsInFilter = filteredInventory.filter(item => !topItemsInFilter.includes(item));
  const uniqueCategories = [...new Set(inventory.map((i) => i.category))];

  // --- Order Sorting (Updated Logic) ---
  const sortedOrders = [...orders].sort((a, b) => {
    // 1. Completed orders go last
    const aIsCompleted = a.status === 'completed';
    const bIsCompleted = b.status === 'completed';
    if (aIsCompleted && !bIsCompleted) return 1;
    if (!aIsCompleted && bIsCompleted) return -1;

    // If both are completed, sort by creation time descending (newest completed first)
    if (aIsCompleted && bIsCompleted) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }

    // 2. Non-completed: Sort by pickupTime ascending (closest pickup first)
    const pickupTimeDiff = a.pickupTime.getTime() - b.pickupTime.getTime();
    if (pickupTimeDiff !== 0) {
      return pickupTimeDiff;
    }

    // 3. Tie-breaker: If pickup times are the same, sort by creation time ascending (oldest first)
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  // --- Render Logic ---
  if (!buffet) {
    // ... (loading state remains the same)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl font-medium">Loading Buffet Dashboard...</p>
        <p className="text-sm">Please wait a moment.</p>
      </div>
    );
  }

  // --- Helper function for time formatting ---
  const formatRemainingTime = (order: Order): { text: string; color: string; urgent: boolean } => {
     // ... (remains the same)
    if (order.status === 'completed') {
      return { text: "Picked Up", color: "text-gray-200", urgent: false }; // Use color compatible with completed card
    }

    const now = currentTime.getTime();
    const pickupTimestamp = order.pickupTime.getTime();
    const remainingMs = Math.max(0, pickupTimestamp - now);

    if (remainingMs <= 0) {
      return { text: "Ready for Pickup", color: "text-red-600 font-bold animate-pulse", urgent: true };
    }

    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    const timeString = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

    let color = "text-gray-600"; // Default color
    // Base color on status
    if (order.status === 'pending') color = 'text-yellow-700';
    else if (order.status === 'preparing') color = 'text-blue-700';
    else if (order.status === 'ready') color = 'text-green-700';

    // Override color based on urgency
    if (remainingMinutes < 1) {
        color = "text-orange-600 font-semibold";
        return { text: `Pickup in: ${timeString}`, color: color, urgent: true};
    }
     if (remainingMinutes < 3) {
        color = "text-yellow-600 font-semibold";
      return { text: `Pickup in: ${timeString}`, color: color, urgent: false }; // Less urgent than <1 min
    }

    return { text: `Pickup in: ${timeString}`, color: color, urgent: false };
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 font-sans">
      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">

        {/* Orders Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col overflow-hidden">
          <h2 className="text-4xl font-bold mb-4 p-2 text-blue-700 flex items-center shrink-0">
            <FontAwesomeIcon icon={faListAlt} className="mr-4" />
            Incoming Orders
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-2">
            {/* USE sortedOrders here */}
            {sortedOrders.map((order) => {
              const nextStatusMap = { pending: "preparing", preparing: "ready", ready: "completed", completed: "completed" } as const;
              let cardStyles = "";
              let itemTextColor = "text-gray-900";
              let secondaryTextColor = "text-gray-600";
              let iconColor = "text-gray-600";
              let statusTextColor = "text-gray-700";

              switch (order.status) {
                 // ... (status styling remains the same)
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

              // Check if the order is new
              const orderAgeMs = currentTime.getTime() - order.createdAt.getTime();
              const isNew = orderAgeMs < NEW_ORDER_THRESHOLD_MS && order.status !== 'completed';

              return (
                // ADDED `relative` for positioning the NEW badge
                <div
                  key={order.id}
                  onClick={() => { if (order.status !== 'completed') { updateOrderStatus(order.id, nextStatusMap[order.status]); } }}
                  className={`relative p-4 rounded-xl flex items-start border ${order.status !== 'completed' ? 'cursor-pointer active:scale-[0.98]' : ''} transition-all duration-150 ${cardStyles} ${isUrgent && order.status !== 'completed' ? 'ring-2 ring-offset-1 ring-orange-500' : ''}`}
                >
                  {/* ADDED: "NEW" Badge */}
                  {isNew && (
                    <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow z-10"> {/* Reduced padding slightly */}
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
                    {/* Pickup Code */}
                    <div className={`text-lg font-medium ${secondaryTextColor} flex items-center mt-1`}>
                       <FontAwesomeIcon icon={faKey} className="mr-2 text-xs" />
                       Code: <span className="font-bold ml-1 tracking-wider">{order.pickupCode}</span>
                    </div>
                    {/* Pickup Time / Remaining Time */}
                    <div className={`text-lg ${pickupTimeColor} flex items-center mt-1 font-medium`}>
                        <FontAwesomeIcon icon={faClock} className="mr-2 text-xs" />
                        {pickupTimeDisplay}
                    </div>
                  </div>
                  {/* Order Status (Moved slightly down to avoid overlap with NEW badge if text is long) */}
                  <div className={`text-xl font-bold uppercase whitespace-nowrap ${statusTextColor} self-center ml-auto pl-4 pt-1`}> {/* Added padding top/left */}
                    {order.status}
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && ( <p className="text-center text-gray-500 text-xl mt-10">No active orders.</p> )}
          </div>
        </div>

        {/* Inventory Panel */}
        {/* ... (Inventory panel remains the same) ... */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col overflow-hidden">
          <h2 className="text-4xl font-bold mb-4 p-2 text-blue-700 flex items-center shrink-0">
            <FontAwesomeIcon icon={faBox} className="mr-4" />
            Inventory Management
          </h2>
          <div className="flex flex-wrap gap-3 mb-4 px-2 shrink-0">
            <button onClick={() => setSelectedCategory("all")} className={`px-6 py-3 rounded-lg text-xl font-semibold transition-all duration-150 ease-in-out ${ selectedCategory === "all" ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400" }`}>All</button>
            {uniqueCategories.map((category) => ( <button key={category} onClick={() => setSelectedCategory(category)} className={`px-6 py-3 rounded-lg text-xl font-semibold transition-all duration-150 ease-in-out ${ selectedCategory === category ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400" }`} > {category} </button> ))}
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-3 pr-2 pb-2">
             {/* --- Top Items Section --- */}
            { topItemsInFilter.length > 0 && (
              <div className="text-xl text-gray-800 p-3 bg-yellow-100 border-t border-b border-yellow-200 rounded-lg mt-2 font-semibold sticky top-0 z-10"> Most Popular in '{selectedCategory}' </div>
            )}
            {topItemsInFilter.map((item) => {
              const itemBg = item.available ? "bg-green-50 hover:bg-green-100 border-green-200" : "bg-red-50 hover:bg-red-100 border-red-200";
              const itemIconColor = item.available ? "text-green-700" : "text-red-700";
              return (
                <div key={item._id + '-top'} onClick={() => handleToggleAvailability(item._id)} className={`p-5 rounded-xl flex items-center border cursor-pointer active:scale-95 transition-transform ${itemBg}`} >
                  <FontAwesomeIcon icon={item.available ? faCheckCircle : faTimesCircle} className={`text-4xl mr-4 shrink-0 ${itemIconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-gray-900 mb-1 break-words">{item.name}</div>
                    <div className="text-lg text-gray-700"> {item.stockLevel} in stock • {itemPurchases[item._id] || 0} ordered </div>
                  </div>
                </div>
              );
             })}

            {/* --- Separator --- */}
            { otherItemsInFilter.length > 0 && topItemsInFilter.length > 0 && ( <div className="h-px bg-gray-300 my-4"></div> )}

            {/* --- Other Items Section --- */}
             { otherItemsInFilter.length > 0 && ( <div className="text-xl text-gray-800 p-3 bg-gray-100 border-t border-b border-gray-200 rounded-lg font-semibold sticky top-0 z-10"> {selectedCategory === 'all' ? 'Other Items' : `Other ${selectedCategory} Items`} </div> )}
            {otherItemsInFilter.map((item) => {
              const itemBg = item.available ? "bg-green-50 hover:bg-green-100 border-green-200" : "bg-red-50 hover:bg-red-100 border-red-200";
              const itemIconColor = item.available ? "text-green-700" : "text-red-700";
              return (
                <div key={item._id + '-other'} onClick={() => handleToggleAvailability(item._id)} className={`p-5 rounded-xl flex items-center border cursor-pointer active:scale-95 transition-transform ${itemBg}`}>
                  <FontAwesomeIcon icon={item.available ? faCheckCircle : faTimesCircle} className={`text-4xl mr-4 shrink-0 ${itemIconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-gray-900 mb-1 break-words">{item.name}</div>
                    <div className="text-lg text-gray-700"> {item.stockLevel} in stock </div>
                  </div>
                </div>
              );
            })}

            {/* --- Empty State Messages --- */}
            {filteredInventory.length === 0 && inventory.length > 0 && ( <p className="text-center text-gray-500 text-xl mt-10 col-span-1">No items found in the '{selectedCategory}' category.</p> )}
            {inventory.length === 0 && ( <p className="text-center text-gray-500 text-xl mt-10 col-span-1">Inventory is currently empty. Add items via admin panel.</p> )}
          </div>
        </div>

      </div>
    </div>
  );
};