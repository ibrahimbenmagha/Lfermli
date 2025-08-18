// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Heart, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const HistoryPage = () => {
//   const navigate = useNavigate();

//   const recentHistory = [
//     {
//       date: '2024-05-25',
//       nurse: 'Claire Dubois',
//       service: 'Injection',
//       status: 'Terminé'
//     },
//     {
//       date: '2024-05-22',
//       nurse: 'Marie Dupont',
//       service: 'Soins post-opératoires',
//       status: 'Terminé'
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-light">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 onClick={() => navigate('/patient/dashboard')}
//               >
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Retour au Tableau de bord
//               </Button>
//               <h1 className="text-2xl font-bold text-gray-900">Historique des Soins</h1>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* History Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Heart className="h-5 w-5 mr-2 text-secondary" />
//               Vos Soins Passés
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentHistory.map((item, index) => (
//                 <div key={index} className="border-l-4 border-secondary pl-4 py-2">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-semibold">{item.service}</p>
//                       <p className="text-sm text-gray-600">avec {item.nurse}</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(item.date).toLocaleDateString('fr-FR')}
//                       </p>
//                     </div>
//                     <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                       {item.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               {recentHistory.length === 0 && (
//                 <p className="text-gray-500 text-center py-4">
//                   Aucun soin passé à afficher
//                 </p>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default HistoryPage;




import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loadingRecentAppointments, setLoadingRecentAppointments] = useState(true);

  // Fetch terminated appointments
  useEffect(() => {
    const fetchRecentAppointments = async () => {
      try {
        setLoadingRecentAppointments(true);
        const response = await axiosInstance.get('getPatientAppointmentsTermine');
        setRecentAppointments(response.data.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: "Erreur",
          description: axiosError.response?.data?.message || "Impossible de charger les soins récents. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoadingRecentAppointments(false);
      }
    };
    fetchRecentAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-light">
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
              <h1 className="text-2xl font-bold text-gray-900">Historique des Soins</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-secondary" />
              Vos Soins Passés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingRecentAppointments ? (
                <p className="text-gray-500 text-center py-4">Chargement des soins récents...</p>
              ) : recentAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun soin passé à afficher</p>
              ) : (
                recentAppointments.map((appointment, index) => (
                  <div key={index} className="border-l-4 border-secondary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
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
  );
};

export default HistoryPage;
