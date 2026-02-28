import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Heart,
  CheckCircle,
  Info,
  Stethoscope,
  Star,
  Shield,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import axiosInstance from '../axiosConfig';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const bookingSchema = z.object({
  service: z.string().min(1, "Veuillez sélectionner un service"),
  nurse: z.string().min(1, "Veuillez sélectionner un infirmier"),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string().min(1, "Veuillez sélectionner l'heure"),
  address: z.string().min(10, "Veuillez saisir une adresse complète"),
  emergencyLevel: z.enum(["normal", "urgent", "super_urgent"], {
    required_error: "Veuillez sélectionner un niveau d'urgence",
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const urgencyLevels = [
  { value: "normal", label: "Normal", color: "bg-green-100 text-green-800" },
  { value: "urgent", label: "Urgent", color: "bg-yellow-100 text-yellow-800" },
  { value: "super_urgent", label: "Super Urgent", color: "bg-red-100 text-red-800" },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingNurses, setLoadingNurses] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'home' | 'online' | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: "",
      nurse: "",
      date: undefined,
      address: "",
      emergencyLevel: "normal",
    },
  });

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const response = await axiosInstance.get('auth/GetAllServices');
        const apiServices = response.data.data;
        const servicesWithDetails = apiServices.map(service => ({
          value: service.id.toString(),
          label: service.name,
          duration: getServiceDuration(service.name),
          description: getServiceDescription(service.name),
          image: getServiceImage(service.name),
        }));
        setServices(servicesWithDetails);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les services. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch nurses when service is selected
  useEffect(() => {
    const fetchNurses = async () => {
      const serviceId = form.watch('service');
      if (serviceId) {
        try {
          setLoadingNurses(true);
          document.cookie = `serviceId=${serviceId}; path=/; max-age=3600;`;
          const response = await axiosInstance.get('auth/getNurseByServiceId');
          setNurses(response.data.data);
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les infirmiers. Veuillez réessayer.",
            variant: "destructive",
          });
        } finally {
          setLoadingNurses(false);
        }
      }
    };
    fetchNurses();
  }, [form.watch('service')]);

  // Fetch patient data when reaching step 4
  useEffect(() => {
    if (step === 4) {
      const fetchPatient = async () => {
        try {
          setLoadingPatient(true);
          const response = await axiosInstance.get('getPatientById');
          setPatient(response.data.data);
          form.setValue('address', '');
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les informations du patient. Veuillez réessayer.",
            variant: "destructive",
          });
        } finally {
          setLoadingPatient(false);
        }
      };
      fetchPatient();
    }
  }, [step, form]);

  // Fonction pour estimer la durée
  const getServiceDuration = (serviceName) => {
    const durations = {
      'Prélèvement sanguin': '30-45 min',
      'Soin diabétique': '30-45 min',
      'Injection intramusculaire': '15-30 min',
      'Change de pansement': '30-60 min',
      'Surveillance tension artérielle': '15-30 min',
    };
    return durations[serviceName] || '30-60 min';
  };

  // Fonction pour la description
  const getServiceDescription = (serviceName) => {
    const descriptions = {
      'Prélèvement sanguin': 'Prise de sang à domicile pour analyses médicales',
      'Soin diabétique': 'Surveillance glycémique, injections d’insuline',
      'Injection intramusculaire': 'Administration sécurisée d’injections',
      'Change de pansement': 'Renouvellement des pansements pour plaies',
      'Surveillance tension artérielle': 'Mesure et suivi de la tension',
    };
    return descriptions[serviceName] || 'Soins professionnels à domicile';
  };

  // Fonction pour l'image
  const getServiceImage = (serviceName) => {
    const images = {
      'Prélèvement sanguin': 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      'Soin diabétique': 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop',
      'Injection intramusculaire': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      'Change de pansement': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      'Surveillance tension artérielle': 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop',
    };
    return images[serviceName] || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop';
  };

  const getSelectedService = () => {
    const serviceValue = form.watch('service');
    return services.find(s => s.value === serviceValue);
  };

  const getSelectedNurse = () => {
    const nurseValue = form.watch('nurse');
    return nurses.find(n => n.nurse_id.toString() === nurseValue);
  };

  const nextStep = () => {
    if (step === 1 && form.watch('service')) {
      document.cookie = `serviceId=${form.watch('service')}; path=/; max-age=3600;`;
      setStep(2);
    } else if (step === 2 && form.watch('nurse') && form.watch('emergencyLevel')) {
      document.cookie = `nurseId=${form.watch('nurse')}; path=/; max-age=3600;`;
      document.cookie = `emergencyLevel=${form.watch('emergencyLevel')}; path=/; max-age=3600;`;
      setStep(3);
    } else if (step === 3 && form.watch('date') && form.watch('time')) {
      const date = form.watch('date');
      const time = form.watch('time');
      const [hours, minutes] = time.split(':');
      const dateTime = new Date(date);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      
      document.cookie = `date=${dateTime.toISOString()}; path=/; max-age=3600;`;
      setStep(4);
    } else if (step === 4 && form.watch('address')) {
      setStep(5);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleValidate = async () => {
    if (!paymentMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une méthode de paiement.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPayment(true);
      const response = await axiosInstance.post('createAppointment', {
        address: form.getValues('address'),
      });
      
      const newApptId = response.data.data.id;
      setAppointmentId(newApptId);

      // Set payment method on backend
      await axiosInstance.post(`appointment/${newApptId}/payment-method`, {
        method: paymentMethod
      });

      if (paymentMethod === 'online') {
        const intentRes = await axiosInstance.post(`appointment/${newApptId}/create-payment-intent`);
        setClientSecret(intentRes.data.clientSecret);
      } else {
        // Home payment - direct success redirect (or wait for confirmation)
        toast({
          title: "Succès",
          description: "Rendez-vous créé avec succès. Paiement à domicile sélectionné.",
        });
        navigate('/patient/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Échec de la validation du rendez-vous.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Back to Dashboard Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/patient/dashboard')}
          className="px-6 py-2 text-lg font-semibold border-2"
        >
          ← Retour au tableau de bord
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1920&h=800&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Heart className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Réservez Vos Soins
            <span className="block text-blue-200">à Domicile</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Des infirmières qualifiées et expérimentées pour des soins de qualité dans le confort de votre foyer
          </p>
          <div className="flex justify-center items-center space-x-8 text-lg">
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <span>Certifiées</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              <span>24h/24</span>
            </div>
            <div className="flex items-center">
              <Award className="h-6 w-6 mr-2" />
              <span>Expérimentées</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-3 text-base font-medium ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 && 'Choisir le Service'}
                  {stepNumber === 2 && 'Choisir l\'Infirmier'}
                  {stepNumber === 3 && 'Choisir la Date'}
                  {stepNumber === 4 && 'Détails'}
                  {stepNumber === 5 && 'Paiement'}
                </span>
                {stepNumber < 5 && (
                  <div className={`w-12 h-1 mx-2 rounded-full ${
                    step > stepNumber ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <Form {...form}>
            <form className="space-y-8">
              {/* Step 1: Service Selection */}
              {step === 1 && (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="flex items-center justify-center gap-3 text-left text-lg">
                      <Stethoscope className="h-8 w-8 text-blue-600" />
                      Choisissez votre service
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-4">
                      Sélectionnez le type de soins dont vous avez besoin parmi nos services professionnels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {loadingServices ? (
                      <div className="text-center">Chargement des services...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {services.map((service) => (
                          <div
                            key={service.value}
                            className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                              form.watch('service') === service.value 
                                ? 'ring-4 ring-blue-500 shadow-blue-200' 
                                : 'hover:shadow-xl'
                            }`}
                            onClick={() => form.setValue('service', service.value)}
                          >
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={service.image} 
                                alt={service.label}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-6 bg-white">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{service.label}</h3>
                              <p className="text-gray-600 mb-3">{service.description}</p>
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {service.duration}
                                </span>
                                {form.watch('service') === service.value && (
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {getSelectedService() && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-4">
                          <Info className="h-6 w-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-bold text-blue-900 text-lg">Service sélectionné</h4>
                            <p className="text-blue-700 mt-2">
                              <strong>{getSelectedService()?.label}</strong> ({getSelectedService()?.duration})
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                              {getSelectedService()?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-6">
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={!form.watch('service') || loadingServices}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-3 text-lg font-semibold"
                      >
                        Continuer →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Nurse Selection */}
              {step === 2 && (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="flex items-center justify-center gap-3 text-3xl text-gray-800">
                      <User className="h-8 w-8 text-blue-600" />
                      Choisissez votre infirmier
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-4">
                      Sélectionnez un infirmier qualifié pour votre soin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {loadingNurses ? (
                      <div className="text-center">Chargement des infirmiers...</div>
                    ) : nurses.length === 0 ? (
                      <div className="text-center text-gray-600">Aucun infirmier disponible pour ce service.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {nurses.map((nurse) => (
                          <div
                            key={nurse.nurse_id}
                            className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                              form.watch('nurse') === nurse.nurse_id.toString()
                                ? 'ring-4 ring-blue-500 shadow-blue-200'
                                : 'hover:shadow-xl'
                            }`}
                            onClick={() => form.setValue('nurse', nurse.nurse_id.toString())}
                          >
                            <div className="p-6 bg-white">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {nurse.first_name} {nurse.last_name}
                              </h3>
                              <p className="text-gray-600 mb-2"><Mail className="h-4 w-4 inline mr-1" /> {nurse.email}</p>
                              <p className="text-gray-600 mb-2"><Phone className="h-4 w-4 inline mr-1" /> {nurse.phone_number}</p>
                              <p className="text-gray-600 mb-2"><MapPin className="h-4 w-4 inline mr-1" /> {nurse.city_name}, {nurse.zone_name}</p>
                              <p className="text-gray-600 mb-3"><Stethoscope className="h-4 w-4 inline mr-1" /> {nurse.services}</p>
                              {form.watch('nurse') === nurse.nurse_id.toString() && (
                                <CheckCircle className="h-5 w-5 text-blue-600 absolute top-4 right-4" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {getSelectedNurse() && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-4">
                          <Info className="h-6 w-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-bold text-blue-900 text-lg">Infirmier sélectionné</h4>
                            <p className="text-blue-700 mt-2">
                              <strong>{getSelectedNurse()?.first_name} {getSelectedNurse()?.last_name}</strong>
                            </p>
                            <p className="text-blue-600 text-sm mt-1">
                              {getSelectedNurse()?.city_name}, {getSelectedNurse()?.zone_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Barre de niveau d'urgence */}
                    <FormField
                      control={form.control}
                      name="emergencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold text-gray-800">Niveau d'urgence</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {urgencyLevels.map((urgency) => (
                              <div
                                key={urgency.value}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  field.value === urgency.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(urgency.value)}
                              >
                                <div className="text-center">
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${urgency.color}`}>
                                    {urgency.label}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="px-8 py-3 text-lg font-semibold border-2"
                      >
                        ← Retour
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={!form.watch('nurse') || !form.watch('emergencyLevel') || loadingNurses}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8 py-3 text-lg font-semibold"
                      >
                        Continuer →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Date & Time Selection */}
              {step === 3 && (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-8 border-b border-gray-100">
                    <CardTitle className="flex items-center justify-center gap-3 text-3xl text-gray-800">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                      Quand souhaitez-vous votre soin ?
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-4">
                      Sélectionnez une date puis choisissez parmi les créneaux disponibles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          1. Choisir la date
                        </h4>
                        <div className="flex justify-center p-4 bg-white rounded-2xl shadow-inner border border-blue-50">
                          <Calendar
                            mode="single"
                            selected={form.watch('date')}
                            onSelect={(date) => {
                              form.setValue('date', date as Date);
                              form.setValue('time', ''); // Reset time when date changes
                            }}
                            className="rounded-md"
                            disabled={(date) => 
                              date < new Date(new Date().setHours(0,0,0,0)) || 
                              date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            }
                            initialFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          2. Choisir l'heure
                        </h4>
                        
                        {!form.watch('date') ? (
                          <div className="flex flex-col items-center justify-center h-[300px] p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-center">Veuillez d'abord sélectionner une date sur le calendrier</p>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
                            {loadingSlots ? (
                              <div className="flex flex-col items-center justify-center h-[300px]">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                                <p className="text-gray-500">Recherche des créneaux...</p>
                              </div>
                            ) : availableSlots.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableSlots.map((slot) => (
                                  <Button
                                    key={slot}
                                    type="button"
                                    variant={form.watch('time') === slot ? 'default' : 'outline'}
                                    className={`py-6 text-lg font-bold transition-all duration-200 border-2 ${
                                      form.watch('time') === slot 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                                        : 'hover:border-blue-400 hover:bg-blue-50 border-gray-100'
                                    }`}
                                    onClick={() => form.setValue('time', slot)}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    {slot}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[300px] p-8 bg-red-50 rounded-2xl border-2 border-dashed border-red-200 text-red-600">
                                <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                                <p className="text-center font-semibold">Aucun créneau disponible</p>
                                <p className="text-sm text-center mt-2 opacity-80">Essayez une autre date ou changez d'infirmier(ère).</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="px-10 py-6 text-lg font-bold border-2 hover:bg-gray-50"
                      >
                        ← Retour
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={!form.watch('date') || !form.watch('time')}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-12 py-6 text-xl font-bold rounded-xl shadow-xl transform transition hover:scale-105"
                      >
                        Valider l'horaire →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Personal Information */}
              {step === 4 && (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="flex items-center justify-center gap-3 text-3xl text-gray-800">
                      <User className="h-8 w-8 text-blue-600" />
                      Vos informations
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-4">
                      Vérifiez vos informations et ajoutez votre adresse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingPatient ? (
                      <div className="text-center">Chargement des informations du patient...</div>
                    ) : patient ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                  <Input value={patient.first_name} disabled />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                  <Input value={patient.last_name} disabled />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input value={patient.email} disabled />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                  <Input value={patient.phone_number} disabled />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse complète</FormLabel>
                              <FormControl>
                                <Input placeholder="Numéro, rue, appartement..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    ) : (
                      <div className="text-center text-red-600">
                        Impossible de charger les informations du patient.
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                      <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                        <CheckCircle className="h-6 w-6" />
                        Récapitulatif de votre réservation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong className="text-green-800">Service:</strong> <span className="text-green-700">{getSelectedService()?.label}</span></p>
                          <p><strong className="text-green-800">Infirmier:</strong> <span className="text-green-700">{getSelectedNurse()?.first_name} {getSelectedNurse()?.last_name}</span></p>
                          <p><strong className="text-green-800">Date:</strong> <span className="text-green-700">{form.watch('date') ? format(form.watch('date'), "PPP", { locale: fr }) : 'Non sélectionnée'}</span></p>
                          <p><strong className="text-green-800">Niveau d'urgence:</strong> <span className="text-green-700 capitalize">{form.watch('emergencyLevel') || 'Non sélectionné'}</span></p>
                        </div>
                        <div className="space-y-2">
                          <p><strong className="text-green-800">Durée estimée:</strong> <span className="text-green-700">{getSelectedService()?.duration}</span></p>
                          <p><strong className="text-green-800">Lieu:</strong> <span className="text-green-700">{getSelectedNurse()?.city_name}, {getSelectedNurse()?.zone_name}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="px-8 py-3 text-lg font-semibold border-2"
                      >
                        ← Retour
                      </Button>
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        disabled={loadingPatient || !form.watch('address')}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-12 py-4 text-xl font-bold rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95"
                      >
                        Continuer vers le paiement →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Payment */}
              {step === 5 && (
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="text-center pb-8 bg-gradient-to-r from-blue-600/10 to-green-600/10 mb-6">
                    <CardTitle className="flex items-center justify-center gap-3 text-3xl text-gray-800">
                      <Shield className="h-8 w-8 text-blue-600" />
                      Sécurisez votre rendez-vous
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-4">
                      Choisissez comment vous souhaitez régler votre prestation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-w-4xl mx-auto space-y-8">
                    {!clientSecret ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div 
                          className={`p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            paymentMethod === 'online' 
                              ? 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-2xl scale-105' 
                              : 'border-gray-100 bg-white hover:border-blue-200'
                          }`}
                          onClick={() => setPaymentMethod('online')}
                        >
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                              <Star className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Paiement en ligne</h3>
                            <p className="text-gray-600">Payez par carte bancaire (Visa/Mastercard) en toute sécurité via Stripe.</p>
                            <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold animate-pulse">Recommandé</span>
                          </div>
                        </div>

                        <div 
                          className={`p-8 rounded-2xl border-3 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            paymentMethod === 'home' 
                              ? 'border-green-500 bg-green-50 shadow-green-100 shadow-2xl scale-105' 
                              : 'border-gray-100 bg-white hover:border-green-200'
                          }`}
                          onClick={() => setPaymentMethod('home')}
                        >
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <MapPin className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Paiement à domicile</h3>
                            <p className="text-gray-600">Réglez directement l'infirmier(ère) au moment de la prestation.</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-blue-50 animate-in fade-in zoom-in duration-300">
                        <h4 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                          Finaliser le paiement
                        </h4>
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <StripePaymentForm 
                            clientSecret={clientSecret} 
                            appointmentId={appointmentId}
                            onSuccess={() => navigate('/patient/dashboard')} 
                          />
                        </Elements>
                      </div>
                    )}

                    {!clientSecret && (
                      <div className="flex justify-between pt-8 border-t border-gray-100">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={prevStep}
                          className="px-8 py-3 text-lg border-2 hover:bg-gray-50"
                        >
                          ← Retour
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleValidate}
                          disabled={!paymentMethod || processingPayment}
                          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-12 py-6 text-xl font-bold shadow-xl rounded-xl"
                        >
                          {processingPayment ? <Loader2 className="animate-spin mr-2" /> : null}
                          {paymentMethod === 'online' ? 'Aller au paiement →' : 'Confirmer le rendez-vous ✓'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pourquoi nous faire confiance ?</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Des milliers de patients nous font confiance pour leurs soins à domicile
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Infirmières certifiées</h3>
              <p className="text-lg opacity-90">Toutes nos infirmières sont diplômées d'État avec plusieurs années d'expérience</p>
              <div className="flex justify-center mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Disponible 24h/24</h3>
              <p className="text-lg opacity-90">Service d'urgence disponible à tout moment, 7 jours sur 7</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Partout au Maroc</h3>
              <p className="text-lg opacity-90">Intervention dans plusieurs villes du Maroc</p>
              <p className="text-green-400 font-semibold mt-2">Couverture nationale</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;