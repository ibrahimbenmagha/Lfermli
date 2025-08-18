
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar as CalendarIcon, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: number;
  patient_id: number;
  service_nurse_id: number;
  service_name: string;
  patient_name: string;
  apointementsDate: string;
  adress: string;
  statut: string;
  emergency_level: string;
}

const AppointmentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch completed appointments (termine only)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch completed appointments
        const apptResponse = await axiosInstance.get('getNurseAppointmentsTermine');
        const filteredAppointments = apptResponse.data.data
          .filter((appt: Appointment) => appt.statut === 'termine')
          .sort(
            (a: Appointment, b: Appointment) =>
              new Date(b.apointementsDate).getTime() - new Date(a.apointementsDate).getTime()
          );
        setAppointments(filteredAppointments);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError('Impossible de charger l\'historique des rendez-vous. Veuillez réessayer.');
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Erreur lors du chargement des rendez-vous.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format date for display
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  };

  // Get status styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'termine':
        return 'bg-blue-100 text-blue-900 border-blue-400';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-400';
    }
  };

  // Get emergency level styles
  const getEmergencyStyles = (level: string) => {
    switch (level) {
      case 'urgent':
        return 'bg-red-100 text-red-900';
      case 'normal':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  // Placeholder for messages button
  const handleMessages = () => {
    toast({
      title: 'Info',
      description: 'Fonctionnalité de messagerie en cours de développement.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/nurse/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Historique des Rendez-vous</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleMessages}>
              <Mail className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error} Veuillez réessayer ou contacter le support.</p>
          </div>
        )}

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
              Historique des Rendez-vous Terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-4">Chargement des rendez-vous...</p>
            ) : (
              <div>
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center">Aucun rendez-vous terminé.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appt) => (
                      <Card
                        key={appt.id}
                        className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-bold text-gray-800">
                                {formatDateTime(appt.apointementsDate)}
                              </p>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                                  appt.statut
                                )}`}
                              >
                                Terminé
                              </span>
                            </div>
                            <p className="text-xl font-semibold text-gray-900">{appt.service_name}</p>
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Patient: <span className="font-normal">{appt.patient_name}</span></p>
                              <p className="font-medium truncate">Adresse: <span className="font-normal">{appt.adress}</span></p>
                            </div>
                            <div className="flex items-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getEmergencyStyles(
                                  appt.emergency_level
                                )}`}
                              >
                                Urgence: {appt.emergency_level === 'urgent' ? 'Urgent' : 'Normal'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppointmentHistory;
