// components/InventoryManagement.tsx
import { FC, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { Buffet, InventoryItem } from "../../types";
import { AddItemForm } from "./AddItemForm";
import { InventoryList } from "./InventoryList";

interface InventoryManagementProps {
  buffet: Buffet;
  inventory: InventoryItem[];
  fetchInventory: (buffetId: string) => Promise<void>;
  navigate: NavigateFunction;
}

export const InventoryManagement: FC<InventoryManagementProps> = ({ 
  buffet, 
  inventory, 
  fetchInventory, 
  navigate 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Kínálat kezelése</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition cursor-pointer"
        >
          {showAddForm ? 'Mégse' : 'Új tétel hozzáadása'}
        </button>
      </div>
      
      {showAddForm && (
        <AddItemForm 
          buffet={buffet}
          fetchInventory={fetchInventory}
          setShowAddForm={setShowAddForm}
          navigate={navigate}
        />
      )}
      
      <InventoryList 
        inventory={inventory}
        buffet={buffet}
        fetchInventory={fetchInventory}
        navigate={navigate}
      />
    </div>
  );
};