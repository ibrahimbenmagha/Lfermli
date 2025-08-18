
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, HelpCircle } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface City {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  name: string;
  city_id: number;
}

interface Service {
  id: number;
  name: string;
}

interface ServiceInput {
  name: string;
  price: string;
}

const CreateNurse: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    nickname: '',
    phone_number: '',
    password: '',
    city_name: '',
    zone_name: '',
    status: 'disabled',
  });
  const [services, setServices] = useState<ServiceInput[]>([{ name: '', price: '' }]);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const citiesResponse = await axiosInstance.get('auth/GetAllCities');
        setCities(citiesResponse.data.data);

        const servicesResponse = await axiosInstance.get('auth/GetAllServices');
        setAvailableServices(servicesResponse.data.data);

        const zonesResponse = await axiosInstance.get('auth/GetAllZones');
        setZones(zonesResponse.data.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des données.';
        setError(errorMessage);
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceChange = (index: number, field: keyof ServiceInput, value: string) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  const addService = () => {
    if (services.length < 3) {
      setServices([...services, { name: '', price: '' }]);
    } else {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez pas ajouter plus de 3 services.',
        variant: 'destructive',
      });
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      services: services.filter((service) => service.name && service.price),
    };

    try {
      const response = await axiosInstance.post('auth/CreateNurse', payload);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        nickname: '',
        phone_number: '',
        password: '',
        city_name: '',
        zone_name: '',
        status: 'disabled',
      });
      setServices([{ name: '', price: '' }]);
      toast({
        title: 'Succès',
        description: response.data.message || 'Infirmier créé avec succès.',
        variant: 'default',
      });
      navigate('/NurseCreationSuccess');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errors?: any }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de la création de l\'infirmier.';
      setError(errorMessage);
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter((zone) => {
    const selectedCity = cities.find((city) => city.name === formData.city_name);
    return selectedCity ? zone.city_id === selectedCity.id : true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Créer une Infirmière
              </h1>
              <p className="text-gray-600 mt-1">Ajouter une nouvelle infirmière au système</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
          <UserPlus className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg max-w-lg mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Formulaire de création d'infirmière
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Surnom"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Select
                value={formData.city_name}
                onValueChange={(value) => setFormData({ ...formData, city_name: value, zone_name: '' })}
                required
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={formData.zone_name}
                onValueChange={(value) => setFormData({ ...formData, zone_name: value })}
                required
                disabled={!formData.city_name}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionner une zone" />
                </SelectTrigger>
                <SelectContent>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                placeholder="Statut"
                value={formData.status}
                disabled
                className="focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 group">
                <HelpCircle className="h-4 w-4 text-gray-500" />
                <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 right-0 top-8 z-10">
                  Contacter le support pour activer votre compte
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-600">Services (jusqu'à 3)</label>
                <Button
                  type="button"
                  onClick={addService}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Ajouter un service
                </Button>
              </div>
              {services.map((service, index) => (
                <div key={index} className="flex space-x-2 items-center">
                  <Select
                    value={service.name}
                    onValueChange={(value) => handleServiceChange(index, 'name', value)}
                    required
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServices.map((srv) => (
                        <SelectItem key={srv.id} value={srv.name}>
                          {srv.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Prix"
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {services.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeService(index)}
                      className="hover:bg-red-600"
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : (
                  <UserPlus className="h-4 w-4 mr-1" />
                )}
                Créer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateNurse;

