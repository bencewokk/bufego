import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar";

interface Buffet {
  id: string;
  name: string;
  email: string;
  location: string;
  openingHours: string;
  image: string;
  tags?: string[]; // Make tags optional with ?
}

export const BuffetDashboard = () => {
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
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
        // Assuming that the buffet information is provided in response.data.user
        setBuffet(response.data.user);
      } catch (error) {
        console.error("Error fetching buffet data:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBuffetData();
  }, [navigate]);

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
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Név: </span>{buffet.name}
          </div>
          <div>
            <span className="font-semibold">Email: </span>{buffet.email}
          </div>
          <div>
            <span className="font-semibold">Helyszín: </span>{buffet.location}
          </div>
          <div>
            <span className="font-semibold">Nyitvatartás: </span>{buffet.openingHours}
          </div>
          <div>
            <span className="font-semibold">Címkék: </span>
            {buffet.tags && buffet.tags.length > 0 ? buffet.tags.join(", ") : "Nincsenek címkék"}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition"
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
};

export default BuffetDashboard;