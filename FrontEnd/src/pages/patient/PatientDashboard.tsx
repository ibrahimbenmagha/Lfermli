import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Clock, Mail, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface Appointment {
  id: number;
  service_name: string;
  nurse_name: string;
  apointementsDate: string;
  statut: string;
}

interface PatientData {
  first_name: string;
  last_name: string;
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [patientData, setPatientData] = useState<PatientData>({ first_name: '', last_name: '' });
  const [unreadConversationsCount, setUnreadConversationsCount] = useState<number>(0);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingRecentAppointments, setLoadingRecentAppointments] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState(true);
  const [loadingUnreadCount, setLoadingUnreadCount] = useState(true);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoadingPatientData(true);
        const response = await axiosInstance.get('getPatientById');
        setPatientData(response.data.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || "Impossible de charger les informations du patient. Veuillez réessayer.",
          variant: 'destructive',
        });
      } finally {
        setLoadingPatientData(false);
      }
    };
    fetchPatientData();
  }, []);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const response = await axiosInstance.get('getPatientAppointments');
        setUpcomingAppointments(response.data.data || []);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Impossible de charger les rendez-vous. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch recent (terminated) appointments
  useEffect(() => {
    const fetchRecentAppointments = async () => {
      try {
        setLoadingRecentAppointments(true);
        const response = await axiosInstance.get('getPatientAppointmentsTermine');
        setRecentAppointments(response.data.data || []);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Impossible de charger les soins récents. Veuillez réessayer.',
          variant: 'destructive',
        });
      } finally {
        setLoadingRecentAppointments(false);
      }
    };
    fetchRecentAppointments();
  }, []);

  // Fetch unread conversations count
  useEffect(() => {
    const fetchUnreadConversationsCount = async () => {
      try {
        setLoadingUnreadCount(true);
        const response = await axiosInstance.get('getUnreadConversationsCount');
        setUnreadConversationsCount(response.data.data.unread_conversations_count || 0);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Impossible de charger le nombre de discussions non lues.',
          variant: 'destructive',
        });
      } finally {
        setLoadingUnreadCount(false);
      }
    };
    fetchUnreadConversationsCount();
    const interval = setInterval(fetchUnreadConversationsCount, 10000); // Polling toutes les 10 secondes
    return () => clearInterval(interval); // Nettoyage à la désactivation du composant
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axiosInstance.post('auth/logout');
      document.cookie.split(';').forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
      navigate('/login');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || "Une erreur s'est produite lors de la déconnexion. Veuillez réessayer.",
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Patient</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/patient/PatientMessages')} className="relative">
                <Mail className="h-4 w-4 mr-2" />
                Messages
                {unreadConversationsCount > 0 && !loadingUnreadCount && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadConversationsCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/patient/profilePage')}>
                <Settings className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-medical text-white rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {loadingPatientData ? 'Chargement...' : `Bonjour, ${patientData.first_name} ${patientData.last_name} !`}
          </h2>
          <p className="text-lg opacity-90">
            Vous avez {loadingAppointments ? '...' : upcomingAppointments.length} rendez-vous à venir cette semaine.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patient/booking')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Réserver un soin</h3>
              <p className="text-gray-600">Prenez rendez-vous avec une infirmière</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patient/history')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Historique</h3>
              <p className="text-gray-600">Consultez vos soins passés</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/patient/appointments')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rendez-vous planifiés</h3>
              <p className="text-gray-600">Consultez vos rendez-vous</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Prochains rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingAppointments ? (
                  <p className="text-gray-500 text-center py-4">Chargement des rendez-vous...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun rendez-vous prévu</p>
                ) : (
                  upcomingAppointments.map((appointment: Appointment) => (
                    <div key={appointment.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{appointment.service_name}</p>
                          <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(appointment.apointementsDate).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              appointment.statut === 'en_attente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : appointment.statut === 'confirme'
                                ? 'bg-green-100 text-green-800'
                                : appointment.statut === 'termine'
                                ? 'bg-blue-100 text-blue-800'
                                : ''
                            }`}
                          >
                            {appointment.statut}
                          </span>
                          <Button size="sm" variant="outline">
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-secondary" />
                Soins récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingRecentAppointments ? (
                  <p className="text-gray-500 text-center py-4">Chargement des soins récents...</p>
                ) : recentAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun soin récent trouvé</p>
                ) : (
                  recentAppointments.map((appointment: Appointment) => (
                    <div key={appointment.id} className="border-l-4 border-secondary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{appointment.service_name}</p>
                          <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {appointment.statut}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;