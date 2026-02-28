import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Star, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
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
  service_name: string;
  nurse_name: string;
  apointementsDate: string;
  statut: string;
  hasReview?: boolean;
}

interface MedicalRecord {
  id: number;
  appointment_id: number;
  appointment_date: string;
  service_name: string;
  nurse_name: string;
  prescriptions: string | null;
  resultats_tests: string | null;
  notes_infirmier: string | null;
  created_at: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  nurse_name: string;
  appointment_date: string;
  created_at: string;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loadingRecentAppointments, setLoadingRecentAppointments] = useState(true);
  const [myReviews, setMyReviews] = useState<Review[]>([]);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Medical record dialog state
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // Fetch terminated appointments
  useEffect(() => {
    fetchRecentAppointments();
    fetchMyReviews();
  }, []);

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

  const fetchMyReviews = async () => {
    try {
      const response = await axiosInstance.get('getMyReviews');
      setMyReviews(response.data.data);
    } catch (error) {
      // Silently fail, reviews are optional
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchMedicalHistory = async () => {
    setLoadingMedical(true);
    try {
      const response = await axiosInstance.get('getMyMedicalHistory');
      setMedicalRecords(response.data.data);
      setMedicalDialogOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible de charger l'historique médical",
        variant: "destructive",
      });
    } finally {
      setLoadingMedical(false);
    }
  };

  // Check if appointment already has a review
  const hasReview = (appointmentId: number) => {
    return myReviews.some(review => 
      new Date(review.appointment_date).getTime() === new Date(recentAppointments.find(a => a.id === appointmentId)?.apointementsDate || '').getTime()
    );
  };

  // Handle review submission
  const handleReviewClick = (appointment: Appointment) => {
    setAppointmentToReview(appointment);
    setRating(0);
    setComment('');
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!appointmentToReview || rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await axiosInstance.post('createReview', {
        appointment_id: appointmentToReview.id,
        rating: rating,
        comment: comment || null
      });

      toast({
        title: "Succès",
        description: "Merci pour votre avis !",
      });

      setReviewDialogOpen(false);
      setAppointmentToReview(null);
      fetchMyReviews(); // Refresh reviews
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible de soumettre l'avis",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 ${interactive ? 'cursor-pointer' : ''} ${
              star <= (interactive ? (hoverRating || rating) : count)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

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
            <Button 
              variant="outline" 
              onClick={fetchMedicalHistory}
              disabled={loadingMedical}
            >
              <FileText className="h-4 w-4 mr-2" />
              {loadingMedical ? "Chargement..." : "Mon Dossier Médical"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* History Section */}
        <Card className="mb-8">
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
                recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-secondary pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Terminé
                        </span>
                        {!hasReview(appointment.id) ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReviewClick(appointment)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Noter
                          </Button>
                        ) : (
                          <span className="text-sm text-green-600 flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-green-600" />
                            Noté
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Reviews Section */}
        {myReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Mes Avis ({myReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.appointment_date).toLocaleDateString('fr-FR')}
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Laisser un avis
            </DialogTitle>
            <DialogDescription>
              Partagez votre expérience avec cet infirmier
            </DialogDescription>
          </DialogHeader>
          {appointmentToReview && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="font-semibold">{appointmentToReview.service_name}</p>
                <p className="text-sm text-gray-600">avec {appointmentToReview.nurse_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(appointmentToReview.apointementsDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Votre note</Label>
                  <div className="flex justify-center">
                    {renderStars(rating, true)}
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    {rating === 0 && "Cliquez pour noter"}
                    {rating === 1 && "Très insatisfait"}
                    {rating === 2 && "Insatisfait"}
                    {rating === 3 && "Neutre"}
                    {rating === 4 && "Satisfait"}
                    {rating === 5 && "Très satisfait"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="review-comment">Commentaire (optionnel)</Label>
                  <Textarea
                    id="review-comment"
                    placeholder="Partagez votre expérience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)} disabled={submittingReview}>
              Annuler
            </Button>
            <Button onClick={submitReview} disabled={submittingReview || rating === 0}>
              {submittingReview ? "Envoi..." : "Publier l'avis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical History Dialog */}
      <Dialog open={medicalDialogOpen} onOpenChange={setMedicalDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Mon Dossier Médical
            </DialogTitle>
            <DialogDescription>
              Historique de vos consultations et notes médicales
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {medicalRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun dossier médical disponible</p>
            ) : selectedRecord ? (
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedRecord(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Button>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold">{selectedRecord.service_name}</p>
                    <p className="text-sm text-gray-600">par {selectedRecord.nurse_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedRecord.appointment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  {selectedRecord.prescriptions && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">💊 Prescriptions</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.prescriptions}</p>
                    </div>
                  )}
                  
                  {selectedRecord.resultats_tests && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">🔬 Résultats des tests</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.resultats_tests}</p>
                    </div>
                  )}
                  
                  {selectedRecord.notes_infirmier && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">📝 Notes de l'infirmier</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.notes_infirmier}</p>
                    </div>
                  )}
                  
                  {!selectedRecord.prescriptions && !selectedRecord.resultats_tests && !selectedRecord.notes_infirmier && (
                    <p className="text-gray-500 text-center py-4">Aucune note médicale pour cette consultation</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {medicalRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{record.service_name}</p>
                        <p className="text-sm text-gray-600">par {record.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(record.appointment_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <ArrowLeft className="h-5 w-5 text-gray-400 rotate-180" />
                    </div>
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

export default HistoryPage;
