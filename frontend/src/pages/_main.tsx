import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
// import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';

export const MainPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />

      
    </div>
  );
};