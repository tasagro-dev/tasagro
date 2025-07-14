
import { Sprout, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-agro-gradient rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-agro-gradient">TasAgro</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              La plataforma líder en Argentina para tasar y vender propiedades rurales. 
              Conectamos el campo con la tecnología para maximizar el valor de tu inversión.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@tasagro.com.ar</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>+54 11 4000-0000</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Tasación Rural</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Venta de Campos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Asesoramiento</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Valuaciones</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Quiénes Somos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Contacto</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="text-gray-400 hover:text-agro-400 transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 TasAgro. Todos los derechos reservados. Hecho con ❤️ para el campo argentino.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
