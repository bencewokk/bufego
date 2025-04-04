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

interface Buffet {
  id: number;
  name: string;
  location: string;
  rating: number;
  openingHours: string;
  image: string;
  tags: string[]; // Explicitly type the tags array
}

export const AdminDashboard = () => {
  const [username, setUsername] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBuffet, setNewBuffet] = useState<Buffet>({
    id: 0,
    name: "",
    location: "",
    rating: 0,
    openingHours: "",
    image: "/src/buffet1.jpg",
    tags: [], // Now properly typed as string[]
  });
  const [buffets, setBuffets] = useState([
    {
      id: 1,
      name: "Főépület Büfé",
      location: "Főépület, földszint",
      rating: 4.5,
      openingHours: "8:00 - 16:00",
      image: "/src/buffet1.jpg",
      tags: ["szendvics", "kávé", "péksütemény"],
    },
    // ... other buffet objects
  ]);
  const navigate = useNavigate();

  // Auth check (same as before)
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleAddBuffet = () => {
    const newId =
      buffets.length > 0 ? Math.max(...buffets.map((b) => b.id)) + 1 : 1;
    setBuffets([...buffets, { ...newBuffet, id: newId }]);
    setShowAddModal(false);
    setNewBuffet({
      id: 1,
      name: "",
      location: "",
      rating: 0,
      openingHours: "",
      image: "/src/buffet1.jpg",
      tags: [],
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navbar */}
      <DashboardNav username={username} handleLogout={handleLogout} />

      {/* Add Buffet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-[var(--primary-dark)]">
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
                      .filter((tag) => tag.trim() !== ""),
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Mégse
              </button>
              <button
                onClick={handleAddBuffet}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)]"
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
          <h2 className="text-2xl font-bold text-[var(--text)]">Büfék</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#ff9800] text-white px-4 py-2 rounded-md hover:bg-[#ff8a00] transition-colors cursor-pointer"
          >
            + Új Büfé
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buffets.map((buffet) => (
            <Link
              to={`/admin/buffet/${buffet.id}`}
              key={buffet.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute bottom-0 left-0 bg-[var(--primary)] text-white px-3 py-1 rounded-tr-lg">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  {buffet.openingHours}
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-[var(--text)]">
                    {buffet.name}
                  </h2>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-yellow-500 mr-1"
                    />
                    <span className="font-medium">{buffet.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  <span>{buffet.location}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {buffet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
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
