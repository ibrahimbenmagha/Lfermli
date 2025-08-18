import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Clock, MapPin, Shield, Users, Stethoscope, Syringe, Bandage, Home, Star } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  description?: string;
  category?: string;
  price?: string;
  duration?: string;
  icon?: React.ComponentType<{ className?: string }>;
  features?: string[];
}

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate=useNavigate();
  
const handleNavigate= ()=>{
  navigate("/login")
};

  const staticServices: Service[] = [
    {
      id: 1,
      name: "Soins infirmiers généraux",
      description: "Pansements, injections, prises de sang, surveillance médicale",
      category: "general",
      price: "À partir de 35€",
      duration: "30-60 min",
      icon: Stethoscope,
      features: ["Pansements simples et complexes", "Injections (IM, SC, IV)", "Prélèvements sanguins", "Surveillance tensionnelle"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
    {
      id: 2,
      name: "Soins post-opératoires",
      description: "Surveillance et soins après intervention chirurgicale",
      category: "specialized",
      price: "À partir de 45€",
      duration: "45-90 min",
      icon: Bandage,
      features: ["Surveillance cicatrisation", "Ablation de fils", "Soins de stomie", "Surveillance drainage"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
    {
      id: 3,
      name: "Soins palliatifs",
      description: "Accompagnement et soins de confort à domicile",
      category: "specialized",
      price: "À partir de 50€",
      duration: "60-120 min",
      icon: Heart,
      features: ["Soins de confort", "Gestion de la douleur", "Accompagnement familial", "Coordination médicale"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
    {
      id: 4,
      name: "Soins diabétiques",
      description: "Surveillance glycémique et éducation thérapeutique",
      category: "chronic",
      price: "À partir de 40€",
      duration: "30-45 min",
      icon: Syringe,
      features: ["Surveillance glycémie", "Injections insuline", "Éducation patient", "Suivi diététique"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
    {
      id: 5,
      name: "Soins de nursing",
      description: "Aide à l'hygiène et soins de confort",
      category: "general",
      price: "À partir de 30€",
      duration: "45-60 min",
      icon: Users,
      features: ["Toilette au lit", "Aide à l'habillage", "Soins d'hygiène", "Mobilisation"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
    {
      id: 6,
      name: "Urgences à domicile",
      description: "Interventions urgentes 24h/24",
      category: "emergency",
      price: "À partir de 80€",
      duration: "Variable",
      icon: Shield,
      features: ["Disponible 24h/24", "Intervention rapide", "Premiers secours", "Coordination SAMU"],
      created_at: "2025-07-08T21:51:00Z",
      updated_at: "2025-07-08T21:51:00Z",
    },
  ];

  const categories = [
    { value: 'all', label: 'Tous les services' },
    { value: 'general', label: 'Soins généraux' },
    { value: 'specialized', label: 'Soins spécialisés' },
    { value: 'chronic', label: 'Maladies chroniques' },
    { value: 'emergency', label: 'Urgences' },
  ];

  const zones = [
    { value: 'all', label: 'Toutes les zones' },
    { value: 'Casablanca', label: 'Casablanca' },
    { value: 'Rabat', label: 'Rabat' },
    { value: 'Salle', label: 'Salle' },
    { value: 'Mouhamadia', label: 'Mouhamadia' },
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('auth/GetAllServices');
        if (response.data.data && response.data.data.length > 0) {
          setServices(response.data.data);
        } else {
          setServices(staticServices);
        }
      } catch (error: any) {
        setError('Erreur lors de la récupération des services');
        setServices(staticServices);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(service => {
    if (selectedCategory !== 'all' && service.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-light">
      <section className="bg-gradient-medical text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">Nos Services de Soins</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Des soins infirmiers professionnels à domicile, adaptés à vos besoins spécifiques. 
            Nos infirmières qualifiées interviennent 24h/24 pour votre bien-être.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100" onClick={handleNavigate}>
              <Clock className="w-5 h-5 mr-2" />
              Réserver maintenant
            </Button>

          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center">
              <p>{error}</p>
            </div>
          )}


          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Chargement des services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun service trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => {
                const IconComponent = service.icon || Stethoscope;
                return (
                  <Card key={service.id} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-800">{service.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {service.description || 'Description non disponible'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Tarif</span>
                        <span className="font-semibold text-primary">{service.price || 'Sur demande'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Durée</span>
                        <span className="font-semibold text-gray-700">{service.duration || 'Variable'}</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 text-sm">Prestations incluses :</h4>
                        <ul className="space-y-1">
                          {service.features?.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <Star className="h-3 w-3 text-secondary mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          )) || <li className="text-sm text-gray-600">Non spécifié</li>}
                        </ul>
                      </div>
                      <div className="pt-4">
                        <Button className="w-full bg-secondary hover:bg-secondary-600 text-white">
                          <Home className="w-4 h-4 mr-2" />
                          Réserver ce service
                        </Button>
                      </div>
                      
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Une question sur nos services ?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Notre équipe médicale est à votre disposition pour vous conseiller et vous orienter vers le service le plus adapté à vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary-600">
              Contacter un conseiller
            </Button>
            <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-white">
              Urgence 24h/24
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
