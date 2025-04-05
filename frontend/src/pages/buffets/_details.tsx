// src/pages/BuffetDetailsPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';

import { Navbar } from '../../components/landing/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faStar, 
  faClock, 
  faUtensils,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useIntersection } from '../../hooks/useIntersection';

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

  // Enhanced category tracking with Intersection Observer
  const [categoryElements, setCategoryElements] = useState<HTMLElement[]>([]);
  const { visibleElements: visibleCategories, visibilityPercentages } = useIntersection(categoryElements, "-100px 0px -300px 0px");

  // Use a ref callback to collect category elements
  const setCategoryRef = (element: HTMLElement | null) => {
    if (element && !categoryElements.some(el => el.id === element.id)) {
      setCategoryElements(prev => [...prev, element]);
    }
  };

  // Make sure all categories are observed after rendering
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-category-section]')) as HTMLElement[];
    if (elements.length > 0 && elements.length !== categoryElements.length) {
      setCategoryElements(elements);
    }
  }, [buffet]);

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
        <div className="sticky top-0 z-20 bg-white py-4 mb-6 border-b shadow-sm">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 px-1">
              {buffet.menu.map((category, index) => {
                const isVisible = visibleCategories.has(category.category);
                const visibilityPercent = visibilityPercentages[category.category] || 0;
                
                return (
                  <a
                    key={index}
                    href={`#${category.category}`}
                    className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 overflow-hidden ${
                      isVisible ? 'text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: isVisible 
                        ? `color-mix(in srgb, var(--primary) ${visibilityPercent}%, var(--primary-dark))`
                        : '',
                      transform: isVisible 
                        ? `scale(${1 + (visibilityPercent / 500)})`
                        : 'scale(1)',
                      transition: 'all 150ms ease-out'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(category.category)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                  >
                    {isVisible && (
                      <div 
                        className="absolute inset-0 bg-white opacity-20 blur-sm"
                        style={{ opacity: visibilityPercent / 300 }}
                      />
                    )}
                    <span className="relative z-10">{category.category}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* todo ezt jora meg kell csinalni */}
        {/* Menu Section with Refs */}
        {buffet.menu.map((category, index) => (
          <div 
            key={index} 
            id={category.category}
            ref={setCategoryRef}
            data-category-section
            className="mb-8 scroll-mt-28 pb-12"
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