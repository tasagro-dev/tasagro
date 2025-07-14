
import { ArrowRight, Calculator, Store, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-50 via-white to-agro-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Content */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tu campo vale más de lo que{' '}
            <span className="text-agro-gradient">imaginás</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto" style={{ color: '#444444' }}>
            TasAgro te ayuda a conocer el valor real de tu propiedad rural y a conectar con compradores serios del sector agropecuario.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-agro-gradient hover:bg-agro-600 text-white px-8 py-4 text-lg"
            >
              Comenzar ahora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-agro-600 text-agro-600 hover:bg-agro-50 px-8 py-4 text-lg"
            >
              Ver demo
            </Button>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tasa tu Propiedad */}
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg animate-scale-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-agro-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tasá tu Propiedad Rural
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Obtené una valuación automática y precisa de tu campo. Nuestro algoritmo considera hectáreas, ubicación, tipo de suelo, mejoras y más factores clave.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Valuación instantánea
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Análisis detallado del suelo
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Comparación con mercado
                </li>
              </ul>
              <Button className="w-full bg-agro-gradient hover:bg-gradient-to-br hover:from-agro-600 hover:via-agro-700 hover:to-agro-800 hover:shadow-xl text-white group-hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Tasar mi propiedad
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Publicá y Vendé */}
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg animate-scale-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-agro-gradient rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Publicá y Vendé tu Campo
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Creá un anuncio profesional para tu propiedad rural. Llegá a compradores serios con fotos, ubicación exacta, precio y descripción detallada.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Galería de fotos profesional
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Mapas y ubicación precisa
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-agro-500 rounded-full mr-3"></div>
                  Red de compradores verificados
                </li>
              </ul>
              <Button className="w-full bg-agro-gradient hover:bg-gradient-to-br hover:from-agro-600 hover:via-agro-700 hover:to-agro-800 hover:shadow-xl text-white group-hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Publicar mi campo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 text-center">
          <div className="animate-fade-in">
            <div className="text-3xl md:text-4xl font-bold text-agro-600 mb-2">+500</div>
            <div className="text-gray-600">Propiedades tasadas</div>
          </div>
          <div className="animate-fade-in">
            <div className="text-3xl md:text-4xl font-bold text-agro-600 mb-2">+150</div>
            <div className="text-gray-600">Campos vendidos</div>
          </div>
          <div className="animate-fade-in">
            <div className="text-3xl md:text-4xl font-bold text-agro-600 mb-2">95%</div>
            <div className="text-gray-600">Precisión en tasaciones</div>
          </div>
          <div className="animate-fade-in">
            <div className="text-3xl md:text-4xl font-bold text-agro-600 mb-2">24hs</div>
            <div className="text-gray-600">Tiempo promedio venta</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator arrow - always visible */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-agro-600">
          <span className="text-sm mb-2 text-gray-500">Más información</span>
          <ChevronDown className="w-6 h-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
