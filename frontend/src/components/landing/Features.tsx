import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faMapMarkerAlt, faMobileAlt, faClock } from '@fortawesome/free-solid-svg-icons';

export const Features = () => {
  const features = [
    {
      icon: faUtensils,
      title: "Aktuális menük",
      description: "Nézd meg a büfék aktuális kínálatát és válaszd ki kedvencedet!"
    },
    {
      icon: faMapMarkerAlt,
      title: "Helymeghatározás",
      description: "Találd meg az iskolád büféjét könnyen!"
    },
    {
      icon: faMobileAlt,
      title: "Mobil rendelés",
      description: "Rendelj előre és kerüld el a sorban állást!"
    },
    {
      icon: faClock,
      title: "Időmegtakarítás",
      description: "Spórolj időt az előrendeléssel és értesülj ha elkészült az ételed!"
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[var(--text)]">
          Miért válaszd a BüféGO-t?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-[var(--primary)] text-3xl mb-4 flex justify-center">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-[var(--text)]">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};