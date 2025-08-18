// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Calendar, Heart, User, Mail, Settings, LogOut } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../../axiosConfig';
// import { toast } from '@/hooks/use-toast';
// import { AxiosError } from 'axios';

// interface NurseData {
//   first_name: string;
//   last_name: string;
//   note_over_5?: number;
// }

// interface Appointment {
//   id: number;
//   patient_id: number;
//   service_nurse_id: number;
//   service_name: string;
//   patient_name: string;
//   apointementsDate: string;
//   adress: string;
//   statut: string;
//   emergency_level: string;
// }

// interface Stats {
//   upcoming_appointments_count: number;
//   completed_appointments_count: number;
//   total_revenue: number;
//   rating?: number;
// }

// const NurseDashboard = () => {
//   const navigate = useNavigate();
//   const [nurseData, setNurseData] = useState<NurseData>({ first_name: '', last_name: '' });
//   const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
//   const [stats, setStats] = useState<Stats>({
//     upcoming_appointments_count: 0,
//     completed_appointments_count: 0,
//     total_revenue: 0,
//     rating: 4.8, // Valeur statique temporaire
//   });
//   const [loadingNurseData, setLoadingNurseData] = useState(true);
//   const [loadingAppointments, setLoadingAppointments] = useState(true);
//   const [loadingStats, setLoadingStats] = useState(true);

//   const Navigate= useNavigate()

