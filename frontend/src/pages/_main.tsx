import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';

export const MainPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      
      {/* You could add more sections here like:
          - Popular Locations
          - Testimonials
          - FAQ
          - Contact/Footer
      */}
    </div>
  );
};