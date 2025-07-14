
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12">
              <img 
                src="/lovable-uploads/16d2ddd6-1606-46f8-85b2-ccc3f963b042.png" 
                alt="TasAgro Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">
              Inicio
            </a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">
              Servicios
            </a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors duration-200">
              Contacto
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-700">
              Iniciar Sesión
            </Button>
            <Button className="bg-agro-gradient hover:bg-agro-600 text-white">
              Registrarse
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 animate-fade-in">
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Inicio
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Servicios
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Contacto
              </a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-700">
                  Iniciar Sesión
                </Button>
                <Button className="w-full bg-agro-gradient hover:bg-agro-600 text-white">
                  Registrarse
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
