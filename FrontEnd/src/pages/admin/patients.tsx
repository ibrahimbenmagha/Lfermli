import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Trash2, AlertCircle, ArrowLeft, Plus, Users } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface Patient {
  patientId: number;
  first_name: string;
  last_name: string;
  email: string;
  nickname?: string;
  phone_number?: string;
  user_id: number;
}

const GPatients: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [countLoading, setCountLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [patientsWithoutAppointments, setPatientsWithoutAppointments] = useState<number>(0);
  const [patientsWithRecentAppointments, setPatientsWithRecentAppointments] = useState<number>(0);
  const [newPatientsLast7Days, setNewPatientsLast7Days] = useState<number>(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    nickname: '',
    phone_number: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCountLoading(true);
        setError(null);

        const patientsResponse = await axiosInstance.get('getAllPatientsInfos');
        const mappedPatients = patientsResponse.data.data.map((patient: any) => ({
          patientId: patient.id,
          user_id: patient.user_id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          phone_number: patient.phone_number,
          nickname: patient.nickname || undefined,
        }));
        setPatients(mappedPatients);
        setFilteredPatients(mappedPatients);

        const statsResponse = await axiosInstance.get('getPatientStatistics');
        setTotalPatients(statsResponse.data.total_patients);
        setPatientsWithoutAppointments(statsResponse.data.patients_without_appointments);
        setPatientsWithRecentAppointments(statsResponse.data.patients_with_recent_appointments);
        setNewPatientsLast7Days(statsResponse.data.new_patients_last_7_days);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des données.';
        setError(errorMessage);
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setCountLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshPatientCount = async () => {
    try {
      setCountLoading(true);
      const statsResponse = await axiosInstance.get('getPatientStatistics');
      setTotalPatients(statsResponse.data.total_patients);
      setPatientsWithoutAppointments(statsResponse.data.patients_without_appointments);
      setPatientsWithRecentAppointments(statsResponse.data.patients_with_recent_appointments);
      setNewPatientsLast7Days(statsResponse.data.new_patients_last_7_days);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors du chargement du nombre de patients.',
        variant: 'destructive',
      });
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (patient.nickname && patient.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (patient.phone_number && patient.phone_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const deletePatient = async (patientId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return;
    try {
      await axiosInstance.delete(`patients/${patientId}`);
      setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
      setFilteredPatients((prev) => prev.filter((p) => p.patientId !== patientId));
      await refreshPatientCount();
      toast({
        title: 'Succès',
        description: 'Patient supprimé avec succès.',
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la suppression du patient.',
        variant: 'destructive',
      });
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        nickname: formData.nickname,
        phone_number: formData.phone_number,
        password: formData.password,
      };
      const response = await axiosInstance.post('auth/CreatePatient', payload);
      const newPatient = {
        patientId: response.data.data.id,
        first_name: response.data.data.first_name,
        last_name: response.data.data.last_name,
        email: response.data.data.email,
        nickname: response.data.data.nickname || undefined,
        phone_number: response.data.data.phone_number,
        user_id: response.data.data.user_id || response.data.data.id,
      };
      setPatients((prev) => [...prev, newPatient]);
      setFilteredPatients((prev) => [...prev, newPatient]);
      setIsAddModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        nickname: '',
        phone_number: '',
        password: '',
      });
      await refreshPatientCount();
      toast({
        title: 'Succès',
        description: 'Patient ajouté avec succès.',
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
      if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        setFormErrors(errors);
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez vérifier les champs saisis.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'ajout du patient.';
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      setFormErrors({});
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        nickname: formData.nickname,
        phone_number: formData.phone_number,
        password: formData.password || undefined,
      };
      const response = await axiosInstance.put(`patients/${selectedPatient.patientId}`, payload);
      const updatedPatient = {
        patientId: response.data.data.id || response.data.data.patientId,
        first_name: response.data.data.first_name,
        last_name: response.data.data.last_name,
        email: response.data.data.email,
        nickname: response.data.data.nickname || undefined,
        phone_number: response.data.data.phone_number,
        user_id: response.data.data.user_id || selectedPatient.user_id,
      };
      setPatients((prev) =>
        prev.map((p) => (p.patientId === selectedPatient.patientId ? updatedPatient : p))
      );
      setFilteredPatients((prev) =>
        prev.map((p) => (p.patientId === selectedPatient.patientId ? updatedPatient : p))
      );
      setIsEditModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        nickname: '',
        phone_number: '',
        password: '',
      });
      await refreshPatientCount();
      toast({
        title: 'Succès',
        description: 'Patient mis à jour avec succès.',
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
      if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        setFormErrors(errors);
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez vérifier les champs saisis.',
          variant: 'destructive',
        });
      } else {
        const errorMessage = axiosError.response?.data?.message || 'Erreur lors de la mise à jour du patient.';
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      nickname: patient.nickname || '',
      phone_number: patient.phone_number || '',
      password: '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion des Patients
              </h1>
              <p className="text-gray-600 mt-1">Administrez vos patients</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setFormErrors({});
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un patient</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">
                {countLoading ? <span className="inline-block animate-pulse">...</span> : totalPatients}
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients sans rendez-vous</p>
              <p className="text-2xl font-bold text-purple-600">
                {countLoading ? <span className="inline-block animate-pulse">...</span> : patientsWithoutAppointments}
              </p>
            </div>
            <Users className="h-10 w-10 text-purple-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rendez-vous récents (7 jours)</p>
              <p className="text-2xl font-bold text-green-600">
                {countLoading ? <span className="inline-block animate-pulse">...</span> : patientsWithRecentAppointments}
              </p>
            </div>
            <Users className="h-10 w-10 text-green-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nouveaux patients (7 jours)</p>
              <p className="text-2xl font-bold text-orange-600">
                {countLoading ? <span className="inline-block animate-pulse">...</span> : newPatientsLast7Days}
              </p>
            </div>
            <Users className="h-10 w-10 text-orange-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <Input
              placeholder="Rechercher par nom, email, surnom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 border-gray-200 focus:bg-white transition-colors"
            />
            <Button
              onClick={refreshPatientCount}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Rafraîchir le compteur
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Liste des Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Chargement des patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun patient trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Surnom</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient, index) => (
                    <TableRow
                      key={patient.patientId}
                      className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell
                        className="px-6 py-4 cursor-pointer hover:text-blue-600 font-medium transition-colors"
                        onClick={() => openEditModal(patient)}
                      >
                        {patient.first_name} {patient.last_name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{patient.nickname || 'Non renseigné'}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{patient.email}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{patient.phone_number || 'Non renseigné'}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePatient(patient.patientId)}
                            className="hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Ajouter un Patient</DialogTitle>
            <DialogDescription className="text-gray-600">
              Remplissez les informations pour créer un nouveau patient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPatient} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.first_name ? 'border-red-500' : ''}`}
              />
              {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
            </div>
            <div>
              <Input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.last_name ? 'border-red-500' : ''}`}
              />
              {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
            </div>
            <div>
              <Input
                placeholder="Surnom"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.nickname ? 'border-red-500' : ''}`}
              />
              {formErrors.nickname && <p className="text-red-500 text-sm mt-1">{formErrors.nickname}</p>}
            </div>
            <div>
              <Input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.phone_number ? 'border-red-500' : ''}`}
              />
              {formErrors.phone_number && <p className="text-red-500 text-sm mt-1">{formErrors.phone_number}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.password ? 'border-red-500' : ''}`}
              />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">Modifier un Patient</DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifiez les informations du patient sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPatient} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.first_name ? 'border-red-500' : ''}`}
              />
              {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
            </div>
            <div>
              <Input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.last_name ? 'border-red-500' : ''}`}
              />
              {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
            </div>
            <div>
              <Input
                placeholder="Surnom"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.nickname ? 'border-red-500' : ''}`}
              />
              {formErrors.nickname && <p className="text-red-500 text-sm mt-1">{formErrors.nickname}</p>}
            </div>
            <div>
              <Input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : ''}`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.phone_number ? 'border-red-500' : ''}`}
              />
              {formErrors.phone_number && <p className="text-red-500 text-sm mt-1">{formErrors.phone_number}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Nouveau mot de passe (facultatif)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`focus:ring-2 focus:ring-blue-500 ${formErrors.password ? 'border-red-500' : ''}`}
              />
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Mettre à jour
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GPatients;


