import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

const RegisterPatient: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    nickname: '',
    phone_number: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('auth/CreatePatient', formData);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        nickname: '',
        phone_number: '',
        password: '',
      });
      toast({
        title: 'Succès',
        description: response.data.message || 'Patient créé avec succès.',
        variant: 'default',
      });
      navigate('/login'); // Rediriger vers la liste des patients après création
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; errors?: any }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de la création du patient.';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/nurse/patients')}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Créer un Patient
              </h1>
              <p className="text-gray-600 mt-1">Ajouter un nouveau patient au système</p>
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
            Formulaire de création de patient
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
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/nurse/patients')}
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

export default RegisterPatient;