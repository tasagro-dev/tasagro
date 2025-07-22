import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import campoVerdeImg from '@/assets/campo-verde.jpg';
import tabletNegociosImg from '@/assets/tablet-negocios.jpg';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sección Izquierda - Quiero Comprar */}
      <div 
        className="flex-1 min-h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${campoVerdeImg})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center px-6">
          <Button 
            size="lg"
            className="bg-agro-gradient hover:bg-agro-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate('#')} // Cambia por la ruta de comprar cuando esté disponible
          >
            QUIERO COMPRAR
          </Button>
        </div>
      </div>

      {/* Sección Derecha - Quiero Tasar/Vender */}
      <div 
        className="flex-1 min-h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${tabletNegociosImg})` }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center px-6">
          <Button 
            size="lg"
            className="bg-agro-gradient hover:bg-agro-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/tasar-campo')}
          >
            QUIERO TASAR/VENDER MI CAMPO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
