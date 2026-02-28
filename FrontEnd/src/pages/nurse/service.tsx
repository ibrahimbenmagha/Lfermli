import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar as CalendarIcon, ArrowLeft, Mail, FileText, Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

interface Review {
  id: number;
  rating: number;
  comment: string;
  patient_name: string;
  created_at: string;
}

interface NurseRating {
  average_rating: number;
  total_reviews: number;
}

const AppointmentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nurseRating, setNurseRating] = useState<NurseRating | null>(null);
  const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Medical record dialog state
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prescriptions, setPrescriptions] = useState('');
  const [resultatsTests, setResultatsTests] = useState('');
  const [notesInfirmier, setNotesInfirmier] = useState('');
  const [submittingRecord, setSubmittingRecord] = useState(false);

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

  // Handle medical record dialog
  const handleAddMedicalRecord = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptions('');
    setResultatsTests('');
    setNotesInfirmier('');
    setMedicalDialogOpen(true);
  };

  // Submit medical record
  const submitMedicalRecord = async () => {
    if (!selectedAppointment) return;

    if (!prescriptions && !resultatsTests && !notesInfirmier) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins un champ",
        variant: "destructive",
      });
      return;
    }

    setSubmittingRecord(true);
    try {
      await axiosInstance.post('createMedicalRecord', {
        appointment_id: selectedAppointment.id,
        prescriptions: prescriptions || null,
        resultats_tests: resultatsTests || null,
        notes_infirmier: notesInfirmier || null
      });

      toast({
        title: "Succès",
        description: "Dossier médical enregistré avec succès",
      });

      setMedicalDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible d'enregistrer le dossier médical",
        variant: "destructive",
      });
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Fetch nurse reviews
  const fetchMyReviews = async () => {
    setLoadingReviews(true);
    try {
      // Get nurse ID from local data or API
      const nurseInfoResponse = await axiosInstance.get('GetNurseInfosById');
      const nurseId = nurseInfoResponse.data.data.nurse_id;

      // Fetch reviews for this nurse
      const reviewsResponse = await axiosInstance.get(`auth/getReviewsByNurse/${nurseId}`);
      setReviews(reviewsResponse.data.data);

      // Fetch average rating
      const ratingResponse = await axiosInstance.get(`auth/getNurseAverageRating/${nurseId}`);
      setNurseRating(ratingResponse.data.data);

      setReviewsDialogOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible de charger les avis",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchMyReviews}
                disabled={loadingReviews}
              >
                <Star className="h-4 w-4 mr-2" />
                {loadingReviews ? "Chargement..." : "Mes Avis"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/nurse/NurseMessages')}>
                <Mail className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </div>
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
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getEmergencyStyles(
                                  appt.emergency_level
                                )}`}
                              >
                                {appt.emergency_level === 'urgent' ? 'Urgent' : 'Normal'}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAddMedicalRecord(appt)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Dossier
                              </Button>
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

      {/* Medical Record Dialog */}
      <Dialog open={medicalDialogOpen} onOpenChange={setMedicalDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Ajouter un Dossier Médical
            </DialogTitle>
            <DialogDescription>
              Ajoutez les notes médicales pour ce rendez-vous
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-semibold">{selectedAppointment.service_name}</p>
                <p className="text-sm text-gray-600">Patient: {selectedAppointment.patient_name}</p>
                <p className="text-sm text-gray-500">
                  {formatDateTime(selectedAppointment.apointementsDate)}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prescriptions">💊 Prescriptions</Label>
                  <Textarea
                    id="prescriptions"
                    placeholder="Médicaments prescrits, posologie..."
                    value={prescriptions}
                    onChange={(e) => setPrescriptions(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resultats-tests">🔬 Résultats des tests</Label>
                  <Textarea
                    id="resultats-tests"
                    placeholder="Résultats d'analyses, mesures..."
                    value={resultatsTests}
                    onChange={(e) => setResultatsTests(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes-infirmier">📝 Notes de l'infirmier</Label>
                  <Textarea
                    id="notes-infirmier"
                    placeholder="Observations, recommandations..."
                    value={notesInfirmier}
                    onChange={(e) => setNotesInfirmier(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicalDialogOpen(false)} disabled={submittingRecord}>
              Annuler
            </Button>
            <Button onClick={submitMedicalRecord} disabled={submittingRecord}>
              {submittingRecord ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Dialog */}
      <Dialog open={reviewsDialogOpen} onOpenChange={setReviewsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Mes Avis Patients
            </DialogTitle>
            <DialogDescription>
              Consultez les avis laissés par vos patients
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Rating Summary */}
            {nurseRating && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(nurseRating.average_rating))}
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {nurseRating.average_rating.toFixed(1)}/5
                </p>
                <p className="text-sm text-gray-600">
                  Basé sur {nurseRating.total_reviews} avis
                </p>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun avis pour le moment</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.patient_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-2 italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentHistory;
