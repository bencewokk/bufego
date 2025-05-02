import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/landing/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { InventoryItem, Buffet } from "../../types";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import MapComponent from "./MapComponent";
import { generatePickupCode } from "./utils";
import BuffetInfo from "./BuffetInfo";
import BuffetMenu from "./BuffetMenu";
import BuffetCart from "./BuffetCart";

export const BuffetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<InventoryItem[]>([]);

  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchBuffet = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let response;
        const url = `http://localhost:3000/api/buffets/get/${id}`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        response = await axios.get(url, { headers });

        const data = response.data;
        const buffetData: Buffet = {
          ...data,
          id: data._id,
          inventory: data.inventory?.map((item: any, index: number) => ({
             ...item,
             uniqueId: item._id ? item._id.toString() : `${item.name}-${index}`
          })) || [],
          dailyHours: data.dailyHours || {
            monday: "7:00 - 21:00",
            tuesday: "7:00 - 21:00",
            wednesday: "7:00 - 21:00",
            thursday: "7:00 - 21:00",
            friday: "7:00 - 22:00",
            saturday: "8:00 - 22:00",
            sunday: "8:00 - 20:00"
          }
        };
        setBuffet(buffetData);
      } catch (err) {
        console.error("Hiba a lekérdezés során:", err);
        setError("A büfék betöltése sikertelen. Próbáld meg később.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBuffet();
  }, [id]);

  const addToCart = (itemToAdd: InventoryItem) => {
    if (!cart.some(item => item.uniqueId === itemToAdd.uniqueId)) {
      setCart(prevCart => [...prevCart, itemToAdd]);
    } else {
        console.log(`${itemToAdd.name} már a kosárban van.`);
    }
  };

  const removeFromCart = (itemToRemove: InventoryItem) => {
    setCart(prevCart => prevCart.filter(item => item.uniqueId !== itemToRemove.uniqueId));
  };
  // --- End Cart Functions ---

  const placeOrder = async (pickupTime: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Be kell legyél jelentkezve, hogy rendelést adj le.");
      return;
    }

    if (cart.length === 0) {
      alert("A kosarad üres. Adj hozzá valamit a rendeléshez.");
      return;
    }

    const orderData = {
      items: cart.map(item => item.name),
      pickupCode: generatePickupCode(),
      pickupTime: new Date(pickupTime),
      buffetId: buffet?.id,
      total: cart.reduce((sum, item) => sum + (item.price || 0), 0)
    };

    setOrdering(true);
    setOrderSuccess(null);
    setOrderError(null);
    try {
      await axios.post("http://localhost:3000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderSuccess(`Rendelés sikeresen leadva! Az átvételi kódod: ${orderData.pickupCode}. Átvételi idő: ${new Date(pickupTime).toLocaleTimeString()}.`);
      setCart([]);
    } catch (error: any) {
      console.error("Hiba a rendelés leadása során:", error);
      setOrderError(`Sikertelen rendelés. ${error.response?.data?.message || 'Kérlek próbáld meg később.'}`);
    } finally {
      setOrdering(false);
    }
  };

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
            <p className="font-bold">Hiba</p>
            <p>{error || "Büfé nem található."}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderMap = (status: Status) => {
    if (status === Status.LOADING) return <div>Térkép betöltése...</div>;
    if (status === Status.FAILURE) return <div>Sikertelen a térkép betöltése.</div>;
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
  const todayHours = buffet.dailyHours ? buffet.dailyHours[today as keyof typeof buffet.dailyHours] : (buffet.openingHours || "N/A");

  const isAnyItemAvailable = buffet.inventory?.some(item => item.available) ?? false;

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
          <span className="font-medium">Fedezz fel más büféket</span>
        </Link>

        {/* Buffet Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          {/* Image and Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            <BuffetInfo buffet={buffet} today={today} todayHours={todayHours} />
          </div>

          {/* Full width map section */}
          <div className="w-full p-6 md:p-8 border-t border-gray-100">
             <h3 className="font-semibold text-lg mb-3" style={{ color: "var(--text)" }}>Keress minket!</h3>
             <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
               {apiKey ? (
                 <Wrapper apiKey={apiKey} render={renderMap} />
               ) : (
                 <div className="bg-gray-100 text-red-600 w-full h-full flex items-center justify-center text-center p-4">
                   API hiba lépett fel.<br/>A térkép nem jeleníthető meg.
                 </div>
               )}
             </div>
           </div>

          {/* Inventory / Menu Section */}
          <BuffetMenu
            inventoryByCategory={inventoryByCategory}
            cart={cart}
            addToCart={addToCart}
            isAnyItemAvailable={isAnyItemAvailable}
          />

          {/* --- Cart and Order Section --- */}
          {isAnyItemAvailable && (
            <BuffetCart
              cart={cart}
              removeFromCart={removeFromCart}
              orderSuccess={orderSuccess}
              orderError={orderError}
              buffetName={buffet.name}
              buffetId={buffet.id}
              onClearCart={() => setCart([])}
            />
          )}
        </div>
      </div>
      <style>{`
        :root {
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
           color: var(--primary-dark);
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

export default BuffetDetails;