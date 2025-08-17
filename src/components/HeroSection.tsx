import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import campoVerdeImg from '@/assets/campo-verde.jpg';
import tabletNegociosImg from '@/assets/tablet-negocios.jpg';

interface HeroSectionProps {
  onComprarClick: () => void;
}

const HeroSection = ({ onComprarClick }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sección Izquierda - Quiero Comprar */}
      <div 
        className="flex-1 min-h-[50vh] md:min-h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${campoVerdeImg})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center px-6">
          <Button 
            size="lg"
            className="bg-agro-gradient hover:bg-agro-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={onComprarClick}
          >
            QUIERO COMPRAR
          </Button>
        </div>
      </div>

      {/* Sección Derecha - Quiero Tasar/Vender */}
      <div 
        className="flex-1 min-h-[50vh] md:min-h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${tabletNegociosImg})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center px-6">
          <Button 
            size="lg"
            className="bg-white/95 backdrop-blur-sm hover:bg-white text-agro-600 hover:text-agro-700 px-8 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-agro-600/20 transform hover:scale-105 transition-all duration-300 border-2 border-agro-500/20 hover:border-agro-500/40 animate-fade-in"
            onClick={() => navigate('/tasar-campo')}
          >
            <span className="drop-shadow-sm">QUIERO TASAR/VENDER MI CAMPO</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
