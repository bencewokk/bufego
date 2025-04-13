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
  faTimes,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

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
  dailyHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
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

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


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
        // Add sample daily hours if not available in the API response
        const buffetData = { 
          ...data, 
          id: data._id,
          dailyHours: data.dailyHours || {
            monday: "7:00 AM - 9:00 PM",
            tuesday: "7:00 AM - 9:00 PM",
            wednesday: "7:00 AM - 9:00 PM",
            thursday: "7:00 AM - 9:00 PM",
            friday: "7:00 AM - 10:00 PM",
            saturday: "8:00 AM - 10:00 PM",
            sunday: "8:00 AM - 8:00 PM"
          }
        };
        setBuffet(buffetData);
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

  // Render function for Google Maps Wrapper
  const renderMap = (status: Status) => {
    if (status === Status.LOADING) return <div>Loading map...</div>;
    if (status === Status.FAILURE) return <div>Failed to load map.</div>;
    return <MapComponent location={buffet.location} />;
  };

  const inventoryByCategory: Record<string, InventoryItem[]> = {};
  buffet.inventory?.forEach((item) => {
    if (!inventoryByCategory[item.category]) {
      inventoryByCategory[item.category] = [];
    }
    inventoryByCategory[item.category].push(item);
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = buffet.dailyHours ? buffet.dailyHours[today as keyof typeof buffet.dailyHours] : buffet.openingHours;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 relative h-96 bg-gradient-to-r from-blue-50 to-purple-50">
              {buffet.image ? (
                <img
                  src={buffet.image}
                  alt={buffet.name}
                  className="w-full h-full object-cover object-center rounded-lg shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <span className="text-gray-500 text-xl">🍽️ Buffet Preview</span>
                </div>
              )}
              <div className="absolute top-10 right-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center">
                <FontAwesomeIcon icon={faClock} style={{ color: "var(--primary)" }} className="mr-2" />
                <span className="font-medium text-gray-700">Today: {todayHours}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text)" }}>
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
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                        Location
                      </h3>
                      <p className="mb-4 text-gray-700">{buffet.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      style={{ color: "var(--primary)" }}
                      className="mt-1 mr-4 text-xl" 
                    />
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                        Daily Hours
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {buffet.dailyHours && Object.entries(buffet.dailyHours).map(([day, hours]) => (
                          <div key={day} className={`flex justify-between ${day === today ? 'font-semibold' : ''}`}>
                            <span className="capitalize">{day}</span>
                            <span className="text-gray-700 ml-4">{hours}</span>
                          </div>
                        ))}
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
                        <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>
                          Contact Email
                        </h3>
                        <a href={`mailto:${buffet.email}`} className="link-color">
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
                    <h3 className="font-semibold" style={{ color: "var(--text)" }}>
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

          {/* Full width map section */}
          <div className="w-full p-6 md:p-8 border-t border-gray-100">
            <h3 className="font-semibold text-xl mb-4" style={{ color: "var(--text)" }}>
              Find Us
            </h3>
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
              {apiKey ? (
                <Wrapper apiKey={apiKey} render={renderMap} />
              ) : (
                <div className="text-red-600 w-full h-full flex items-center justify-center">
                  Google Maps API key is missing.
                </div>
              )}
            </div>
          </div>

          {buffet.inventory && buffet.inventory.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-100">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg mr-4 icon-bg">
                  <FontAwesomeIcon icon={faBoxOpen} className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
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
                      <h3 className="font-semibold text-lg" style={{ color: "var(--text)" }}>
                        {category} ({items.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3">
                        {items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center group">
                            <span className="transition-colors group-hover-link" style={{ color: "var(--text)" }}>
                              {item.name}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                                item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={item.available ? faCheck : faTimes}
                                className="mr-1.5"
                              />
                              {item.available ? "Available" : "Out of Stock"}
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
      <style>{`
        .link-color {
          color: var(--primary);
          transition: color 0.2s;
        }
        .link-color:hover {
          color: var(--primary-dark);
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
};

// Map Component to Render the Google Map
const MapComponent = ({ location }: { location: string }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 }, // Default center, will be updated by geocoder
        zoom: 15,
      });
      setMap(newMap);

      // Geocode the buffet location to get coordinates
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          newMap.setCenter({ lat: lat(), lng: lng() });
          new google.maps.Marker({
            position: { lat: lat(), lng: lng() },
            map: newMap,
            title: location,
          });
        } else {
          console.error("Geocode failed: ", status);
        }
      });
    }
  }, [location, map]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default BuffetDetails;