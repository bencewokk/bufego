import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DashboardNav } from "../../components/Dashboard/DashboardNav";
import { BuffetCard } from "../../components/Dashboard/BuffetCard";
import { AddBuffetModal } from "../../components/Dashboard/AddBuffetModal";
import { EditBuffetModal } from "../../components/Dashboard/EditBuffetModal";
import { useBuffets } from "../../hooks/useBuffets";

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
  
  const { buffets, loading, error, addBuffet, updateBuffet, deleteBuffet } = useBuffets();
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleAddBuffet = async () => {
    try {
      await addBuffet(newBuffet);
      setShowAddModal(false);
      setNewBuffet({
        name: "",
        location: "",
        openingHours: "",
        email: "",
        password: "",
        image: "/src/buffet1.jpg",
        tags: [],
      });
    } catch (error) {
      console.error("Failed to add buffet:", error);
    }
  };

  const handleEditBuffet = async () => {
    if (currentBuffet) {
      try {
        await updateBuffet(currentBuffet);
        setShowEditModal(false);
        setCurrentBuffet(null);
      } catch (error) {
        console.error("Failed to update buffet:", error);
      }
    }
  };

  const handleDeleteBuffet = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (window.confirm("Biztosan törölni szeretnéd ezt a büfét?")) {
      try {
        await deleteBuffet(id);
      } catch (error) {
        console.error("Failed to delete buffet:", error);
      }
    }
  };

  const handleOpenEditModal = (buffet: Buffet, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentBuffet({ ...buffet });
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--admin-background)]">
      <DashboardNav username={username} handleLogout={handleLogout} />

      <AddBuffetModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddBuffet}
        newBuffet={newBuffet}
        setNewBuffet={setNewBuffet}
      />

      <EditBuffetModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditBuffet}
        currentBuffet={currentBuffet}
        setCurrentBuffet={setCurrentBuffet}
      />

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

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buffets.map((buffet) => (
              <BuffetCard
                key={buffet.id}
                buffet={buffet}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteBuffet}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;