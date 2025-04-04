// src/pages/BuffetListPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faStar, faClock } from '@fortawesome/free-solid-svg-icons';

// Temporary local data store (will be moved to state management later)
const localBuffets = [
  {
    id: 1,
    name: "Főépület Büfé",
    location: "Főépület, földszint",
    rating: 4.5,
    openingHours: "8:00 - 16:00",
    image: "/src/buffet1.jpg",
    tags: ["szendvics", "kávé", "péksütemény"]
  },
  {
    id: 2,
    name: "Q Épület Étterem",
    location: "Q épület, 1. emelet",
    rating: 4.2,
    openingHours: "10:00 - 18:00",
    image: "/src/buffet2.jpg",
    tags: ["meleg étel", "napi menü", "leves"]
  },
  {
    id: 3,
    name: "Kertészeti Büfé",
    location: "K épület mellett",
    rating: 4.7,
    openingHours: "8:30 - 15:30",
    image: "/src/buffet3.jpg",
    tags: ["gyros", "hamburger", "saláta"]
  }
];

export const BuffetListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBuffets = localBuffets.filter(buffet => 
    buffet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buffet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-[var(--text)]">Büfék a közelben</h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Keresés név vagy étel szerint..."
              className="w-full p-4 rounded-full border border-gray-300 pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuffets.map(buffet => (
            <Link 
              to={`/buffet/${buffet.id}`}
              key={buffet.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                <div className="absolute bottom-0 left-0 bg-[var(--primary)] text-white px-3 py-1 rounded-tr-lg">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  {buffet.openingHours}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-[var(--text)]">{buffet.name}</h2>
                  <div className="flex items-center bg-yellow-100 px-2 py-1 rounded">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                    <span className="font-medium">{buffet.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                  <span>{buffet.location}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {buffet.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};