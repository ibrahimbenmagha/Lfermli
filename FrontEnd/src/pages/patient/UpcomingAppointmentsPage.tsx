import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, X, Edit, AlertTriangle } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Appointment {
  id: number;
  service_name: string;
  nurse_name: string;
  apointementsDate: string;
  adress: string;
  statut: string;
  emergency_level: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | null;
  payment_method: 'home' | 'bank_transfer' | 'online' | 'none' | null;
}

const UpcomingAppointmentsPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  
  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyLevel, setEditEmergencyLevel] = useState('');
  const [editing, setEditing] = useState(false);

  // Fetch upcoming appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await axiosInstance.get('getPatientAppointmentsActive');
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

  // Handle cancel appointment
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    
    setCancelling(true);
    try {
      await axiosInstance.put('cancelAppointmentByPatient', {
        appointementId: appointmentToCancel.id
      });
      
      toast({
        title: "Succès",
        description: "Rendez-vous annulé avec succès",
      });
      
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      fetchAppointments(); // Refresh list
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible d'annuler le rendez-vous",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  // Handle edit appointment
  const handleEditClick = (appointment: Appointment) => {
    if (appointment.statut !== 'en_attente') {
      toast({
        title: "Information",
        description: "Seuls les rendez-vous en attente peuvent être modifiés",
        variant: "destructive",
      });
      return;
    }
    
    setAppointmentToEdit(appointment);
    const dateTime = new Date(appointment.apointementsDate);
    setEditDate(dateTime.toISOString().split('T')[0]);
    setEditTime(dateTime.toTimeString().slice(0, 5));
    setEditAddress(appointment.adress);
    setEditEmergencyLevel(appointment.emergency_level);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!appointmentToEdit) return;
    
    setEditing(true);
    try {
      const newDateTime = `${editDate}T${editTime}:00`;
      
      await axiosInstance.put('updateAppointmentByPatient', {
        appointementId: appointmentToEdit.id,
        date: newDateTime,
        address: editAddress,
        emergencyLevel: editEmergencyLevel
      });
      
      toast({
        title: "Succès",
        description: "Rendez-vous modifié avec succès",
      });
      
      setEditDialogOpen(false);
      setAppointmentToEdit(null);
      fetchAppointments(); // Refresh list
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: "Erreur",
        description: axiosError.response?.data?.message || "Impossible de modifier le rendez-vous",
        variant: "destructive",
      });
    } finally {
      setEditing(false);
    }
  };

  const handleDownloadInvoice = async (appointmentId: number) => {
    try {
      setDownloading(appointmentId);
      const response = await axiosInstance.get(`appointment/${appointmentId}/invoice/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture. Elle n'est peut-être pas encore générée.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirme':
        return 'bg-green-100 text-green-800';
      case 'refuse':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return 'En attente';
      case 'confirme':
        return 'Confirmé';
      case 'refuse':
        return 'Refusé';
      case 'termine':
        return 'Terminé';
      default:
        return statut;
    }
  };

  const getPaymentStatusBadge = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusLabel = (status: string | null, method: string | null) => {
    if (!status || status === 'pending') {
      if (method === 'home') return 'Paiement à domicile';
      return 'En attente de paiement';
    }
    if (status === 'paid') return 'Payé';
    if (status === 'failed') return 'Échec du paiement';
    return status;
  };

  const getEmergencyLabel = (level: string) => {
    switch (level) {
      case 'normal':
        return 'Normal';
      case 'urgent':
        return 'Urgent';
      case 'super_urgent':
        return 'Très urgent';
      default:
        return level;
    }
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
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-primary pl-4 py-3 bg-gray-50 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{appointment.service_name}</p>
                        <p className="text-sm text-gray-600">avec {appointment.nurse_name}</p>
                        <p className="text-sm text-gray-500">
                          📅 {new Date(appointment.apointementsDate).toLocaleDateString('fr-FR')} à {new Date(appointment.apointementsDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-gray-500">📍 {appointment.adress}</p>
                        <p className="text-sm text-gray-500">⚡ {getEmergencyLabel(appointment.emergency_level)}</p>
                      </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.statut)}`}>
                              {getStatusLabel(appointment.statut)}
                            </span>
                            {appointment.payment_method && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadge(appointment.payment_status)}`}>
                                {getPaymentStatusLabel(appointment.payment_status, appointment.payment_method)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {appointment.payment_status === 'paid' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-green-600 text-green-600 hover:bg-green-50"
                                onClick={() => handleDownloadInvoice(appointment.id)}
                                disabled={downloading === appointment.id}
                              >
                                {downloading === appointment.id ? "..." : "Facture PDF"}
                              </Button>
                            )}
                            {appointment.statut === 'en_attente' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditClick(appointment)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                          )}
                          {(appointment.statut === 'en_attente' || appointment.statut === 'confirme') && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmer l'annulation
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {appointmentToCancel && (
            <div className="py-4 bg-gray-50 rounded-lg px-4">
              <p className="font-semibold">{appointmentToCancel.service_name}</p>
              <p className="text-sm text-gray-600">avec {appointmentToCancel.nurse_name}</p>
              <p className="text-sm text-gray-500">
                {new Date(appointmentToCancel.apointementsDate).toLocaleDateString('fr-FR')} à {new Date(appointmentToCancel.apointementsDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
              Non, garder
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={cancelling}>
              {cancelling ? "Annulation..." : "Oui, annuler"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-primary" />
              Modifier le rendez-vous
            </DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre rendez-vous. Seuls les rendez-vous en attente peuvent être modifiés.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Heure</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Votre adresse complète"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergency">Niveau d'urgence</Label>
              <Select value={editEmergencyLevel} onValueChange={setEditEmergencyLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau d'urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="super_urgent">Très urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editing}>
              Annuler
            </Button>
            <Button onClick={confirmEdit} disabled={editing}>
              {editing ? "Modification..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingAppointmentsPage;