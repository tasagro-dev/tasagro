
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12">
              <img 
                src="/lovable-uploads/142fdbf6-524d-4445-85ef-679e2cb9aecf.png" 
                alt="TasAgro Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-agro-gradient">TasAgro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-agro-600 transition-colors duration-200">
              Inicio
            </Link>
            <a href="#servicios" className="text-gray-700 hover:text-agro-600 transition-colors duration-200">
              Servicios
            </a>
            <a href="#contacto" className="text-gray-700 hover:text-agro-600 transition-colors duration-200">
              Contacto
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              className="bg-agro-gradient hover:bg-agro-600 text-white"
              onClick={handleAuthClick}
            >
              {user ? 'Dashboard' : 'Iniciar Sesión'}
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
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agro-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <a
                href="#servicios"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agro-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Servicios
              </a>
              <a
                href="#contacto"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-agro-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </a>
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  className="w-full bg-agro-gradient hover:bg-agro-600 text-white"
                  onClick={handleAuthClick}
                >
                  {user ? 'Dashboard' : 'Iniciar Sesión'}
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
