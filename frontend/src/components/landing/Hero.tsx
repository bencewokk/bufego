export const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary)] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Gyors és egyszerű étkezés a kampuszon
            </h1>
            <p className="text-lg md:text-xl text-white mb-6">
              Keresd meg a legjobb büféket, nézd meg a menüt és rendelj előre - 
              minden egy helyen!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/register" 
                className="bg-white text-[var(--primary)] px-6 py-3 rounded-full 
                          font-medium text-center hover:bg-gray-100 transition-colors"
              >
                Regisztráció
              </a>
              <a 
                href="/about" 
                className="border-2 border-white text-white px-6 py-3 rounded-full 
                          font-medium text-center hover:bg-white/10 transition-colors"
              >
                Tudj meg többet
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};