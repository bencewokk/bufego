import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/landing/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faMapMarkerAlt,
  faArrowLeft,
  faTag,
  faEnvelope,
  faBoxOpen,
  faCheck,
  faTimes,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faShoppingCart, faPlus, faMinus, faExclamationCircle, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

interface InventoryItem {
  name: string;
  available: boolean;
  category: string;
}

interface OrderTrackerProps {
  buffetId: string;
}

interface Buffet {
  id: string;
  name: string;
  location: string;
  openingHours: string;
  dailyHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  image: string;
  tags: string[];
  email?: string;
  password?: string;
  __v?: number;
  inventory?: InventoryItem[];
}


// ...existing interface declarations...

interface OrderItem {
  name: string;
  quantity: number;
}

interface OrderModalProps {
  buffet: Buffet;
  inventory: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}


export const BuffetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);


  useEffect(() => {
    const fetchBuffet = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let response;
        if (token) {
          response = await axios.get(`http://localhost:3000/api/buffets/get/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await axios.get(`http://localhost:3000/api/buffets/get/${id}`);
        }
        const data = response.data;
        // Add sample daily hours if not available in the API response
        const buffetData = { 
          ...data, 
          id: data._id,
          dailyHours: data.dailyHours || {
            monday: "7:00 AM - 9:00 PM",
            tuesday: "7:00 AM - 9:00 PM",
            wednesday: "7:00 AM - 9:00 PM",
            thursday: "7:00 AM - 9:00 PM",
            friday: "7:00 AM - 10:00 PM",
            saturday: "8:00 AM - 10:00 PM",
            sunday: "8:00 AM - 8:00 PM"
          }
        };
        setBuffet(buffetData);
      } catch (err) {
        console.error("Error fetching buffet details:", err);
        setError("Failed to load buffet details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBuffet();
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !buffet) {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg text-red-600 bg-red-100 p-4 rounded-lg shadow">
            <p className="font-bold">Error</p>
            <p>{error || "Buffet not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render function for Google Maps Wrapper
  const renderMap = (status: Status) => {
    if (status === Status.LOADING) return <div>Loading map...</div>;
    if (status === Status.FAILURE) return <div>Failed to load map.</div>;
    return <MapComponent location={buffet.location} />;
  };

  const inventoryByCategory: Record<string, InventoryItem[]> = {};
  buffet.inventory?.forEach((item) => {
    if (!inventoryByCategory[item.category]) {
      inventoryByCategory[item.category] = [];
    }
    inventoryByCategory[item.category].push(item);
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = buffet.dailyHours ? buffet.dailyHours[today as keyof typeof buffet.dailyHours] : buffet.openingHours;

  return (
    <div style={{ backgroundColor: "var(--background)" }} className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/buffets"
          className="inline-flex items-center transition duration-200 mb-6 group link-color"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="mr-2 transition-transform group-hover:-translate-x-1"
          />
          <span className="font-medium">Explore Other Buffets</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 relative h-96 bg-gradient-to-r from-blue-50 to-purple-50">
              {buffet.image ? (
                <img
                  src={buffet.image}
                  alt={buffet.name}
                  className="w-full h-full object-cover object-center rounded-lg shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <span className="text-gray-500 text-xl">🍽️ Buffet Preview</span>
                </div>
              )}
              <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center">
                <FontAwesomeIcon icon={faClock} style={{ color: "var(--primary)" }} className="mr-2" />
                <span className="font-medium text-gray-700">Today: {todayHours}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
                  {buffet.name}
                </h1>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      style={{ color: "var(--primary)" }}
                      className="mt-1 mr-4 text-xl"
                    />
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                        Location
                      </h3>
                      <p className="mb-4 text-gray-700">{buffet.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: "var(--primary)" }}
                      className="mt-1 mr-4 text-xl" 
                    />
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                        Daily Hours
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {buffet.dailyHours && Object.entries(buffet.dailyHours).map(([day, hours]) => (
                          <div key={day} className={`flex justify-between ${day === today ? 'font-semibold' : ''}`}>
                            <span className="capitalize">{day}</span>
                            <span className="text-gray-700 ml-4">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {buffet.email && (
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{ color: "var(--primary)" }}
                        className="mr-4 text-xl"
                      />
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                          Contact Email
                        </h3>
                        <a href={`mailto:${buffet.email}`} className="link-color">
                          {buffet.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {buffet.tags?.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon
                      icon={faTag}
                      style={{ color: "var(--primary)" }}
                      className="mr-3 text-lg"
                    />
                    <h3 className="font-semibold" style={{ color: "var(--text)" }}>
                      Features & Amenities
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {buffet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full text-sm hover:bg-primary-light transition-colors flex items-center tag-bg border tag-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* New Order Online section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="md:col-span-2">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: "var(--primary)" }}>
                      <FontAwesomeIcon icon={faShoppingCart} className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                      Order Online
                    </h2>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Order your favorite items from {buffet.name} in advance and skip the line!
                    We'll have your food ready for pickup at your chosen time.
                  </p>
                  <button
                    onClick={() => setIsOrderModalOpen(true)}
                    className="px-6 py-3 rounded-lg shadow-md text-white font-medium flex items-center transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                    Start Your Order
                  </button>
                </div>
                
                <div>
                  <OrderTracker buffetId={buffet.id} />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="px-6 py-3 rounded-lg shadow-md text-white font-medium flex items-center transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                  Place an Order
                </button>
              </div>
            </div>
          </div>

          {/* Full width map section */}
          <div className="w-full p-6 md:p-8 border-t border-gray-100">
            <h3 className="font-semibold text-xl mb-4" style={{ color: "var(--text)" }}>
              Find Us
            </h3>
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
              {apiKey ? (
                <Wrapper apiKey={apiKey} render={renderMap} />
              ) : (
                <div className="text-red-600 w-full h-full flex items-center justify-center">
                  Google Maps API key is missing.
                </div>
              )}
            </div>
          </div>

          {buffet.inventory && buffet.inventory.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg mr-4 icon-bg">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                  Menu & Availability
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(inventoryByCategory).map(([category, items]) => (
                  <div
                    key={category}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-lg" style={{ color: "var(--text)" }}>
                        {category} ({items.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3">
                        {items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center group">
                            <span className="transition-colors group-hover-link" style={{ color: "var(--text)" }}>
                              {item.name}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                                item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={item.available ? faCheck : faTimes}
                                className="mr-1.5"
                              />
                              {item.available ? "Available" : "Out of Stock"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {buffet && (
        <OrderModal
          buffet={buffet}
          inventory={buffet.inventory || []}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
      <style>{`
        .link-color {
          color: var(--primary);
          transition: color 0.2s;
        }
        .link-color:hover {
          color: var(--primary-dark);
        }
        .tag-bg {
          background-color: var(--primary-light);
        }
        .tag-border {
          border: 1px solid var(--primary-light);
        }
        .icon-bg {
          background-color: var(--primary);
        }
        .group-hover-link:hover {
          color: var(--primary-dark);
        }
      `}</style>
    </div>
  );
};

// ...existing code...

const OrderModal = ({ buffet, inventory, isOpen, onClose }: OrderModalProps) => {
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState(15); // Default 15 minutes
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [error, setError] = useState("");

  // Group items by category
  const itemsByCategory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  const updateItemQuantity = (name: string, delta: number) => {
    setSelectedItems((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.name === name);
      
      if (existingItemIndex >= 0) {
        const newQuantity = prev[existingItemIndex].quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter((_, index) => index !== existingItemIndex);
        }
        
        const newItems = [...prev];
        newItems[existingItemIndex] = { ...newItems[existingItemIndex], quantity: newQuantity };
        return newItems;
      } else if (delta > 0) {
        return [...prev, { name, quantity: delta }];
      }
      
      return prev;
    });
  };

  const getQuantity = (name: string) => {
    const item = selectedItems.find((item) => item.name === name);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const expandedItems = selectedItems.flatMap(item => 
        Array(item.quantity).fill(item.name)
      );
  
      const response = await axios.post("http://localhost:3000/api/orders", {
        buffetId: buffet.id,
        items: expandedItems,
        customerName: customerName || "Guest",
        customerPhone: customerPhone || undefined,
        pickupTimeMinutes: pickupTime
      });
  
      if (response.data.success) {
        setOrderCode(response.data.pickupCode);
        setOrderComplete(true);
      } else {
        setError(response.data.error || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Error creating order:", err);
      const errorMessage = err?.response?.data?.error || 
                          err?.message || 
                          "Failed to place your order. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setPickupTime(15);
    setOrderComplete(false);
    setOrderCode("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            {orderComplete ? "Order Confirmed" : "Place Order"}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {orderComplete ? (
            <div className="text-center py-10">
              <div className="rounded-full bg-green-100 h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheck} className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
                Your order has been placed!
              </h3>
              <p className="text-xl mb-6 text-gray-700">
                Your pickup code is: <span className="font-bold text-2xl" style={{ color: "var(--primary)" }}>{orderCode}</span>
              </p>
              <p className="text-gray-600 mb-8">
                Please check the screen at the buffet for your order status.
                Your order will be ready for pickup in approximately {pickupTime} minutes.
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 rounded-lg shadow-md text-white font-medium transition-colors"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>
                  Available Items
                </h3>
                
                {Object.entries(itemsByCategory).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-lg mb-3" style={{ color: "var(--primary-dark)" }}>
                      {category}
                    </h4>
                    <div className="space-y-3">
                      {items.filter(item => item.available).map((item) => (
                        <div 
                          key={item.name} 
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <span className="font-medium" style={{ color: "var(--text)" }}>{item.name}</span>
                          
                          <div className="flex items-center">
                            <button
                              onClick={() => updateItemQuantity(item.name, -1)}
                              disabled={getQuantity(item.name) === 0}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ 
                                backgroundColor: getQuantity(item.name) > 0 ? "var(--primary-light)" : "var(--secondary)" 
                              }}
                            >
                              <FontAwesomeIcon icon={faMinus} style={{ color: "var(--primary-dark)" }} />
                            </button>
                            
                            <span className="w-10 text-center font-semibold" style={{ color: "var(--text)" }}>
                              {getQuantity(item.name)}
                            </span>
                            
                            <button
                              onClick={() => updateItemQuantity(item.name, 1)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: "var(--primary-light)" }}
                            >
                              <FontAwesomeIcon icon={faPlus} style={{ color: "var(--primary-dark)" }} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {items.filter(item => item.available).length === 0 && (
                        <p className="text-gray-500 italic">No available items in this category</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {Object.keys(itemsByCategory).length === 0 && (
                  <p className="text-gray-500 italic">No items available for order</p>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>
                  Your Details
                </h3>
                
                <div>
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Your Phone Number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Pickup Time</label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                    {error}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!orderComplete && (
          <div className="border-t border-gray-200 p-6 flex justify-between items-center bg-gray-50">
            <div>
              <p className="text-gray-600">
                Total Items: <span className="font-bold">{getTotalItems()}</span>
              </p>
            </div>
            <button
              disabled={loading || getTotalItems() === 0}
              onClick={handleSubmitOrder}
              className="px-8 py-3 rounded-lg shadow-md text-white font-medium flex items-center transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-5 h-5 border-2 rounded-full border-white border-t-transparent animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                  Place Order
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// Add this component implementation before the MapComponent
const OrderTracker = ({ buffetId }: OrderTrackerProps) => {
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/orders/status/${buffetId}`
        );
        setOrderStatus(response.data.status || "No active orders");
      } catch (err) {
        setError("Failed to load order status");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [buffetId]);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center mb-3">
        <FontAwesomeIcon 
          icon={faBoxOpen} 
          className="text-blue-600 mr-2" 
        />
        <h3 className="font-semibold">Your Order Status</h3>
      </div>
      {loading ? (
        <div className="text-sm text-gray-600">Loading status...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="text-sm text-gray-700">
          {orderStatus}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all" 
              style={{ width: orderStatus === "Ready for pickup" ? '100%' : '50%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Map Component to Render the Google Map
const MapComponent = ({ location }: { location: string }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 }, // Default center, will be updated by geocoder
        zoom: 15,
      });
      setMap(newMap);

      // Geocode the buffet location to get coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          newMap.setCenter({ lat: lat(), lng: lng() });
          new google.maps.Marker({
            position: { lat: lat(), lng: lng() },
            map: newMap,
            title: location,
          });
        } else {
          console.error("Geocode failed: ", status);
        }
      });
    }
  }, [location, map]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default BuffetDetails;