// components/AddItemForm.tsx
import { FC, useState } from "react";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Buffet, InventoryItem } from "../../types";

interface AddItemFormProps {
  buffet: Buffet;
  fetchInventory: (buffetId: string) => Promise<void>;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
}

export const AddItemForm: FC<AddItemFormProps> = ({ 
  buffet, 
  fetchInventory, 
  setShowAddForm,
  navigate
}) => {
  const [newItem, setNewItem] = useState<InventoryItem>({ 
    name: "", 
    available: true, 
    category: "Egyéb" 
  });

  const handleAddItem = async () => {
    if (!buffet || !newItem.name.trim()) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/buffets/inventory/${buffet.id}/add`,
        newItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and fetch updated inventory
      setNewItem({ name: "", available: true, category: "Egyéb" });
      setShowAddForm(false);
      fetchInventory(buffet.id);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Termék neve</label>
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="Pl. Sonkás szendvics"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategória</label>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="Egyéb">Egyéb</option>
            <option value="Szendvics">Szendvics</option>
            <option value="Meleg étel">Meleg étel</option>
            <option value="Ital">Ital</option>
            <option value="Desszert">Desszert</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elérhetőség</label>
          <select
            value={newItem.available ? "true" : "false"}
            onChange={(e) => setNewItem({...newItem, available: e.target.value === "true"})}
            className="w-full p-2 border rounded"
          >
            <option value="true">Elérhető</option>
            <option value="false">Nem elérhető</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleAddItem}
        className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition"
      >
        Hozzáadás
      </button>
    </div>
  );
};