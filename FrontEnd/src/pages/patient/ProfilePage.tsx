import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, ArrowLeft, CheckCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import axiosInstance from '@/axiosConfig';
import { AxiosError } from 'axios';

// Interface pour typer les données du patient
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_photo_url?: string;
}

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer un email valide"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>('https://via.placeholder.com/150');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        console.log('Fetching patient data from /auth/getPatientById');
        const response = await axiosInstance.get<{ data: Patient }>('getPatientById');
        const patientData = response.data.data || response.data;
        if (!patientData) {
          throw new Error('Aucune donnée patient reçue');
        }
        setPatient(patientData);
        setPhotoPreview(patientData.profile_photo_url || 'https://via.placeholder.com/150');
        form.reset({
          firstName: patientData.first_name || '',
          lastName: patientData.last_name || '',
          email: patientData.email || '',
          phone: patientData.phone_number || '',
        });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error('Erreur lors de la récupération des données patient:', axiosError);
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Impossible de charger les informations du patient. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [form]);

  // Handle form submission to update patient data
  const onSubmit = async (data: ProfileFormData) => {
    try {
      console.log('Soumission de la mise à jour vers /auth/updatePatient:', data);
      await axiosInstance.put('/auth/updatePatient', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
      });
      setPatient({
        ...patient!,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
      });
      setIsEditing(false);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Erreur lors de la mise à jour des données patient:', axiosError);
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Échec de la mise à jour du profil. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  // Handle photo upload
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      try {
        const formData = new FormData();
        formData.append('profile_photo', file);
        const response = await axiosInstance.post<{ profile_photo_url: string }>('/auth/updatePatientPhoto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPatient({
          ...patient!,
          profile_photo_url: response.data.profile_photo_url,
        });
        toast({
          title: 'Photo mise à jour',
          description: 'Votre photo de profil a été mise à jour avec succès.',
        });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error('Erreur lors de l\'upload de la photo:', axiosError);
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Échec de la mise à jour de la photo. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/patient/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de bord
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-3xl text-gray-800">
              <User className="h-6 w-6 mr-2 text-blue-600" />
              Votre Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {loading ? (
              <div className="text-center text-gray-600">Chargement des informations...</div>
            ) : patient ? (
              <>
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <img
                      src={photoPreview || 'https://via.placeholder.com/150'}
                      alt="Photo de profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                    />
                    {isEditing && (
                      <label
                        htmlFor="profile-photo"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                        aria-label="Changer la photo de profil"
                      >
                        <Camera className="h-5 w-5" />
                        <input
                          id="profile-photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-gray-800">
                    {patient.first_name} {patient.last_name}
                  </h2>
                  <p className="text-gray-600">{patient.email}</p>
                </div>

                {/* Static Information Section */}
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Prénom</p>
                        <p className="text-lg text-gray-800">{patient.first_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Nom</p>
                        <p className="text-lg text-gray-800">{patient.last_name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Email</p>
                        <p className="text-lg text-gray-800">{patient.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Téléphone</p>
                        <p className="text-lg text-gray-800">{patient.phone_number}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-6 py-2 text-lg font-semibold"
                      >
                        Éditer le Profil
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Edit Form Section */
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prénom</FormLabel>
                              <FormControl>
                                <Input placeholder="Jean" {...field} />
                              </FormControl>
                              <FormMessage />
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
                                <Input placeholder="Dupont" {...field} />
                              </FormControl>
                              <FormMessage />
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
                                <Input placeholder="votre@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
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
                                <Input placeholder="0601234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 text-lg font-semibold"
                        >
                          Annuler
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-6 py-2 text-lg font-semibold"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </>
            ) : (
              <div className="text-center text-red-600">
                Impossible de charger les informations du patient.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;