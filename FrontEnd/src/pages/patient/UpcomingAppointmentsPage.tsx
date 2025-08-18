import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

const UpcomingAppointmentsPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const response = await axiosInstance.get('getPatientAppointments');
        setUpcomingAppointments(response.data.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        toast({
          title: "Erreur",
          description: axiosError.response?.data?.message || "Impossible de charger les rendez-vous. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
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
              <h1 className="text-2xl font-bold text-gray-900">Rendez-vous à venir</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Upcoming Appointments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Vos Rendez-vous à Venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingAppointments ? (
                <p className="text-gray-500 text-center py-4">Chargement des rendez-vous...</p>
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun rendez-vous à venir</p>
              ) : (
                upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')} à {new Date(appointment.apointementsDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.statut === 'confirme' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
      </div>
    </div>
  );
};

export default UpcomingAppointmentsPage;