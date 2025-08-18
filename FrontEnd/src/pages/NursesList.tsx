import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { NurseCard } from '@/components/NurseCard';
import { Input } from '@/components/ui/input';
import { Search, Users, Play, Heart, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const nursesData = [
  {
    id: 1,
    nom: "Benali",
    prenom: "Fatima",
    ville: "Casablanca",
    specialites: ["Soins palliatifs", "Gériatrie"],
    experience: "15 ans",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 2,
    nom: "Amrani",
    prenom: "Aicha",
    ville: "Rabat",
    specialites: ["Diabétologie", "Cardiologie"],
    experience: "12 ans",
    image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Occupée"
  },
  {
    id: 3,
    nom: "Tazi",
    prenom: "Khadija",
    ville: "Fès",
    specialites: ["Pédiatrie", "Soins de plaies"],
    experience: "8 ans",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 4,
    nom: "Slaoui",
    prenom: "Zineb",
    ville: "Marrakech",
    specialites: ["Urgences", "Soins intensifs"],
    experience: "10 ans",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 5,
    nom: "Idrissi",
    prenom: "Salma",
    ville: "Tanger",
    specialites: ["Rééducation", "Kinésithérapie"],
    experience: "7 ans",
    image: "https://images.unsplash.com/photo-1594824596504-b0dec83b794e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 6,
    nom: "Benkirane",
    prenom: "Nadia",
    ville: "Agadir",
    specialites: ["Oncologie", "Chimiothérapie"],
    experience: "13 ans",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 7,
    nom: "Filali",
    prenom: "Houda",
    ville: "Meknès",
    specialites: ["Dermatologie", "Allergologie"],
    experience: "9 ans",
    image: "https://images.unsplash.com/photo-1584467735871-8dd4827f3e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 8,
    nom: "Alaoui",
    prenom: "Samira",
    ville: "Oujda",
    specialites: ["Psychiatrie", "Thérapie comportementale"],
    experience: "11 ans",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Occupée"
  },
  {
    id: 9,
    nom: "Hajjaji",
    prenom: "Laila",
    ville: "Tétouan",
    specialites: ["Soins à domicile", "Gériatrie"],
    experience: "14 ans",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 10,
    nom: "Chraibi",
    prenom: "Malika",
    ville: "Salé",
    specialites: ["Maternité", "Néonatologie"],
    experience: "16 ans",
    image: "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 11,
    nom: "Berrada",
    prenom: "Rachida",
    ville: "Kenitra",
    specialites: ["Cardiologie", "Hypertension"],
    experience: "13 ans",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  },
  {
    id: 12,
    nom: "Ouali",
    prenom: "Yasmine",
    ville: "El Jadida",
    specialites: ["Soins palliatifs", "Accompagnement"],
    experience: "9 ans",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    disponibilite: "Disponible"
  }
];

export const NursesList = () => {
  const [searchCity, setSearchCity] = useState('');
  
  const filteredNurses = nursesData.filter(nurse =>
    nurse.ville.toLowerCase().includes(searchCity.toLowerCase())
  );

  const uniqueCities = [...new Set(nursesData.map(nurse => nurse.ville))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      {/* Hero Section with Video */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600/90 to-green-600/90 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Équipe médicale professionnelle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="flex items-center mb-6">
                <Users className="h-12 w-12 text-white mr-4" />
                <h1 className="text-5xl font-bold">
                  Nos Infirmières Professionnelles au Maroc
                </h1>
              </div>
              <p className="text-xl mb-8 leading-relaxed">
                Découvrez notre équipe d'infirmières qualifiées et expérimentées, 
                disponibles dans toutes les principales villes du Maroc pour vous offrir 
                les meilleurs soins avec compassion et expertise.
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-4 mb-3 inline-block">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold">Soins Compassionnés</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-4 mb-3 inline-block">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold">Sécurité Garantie</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-4 mb-3 inline-block">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-semibold">Expertise Certifiée</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Vidéo de présentation LFERMLI"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50 text-white p-6 rounded-full">
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Découvrez LFERMLI en vidéo
                </h3>
                <p className="text-white/90">
                  Une présentation complète de nos services et de notre approche professionnelle au Maroc
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Photos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Infirmière professionnelle"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-blue-100"
                />
              </div>
              <h3 className="text-3xl font-bold text-blue-600 mb-2">80+</h3>
              <p className="text-gray-600">Infirmières Qualifiées</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Soins spécialisés"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-green-100"
                />
              </div>
              <h3 className="text-3xl font-bold text-green-600 mb-2">15+</h3>
              <p className="text-gray-600">Spécialités Médicales</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Villes couvertes"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-purple-100"
                />
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-2">12+</h3>
              <p className="text-gray-600">Villes du Maroc</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1584467735871-8dd4827f3e0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                  alt="Satisfaction client"
                  className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-yellow-100"
                />
              </div>
              <h3 className="text-3xl font-bold text-yellow-600 mb-2">98%</h3>
              <p className="text-gray-600">Satisfaction Client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par ville (ex: Casablanca, Rabat, Fès...)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <div className="text-gray-600">
                <span className="font-medium">{filteredNurses.length}</span> infirmière(s) trouvée(s)
              </div>
            </div>
            
            {/* Quick city filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSearchCity('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchCity === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes les villes
              </button>
              {uniqueCities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSearchCity(city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    searchCity === city 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nurses Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredNurses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Aucune infirmière trouvée
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier votre recherche ou sélectionnez une autre ville.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNurses.map((nurse) => (
                <NurseCard key={nurse.id} nurse={nurse} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NursesList;
