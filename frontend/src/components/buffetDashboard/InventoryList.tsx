// components/InventoryList.tsx
import { FC, useState } from "react";
import axios from "axios";
import { NavigateFunction } from "react-router-dom";
import { Buffet, InventoryItem } from "../../types";

interface InventoryListProps {
  inventory: InventoryItem[];
  buffet: Buffet;
  fetchInventory: (buffetId: string) => Promise<void>;
  navigate: NavigateFunction;
}

export const InventoryList: FC<InventoryListProps> = ({
  inventory,
  buffet,
  fetchInventory,
  navigate,
}) => {
  // Group inventory items by category
  const groupedInventory: Record<string, InventoryItem[]> = {};
  inventory.forEach((item) => {
    if (!groupedInventory[item.category]) {
      groupedInventory[item.category] = [];
    }
    groupedInventory[item.category].push(item);
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<InventoryItem>>({});

  const handleEditClick = (item: InventoryItem) => {
    setEditingId(item._id);
    setEditValues({ ...item });
  };

  const handleEditChange = (field: keyof InventoryItem, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:3000/api/buffets/inventory/${buffet.id}/update/${editingId}`,
        editValues,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditValues({});
      fetchInventory(buffet.id);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleToggleAvailability = async (itemId: string) => {
    if (!buffet || !itemId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/buffets/inventory/${buffet.id}/toggle/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated inventory
      fetchInventory(buffet.id);
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!buffet || !itemId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/api/buffets/inventory/${buffet.id}/remove/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated inventory
      fetchInventory(buffet.id);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div>
      {Object.keys(groupedInventory).length === 0 ? (
        <p className="text-gray-500">
          Még nincs termék a kínálatban. Kattints a "Új tétel hozzáadása" gombra
          a kezdéshez.
        </p>
      ) : (
        Object.entries(groupedInventory).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="font-medium text-lg mb-2">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`p-3 rounded-lg flex justify-between items-center border ${
                    item.available
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {editingId === item._id ? (
                    <>
                      <input
                        className="w-full px-4 py-3 mr-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none transition-all hover:border-gray-400"
                        value={editValues.name || ""}
                        onChange={(e) =>
                          handleEditChange("name", e.target.value)
                        }
                      />
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none transition-all hover:border-gray-400"
                        type="number"
                        value={editValues.price || 0}
                        onChange={(e) =>
                          handleEditChange("price", Number(e.target.value))
                        }
                      />
                      <button
                        onClick={handleEditSave}
                        className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-sm cursor-pointer"
                      >
                        Mentés
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="ml-2 px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm cursor-pointer"
                      >
                        Mégse
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col flex-grow mr-4">
                        <span className="font-medium text-[var(--text)]">
                          {item.name}
                        </span>
                        <span className="text-[var(--primary)] font-bold mt-0.5">
                          {item.price.toLocaleString("hu-HU")} Ft
                        </span>
                      </div>{" "}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleAvailability(item._id!)}
                          className={`px-2 py-1 rounded text-sm cursor-pointer ${
                            item.available
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {item.available ? "Elfogyott" : "Elérhető"}
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item._id!)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 cursor-pointer"
                        >
                          Törlés
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer"
                        >
                          Szerkeszt
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
