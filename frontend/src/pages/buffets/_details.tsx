import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Navbar } from "../../components/landing/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClock, 
  faMapMarkerAlt, 
  faArrowLeft, 
  faTag, 
  faEnvelope,
  faBoxOpen,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

interface InventoryItem {
  name: string;
  available: boolean;
  category: string;
}

interface Buffet {
  id: string;
  name: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
  email?: string;
  password?: string;
  __v?: number;
  inventory?: InventoryItem[];
}

export const BuffetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [buffet, setBuffet] = useState<Buffet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Set custom CSS variables on the root element
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", "#ffffffff");
    root.style.setProperty("--secondary", "#ffe6c0ff");
    root.style.setProperty("--primary-light", "#ffb340ff");
    root.style.setProperty("--primary", "#ff9800");
    root.style.setProperty("--primary-dark", "#804d00");
    root.style.setProperty("--text", "#333333");
  }, []);

  useEffect(() => {
    const fetchBuffet = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        let response;
        if (token) {
          response = await axios.get(`http://localhost:3000/api/buffets/get/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          response = await axios.get(`http://localhost:3000/api/buffets/get/${id}`);
        }
        const data = response.data;
        setBuffet({ ...data, id: data._id });
      } catch (err) {
        console.error("Error fetching buffet details:", err);
        setError("Failed to load buffet details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBuffet();
  }, [id]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !buffet) {
    return (
      <div style={{ backgroundColor: "var(--background)" }}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg text-red-600 bg-red-100 p-4 rounded-lg shadow">
            <p className="font-bold">Error</p>
            <p>{error || "Buffet not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group inventory items by category
  const inventoryByCategory: Record<string, InventoryItem[]> = {};
  buffet.inventory?.forEach(item => {
    if (!inventoryByCategory[item.category]) {
      inventoryByCategory[item.category] = [];
    }
    inventoryByCategory[item.category].push(item);
  });

  return (
    <div style={{ backgroundColor: "var(--background)" }} className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/buffets" 
          className="inline-flex items-center transition duration-200 mb-6 group link-color"
        >
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            className="mr-2 transition-transform group-hover:-translate-x-1" 
          />
          <span className="font-medium">Explore Other Buffets</span>
        </Link>
  
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="relative h-96 bg-gradient-to-r from-blue-50 to-purple-50">
              {buffet.image ? (
                <img 
                  src={buffet.image} 
                  alt={buffet.name} 
                  className="w-full h-full object-cover object-center" 
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                  <span className="text-gray-500 text-xl">🍽️ Buffet Preview</span>
                </div>
              )}
              
              {/* Opening Hours Badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center">
                <FontAwesomeIcon icon={faClock} style={{ color: "var(--primary)" }} className="mr-2" />
                <span className="font-medium text-gray-700">{buffet.openingHours}</span>
              </div>
            </div>
  
            {/* Details Section */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 
                  className="text-4xl font-bold mb-4" 
                  style={{ color: "var(--text)" }}
                >
                  {buffet.name}
                </h1>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FontAwesomeIcon 
                      icon={faMapMarkerAlt} 
                      style={{ color: "var(--primary)" }} 
                      className="mt-1 mr-4 text-xl" 
                    />
                    <div>
                      <h3 
                        className="font-semibold mb-1" 
                        style={{ color: "var(--text)" }}
                      >
                        Location
                      </h3>
                      <p className="mb-4 text-gray-700">{buffet.location}</p>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <img 
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(buffet.location)}&zoom=15&size=600x150&maptype=roadmap&key=YOUR_API_KEY`}
                          alt="Location map"
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    </div>
                  </div>
  
                  {buffet.email && (
                    <div className="flex items-center">
                      <FontAwesomeIcon 
                        icon={faEnvelope} 
                        style={{ color: "var(--primary)" }}
                        className="mr-4 text-xl" 
                      />
                      <div>
                        <h3 
                          className="font-semibold mb-1" 
                          style={{ color: "var(--text)" }}
                        >
                          Contact Email
                        </h3>
                        <a 
                          href={`mailto:${buffet.email}`}
                          className="link-color"
                        >
                          {buffet.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
              {buffet.tags?.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-3">
                    <FontAwesomeIcon 
                      icon={faTag} 
                      style={{ color: "var(--primary)" }}
                      className="mr-3 text-lg" 
                    />
                    <h3 
                      className="font-semibold" 
                      style={{ color: "var(--text)" }}
                    >
                      Features & Amenities
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {buffet.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 rounded-full text-sm hover:bg-primary-light transition-colors flex items-center tag-bg border tag-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Inventory Section */}
          {buffet.inventory && buffet.inventory.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg mr-4 icon-bg">
                  <FontAwesomeIcon 
                    icon={faBoxOpen} 
                    className="text-white text-xl" 
                  />
                </div>
                <h2 
                  className="text-2xl font-bold" 
                  style={{ color: "var(--text)" }}
                >
                  Menu & Availability
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(inventoryByCategory).map(([category, items]) => (
                  <div 
                    key={category} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 
                        className="font-semibold text-lg" 
                        style={{ color: "var(--text)" }}
                      >
                        {category} ({items.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3">
                        {items.map((item, index) => (
                          <li 
                            key={index} 
                            className="flex justify-between items-center group"
                          >
                            <span className="transition-colors group-hover-link" style={{ color: "var(--text)" }}>
                              {item.name}
                            </span>
                            <span 
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm 
                                ${item.available 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'}`}
                            >
                              <FontAwesomeIcon 
                                icon={item.available ? faCheck : faTimes} 
                                className="mr-1.5" 
                              />
                              {item.available ? 'Available' : 'Out of Stock'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Custom CSS classes to use the CSS variables */}
      <style>{`
        .link-color {
          color: var(--primary);
          transition: color 0.2s;
        }
        .link-color:hover {
          color: var(--primary-dark);
        }
        .icon-color {
          color: var(--primary);
        }
        .tag-bg {
          background-color: var(--primary-light);
        }
        .tag-border {
          border: 1px solid var(--primary-light);
        }
        .icon-bg {
          background-color: var(--primary);
        }
        .group-hover-link:hover {
          color: var(--primary-dark);
        }
      `}</style>
    </div>
  );
}

export default BuffetDetails;
