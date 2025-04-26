import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import logoImage from '../../assets/bufego.png';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  let userEmail = null;
  let userRole = null;
  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();
  if (token) {
    try {
      // @ts-ignore
      const decoded = jwtDecode(token);
      // @ts-ignore
      userEmail = decoded.email || decoded.username || null;
      // @ts-ignore
      userRole = decoded.role || null;
    } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
    window.location.reload(); // Ensures UI updates everywhere
  };

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

          <div className="flex items-center gap-4 md:gap-8">
            {userEmail ? (
              <>
                <span
                  className="text-[var(--text)] text-md flex items-center gap-2 cursor-pointer hover:underline"
                  onClick={() => navigate("/user-dashboard")}
                  title="Felhasználói fiók megtekintése"
                >
                  <FontAwesomeIcon icon={faUser} />
                  {userEmail}
                  {userRole && (
                    <span className="ml-1 text-xs text-gray-500">({userRole})</span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors text-md ml-2"
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-[var(--text)] transition-colors text-md flex items-center gap-2"
                  aria-label="Bejelentkezés"
                >
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="md:hidden text-xl" 
                  />
                  <span className="hidden md:inline">Bejelentkezés</span>
                </a>
                <a
                  href="/signup"
                  className="bg-[var(--primary)] text-[var(--background)] px-4 py-2 rounded-full 
                             hover:bg-[var(--primary-light)] transition-colors text-md
                             flex items-center justify-center gap-2"
                  aria-label="Regisztráció"
                >
                  <FontAwesomeIcon 
                    icon={faUserPlus} 
                    className="md:hidden" 
                  />
                  <span className="hidden md:inline">Regisztráció</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};