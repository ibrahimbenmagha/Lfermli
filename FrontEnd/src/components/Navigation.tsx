import { Heart, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">LFERMLI</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</Link>
            <Link to="/infirmieres" className="text-gray-700 hover:text-blue-600 transition-colors">Nos Infirmières</Link>
            <Link to="/#equipe" className="text-gray-700 hover:text-blue-600 transition-colors">Équipe</Link>
            <Link to="/#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Phone className="h-4 w-4 mr-2" />
              Urgence 24/7
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
