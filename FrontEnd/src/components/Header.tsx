
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-medical bg-clip-text text-transparent">
              Lfermli
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
              À propos
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Connexion
            </Button>
            <Button 
              onClick={() => navigate('/RegisterPatient')}
              className="bg-secondary hover:bg-secondary-600 text-white"
            >
              S'inscrire
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-primary transition-colors">
                Services
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">
                À propos
              </Link>
              <Link to="/blog" className="text-gray-700 hover:text-primary transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Connexion
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-secondary hover:bg-secondary-600 text-white"
                >
                  S'inscrire
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
