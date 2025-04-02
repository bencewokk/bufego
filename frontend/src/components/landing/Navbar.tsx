import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export const Navbar = () => {
  return (
    <nav className="w-full bg-[var(--background)] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="text-2xl md:text-3xl font-bold text-[var(--primary)]">
            BüféGO
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <a
              href="/login"
              className="text-[var(--text)] transition-colors text-lg flex items-center gap-2"
              aria-label="Bejelentkezés"
            >
              <FontAwesomeIcon 
                icon={faUser} 
                className="md:hidden text-xl" 
              />
              <span className="hidden md:inline">Bejelentkezés</span>
            </a>
            <a
              href="/register"
              className="bg-[var(--primary)] text-[var(--background)] px-4 py-2 rounded-full 
                           hover:bg-[var(--primary-light)] transition-colors text-lg
                           flex items-center justify-center gap-2"
              aria-label="Regisztráció"
            >
              <FontAwesomeIcon 
                icon={faUserPlus} 
                className="md:hidden" 
              />
              <span className="hidden md:inline">Regisztráció</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};