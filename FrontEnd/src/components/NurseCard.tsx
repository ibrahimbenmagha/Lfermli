import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Star, Calendar, Plus } from 'lucide-react';

interface Nurse {
  id: number;
  nom: string;
  prenom: string;
  ville: string;
  specialites: string[];
  experience: string;
  image: string;
  disponibilite: string;
}

interface NurseCardProps {
  nurse: Nurse;
}

export const NurseCard = ({ nurse }: NurseCardProps) => {
  const handleReservation = () => {
    alert(`Réservation pour ${nurse.prenom} ${nurse.nom} - ${nurse.ville}`);
  };

  const handleAddToFavorites = () => {
    alert(`${nurse.prenom} ${nurse.nom} ajoutée aux favoris!`);
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 overflow-hidden">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img 
            src={nurse.image}
            alt={`${nurse.prenom} ${nurse.nom}`}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <Badge 
              className={`${
                nurse.disponibilite === 'Disponible' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
              }`}
            >
              {nurse.disponibilite}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-600 text-white">
              <Star className="h-3 w-3 mr-1" />
              Certifiée
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5">
          {/* Name and Location */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {nurse.prenom} {nurse.nom}
            </h3>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{nurse.ville}</span>
            </div>
          </div>
          
          {/* Experience */}
          <div className="flex items-center text-gray-600 mb-3">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">{nurse.experience} d'expérience</span>
          </div>
          
          {/* Specialties */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Spécialités:</p>
            <div className="flex flex-wrap gap-1">
              {nurse.specialites.map((specialite, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {specialite}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleReservation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={nurse.disponibilite === 'Occupée'}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {nurse.disponibilite === 'Disponible' ? 'Réserver' : 'Non disponible'}
            </Button>
            
            <Button 
              onClick={handleAddToFavorites}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter aux favoris
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
