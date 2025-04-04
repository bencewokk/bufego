// src/pages/BuffetDetailsPage.tsx
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faStar, 
  faClock, 
  faUtensils,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Temporary data (replace with API calls later)
const localBuffets = [
  {
    id: 1,
    name: "Főépület Büfé",
    location: "Főépület, földszint",
    rating: 4.5,
    openingHours: "8:00 - 16:00",
    image: "/src/buffet1.jpg",
    tags: ["szendvics", "kávé", "péksütemény"],
    menu: [
      { 
        category: "Szendvicsek",
        items: [
          { name: "Sonkás szendvics", price: 890, description: "Friss zöldségekkel" },
          { name: "Sajtos szendvics", price: 790, description: "Cheddar sajttal" },
        ]
      },
      {
        category: "Italok",
        items: [
          { name: "Cappuccino", price: 450, description: "Örölt kávébab" },
          { name: "Tea", price: 350, description: "Gyümölcsstea választék" },
        ]
      }
    ]
  },
  // ... other buffets
];

export const BuffetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const buffet = localBuffets.find(b => b.id === Number(id));

  if (!buffet) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Büfé nem található</h1>
          <Link to="/buffets" className="text-blue-500 mt-4 inline-block">
            Vissza a büfék listájához
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/buffets" 
            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Vissza az összes büféhoz
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="h-64 bg-gray-200 rounded-lg mb-4">
              <img 
                src={buffet.image} 
                alt={buffet.name} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Info Section */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{buffet.name}</h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-600 w-5" />
                  <span className="text-lg">{buffet.location}</span>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-500 w-5" />
                  <span className="text-lg">{buffet.rating}/5</span>
                </div>
                
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-600 w-5" />
                  <span className="text-lg">{buffet.openingHours}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {buffet.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FontAwesomeIcon icon={faUtensils} className="mr-2" />
            Étlap
          </h2>
          
          {buffet.menu.map((category, index) => (
            <div key={index} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b-2 border-gray-200 pb-2">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-lg">{item.name}</h4>
                      {item.description && 
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                    </div>
                    <span className="font-medium text-[var(--primary)]">
                      {item.price} Ft
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};