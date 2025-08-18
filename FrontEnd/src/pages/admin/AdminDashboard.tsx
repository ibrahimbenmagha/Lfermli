import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Calendar, Settings, Mail, AlertCircle, LogOut } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Stats {
  nurse_count: number;
  patient_count: number;
  total_appointments: number;
  appointments_by_status: {
    en_attente: number;
    confirme: number;
    annule: number;
    termine: number;
  };
  total_revenue: number;
}

interface Appointment {
  id: number;
  patient: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  nurse: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  date: string;
  time: string;
  status: string;
  emergency_level: string;
  address: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    nurse_count: 0,
    patient_count: 0,
    total_appointments: 0,
    appointments_by_status: {
      en_attente: 0,
      confirme: 0,
      annule: 0,
      termine: 0,
    },
    total_revenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats and recent appointments from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats and recent appointments in parallel
        const [statsResponse, appointmentsResponse] = await Promise.all([
          axiosInstance.get('getAdminStats'),
          axiosInstance.get('getRecentAppointments'),
        ]);

        // Set stats
        const statsData = statsResponse.data.data || {
          nurse_count: 0,
          patient_count: 0,
          total_appointments: 0,
          appointments_by_status: {
            en_attente: 0,
            confirme: 0,
            annule: 0,
            termine: 0,
          },
          total_revenue: 0,
        };
        setStats(statsData);

        // Set recent appointments
        setRecentAppointments(appointmentsResponse.data.data || []);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError('Impossible de charger les données. Veuillez réessayer.');
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Erreur lors du chargement des données.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axiosInstance.post('auth/logout');
      
      // Clear all cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success toast
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté avec succès.',
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Une erreur s\'est produite lors de la déconnexion. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  // Format time for appointments
  const formatTime = (date: string) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      return formatDistanceToNow(parsedDate, { addSuffix: true, locale: fr });
    } catch {
      return 'Inconnu';
    }
  };

  // Navigation handlers for quick actions
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Chart.js data configuration for users (Bar)
  const userChartData = {
    labels: ['Infirmières', 'Patients'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [stats.nurse_count, stats.patient_count],
        backgroundColor: ['rgba(244, 63, 94, 0.5)', 'rgba(59, 130, 246, 0.5)'],
        borderColor: ['rgba(244, 63, 94, 1)', 'rgba(59, 130, 246, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const userChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre',
          color: '#1F2937',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Type d\'utilisateur',
          color: '#1F2937',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Chart.js data configuration for appointments (Pie)
  const appointmentChartData = {
    labels: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
    datasets: [
      {
        label: 'Rendez-vous par statut',
        data: [
          stats.appointments_by_status.en_attente,
          stats.appointments_by_status.confirme,
          stats.appointments_by_status.annule,
          stats.appointments_by_status.termine,
        ],
        backgroundColor: [
          'rgba(234, 179, 8, 0.5)', // En attente
          'rgba(75, 192, 192, 0.5)', // Confirmé
          'rgba(255, 99, 132, 0.5)', // Annulé
          'rgba(153, 102, 255, 0.5)', // Terminé
        ],
        borderColor: [
          'rgba(234, 179, 8, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const appointmentChartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#1f2937',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Administration Lfermli</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => handleNavigate('/admin/messages')}>
                <Mail className="h-4 w-4 mr-2" />
                Messages
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNavigate('/admin/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
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

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-2">Tableau de bord administrateur</h2>
          <p className="text-lg opacity-90">Vue d'ensemble de la plateforme Lfermli</p>
        </div>

        {/* Stats Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Chargement du graphique utilisateurs...</p>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold mb-2">Utilisateurs</h4>
                    <Bar data={userChartData} options={userChartOptions} />
                  </>
                )}
              </div>
              <div className="h-64">
                {loading ? (
                  <p className="text-gray-500 text-center py-4">Chargement du graphique rendez-vous...</p>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold mb-2">Rendez-vous par statut</h4>
                    <Pie data={appointmentChartData} options={appointmentChartOptions} />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Patients</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {loading ? 'Chargement...' : stats.patient_count.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Infirmières</p>
                  <p className="text-3xl font-bold text-rose-500">
                    {loading ? 'Chargement...' : stats.nurse_count.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-rose-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
                  <p className="text-3xl font-bold text-green-500">
                    {loading ? 'Chargement...' : stats.total_appointments.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {loading ? 'Chargement...' : stats.total_revenue.toLocaleString()} MAD
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {loading ? 'Chargement...' : stats.appointments_by_status.en_attente.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmé</p>
                  <p className="text-3xl font-bold text-green-500">
                    {loading ? 'Chargement...' : stats.appointments_by_status.confirme.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annulé</p>
                  <p className="text-3xl font-bold text-red-500">
                    {loading ? 'Chargement...' : stats.appointments_by_status.annule.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminé</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {loading ? 'Chargement...' : stats.appointments_by_status.termine.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Actions rapides</h3>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNavigate('/admin/patients')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Gestion des patients</h4>
                    <p className="text-sm text-gray-600">Voir et gérer tous les patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleNavigate('/admin/nurses')}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Gestion des infirmières</h4>
                    <p className="text-sm text-gray-600">Validation et supervision</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500 text-center py-4">Chargement des activités...</p>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center">Aucune activité récente.</p>
                  ) : (
                    recentAppointments.map((appointment, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            Rendez-vous pour {appointment.patient.first_name} {appointment.patient.last_name} avec{' '}
                            {appointment.nurse.first_name} {appointment.nurse.last_name}
                          </p>
                          <p>{appointment.service.name}</p>
                          <p className="text-sm text-gray-600">Date: {appointment.date}</p>
                          <p className="text-xs text-gray-500">
                            Réalisé {formatTime(appointment.date)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;