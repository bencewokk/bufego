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
  faShoppingCart, // Added for cart icon
  faPlusCircle,  // Added for add button
  faTrashAlt,    // Added for remove button
} from "@fortawesome/free-solid-svg-icons";
import { InventoryItem, Buffet } from "../../types"; // Make sure InventoryItem has a unique ID or use name carefully
import { Wrapper, Status } from "@googlemaps/react-wrapper";

// Pickup code generator (assuming it exists or is defined elsewhere)
const generatePickupCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
    const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));
    const number = Math.floor(Math.random() * 10);
    return `${letter1}${letter2}${number}`;
};

// --- Add unique ID to InventoryItem if missing ---
// If your InventoryItem type doesn't have a unique identifier,
// add one or use the name if you are SURE names are unique per buffet.
// For this example, we'll assume 'name' is unique for simplicity.
// interface InventoryItem {
//   name: string;
//   category: string;
//   available: boolean;
//   // id?: string; // Add if possible
// }
// ---

export const BuffetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Cart State ---
  const [cart, setCart] = useState<InventoryItem[]>([]);
  // --- End Cart State ---

  // Order UI state
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_Maps_API_KEY;


  useEffect(() => {
    const fetchBuffet = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let response;
        // Assuming endpoint remains the same
        const url = `http://localhost:3000/api/buffets/get/${id}`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        response = await axios.get(url, { headers });

        const data = response.data;
        // Add sample daily hours if not available in the API response
        const buffetData: Buffet = {
          ...data,
          id: data._id, // Ensure your Buffet type uses 'id' or handles '_id'
          // Assign unique IDs to inventory items if backend doesn't provide them
          inventory: data.inventory?.map((item: any, index: number) => ({
             ...item,
             uniqueId: item._id ? item._id.toString() : `${item.name}-${index}`
          })) || [],
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

  // --- Cart Functions ---
  const addToCart = (itemToAdd: InventoryItem) => {
    // Prevent adding duplicates - check using the unique identifier
    if (!cart.some(item => item.uniqueId === itemToAdd.uniqueId)) {
      setCart(prevCart => [...prevCart, itemToAdd]);
    } else {
        // Optional: Add feedback that item is already in cart
        console.log(`${itemToAdd.name} is already in the cart.`);
    }
  };

  const removeFromCart = (itemToRemove: InventoryItem) => {
    setCart(prevCart => prevCart.filter(item => item.uniqueId !== itemToRemove.uniqueId));
  };
  // --- End Cart Functions ---


  const placeOrder = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to place an order."); // Consider a more user-friendly notification
      return;
    }

    // --- Use Cart for Order ---
    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to order.");
      return;
    }

    const createdAt = new Date();
    const pickupTime = new Date(createdAt.getTime() + 15 * 60000); // Pickup 15 minutes later

    const orderData = {
      // Map cart items to the expected format (e.g., array of names or IDs)
      items: cart.map(item => item.name), // Adjust if API expects IDs
      pickupCode: generatePickupCode(),
      pickupTime,
      buffetId: buffet?.id, // Include buffet ID if needed by backend
      // Add total price if applicable
    };
    // --- End Use Cart for Order ---

    setOrdering(true);
    setOrderSuccess(null); // Clear previous messages
    setOrderError(null);
    try {
      // Ensure the endpoint and headers are correct for placing an order
      await axios.post("http://localhost:3000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderSuccess(`Order placed successfully! Your pickup code is ${orderData.pickupCode}. Pickup around ${pickupTime.toLocaleTimeString()}.`);
      setCart([]); // Clear the cart after successful order
    } catch (error: any) {
      console.error("Error placing order:", error);
      // Provide more specific error feedback if possible
      setOrderError(`Failed to place order. ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setOrdering(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          {/* Skeleton Loader */}
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

  // --- Error State ---
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

  // --- Map Rendering ---
  const renderMap = (status: Status) => {
    if (status === Status.LOADING) return <div>Loading map...</div>;
    if (status === Status.FAILURE) return <div>Failed to load map.</div>;
    // Pass location string to MapComponent (ensure it handles geocoding)
    return <MapComponent location={buffet.location} />;
  };

  // Group inventory by category
  const inventoryByCategory: Record<string, InventoryItem[]> = {};
  buffet.inventory?.forEach((item) => {
    if (!inventoryByCategory[item.category]) {
      inventoryByCategory[item.category] = [];
    }
    inventoryByCategory[item.category].push(item);
  });

  // Determine today's hours
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = buffet.dailyHours ? buffet.dailyHours[today as keyof typeof buffet.dailyHours] : (buffet.openingHours || "N/A"); // Fallback added

  const isAnyItemAvailable = buffet.inventory?.some(item => item.available) ?? false;


  // --- Main Component Return ---
  return (
    <div style={{ backgroundColor: "var(--background)" }} className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
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

        {/* Buffet Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          {/* Image and Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8"> {/* Reduced gap for tighter layout */}
            {/* Image Section */}
            <div className="relative h-64 md:h-auto bg-gradient-to-r from-blue-50 to-purple-50 md:rounded-l-xl"> {/* Adjusted height and rounding */}
              {buffet.image ? (
                <img
                  src={buffet.image}
                  alt={buffet.name}
                  className="w-full h-full object-cover object-center md:rounded-l-xl" // Ensure image covers and rounds
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 md:rounded-l-xl">
                  <span className="text-gray-500 text-xl">🍽️ Buffet Preview</span>
                </div>
              )}
              {/* Today's Hours Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center text-sm">
                <FontAwesomeIcon icon={faClock} style={{ color: "var(--primary)" }} className="mr-2" />
                <span className="font-medium text-gray-700">Today: {todayHours}</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
                  {buffet.name}
                </h1>
                <div className="space-y-4"> {/* Reduced spacing */}
                  {/* Location */}
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      style={{ color: "var(--primary)" }}
                      className="mt-1 mr-3 text-lg" // Slightly smaller icon/margin
                    />
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>Location</h3>
                      <p className="text-gray-700 text-base">{buffet.location}</p> {/* Adjusted text size */}
                    </div>
                  </div>

                  {/* Daily Hours */}
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: "var(--primary)" }}
                      className="mt-1 mr-3 text-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Daily Hours</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm"> {/* Compact grid */}
                        {buffet.dailyHours && Object.entries(buffet.dailyHours).map(([day, hours]) => (
                          <div key={day} className={`flex justify-between ${day === today ? 'font-semibold' : ''}`}>
                            <span className="capitalize">{day.substring(0,3)}</span> {/* Abbreviate day */}
                            <span className="text-gray-600 ml-2">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Email */}
                  {buffet.email && (
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        style={{ color: "var(--primary)" }}
                        className="mr-3 text-lg"
                      />
                      <div>
                         <h3 className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>Contact</h3>
                        <a href={`mailto:${buffet.email}`} className="link-color text-base hover:underline">
                          {buffet.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

               {/* Tags/Features */}
              {buffet.tags?.length > 0 && (
                <div className="mt-5"> {/* Reduced top margin */}
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faTag} style={{ color: "var(--primary)" }} className="mr-2 text-base"/>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Features</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5"> {/* Smaller gap */}
                    {buffet.tags.map((tag, index) => (
                      <span key={index} className="px-2.5 py-1 rounded-full text-xs tag-bg border tag-border"> {/* Smaller padding/text */}
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full width map section */}
          <div className="w-full p-6 md:p-8 border-t border-gray-100">
             <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--text)" }}>Find Us</h3> {/* Smaller heading */}
             <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md"> {/* Adjusted height */}
               {apiKey ? (
                 <Wrapper apiKey={apiKey} render={renderMap} />
               ) : (
                 <div className="bg-gray-100 text-red-600 w-full h-full flex items-center justify-center text-center p-4">
                   Google Maps API key is missing.<br/>Map cannot be displayed.
                 </div>
               )}
             </div>
           </div>

          {/* Inventory / Menu Section */}
          {buffet.inventory && buffet.inventory.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="flex items-center mb-5">
                <div className="p-2.5 rounded-lg mr-3 icon-bg"> {/* Slightly smaller icon bg */}
                  <FontAwesomeIcon icon={faBoxOpen} className="text-white text-lg" /> {/* Slightly smaller icon */}
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                  Menu & Availability
                </h2>
              </div>
              {isAnyItemAvailable ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Reduced gap */}
                  {Object.entries(inventoryByCategory).map(([category, items]) => (
                    <div
                      key={category}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col" // Use flex column
                    >
                      <div className="p-3 border-b border-gray-100"> {/* Reduced padding */}
                        <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>
                          {category} ({items.length})
                        </h3>
                      </div>
                      <div className="p-3 flex-grow"> {/* Reduced padding and allow growth */}
                        <ul className="space-y-2.5"> {/* Reduced spacing */}
                          {items.map((item) => ( // Use uniqueId for key
                            <li key={item.uniqueId} className="flex justify-between items-center group text-sm">
                              <span className="transition-colors group-hover:text-primary-dark mr-2" style={{ color: "var(--text)" }}>
                                {item.name}
                              </span>
                              {item.available ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={cart.some(cartItem => cartItem.uniqueId === item.uniqueId)}
                                  className={`px-2 py-0.5 rounded transition ${
                                    cart.some(cartItem => cartItem.uniqueId === item.uniqueId)
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800'
                                  }`}
                                  aria-label={`Add ${item.name} to cart`}
                                >
                                  <FontAwesomeIcon icon={cart.some(cartItem => cartItem.uniqueId === item.uniqueId) ? faCheck : faPlusCircle} className="mr-1 text-xs"/>
                                  {cart.some(cartItem => cartItem.uniqueId === item.uniqueId) ? 'Added' : 'Add'}
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                  Out
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="font-medium text-orange-700">It looks like all items are currently unavailable.</p>
                    <p className="text-sm text-orange-600 mt-1">Please check back later!</p>
                </div>
              )}
            </div>
          )}

          {/* --- Cart and Order Section --- */}
          {isAnyItemAvailable && ( // Only show ordering if items *can* be available
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex items-center mb-4">
                 <div className="p-2.5 rounded-lg mr-3 icon-bg">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-white text-lg" />
                 </div>
                 <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                    Your Order Cart ({cart.length})
                 </h2>
              </div>

              {/* Cart Items Display */}
              {cart.length > 0 ? (
                <div className="mb-5 space-y-2 max-h-48 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.uniqueId} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                      <span className="text-gray-800 text-sm">{item.name}</span>
                      <button
                        onClick={() => removeFromCart(item)}
                        className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-50"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} size="sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-gray-600 mb-5 text-sm text-center py-3 bg-white rounded border border-gray-100">Your cart is empty. Add items from the menu above.</p>
              )}

              {/* Order Action */}
              <div className="mt-4">
                 {orderSuccess && <div className="mb-3 p-3 rounded bg-green-50 border border-green-200 text-green-800 text-sm">{orderSuccess}</div>}
                 {orderError && <div className="mb-3 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">{orderError}</div>}

                <button
                  onClick={placeOrder}
                  disabled={ordering || cart.length === 0} // Disable if ordering or cart is empty
                  className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    (ordering || cart.length === 0)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {ordering ? (
                     <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Placing Order...
                     </div>
                  ) : `Place Order (${cart.length} Item${cart.length !== 1 ? 's' : ''})`}
                </button>
              </div>
            </div>
          )}
          {/* --- End Cart and Order Section --- */}

        </div> {/* End Buffet Details Card */}
      </div>

      {/* --- Inline Styles --- */}
      <style>{`
        :root {
          /* Define CSS Variables if not already global */
          /* --background: #f8f9fa; */
          /* --text: #333; */
          /* --primary: #007bff; */
          /* --primary-dark: #0056b3; */
          /* --primary-light: #e7f3ff; */
        }
        .link-color {
          color: var(--primary);
          transition: color 0.2s;
        }
        .link-color:hover {
          color: var(--primary-dark);
        }
        .tag-bg {
          background-color: var(--primary-light);
           color: var(--primary-dark); /* Better contrast */
        }
        .tag-border {
          border: 1px solid var(--primary-light);
        }
        .icon-bg {
          background-color: var(--primary);
        }
        .bg-primary { background-color: var(--primary); }
        .hover\:bg-primary-dark:hover { background-color: var(--primary-dark); }
        .text-primary-dark { color: var(--primary-dark); }
        .focus\:ring-primary:focus { --tw-ring-color: var(--primary); }

        /* Improve scrollbar visibility */
         .max-h-48::-webkit-scrollbar {
            width: 6px;
         }
         .max-h-48::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
         }
         .max-h-48::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
         }
         .max-h-48::-webkit-scrollbar-thumb:hover {
            background: #aaa;
         }

      `}</style>
    </div>
  );
};


// --- Map Component (Ensure Geocoding is handled) ---
// Make sure this component correctly geocodes the location string
const MapComponent = ({ location }: { location: string }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [geocodingError, setGeocodingError] = React.useState<string | null>(null);

  useEffect(() => {
    if (mapRef.current && !map && window.google && window.google.maps) { // Check if google.maps is loaded
        const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 }, // Default center
            zoom: 15,
            mapId: 'BUFFET_MAP_ID' // Optional: Use Map IDs for customization
        });
        setMap(newMap);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
            setGeocodingError(null); // Clear previous error
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                 const geoLoc = results[0].geometry.location;
                 newMap.setCenter(geoLoc);
                 // Use Advanced Markers for better performance/customization if needed
                 new google.maps.Marker({
                    position: geoLoc,
                    map: newMap,
                    title: location,
                 });
             } else {
                 console.error(`Geocode failed for "${location}": ${status}`);
                 setGeocodingError(`Could not find location on map (${status}).`);
                 // Keep map centered somewhere reasonable, e.g., default or a wider view
                 newMap.setCenter({ lat: 40.7128, lng: -74.0060 }); // Example: NYC
                 newMap.setZoom(5);
             }
        });
    } else if (!window.google || !window.google.maps) {
        console.error("Google Maps JavaScript API not loaded.");
        setGeocodingError("Map script failed to load.");
    }
  }, [location, map]); // Rerun if location changes or map initializes

  return (
     <div style={{ width: "100%", height: "100%", position: 'relative' }}>
        {geocodingError && (
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '4px', zIndex: 1 }}>
               {geocodingError}
            </div>
        )}
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
     </div>
  );
};

export default BuffetDetails;