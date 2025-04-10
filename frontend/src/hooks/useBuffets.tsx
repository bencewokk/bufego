import { useState, useEffect } from "react";
import axios from "axios";

interface InventoryItem {
  _id?: string;
  name: string;
  available: boolean;
  category: string;
}

interface Buffet {
  id: string;
  name: string;
  email: string;
  password: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
  inventory?: InventoryItem[];
}

export const useBuffets = () => {
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuffets = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const url = "http://localhost:3000/api/buffets/get";
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.get(url, { headers });
      const mappedBuffets = response.data.map((buffet: { _id: any; }) => ({
        ...buffet,
        id: buffet._id 
      }));
      setBuffets(mappedBuffets);
      setError(null);
    } catch (err) {
      console.error("Error fetching buffets:", err);
      setError("Failed to fetch buffets");
    } finally {
      setLoading(false);
    }
  };

  const addBuffet = async (newBuffet: Omit<Buffet, "id">) => {
    const token = localStorage.getItem("accessToken");
    const url = "http://localhost:3000/api/buffets/add";
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.post(url, newBuffet, { headers });
      await fetchBuffets(); 
      return response.data;
    } catch (err) {
      console.error("Error adding buffet:", err);
      throw err;
    }
  };

  const updateBuffet = async (buffet: Buffet) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/update/${buffet.id}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.put(url, buffet, { headers });
      await fetchBuffets();
      return response.data;
    } catch (err) {
      console.error("Error updating buffet:", err);
      throw err;
    }
  };

  const deleteBuffet = async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/delete/${id}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.delete(url, { headers });
      await fetchBuffets(); // Refresh the list
      return response.data;
    } catch (err) {
      console.error("Error deleting buffet:", err);
      throw err;
    }
  };

  // Inventory Management Functions
  const getBuffetInventory = async (buffetId: string) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/inventory/${buffetId}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (err) {
      console.error("Error fetching inventory:", err);
      throw err;
    }
  };

  const updateInventory = async (buffetId: string, inventory: InventoryItem[]) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/inventory/${buffetId}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.put(url, { inventory }, { headers });
      return response.data;
    } catch (err) {
      console.error("Error updating inventory:", err);
      throw err;
    }
  };

  const addInventoryItem = async (buffetId: string, item: InventoryItem) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/inventory/${buffetId}/add`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.post(url, item, { headers });
      return response.data;
    } catch (err) {
      console.error("Error adding inventory item:", err);
      throw err;
    }
  };

  const removeInventoryItem = async (buffetId: string, itemId: string) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/inventory/${buffetId}/remove/${itemId}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.delete(url, { headers });
      return response.data;
    } catch (err) {
      console.error("Error removing inventory item:", err);
      throw err;
    }
  };

  const toggleItemAvailability = async (buffetId: string, itemId: string) => {
    const token = localStorage.getItem("accessToken");
    const url = `http://localhost:3000/api/buffets/inventory/${buffetId}/toggle/${itemId}`;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.put(url, {}, { headers });
      return response.data;
    } catch (err) {
      console.error("Error toggling item availability:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBuffets();
  }, []);

  return {
    buffets,
    loading,
    error,
    fetchBuffets,
    addBuffet,
    updateBuffet,
    deleteBuffet,
    // Inventory methods
    getBuffetInventory,
    updateInventory,
    addInventoryItem,
    removeInventoryItem,
    toggleItemAvailability,
  };
};

export default useBuffets;