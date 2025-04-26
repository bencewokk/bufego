// _buffetDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/landing/Navbar";
import { BuffetDetails } from "../../components/buffetDashboard/BuffetDetails";
import { BuffetImage } from "../../components/buffetDashboard/BuffetImage";
import { InventoryManagement } from "../../components/buffetDashboard/InventoryManagement";
import { BuffetOrderHistoryIsland } from "../../components/buffetDashboard/BuffetOrderHistoryIsland.tsx";
import { Buffet, InventoryItem } from "../../types";

export const BuffetDashboard = () => {
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuffetData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuffet(response.data.user);
        
        // Fetch inventory if buffet data is available
        if (response.data.user && response.data.user.id) {
          fetchInventory(response.data.user.id);
        }
      } catch (error) {
        console.error("Error fetching buffet data:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBuffetData();
  }, [navigate]);

  const fetchInventory = async (buffetId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/buffets/inventory/${buffetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!buffet) {
    return <div>Error loading buffet details.</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Buffet Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BuffetDetails buffet={buffet} />
            <BuffetImage 
              buffet={buffet}
              setBuffet={setBuffet}
              navigate={navigate}
            />
          </div>
        </div>
        
        <button
          onClick={() => navigate("/buffet-dashboard/touch")}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Érintős nézet
        </button>
        
        <InventoryManagement 
          buffet={buffet}
          inventory={inventory}
          fetchInventory={fetchInventory}
          navigate={navigate}
        />

        {/* Buffet Order History Island */}
        <BuffetOrderHistoryIsland />
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition"
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
};

export default BuffetDashboard;