import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
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