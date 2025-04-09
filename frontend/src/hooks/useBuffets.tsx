import { useState, useEffect } from "react";
import axios from "axios";

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
      setBuffets(response.data);
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
      await fetchBuffets(); // Refresh the list
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
      await fetchBuffets(); // Refresh the list
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
  };
};

export default useBuffets;