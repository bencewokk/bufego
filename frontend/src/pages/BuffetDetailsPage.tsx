// src/pages/BuffetDetailsPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
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
    tags: ["szendvics", "kávé", "péksütemény", "leves", "desszert"],
    menu: [
      { 
        category: "Szendvicsek",
        items: [
          { name: "Sonkás szendvics", price: 890, description: "Friss zöldségekkel" },
          { name: "Sajtos szendvics", price: 790, description: "Cheddar sajttal" },
          { name: "Tonhalas szendvics", price: 950, description: "Friss uborkával" },
          { name: "Vegán szendvics", price: 850, description: "Avokádó és hummusszal" },
        ]
      },
      {
        category: "Levesek",
        items: [
          { name: "Húsleves", price: 990, description: "Házi tésztával" },
          { name: "Paradicsomleves", price: 890, description: "Friss bazsalikommal" },
          { name: "Gombakrémleves", price: 950, description: "Pirított gombával" },
        ]
      },
      {
        category: "Főételek",
        items: [
          { name: "Rántott csirke", price: 1490, description: "Hasábburgonyával" },
          { name: "Spagetti Bolognese", price: 1390, description: "Parmezánnal" },
          { name: "Grillezett csirkemell", price: 1590, description: "Friss salátával" },
        ]
      },
      {
        category: "Desszertek",
        items: [
          { name: "Tiramisu", price: 690, description: "Házikészítésű" },
          { name: "Csokoládétorta", price: 790, description: "Málna szósszal" },
          { name: "Palacsinta", price: 590, description: "Nutellával vagy lekváros" },
        ]
      },
      {
        category: "Saláták",
        items: [
          { name: "Cézár saláta", price: 1190, description: "Grillezett csirkemellel" },
          { name: "Görög saláta", price: 990, description: "Feta sajttal" },
          { name: "Quinoa saláta", price: 1290, description: "Avokádóval és édesburgonyával" },
        ]
      }
    ]
  },
  // ... other buffets
];

export const BuffetDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const buffet = localBuffets.find(b => b.id === Number(id));

  // Scroll-based active category navigation
  const [activeCategory, setActiveCategory] = useState('');
  const categoryRefs = useRef<{ [key: string]: HTMLElement }>({});

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 100;
    Object.entries(categoryRefs.current).forEach(([category, el]) => {
      if (
        el.offsetTop <= scrollPosition &&
        el.offsetTop + el.offsetHeight > scrollPosition
      ) {
        setActiveCategory(category);
      }
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

        {/* Sticky Category Navigation */}
        <div className="sticky top-20 z-10 bg-white py-4 mb-6 border-b">
          <div className="flex flex-wrap gap-4">
            {buffet.menu.map((category, index) => (
              <a 
                key={index}
                href={`#${category.category}`}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category.category 
                    ? 'bg-[var(--primary)] text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(category.category)?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
              >
                {category.category}
              </a>
            ))}
          </div>
        </div>

        {/* Menu Section with Refs */}
        {buffet.menu.map((category, index) =>   (
          <div 
            key={index} 
            id={category.category}
            ref={(el) => {
              if (el) categoryRefs.current[category.category] = el;
            }}
            className="mb-8 scroll-mt-24"
          >
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
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}
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
  );
};