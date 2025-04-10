import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar";

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
  location: string;
  openingHours: string;
  image: string;
  tags?: string[];
  inventory?: InventoryItem[];
}

export const BuffetDashboard = () => {
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<InventoryItem>({ name: "", available: true, category: "Egyéb" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuffetData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming that the buffet information is provided in response.data.user
        setBuffet(response.data.user);
        if (response.data.user && response.data.user.image) {
          setImagePreview(response.data.user.image);
        }
        
        // Fetch inventory if buffet data is available
        if (response.data.user && response.data.user.id) {
          fetchInventory(response.data.user.id);
        }
      } catch (error) {
        console.error("Error fetching buffet data:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBuffetData();
  }, [navigate]);

  const fetchInventory = async (buffetId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/buffets/inventory/${buffetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setUpdateMessage({text: "Please select an image file", type: 'error'});
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUpdateMessage({text: "Image must be smaller than 5MB", type: 'error'});
        return;
      }
      
      setUploadedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!buffet || !uploadedImage) return;
    
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    
    setUploading(true);
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      const response = await axios.post(
        `http://localhost:3000/api/buffets/${buffet.id}/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update buffet data with new image URL
      if (response.data && response.data.imageUrl) {
        setBuffet(prev => prev ? {...prev, image: response.data.imageUrl} : null);
        setUpdateMessage({text: "Image uploaded successfully!", type: 'success'});
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUpdateMessage({text: "Failed to upload image. Please try again.", type: 'error'});
    } finally {
      setUploading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!buffet) {
    return <div>Error loading buffet details.</div>;
  }

  // Group inventory items by category
  const groupedInventory: Record<string, InventoryItem[]> = {};
  inventory.forEach(item => {
    if (!groupedInventory[item.category]) {
      groupedInventory[item.category] = [];
    }
    groupedInventory[item.category].push(item);
  });

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Buffet Dashboard</h1>
        
        {/* Buffet details & Image upload */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Buffet Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold">Név: </span>{buffet.name}
                </div>
                <div>
                  <span className="font-semibold">Email: </span>{buffet.email}
                </div>
                <div>
                  <span className="font-semibold">Helyszín: </span>{buffet.location}
                </div>
                <div>
                  <span className="font-semibold">Nyitvatartás: </span>{buffet.openingHours}
                </div>
                <div>
                  <span className="font-semibold">Címkék: </span>
                  {buffet.tags && buffet.tags.length > 0 ? buffet.tags.join(", ") : "Nincsenek címkék"}
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Buffet Image</h2>
              <div className="flex flex-col items-center">
                <div className="w-full h-64 mb-4 p-2 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Buffet preview" 
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500">No image uploaded</p>
                      <p className="text-sm text-gray-400">Upload an image to showcase your buffet</p>
                    </div>
                  )}
                </div>
                
                <div className="w-full flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <label className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-center cursor-pointer transition">
                    Select Image
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleImageChange}
                      accept="image/*"
                      ref={fileInputRef}
                    />
                  </label>
                  <button
                    onClick={handleUploadImage}
                    disabled={!uploadedImage || uploading}
                    className={`px-4 py-2 rounded transition ${
                      uploadedImage && !uploading 
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                
                {updateMessage && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    updateMessage.type === 'success' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {updateMessage.text}
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  <p>Accepted formats: JPG, PNG, GIF</p>
                  <p>Maximum size: 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Added Érintős nézet button */}
        <button
          onClick={() => navigate("/buffet-dashboard/touch")}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Érintős nézet
        </button>
        
        {/* Inventory management */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Kínálat kezelése</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition"
            >
              {showAddForm ? 'Mégse' : 'Új tétel hozzáadása'}
            </button>
          </div>
          
          {/* Add new item form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Termék neve</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e                  .target.value})}
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
          )}
          
          {/* Display inventory */}
          <div>
            {Object.keys(groupedInventory).length === 0 ? (
              <p className="text-gray-500">Még nincs termék a kínálatban. Kattints a "Új tétel hozzáadása" gombra a kezdéshez.</p>
            ) : (
              Object.entries(groupedInventory).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <h3 className="font-medium text-lg mb-2">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((item) => (
                      <div 
                        key={item._id} 
                        className={`p-3 rounded-lg flex justify-between items-center border ${
                          item.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="font-medium">{item.name}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleAvailability(item._id!)}
                            className={`px-2 py-1 rounded text-sm ${
                              item.available 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {item.available ? 'Elfogyott' : 'Elérhető'}
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item._id!)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary-dark)] transition"
        >
          Kijelentkezés
        </button>
      </div>
    </div>
  );
};

export default BuffetDashboard;