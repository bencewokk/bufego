export const Navbar = () => {
  return (
    <nav className="w-full bg-[var(--background)] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 text-[var(--primary)]">
            BüféGO
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a
              href="/login"
              className="text-[var(--text)] transition-colors text-lg"
            >
              Bejelentkezés
            </a>
            <a
              href="/register"
              className="bg-[var(--primary)] text-[var(--background)] px-6 py-2 rounded-full 
                           hover:bg-[var(--primary-light)] transition-colors text-lg text-center
                           w-full md:w-auto"
            >
              Regisztráció
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
