import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faMapMarkerAlt,
  faPencilAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { DashboardNav } from "../../components/Dashboard/DashboardNav";

interface Buffet {
  id: string;
  name: string;
  email: string;
  password: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
}

export const AdminDashboard = () => {
  const [username, setUsername] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [currentBuffet, setCurrentBuffet] = useState<Buffet | null>(null);
  const [newBuffet, setNewBuffet] = useState<Omit<Buffet, "id">>({
    name: "",
    location: "",
    openingHours: "",
    email: "",
    password: "",
    image: "/src/buffet1.jpg",
    tags: [],
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchBuffets = async () => {
      const token = localStorage.getItem("accessToken");
      const url = "http://localhost:3000/api/buffets/get";
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

  const handleAddBuffet = async () => {
    
  }

  const handleEditBuffet = async () => {
    
  }

  const handleDeleteBuffet = async (id: string, event: React.MouseEvent) => {
    
  }

  const handleOpenEditModal = (buffet: Buffet, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentBuffet({ ...buffet });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--admin-background)]">
      <DashboardNav username={username} handleLogout={handleLogout} />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--admin-surface)] rounded-lg p-6 w-full max-w-md animate-fade-in shadow-2xl ">
            <h3 className="text-2xl font-bold mb-4 text-[var(--admin-primary-dark)]">
              Új Büfé
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Név"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={newBuffet.name}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Helyszín"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={newBuffet.location}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, location: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nyitvatartás"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={newBuffet.openingHours}
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, openingHours: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email cím"
                value={newBuffet.email}
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Jelszó"
                value={newBuffet.password}
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                onChange={(e) =>
                  setNewBuffet({ ...newBuffet, password: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-[var(--admin-text)] hover:text-[var(--admin-primary-dark)] cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={handleAddBuffet}
                className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded hover:bg-[var(--admin-primary-dark)] cursor-pointer"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && currentBuffet && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--admin-surface)] rounded-lg p-6 w-full max-w-md animate-fade-in shadow-2xl ">
            <h3 className="text-2xl font-bold mb-4 text-[var(--admin-primary-dark)]">
              Büfé Szerkesztése
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Név"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={currentBuffet.name}
                onChange={(e) =>
                  setCurrentBuffet({ ...currentBuffet, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Helyszín"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={currentBuffet.location}
                onChange={(e) =>
                  setCurrentBuffet({
                    ...currentBuffet,
                    location: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Nyitvatartás"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={currentBuffet.openingHours}
                onChange={(e) =>
                  setCurrentBuffet({
                    ...currentBuffet,
                    openingHours: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Címkék (vesszővel elválasztva)"
                className="w-full p-2 border rounded outline-none border-[#e5e5e5] hover:border-[#a9a9a9] focus:border-[#a9a9a9] transition-all duration-300"
                value={currentBuffet.tags.join(", ")}
                onChange={(e) =>
                  setCurrentBuffet({
                    ...currentBuffet,
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
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-[var(--admin-text)] hover:text-[var(--admin-primary-dark)] cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={handleEditBuffet}
                className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded hover:bg-[var(--admin-primary-dark)] cursor-pointer"
              >
                Mentés  
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div
              key={buffet.id}
              className="bg-[var(--admin-surface)] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              <Link to={`/admin/buffet/${buffet.id}`}>
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

              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={(e) => handleOpenEditModal(buffet, e)}
                  className="bg-[var(--admin-primary-light)] text-[var(--admin-primary)] h-[35px] w-[35px] rounded hover:bg-[var(--admin-primary)] hover:text-white transition-colors cursor-pointer"
                  title="Szerkesztés"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button
                  onClick={(e) => handleDeleteBuffet(buffet.id, e)}
                  className="bg-red-100 text-red-500 h-[35px] w-[35px] rounded hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  title="Törlés"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
