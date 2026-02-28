import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { NurseCard } from '@/components/NurseCard';
import { Input } from '@/components/ui/input';
import { Search, Users, Play, Heart, Shield, Award, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Nurse {
  nurse_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  city_name: string;
  zone_name: string;
  note_over_5?: number;
  services?: string;
}

interface City {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

// Fallback static data if API fails
const fallbackNursesData = [
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
  // ... other fallback data
];

export const NursesList = () => {
  const [searchCity, setSearchCity] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch all nurses
      const nursesResponse = await axiosInstance.get('auth/getAllNursesInfos');
      if (nursesResponse.data.data) {
        setNurses(nursesResponse.data.data);
      }

      // Fetch cities
      try {
        const citiesResponse = await axiosInstance.get('auth/getCities');
        if (citiesResponse.data.data) {
          setCities(citiesResponse.data.data);
        }
      } catch {
        // Cities endpoint might not exist, extract from nurses
        const uniqueCities = [...new Set(nursesResponse.data.data.map((n: Nurse) => n.city_name))];
        setCities(uniqueCities.map((name, id) => ({ id, name: name as string })));
      }

      // Fetch zones
      try {
        const zonesResponse = await axiosInstance.get('auth/getZones');
        if (zonesResponse.data.data) {
          setZones(zonesResponse.data.data);
        }
      } catch {
        // Zones endpoint might not exist, extract from nurses
        const uniqueZones = [...new Set(nursesResponse.data.data.map((n: Nurse) => n.zone_name))];
        setZones(uniqueZones.map((name, id) => ({ id, name: name as string })));
      }

      // Fetch services
      try {
        const servicesResponse = await axiosInstance.get('auth/getServices');
        if (servicesResponse.data.data) {
          setServices(servicesResponse.data.data);
        }
      } catch {
        console.log('Services endpoint not available');
      }

      setUseApi(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Error fetching data:', axiosError.message);
      setUseApi(false);
      toast({
        title: "Info",
        description: "Affichage des données de démonstration",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter nurses by city using API
  const filterByCity = async (cityName: string) => {
    if (!cityName || !useApi) {
      fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get('auth/getNursesByCity', {
        params: { city_name: cityName }
      });
      if (response.data.data) {
        setNurses(response.data.data);
      }
    } catch (error) {
      // Fallback to client-side filtering
      const filtered = nurses.filter(n => 
        n.city_name?.toLowerCase().includes(cityName.toLowerCase())
      );
      setNurses(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Filter nurses by zone using API
  const filterByZone = async (zoneName: string) => {
    if (!zoneName || !useApi) {
      setSelectedZone('');
      fetchInitialData();
      return;
    }

    setSelectedZone(zoneName);
    try {
      setLoading(true);
      const response = await axiosInstance.get('auth/getNursesByZone', {
        params: { zone_name: zoneName }
      });
      if (response.data.data) {
        setNurses(response.data.data);
      }
    } catch (error) {
      // Fallback to client-side filtering
      const allNurses = await axiosInstance.get('auth/getAllNursesInfos');
      const filtered = allNurses.data.data.filter((n: Nurse) => 
        n.zone_name?.toLowerCase().includes(zoneName.toLowerCase())
      );
      setNurses(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Combined filter by service and zone
  const filterByServiceAndZone = async () => {
    if (!selectedService || !selectedZone || !useApi) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get('auth/getNursesByServiceAndZone', {
        params: { 
          serviceId: selectedService,
          zone_name: selectedZone 
        }
      });
      if (response.data.data) {
        setNurses(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Erreur lors du filtrage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchCity('');
    setSelectedZone('');
    setSelectedService('');
    fetchInitialData();
  };

  // Client-side filtering for search input
  const filteredNurses = searchCity && !useApi
    ? nurses.filter(nurse =>
        nurse.city_name?.toLowerCase().includes(searchCity.toLowerCase()) ||
        `${nurse.first_name} ${nurse.last_name}`.toLowerCase().includes(searchCity.toLowerCase())
      )
    : nurses;

  const uniqueCities = [...new Set(nurses.map(nurse => nurse.city_name))].filter(Boolean);

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
              <h3 className="text-3xl font-bold text-blue-600 mb-2">{nurses.length || '80'}+</h3>
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
              <h3 className="text-3xl font-bold text-purple-600 mb-2">{uniqueCities.length || '12'}+</h3>
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
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher par ville (ex: Casablanca, Rabat, Fès...)"
                  value={searchCity}
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    if (useApi && e.target.value.length > 2) {
                      filterByCity(e.target.value);
                    }
                  }}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              
              {/* Zone Filter */}
              <Select value={selectedZone} onValueChange={filterByZone}>
                <SelectTrigger className="w-[200px]">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les zones</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Service Filter */}
              {services.length > 0 && (
                <Select 
                  value={selectedService} 
                  onValueChange={(value) => {
                    setSelectedService(value);
                    if (selectedZone && value) {
                      filterByServiceAndZone();
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <Heart className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              
              <div className="text-gray-600">
                <span className="font-medium">{filteredNurses.length}</span> infirmière(s) trouvée(s)
              </div>
            </div>
            
            {/* Quick city filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSearchCity('');
                  fetchInitialData();
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchCity === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes les villes
              </button>
              {uniqueCities.slice(0, 10).map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchCity(city);
                    if (useApi) filterByCity(city);
                  }}
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
          {loading ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des infirmières...</p>
              </div>
            </div>
          ) : filteredNurses.length === 0 ? (
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
                <div 
                  key={nurse.nurse_id || nurse.user_id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-green-400 relative">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                      <div className="w-24 h-24 rounded-full bg-white p-1">
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {nurse.first_name?.charAt(0)}{nurse.last_name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {nurse.first_name} {nurse.last_name}
                    </h3>
                    <p className="text-gray-600 mb-2 flex items-center justify-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {nurse.city_name} {nurse.zone_name && `- ${nurse.zone_name}`}
                    </p>
                    {nurse.note_over_5 && (
                      <div className="flex items-center justify-center mb-3">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{nurse.note_over_5}/5</span>
                      </div>
                    )}
                    {nurse.services && (
                      <div className="flex flex-wrap justify-center gap-1 mb-3">
                        {nurse.services.split(',').slice(0, 2).map((service, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {service.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NursesList;
