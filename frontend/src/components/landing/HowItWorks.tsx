import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faListUl, faShoppingCart, faUtensils } from '@fortawesome/free-solid-svg-icons';

export const HowItWorks = () => {
  const steps = [
    {
      icon: faSearch,
      title: "Keress",
      description: "Találd meg a közelben lévő büféket vagy keress név szerint!"
    },
    {
      icon: faListUl,
      title: "Böngéssz",
      description: "Nézd meg a menüket és válaszd ki kedvenc ételeidet!"
    },
    {
      icon: faShoppingCart,
      title: "Rendelj",
      description: "Add le a rendelésed és fizesd ki biztonságosan!"
    },
    {
      icon: faUtensils,
      title: "Élvezd",
      description: "Értesítést kapsz, ha elkészült az ételed. Csak át kell venned!"
    }
  ];
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-[var(--text)]">
          Hogyan működik?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          A BüféGO egyszerűen használható, hogy a lehető leggyorsabban hozzájuss az ételedhez
        </p>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start">
          {/* Single connecting line that spans across all icons */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gray-300 z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center mb-8 md:mb-0 w-full md:w-1/4 px-4 relative z-10">
              <div className="bg-[var(--primary)] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-[var(--text)]">{step.title}</h3>
              <p className="text-gray-600 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};