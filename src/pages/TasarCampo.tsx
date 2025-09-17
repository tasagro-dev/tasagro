import { ArrowRight, Calculator, Sprout, Star, MapPin, TrendingUp, CheckCircle, Users, Clock, Award, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ComprarCampos } from '@/components/ComprarCampos';
import { useState } from 'react';

const TasarCampo = () => {
  const navigate = useNavigate();
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
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-agro-50 via-white to-agro-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Main Hero Content */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-agro-100 text-agro-700 mb-8">
                <TrendingUp className="w-4 h-4 mr-2" />
                #1 en Tasaciones Rurales Argentina
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Tu campo vale más de lo que{' '}
              <span className="text-agro-gradient animate-pulse">imaginás</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              La plataforma líder en tasaciones rurales de Argentina. Conocé el valor real de tu propiedad 
              y conectá con compradores serios del sector agropecuario.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-agro-gradient hover:bg-gradient-to-br hover:from-agro-600 hover:via-agro-700 hover:to-agro-800 text-white px-10 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                <Calculator className="mr-3 w-6 h-6" />
                Tasar mi Campo Gratis
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-agro-600 text-agro-600 hover:bg-agro-50 px-10 py-6 text-xl rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={handleComprarClick}
              >
                <Sprout className="mr-3 w-6 h-6" />
                Explorar Campos
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 mb-12">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-agro-500 mr-2" />
                Tasación instantánea
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-agro-500 mr-2" />
                100% gratuito
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-agro-500 mr-2" />
                Datos verificados
              </div>
            </div>
          </div>

          {/* Service Cards - Enhanced */}
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto mb-20">
            {/* Tasa tu Propiedad */}
            <Card className="group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl animate-scale-in h-full bg-white/80 backdrop-blur-sm">
              <CardContent className="p-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-20 h-20 bg-agro-gradient rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Tasá tu Propiedad Rural
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Obtené una valuación automática y precisa de tu campo. Nuestro algoritmo considera hectáreas, ubicación, tipo de suelo, mejoras y más factores clave.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Valuación instantánea basada en IA</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Análisis detallado del suelo y clima</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Comparación con mercado regional</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-agro-gradient hover:bg-gradient-to-br hover:from-agro-600 hover:via-agro-700 hover:to-agro-800 hover:shadow-2xl text-white group-hover:shadow-xl transition-all duration-500 transform hover:scale-105 mt-auto py-4 text-lg rounded-xl"
                  onClick={() => navigate('/auth')}
                >
                  Comenzar Tasación
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>

            {/* Publicá y Vendé */}
            <Card className="group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 border-0 shadow-xl animate-scale-in h-full bg-white/80 backdrop-blur-sm">
              <CardContent className="p-10 flex flex-col h-full">
                <div className="flex items-center justify-center w-20 h-20 bg-agro-gradient rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Sprout className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Publicá y Vendé tu Campo
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  Creá un anuncio profesional para tu propiedad rural. Llegá a compradores serios con fotos, ubicación exacta, precio y descripción detallada.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Galería de fotos profesional</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Mapas y geolocalización precisa</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-3 h-3 bg-agro-500 rounded-full mr-4"></div>
                    <span className="font-medium">Red de compradores verificados</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-agro-gradient hover:bg-gradient-to-br hover:from-agro-600 hover:via-agro-700 hover:to-agro-800 hover:shadow-2xl text-white group-hover:shadow-xl transition-all duration-500 transform hover:scale-105 mt-auto py-4 text-lg rounded-xl"
                  onClick={() => navigate('/auth')}
                >
                  Publicar Campo
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Líderes en el Mercado Rural Argentino
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Miles de productores confían en TasAgro para conocer el valor real de sus propiedades
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-agro-50 to-agro-100">
              <div className="text-4xl md:text-5xl font-bold text-agro-600 mb-2">+2,500</div>
              <div className="text-gray-600 font-medium">Propiedades Tasadas</div>
            </div>
            <div className="animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-agro-50 to-agro-100">
              <div className="text-4xl md:text-5xl font-bold text-agro-600 mb-2">+650</div>
              <div className="text-gray-600 font-medium">Campos Vendidos</div>
            </div>
            <div className="animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-agro-50 to-agro-100">
              <div className="text-4xl md:text-5xl font-bold text-agro-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Precisión en Tasaciones</div>
            </div>
            <div className="animate-fade-in p-6 rounded-2xl bg-gradient-to-br from-agro-50 to-agro-100">
              <div className="text-4xl md:text-5xl font-bold text-agro-600 mb-2">48hs</div>
              <div className="text-gray-600 font-medium">Promedio de Respuesta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-agro-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proceso simple y rápido para obtener la tasación de tu campo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-agro-gradient rounded-full mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Ingresá los Datos</h3>
              <p className="text-gray-600 leading-relaxed">
                Completá la información básica de tu propiedad: ubicación, hectáreas, tipo de suelo y mejoras.
              </p>
            </div>

            <div className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-agro-gradient rounded-full mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Análisis Automático</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro algoritmo analiza tu propiedad comparándola con ventas recientes y datos del mercado.
              </p>
            </div>

            <div className="text-center group">
              <div className="flex items-center justify-center w-16 h-16 bg-agro-gradient rounded-full mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Recibí tu Tasación</h3>
              <p className="text-gray-600 leading-relaxed">
                Obtené un reporte detallado con el valor estimado, análisis de mercado y recomendaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de productores que confiaron en TasAgro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "La tasación fue muy precisa. Vendí mi campo al precio exacto que TasAgro había estimado. Excelente herramienta."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-agro-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-agro-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Carlos Martinez</div>
                    <div className="text-sm text-gray-600">Productor - Santa Fe</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Proceso súper rápido y fácil. En minutos tenía la tasación de mis 500 hectáreas con todos los detalles."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-agro-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-agro-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">María Rodriguez</div>
                    <div className="text-sm text-gray-600">Productora - Córdoba</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "La mejor plataforma para conocer el valor real de los campos. Los datos son muy confiables y actualizados."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-agro-100 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-agro-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Roberto Silva</div>
                    <div className="text-sm text-gray-600">Productor - Buenos Aires</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-agro-600 to-agro-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para Conocer el Valor de tu Campo?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Unite a miles de productores que ya conocen el valor real de sus propiedades
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-agro-600 hover:bg-gray-100 px-10 py-6 text-xl rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/auth')}
            >
              <Calculator className="mr-3 w-6 h-6" />
              Comenzar Ahora - Es Gratis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-agro-600 px-10 py-6 text-xl rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={handleComprarClick}
            >
              Ver Campos en Venta
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TasarCampo;