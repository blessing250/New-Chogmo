import React from 'react';
import Hero from './Hero';
import Features from './Features';
import Services from './Services';
import Testimonials from './Testimonials';
import CTA from './CTA';
import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black">
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <Services />
      <Testimonials />
      <CTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
};

export default LandingPage;