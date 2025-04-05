import { useState } from 'react';
import logoImage from '../../assets/bufegoadmin.png';

interface NavProps {
    username: string;
    handleLogout: () => void;
  }
  
  export const DashboardNav: React.FC<NavProps> = ({ username, handleLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
  
    return (
      <nav className="w-full bg-[var(--admin-surface)] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
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
                className="w-10 h-10 rounded-full bg-[var(--admin-primary)] flex items-center justify-center 
                         text-white hover:bg-[var(--admin-primary-dark)] transition-colors cursor-pointer"
              >
                {username.charAt(0).toUpperCase()}
              </button>
  
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--admin-surface)] rounded-md shadow-lg py-1 border border-[var(--admin-primary-light)]">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-primary-light)] 
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