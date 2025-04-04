import { useState } from 'react';
import logoImage from '../../assets/bufego.png';

interface NavProps {
    username: string;
    handleLogout: () => void;
  }
  

  export const DashboardNav: React.FC<NavProps> = ({ username, handleLogout }) => {

    const [showDropdown, setShowDropdown] = useState(false);

    return (
    <nav className="w-full bg-[var(--background)] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Logo now links to homepage */}
            <a href="/" aria-label="Főoldal">
              <img 
                src={logoImage} 
                alt="BüféGO Logo" 
                className="h-8 md:h-10"
              />
            </a>
          </div>

          <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center 
                     text-white hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
          >
            {username.charAt(0).toUpperCase()}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-[#333333] hover:bg-[var(--secondary)] 
                         text-left transition-colors cursor-pointer"
              >
                Kijelentkezés
              </button>
            </div>
          )}
        </div>


        </div>
      </div>
    </nav>
  );
};