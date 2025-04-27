import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faListUl, faShoppingCart, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

interface StepProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

const Step = ({ icon, title, description, delay }: StepProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay * 0.2 }}
      className="flex flex-col items-center mb-8 md:mb-0 w-full md:w-1/4 px-4 relative z-10 group"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-full" />
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 relative shadow-lg hover:scale-110 transition-transform duration-300">
          <FontAwesomeIcon icon={icon} className="transform group-hover:rotate-[-10deg] transition-transform duration-300" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-[var(--text)] bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-[var(--text)] text-center text-md leading-relaxed max-w-[200px] opacity-90">
        {description}
      </p>
    </motion.div>
  );
};

export const HowItWorks = () => {
  const steps = [
    { icon: faSearch, title: "Keress", description: "Találd meg a közelben lévő büfékat vagy keress név szerint" },
    { icon: faListUl, title: "Böngéssz", description: "Nézd meg a kinálatot és válaszd ki kedvenc ételeidet" },
    { icon: faShoppingCart, title: "Rendelj", description: "Add le a rendelésed és fizesd ki biztonságosan online" },
    { icon: faUtensils, title: "Élvezd", description: "Értesítést kapsz, ha elkészült az ételed. Csak át kell venned" }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--background)] to-[var(--secondary)]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl p-2 font-extrabold mb-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] bg-clip-text text-transparent">
            Hogyan működik?
          </h2>
          <p className="text-lg text-[var(--text)] mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
            A BüféGO egyszerűen használható, hogy a lehető <span className="font-semibold text-[var(--primary)]">legyorsabban</span> hozzájuss az ételedhez
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row justify-between items-start">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary-light)]/20 rounded-full">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] origin-left rounded-full"
            />
          </div>

          {steps.map((step, index) => (
            <Step key={index} {...step} delay={index} />
          ))}
        </div>
      </div>
    </section>
  );
};