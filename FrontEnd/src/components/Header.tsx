import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, User, Heart, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import SOSButtonModal from '@/components/SOSButtonModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-xs sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center shadow-xs">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-medical bg-clip-text text-transparent tracking-tight">
              Lfermli
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-7 rtl:space-x-reverse font-medium text-sm">
            <Link to="/" className="text-slate-600 hover:text-teal-600 transition-colors">
              {t('nav.home', 'Accueil')}
            </Link>
            <Link to="/services" className="text-slate-600 hover:text-teal-600 transition-colors">
              {t('nav.services', 'Services')}
            </Link>
            <Link to="/infirmieres" className="text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-1">
              <MapPin className="h-4 w-4 text-teal-600" />
              <span>{t('nav.nurses', 'Trouver un infirmier')}</span>
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-teal-600 transition-colors">
              {t('nav.about', 'À propos')}
            </Link>
            <Link to="/blog" className="text-slate-600 hover:text-teal-600 transition-colors">
              {t('nav.blog', 'Blog')}
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-teal-600 transition-colors">
              {t('nav.contact', 'Contact')}
            </Link>
          </nav>

          {/* Actions: SOS, Lang, Auth */}
          <div className="hidden sm:flex items-center space-x-3 rtl:space-x-reverse">
            {/* SOS Emergency button */}
            <SOSButtonModal variant="header" />

            {/* Language Switcher */}
            <LanguageSelector />

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <User className="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" />
              {t('nav.login', 'Connexion')}
            </Button>

            <Button 
              size="sm"
              onClick={() => navigate('/RegisterPatient')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
            >
              {t('nav.register', "S'inscrire")}
            </Button>
          </div>

          {/* Mobile menu and mobile SOS button */}
          <div className="flex items-center gap-2 lg:hidden">
            <SOSButtonModal variant="header" />
            <LanguageSelector />
            <button
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-fade-in">
            <nav className="flex flex-col space-y-3 text-sm font-medium">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1">
                {t('nav.home', 'Accueil')}
              </Link>
              <Link to="/services" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1">
                {t('nav.services', 'Services')}
              </Link>
              <Link to="/infirmieres" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span>{t('nav.nurses', 'Trouver un infirmier')}</span>
              </Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1">
                {t('nav.about', 'À propos')}
              </Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1">
                {t('nav.blog', 'Blog')}
              </Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-slate-700 hover:text-teal-600 py-1">
                {t('nav.contact', 'Contact')}
              </Link>
              <div className="flex flex-col space-y-2 pt-3 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                  className="w-full justify-center"
                >
                  <User className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('nav.login', 'Connexion')}
                </Button>
                <Button 
                  onClick={() => { setIsMenuOpen(false); navigate('/RegisterPatient'); }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white justify-center"
                >
                  {t('nav.register', "S'inscrire")}
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
