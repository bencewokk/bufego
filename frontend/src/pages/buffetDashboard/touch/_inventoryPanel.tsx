// src/components/InventoryPanel.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { InventoryItem, Order } from "../../../types";

interface InventoryPanelProps {
  inventory: InventoryItem[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  orders: Order[]; // Add orders prop
  onToggleAvailability: (itemId: string) => void;
}

const InventoryPanel = ({ inventory, selectedCategory, setSelectedCategory, orders = [], onToggleAvailability }: InventoryPanelProps) => {
  // --- Calculate Preparing Orders ---
  const preparingOrdersCount: Record<string, number> = orders
    .filter(order => order.status === "preparing") // Only include "preparing" orders
    .reduce((acc, order) => {
      order.items.forEach(itemName => {
        acc[itemName] = (acc[itemName] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

  // --- Filtering & Sorting ---
  const filteredInventory = inventory.filter((item) =>
    selectedCategory === "all" || item.category === selectedCategory
  );

  const getTopItems = () => [...inventory]
    .sort((a, b) => (preparingOrdersCount[b.name] || 0) - (preparingOrdersCount[a.name] || 0))
    .slice(0, 5);

  const topItemsInFilter = getTopItems().filter(item => filteredInventory.includes(item));
  const otherItemsInFilter = filteredInventory.filter(item => !topItemsInFilter.includes(item));
  const uniqueCategories = [...new Set(inventory.map((i) => i.category))];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col overflow-hidden">
      <h2 className="text-4xl font-bold mb-4 p-2 text-blue-700 flex items-center shrink-0">
        <FontAwesomeIcon icon={faBox} className="mr-4" />
        Inventory Management
      </h2>
      <div className="flex flex-wrap gap-3 mb-4 px-2 shrink-0">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-6 py-3 rounded-lg text-xl font-semibold transition-all duration-150 ease-in-out ${selectedCategory === "all" ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"}`}
        >
          All
        </button>
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-lg text-xl font-semibold transition-all duration-150 ease-in-out ${selectedCategory === category ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-3 pr-2 pb-2">
        {topItemsInFilter.length > 0 && (
          <div className="text-xl text-gray-800 p-3 bg-yellow-100 border-t border-b border-yellow-200 rounded-lg mt-2 font-semibold sticky top-0 z-10">
            Most Popular in '{selectedCategory}'
          </div>
        )}
        {topItemsInFilter.map((item) => {
          const itemBg = item.available ? "bg-green-50 hover:bg-green-100 border-green-200" : "bg-red-50 hover:bg-red-100 border-red-200";
          const itemIconColor = item.available ? "text-green-700" : "text-red-700";
          return (
            <div
              key={item._id + '-top'}
              onClick={() => onToggleAvailability(item._id)}
              className={`p-5 rounded-xl flex items-center border cursor-pointer active:scale-95 transition-transform ${itemBg}`}
            >
              <FontAwesomeIcon icon={item.available ? faCheckCircle : faTimesCircle} className={`text-4xl mr-4 shrink-0 ${itemIconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1 break-words">
                  {item.name}
                </div>
                <div className="text-lg text-gray-700">
                  {preparingOrdersCount[item.name] || 0} being prepared
                </div>
              </div>
            </div>
          );
        })}

        {otherItemsInFilter.length > 0 && topItemsInFilter.length > 0 && (<div className="h-px bg-gray-300 my-4"></div>)}

        {otherItemsInFilter.length > 0 && (
          <div className="text-xl text-gray-800 p-3 bg-gray-100 border-t border-b border-gray-200 rounded-lg font-semibold sticky top-0 z-10">
            {selectedCategory === 'all' ? 'Other Items' : `Other ${selectedCategory} Items`}
          </div>
        )}
        {otherItemsInFilter.map((item) => {
          const itemBg = item.available ? "bg-green-50 hover:bg-green-100 border-green-200" : "bg-red-50 hover:bg-red-100 border-red-200";
          const itemIconColor = item.available ? "text-green-700" : "text-red-700";
          return (
            <div
              key={item._id + '-other'}
              onClick={() => onToggleAvailability(item._id)}
              className={`p-5 rounded-xl flex items-center border cursor-pointer active:scale-95 transition-transform ${itemBg}`}
            >
              <FontAwesomeIcon icon={item.available ? faCheckCircle : faTimesCircle} className={`text-4xl mr-4 shrink-0 ${itemIconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-gray-900 mb-1 break-words">
                  {item.name}
                </div>
                <div className="text-lg text-gray-700">
                  {preparingOrdersCount[item.name] || 0} being prepared
                </div>
              </div>
            </div>
          );
        })}

        {filteredInventory.length === 0 && inventory.length > 0 && (
          <p className="text-center text-gray-500 text-xl mt-10 col-span-1">
            No items found in the '{selectedCategory}' category.
          </p>
        )}
        {inventory.length === 0 && (
          <p className="text-center text-gray-500 text-xl mt-10 col-span-1">
            Inventory is currently empty. Add items via admin panel.
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
