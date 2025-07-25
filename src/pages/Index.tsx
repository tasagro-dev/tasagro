
import { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import { ComprarCampos } from '@/components/ComprarCampos';

const Index = () => {
  const [showComprarCampos, setShowComprarCampos] = useState(false);

  const handleComprarClick = () => {
    setShowComprarCampos(true);
  };

  const handleBackToHome = () => {
    setShowComprarCampos(false);
  };

  if (showComprarCampos) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <ComprarCampos onBack={handleBackToHome} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection onComprarClick={handleComprarClick} />
      <Footer />
    </div>
  );
};

export default Index;
