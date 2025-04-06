import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faMapMarkerAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardNav } from "../../components/Dashboard/DashboardNav";

// Update Buffet interface to use string id (MongoDB ObjectId)
interface Buffet {
  id: string; // Changed from number to string to match MongoDB _id
  name: string;
  location: string;
  rating: number;
  openingHours: string;
  image: string;
  tags: string[];
}

export const AdminDashboard = () => {
  const [username, setUsername] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [buffets, setBuffets] = useState<Buffet[]>([]); // Initialize as empty array
  const [newBuffet, setNewBuffet] = useState<Omit<Buffet, "id">>({
    name: "",
    location: "",
    rating: 0,
    openingHours: "",
    image: "/src/buffet1.jpg",
    tags: [],
  });
  const navigate = useNavigate();

  // Check authentication (unchanged)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const url = "http://localhost:3000/api/dashboard";
    const headers = { Authorization: `Bearer ${token}` };

    if (!token) {
      navigate("/");
    }

    axios
      .get(url, { headers })
      .then((response) => {
        setUsername(response.data.user.username);
      })
      .catch(() => navigate("/"));
  }, [navigate]);

  // Fetch buffets from MongoDB on component mount
  useEffect(() => {
    const fetchBuffets = async () => {
      const token = localStorage.getItem("accessToken");
      const url = "http://localhost:3000/api/buffets";
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const response = await axios.get(url, { headers });
        setBuffets(response.data);
      } catch (error) {
        console.error("Error fetching buffets:", error);
      }
    };

    fetchBuffets();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  // Save new buffet to MongoDB
  const handleAddBuffet = async () => {
    const token = localStorage.getItem("accessToken");
    const url = "http://localhost:3000/api/buffets";
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.post(url, newBuffet, { headers });
      const savedBuffet = response.data; // Includes the server-assigned id
      setBuffets([...buffets, savedBuffet]); // Add the saved buffet to state
      setShowAddModal(false);
      setNewBuffet({
        name: "",
        location: "",
        rating: 0,
        openingHours: "",
        image: "/src/buffet1.jpg",
        tags: [],
      });
    } catch (error) {
      console.error("Error saving buffet:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-background)]">
      {/* Navbar */}
      <DashboardNav username={username} handleLogout={handleLogout} />

      {/* Add Buffet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--admin-surface)] rounded-lg p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-[var(--admin-primary-dark)]">
              Új Büfé
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Név"
                className="w-full p-2 border rounded"
                value={newBuffet.name}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Helyszín"
                className="w-full p-2 border rounded"
                value={newBuffet.location}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, location: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Értékelés"
                className="w-full p-2 border rounded"
                value={newBuffet.rating}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, rating: Number(e.target.value) })
                }
              />
              <input
                type="text"
                placeholder="Nyitvatartás"
                className="w-full p-2 border rounded"
                value={newBuffet.openingHours}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, openingHours: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Címkék (vesszővel elválasztva)"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setNewBuffet({
                    ...newBuffet,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag !== ""),
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[var(--admin-text)] hover:text-[var(--admin-primary-dark)]"
              >
                Mégse
              </button>
              <button
                onClick={handleAddBuffet}
                className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded hover:bg-[var(--admin-primary-dark)]"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Büfék</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[var(--admin-primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--admin-primary-dark)] transition-colors cursor-pointer"
          >
            + Új Büfé
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buffets.map((buffet) => (
            <Link
              to={`/admin/buffet/${buffet.id}`}
              key={buffet.id}
              className="bg-[var(--admin-surface)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute bottom-0 left-0 bg-[var(--admin-primary)] text-white px-3 py-1 rounded-tr-lg">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  {buffet.openingHours}
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-[var(--admin-text)]">
                    {buffet.name}
                  </h2>
                  <div className="flex items-center bg-[var(--admin-primary-light)] px-2 py-1 rounded">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-[var(--admin-primary)] mr-1"
                    />
                    <span className="font-medium">{buffet.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-[var(--admin-text)] mb-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  <span>{buffet.location}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {buffet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[var(--admin-primary-light)] text-[var(--admin-primary)] px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;