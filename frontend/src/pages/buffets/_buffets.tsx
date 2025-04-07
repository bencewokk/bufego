// src/pages/BuffetListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Define Buffet interface consistent with MongoDB structure
interface Buffet {
  id: string; // MongoDB ObjectId as string
  name: string;
  location: string;
  openingHours: string;
  image: string;
  tags: string[];
}

export const BuffetListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [buffets, setBuffets] = useState<Buffet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch buffets from MongoDB on component mount
  useEffect(() => {
    const fetchBuffets = async () => {
      try {
        // Get the token (if you're using token-based auth for public routes too)
        const token = localStorage.getItem('accessToken');
        
        // Option 1: With authentication (like your admin page)
        if (token) {
          const response = await axios.get('http://localhost:3000/api/buffets', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBuffets(response.data);
        } 
        // Option 2: Without authentication (if your API allows public access)
        else {
          const response = await axios.get('http://localhost:3000/api/buffets/public');
          setBuffets(response.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching buffets:', err);
        setError('Failed to load buffets. Please try again later.');
        setLoading(false);
      }
    };

    fetchBuffets();
  }, []);
  
  const filteredBuffets = buffets.filter(buffet => 
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Buffets betöltése...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="ml-4 px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Újrapróbálkozás
            </button>
          </div>
        ) : filteredBuffets.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Nincs találat</div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};