//   // Fetch nurse data
//   useEffect(() => {
//     const fetchNurseData = async () => {
//       try {
//         setLoadingNurseData(true);
//         const response = await axiosInstance.get('GetNurseInfosById');
//         setNurseData(response.data.data);
//         // Si note_over_5 est inclus dans la réponse, mettre à jour le rating
//         if (response.data.data.note_over_5) {
//           setStats((prev) => ({ ...prev, rating: response.data.data.note_over_5 }));
//         }
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         toast({
//           title: "Erreur",
//           description: axiosError.response?.data?.message || "Impossible de charger les informations de l'infirmier. Veuillez réessayer.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoadingNurseData(false);
//       }
//     };
//     fetchNurseData();
//   }, []);

//   // Fetch upcoming appointments
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         setLoadingAppointments(true);
//         const response = await axiosInstance.get('getNurseAppointments');
//         setUpcomingAppointments(response.data.data);
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         toast({
//           title: "Erreur",
//           description: axiosError.response?.data?.message || "Impossible de charger les rendez-vous. Veuillez réessayer.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoadingAppointments(false);
//       }
//     };
//     fetchAppointments();
//   }, []);

//   // Fetch nurse stats
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoadingStats(true);
//         const response = await axiosInstance.get('getNurseStats');
//         setStats((prev) => ({
//           ...prev,
//           upcoming_appointments_count: response.data.data.upcoming_appointments_count,
//           completed_appointments_count: response.data.data.completed_appointments_count,
//           total_revenue: response.data.data.total_revenue,
//         }));
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         toast({
//           title: "Erreur",
//           description: axiosError.response?.data?.message || "Impossible de charger les statistiques.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoadingStats(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       // Call the backend logout endpoint
//       await axiosInstance.post('auth/logout');
      
//       // Clear all cookies
//       document.cookie.split(";").forEach((cookie) => {
//         document.cookie = cookie
//           .replace(/^ +/, "")
//           .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
//       });
      
//       // Clear localStorage and sessionStorage
//       localStorage.clear();
//       sessionStorage.clear();
      
//       // Show success toast
//       toast({
//         title: "Déconnexion réussie",
//         description: "Vous avez été déconnecté avec succès.",
//       });
      
//       // Navigate to login page
//       navigate('/login');
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: "Erreur",
//         description: axiosError.response?.data?.message || "Une erreur s'est produite lors de la déconnexion. Veuillez réessayer.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-light">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Infirmière</h1>
//             <div className="flex items-center space-x-4">
//               <Button variant="outline" size="sm" onClick={()=>{navigate('/nurse/NurseMessages')}}>
//                 <Mail className="h-4 w-4 mr-2" />
//                 Messages
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => navigate('/nurse/profile')}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Profil
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleLogout}
//                 className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600"
//               >
//                 <LogOut className="h-4 w-4 mr-2" />
//                 Déconnexion
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* Welcome Section */}
//         <div className="bg-gradient-medical text-white rounded-lg p-6 mb-8">
//           <h2 className="text-3xl font-bold mb-2">
//             {loadingNurseData ? 'Chargement...' : `Bonjour, ${nurseData.first_name} ${nurseData.last_name} !`}
//           </h2>
//           <p className="text-lg opacity-90">
//             Vous avez {loadingStats ? '...' : stats.upcoming_appointments_count} rendez-vous à venir cette semaine.
//           </p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card>
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold text-primary mb-2">
//                 {loadingStats ? '...' : stats.upcoming_appointments_count}
//               </div>
//               <p className="text-gray-600">RDV cette semaine</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold text-secondary mb-2">
//                 {loadingStats ? '...' : stats.completed_appointments_count}
//               </div>
//               <p className="text-gray-600">RDV terminés</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold text-primary mb-2">
//                 {loadingStats ? '...' : `${stats.total_revenue} MAD`}
//               </div>
//               <p className="text-gray-600">Revenus</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-6 text-center">
//               <div className="text-3xl font-bold text-secondary mb-2">
//                 {loadingStats || !stats.rating ? '...' : `${stats.rating}/5`}
//               </div>
//               <p className="text-gray-600">Note moyenne</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Upcoming Appointments */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Calendar className="h-5 w-5 mr-2 text-primary" />
//                 Rendez-vous prochains
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {loadingAppointments ? (
//                   <p className="text-gray-500 text-center py-4">Chargement des rendez-vous...</p>
//                 ) : upcomingAppointments.length === 0 ? (
//                   <p className="text-gray-500 text-center py-4">Aucun rendez-vous à venir</p>
//                 ) : (
//                   upcomingAppointments.map((appointment: Appointment) => (
//                     <div key={appointment.id} className="border-l-4 border-primary pl-4 py-2">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <p className="font-semibold">{appointment.service_name}</p>
//                           <p className="text-sm text-gray-600">avec {appointment.patient_name}</p>
//                           <p className="text-sm text-gray-500">
//                             {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')} à{' '}
//                             {new Date(appointment.apointementsDate).toLocaleTimeString('fr-FR', {
//                               hour: '2-digit',
//                               minute: '2-digit',
//                             })}
//                           </p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs ${
//                               appointment.statut === 'en_attente'
//                                 ? 'bg-yellow-100 text-yellow-800'
//                                 : appointment.statut === 'confirme'
//                                 ? 'bg-green-100 text-green-800'
//                                 : appointment.statut === 'termine'
//                                 ? 'bg-blue-100 text-blue-800'
//                                 : ''
//                             }`}
//                           >
//                             {appointment.statut}
//                           </span>
//                           <Button size="sm" variant="outline">
//                             Modifier
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Quick Actions */}
//           <div className="space-y-6">
//             <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/schedule')}>
//               <CardContent className="p-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
//                     <Calendar className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">Gérer mon planning</h3>
//                     <p className="text-gray-600">Ajoutez vos disponibilités</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/services')}>
//               <CardContent className="p-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
//                     <Heart className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">Mes services</h3>
//                     <p className="text-gray-600">Configurez vos spécialités</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/profile')}>
//               <CardContent className="p-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
//                     <User className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">Mon profil</h3>
//                     <p className="text-gray-600">Mettez à jour vos informations</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NurseDashboard;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, User, Mail, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface NurseData {
  first_name: string;
  last_name: string;
  note_over_5?: number;
}

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

interface Stats {
  upcoming_appointments_count: number;
  completed_appointments_count: number;
  total_revenue: number;
  rating?: number;
}

const NurseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [nurseData, setNurseData] = useState<NurseData>({ first_name: '', last_name: '' });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    upcoming_appointments_count: 0,
    completed_appointments_count: 0,
    total_revenue: 0,
    rating: 4.8,
  });
  const [unreadConversationsCount, setUnreadConversationsCount] = useState<number>(0);
  const [loadingNurseData, setLoadingNurseData] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUnreadCount, setLoadingUnreadCount] = useState(true);

  // Fetch nurse data
  useEffect(() => {
    const fetchNurseData = async () => {
      try {
        setLoadingNurseData(true);
        const response = await axiosInstance.get('GetNurseInfosById');
        setNurseData(response.data.data);
        if (response.data.data.note_over_5) {
          setStats((prev) => ({ ...prev, rating: response.data.data.note_over_5 }));
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || "Impossible de charger les informations de l'infirmier. Veuillez réessayer.",
          variant: 'destructive',
        });
      } finally {
        setLoadingNurseData(false);
      }
    };
    fetchNurseData();
  }, []);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const response = await axiosInstance.get('getNurseAppointments');
        setUpcomingAppointments(response.data.data);
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

  // Fetch nurse stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await axiosInstance.get('getNurseStats');
        setStats((prev) => ({
          ...prev,
          upcoming_appointments_count: response.data.data.upcoming_appointments_count,
          completed_appointments_count: response.data.data.completed_appointments_count,
          total_revenue: response.data.data.total_revenue,
        }));
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Impossible de charger les statistiques.',
          variant: 'destructive',
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
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
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Infirmière</h1>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/nurse/NurseMessages')} className="relative">
                <Mail className="h-4 w-4 mr-2" />
                Messages
                {unreadConversationsCount > 0 && !loadingUnreadCount && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadConversationsCount}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/nurse/profile')}>
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
            {loadingNurseData ? 'Chargement...' : `Bonjour, ${nurseData.first_name} ${nurseData.last_name} !`}
          </h2>
          <p className="text-lg opacity-90">
            Vous avez {loadingStats ? '...' : stats.upcoming_appointments_count} rendez-vous à venir cette semaine.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {loadingStats ? '...' : stats.upcoming_appointments_count}
              </div>
              <p className="text-gray-600">RDV cette semaine</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {loadingStats ? '...' : stats.completed_appointments_count}
              </div>
              <p className="text-gray-600">RDV terminés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {loadingStats ? '...' : `${stats.total_revenue} MAD`}
              </div>
              <p className="text-gray-600">Revenus</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {loadingStats || !stats.rating ? '...' : `${stats.rating}/5`}
              </div>
              <p className="text-gray-600">Note moyenne</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Rendez-vous prochains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingAppointments ? (
                  <p className="text-gray-500 text-center py-4">Chargement des rendez-vous...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun rendez-vous à venir</p>
                ) : (
                  upcomingAppointments.map((appointment: Appointment) => (
                    <div key={appointment.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{appointment.service_name}</p>
                          <p className="text-sm text-gray-600">avec {appointment.patient_name}</p>
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

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/schedule')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Gérer mon planning</h3>
                    <p className="text-gray-600">Ajoutez vos disponibilités</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/services')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Mes services</h3>
                    <p className="text-gray-600">Configurez vos spécialités</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nurse/profile')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Mon profil</h3>
                    <p className="text-gray-600">Mettez à jour vos informations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;