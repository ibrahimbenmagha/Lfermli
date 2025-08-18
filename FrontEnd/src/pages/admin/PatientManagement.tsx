// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, Trash2, Lock, Unlock, AlertCircle, ArrowLeft, Plus, Users, UserCheck, UserX, MapPin, Phone } from 'lucide-react';
// import axiosInstance from '../../axiosConfig';
// import { toast } from '@/hooks/use-toast';
// import { AxiosError } from 'axios';

// interface Service {
//   id: number;
//   name: string;
//   price: string;
// }

// interface City {
//   id: number;
//   name: string;
// }

// interface Zone {
//   id: number;
//   name: string;
//   city_id: number;
// }

// interface Nurse {
//   nurseId: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   city_name?: string;
//   phone_number?: string;
//   zone_name?: string;
//   nickname?: string;
//   services?: Service[];
//   status: 'activated' | 'disabled';
//   user_id: number;
// }

// const NurseManagement: React.FC = () => {
//   const navigate = useNavigate();
//   const [nurses, setNurses] = useState<Nurse[]>([]);
//   const [filteredNurses, setFilteredNurses] = useState<Nurse[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
//   const [services, setServices] = useState<Service[]>([]);
//   const [cities, setCities] = useState<City[]>([]);
//   const [zones, setZones] = useState<Zone[]>([]);
//   const [formData, setFormData] = useState({
//     first_name: '',
//     last_name: '',
//     email: '',
//     city_id: '',
//     phone_number: '',
//     zone_id: '',
//     nickname: '',
//     password: '',
//     selectedServices: [{ id: '', price: '' }],
//     isActive: true,
//   });

//   // Calcul des statistiques
//   const totalNurses = nurses.length;
//   const activatedNurses = nurses.filter(nurse => nurse.status === 'activated').length;
//   const disabledNurses = nurses.filter(nurse => nurse.status === 'disabled').length;
//   const uniqueCities = [...new Set(nurses.map(nurse => nurse.city_name).filter(Boolean))].length;

//   // Fetch nurses, services, cities, and zones from backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Fetch nurses
//         const nursesResponse = await axiosInstance.get('GetAllNurses');
//         const mappedNurses = nursesResponse.data.data.map((nurse: any) => ({
//           nurseId: nurse.id || nurse.nurseId,
//           user_id: nurse.user_id,
//           first_name: nurse.first_name,
//           last_name: nurse.last_name,
//           email: nurse.email,
//           city_name: nurse.city_name,
//           phone_number: nurse.phone_number,
//           zone_name: nurse.zone_name,
//           nickname: nurse.nickname,
//           services: Array.isArray(nurse.services) ? nurse.services : [],
//           status: nurse.status || 'activated',
//         }));
//         setNurses(mappedNurses);
//         setFilteredNurses(mappedNurses);

//         // Fetch services
//         const servicesResponse = await axiosInstance.get('auth/GetAllServices');
//         setServices(servicesResponse.data.data);

//         // Fetch cities
//         const citiesResponse = await axiosInstance.get('auth/GetAllCities');
//         setCities(citiesResponse.data.data);

//         // Fetch zones
//         const zonesResponse = await axiosInstance.get('auth/GetAllZones');
//         setZones(zonesResponse.data.data);
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des données.';
//         setError(errorMessage);
//         toast({
//           title: 'Erreur',
//           description: errorMessage,
//           variant: 'destructive',
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Recherche améliorée incluant la ville et numéro de téléphone
//   useEffect(() => {
//     const filtered = nurses.filter(
//       (nurse) =>
//         `${nurse.first_name} ${nurse.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         nurse.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (nurse.city_name && nurse.city_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
//         (nurse.phone_number && nurse.phone_number.toLowerCase().includes(searchQuery.toLowerCase()))
//     );
//     setFilteredNurses(filtered);
//   }, [searchQuery, nurses]);

//   // Activer/Désactiver une infirmière
//   const toggleNurseStatus = async (nurseId: number, status: 'activated' | 'disabled') => {
//     try {
//       const newStatus = status === 'activated' ? 'disabled' : 'activated';
//       const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
//       document.cookie = `nurseId=${nurseId}; path=/; expires=${expires}; SameSite=Strict; Secure`;
//       document.cookie = `status=${status}; path=/; expires=${expires}; SameSite=Strict; Secure`;

//       const response = await axiosInstance.put('toggleNurseStatus', {}, {
//         withCredentials: true,
//       });

//       const updatedNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
//       setNurses((prev) =>
//         prev.map((n) => (n.nurseId === nurseId ? updatedNurse : n))
//       );
//       setFilteredNurses((prev) =>
//         prev.map((n) => (n.nurseId === nurseId ? updatedNurse : n))
//       );

//       document.cookie = `nurseId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
//       document.cookie = `status=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

//       toast({
//         title: 'Succès',
//         description: `Infirmière ${newStatus === 'activated' ? 'activée' : 'désactivée'} avec succès.`,
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour du statut.',
//         variant: 'destructive',
//       });
//       console.error('Toggle status error:', axiosError);
//     }
//   };

//   // Supprimer une infirmière
//   const deleteNurse = async (nurseId: number) => {
//     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette infirmière ?')) return;
//     try {
//       await axiosInstance.delete(`nurses/${nurseId}`);
//       setNurses((prev) => prev.filter((n) => n.nurseId !== nurseId));
//       setFilteredNurses((prev) => prev.filter((n) => n.nurseId !== nurseId));
//       toast({
//         title: 'Succès',
//         description: 'Infirmière supprimée avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la suppression de l\'infirmière.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Gérer les services dynamiques
//   const handleServiceChange = (index: number, field: 'id' | 'price', value: string) => {
//     const newServices = [...formData.selectedServices];
//     newServices[index] = { ...newServices[index], [field]: value };
//     setFormData({ ...formData, selectedServices: newServices });
//   };

//   const addServiceField = () => {
//     if (formData.selectedServices.length < 3) {
//       setFormData({ ...formData, selectedServices: [...formData.selectedServices, { id: '', price: '' }] });
//     } else {
//       toast({
//         title: 'Limite atteinte',
//         description: 'Vous ne pouvez pas ajouter plus de 3 services.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const removeServiceField = (index: number) => {
//     if (formData.selectedServices.length > 1) {
//       const newServices = formData.selectedServices.filter((_, i) => i !== index);
//       setFormData({ ...formData, selectedServices: newServices });
//     } else {
//       toast({
//         title: 'Erreur',
//         description: 'Vous devez avoir au moins un service.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Ajouter une infirmière
//   const handleAddNurse = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const payload: any = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         city_id: parseInt(formData.city_id),
//         phone_number: formData.phone_number,
//         zone_id: parseInt(formData.zone_id),
//         nickname: formData.nickname,
//         password: formData.password,
//         services: formData.selectedServices.map(service => ({
//           id: parseInt(service.id),
//           price: parseFloat(service.price),
//         })),
//       };
//       if (formData.isActive) {
//         payload.status = 'activated';
//       }
//       const response = await axiosInstance.post('auth/CreateNurse', payload);
//       const newNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
//       setNurses((prev) => [...prev, newNurse]);
//       setFilteredNurses((prev) => [...prev, newNurse]);
//       setIsAddModalOpen(false);
//       setFormData({
//         first_name: '',
//         last_name: '',
//         email: '',
//         city_id: '',
//         phone_number: '',
//         zone_id: '',
//         nickname: '',
//         password: '',
//         selectedServices: [{ id: '', price: '' }],
//         isActive: true,
//       });
//       toast({
//         title: 'Succès',
//         description: 'Infirmière ajoutée avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
//       const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'ajout de l\'infirmière.';
//       toast({
//         title: 'Erreur',
//         description: errorMessage,
//         variant: 'destructive',
//       });
//     }
//   };

//   // Modifier une infirmière
//   const handleEditNurse = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedNurse) return;
//     try {
//       const payload: any = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         city_id: parseInt(formData.city_id),
//         phone_number: formData.phone_number,
//         zone_id: parseInt(formData.zone_id),
//         nickname: formData.nickname,
//         password: formData.password || undefined,
//         services: formData.selectedServices.map(service => ({
//           id: parseInt(service.id),
//           price: parseFloat(service.price),
//         })),
//       };
//       if (formData.isActive) {
//         payload.status = 'activated';
//       }
//       const response = await axiosInstance.put(`nurses/${selectedNurse.nurseId}`, payload);
//       const updatedNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
//       setNurses((prev) =>
//         prev.map((n) => (n.nurseId === selectedNurse.nurseId ? updatedNurse : n))
//       );
//       setFilteredNurses((prev) =>
//         prev.map((n) => (n.nurseId === selectedNurse.nurseId ? updatedNurse : n))
//       );
//       setIsEditModalOpen(false);
//       setFormData({
//         first_name: '',
//         last_name: '',
//         email: '',
//         city_id: '',
//         phone_number: '',
//         zone_id: '',
//         nickname: '',
//         password: '',
//         selectedServices: [{ id: '', price: '' }],
//         isActive: true,
//       });
//       toast({
//         title: 'Succès',
//         description: 'Infirmière mise à jour avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour de l\'infirmière.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Ouvrir la modale de modification
//   const openEditModal = (nurse: Nurse) => {
//     setSelectedNurse(nurse);
//     setFormData({
//       first_name: nurse.first_name,
//       last_name: nurse.last_name,
//       email: nurse.email,
//       city_id: cities.find(city => city.name === nurse.city_name)?.id.toString() || '',
//       phone_number: nurse.phone_number || '',
//       zone_id: zones.find(zone => zone.name === nurse.zone_name)?.id.toString() || '',
//       nickname: nurse.nickname || '',
//       password: '',
//       selectedServices: Array.isArray(nurse.services) ? nurse.services.map(s => ({ id: s.id.toString(), price: s.price.toString() })) : [{ id: '', price: '' }],
//       isActive: nurse.status === 'activated',
//     });
//     setIsEditModalOpen(true);
//   };

//   // Filtrer les zones par ville sélectionnée
//   const filteredZones = zones.filter(zone => zone.city_id === parseInt(formData.city_id));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
//       <header className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="outline"
//               onClick={() => navigate('/admin/dashboard')}
//               className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span>Retour</span>
//             </Button>
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Gestion des Infirmières
//               </h1>
//               <p className="text-gray-600 mt-1">Administrez votre équipe médicale</p>
//             </div>
//           </div>
//           <Button 
//             onClick={() => setIsAddModalOpen(true)} 
//             className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
//           >
//             <Plus className="h-4 w-4" />
//             <span>Ajouter un praticien</span>
//           </Button>
//         </div>
//       </header>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardContent className="p-6 flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Infirmières</p>
//               <p className="text-2xl font-bold text-blue-600">{loading ? '...' : totalNurses}</p>
//             </div>
//             <Users className="h-10 w-10 text-blue-500 opacity-20" />
//           </CardContent>
//         </Card>
//         <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardContent className="p-6 flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Infirmières Activées</p>
//               <p className="text-2xl font-bold text-green-600">{loading ? '...' : activatedNurses}</p>
//             </div>
//             <UserCheck className="h-10 w-10 text-green-500 opacity-20" />
//           </CardContent>
//         </Card>
//         <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardContent className="p-6 flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Infirmières Désactivées</p>
//               <p className="text-2xl font-bold text-red-600">{loading ? '...' : disabledNurses}</p>
//             </div>
//             <UserX className="h-10 w-10 text-red-500 opacity-20" />
//           </CardContent>
//         </Card>
//         <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardContent className="p-6 flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Villes Couvertes</p>
//               <p className="text-2xl font-bold text-purple-600">{loading ? '...' : uniqueCities}</p>
//             </div>
//             <MapPin className="h-10 w-10 text-purple-500 opacity-20" />
//           </CardContent>
//         </Card>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
//           <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
//           <p>{error}</p>
//         </div>
//       )}

//       <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//         <CardContent className="p-6">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <Search className="h-5 w-5 text-blue-600" />
//             </div>
//             <Input
//               placeholder="Rechercher par nom, email, ville ou téléphone..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-white/50 border-gray-200 focus:bg-white transition-colors"
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//         <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//           <CardTitle className="text-xl font-semibold text-gray-800">
//             Liste des Infirmières ({filteredNurses.length})
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           {loading ? (
//             <div className="text-center py-12">
//               <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//               <p className="text-gray-500 mt-4">Chargement des infirmières...</p>
//             </div>
//           ) : filteredNurses.length === 0 ? (
//             <div className="text-center py-12">
//               <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <p className="text-gray-500">Aucune infirmière trouvée.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="border-b border-gray-100">
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Services</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ville</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Zone</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</TableHead>
//                     <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredNurses.map((nurse, index) => (
//                     <TableRow 
//                       key={nurse.nurseId} 
//                       className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors duration-200 ${
//                         index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
//                       }`}
//                     >
//                       <TableCell
//                         className="px-6 py-4 cursor-pointer hover:text-blue-600 font-medium transition-colors"
//                         onClick={() => openEditModal(nurse)}
//                       >
//                         {nurse.first_name} {nurse.last_name}
//                       </TableCell>
//                       <TableCell className="px-6 py-4 text-gray-600">{nurse.email}</TableCell>
//                       <TableCell className="px-6 py-4 text-gray-600">{nurse.phone_number || 'Non renseigné'}</TableCell>
//                       <TableCell className="px-6 py-4 text-gray-600">
//                         {Array.isArray(nurse.services) && nurse.services.length 
//                           ? nurse.services.map(s => `${s.name} (${s.price}€)`).join(', ') 
//                           : 'Non renseigné'}
//                       </TableCell>
//                       <TableCell className="px-6 py-4">
//                         {nurse.city_name ? (
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                             <MapPin className="h-3 w-3 mr-1" />
//                             {nurse.city_name}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">Non renseigné</span>
//                         )}
//                       </TableCell>
//                       <TableCell className="px-6 py-4 text-gray-600">{nurse.zone_name || 'Non renseigné'}</TableCell>
//                       <TableCell className="px-6 py-4">
//                         {nurse.status === 'activated' ? (
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
//                             Activé
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                             <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
//                             Désactivé
//                           </span>
//                         )}
//                       </TableCell>
//                       <TableCell className="px-6 py-4">
//                         <div className="flex space-x-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => toggleNurseStatus(nurse.nurseId, nurse.status)}
//                             className="hover:bg-gray-50 transition-colors"
//                           >
//                             {nurse.status === 'activated' ? (
//                               <Lock className="h-4 w-4 mr-1 text-red-500" />
//                             ) : (
//                               <Unlock className="h-4 w-4 mr-1 text-green-500" />
//                             )}
//                             {nurse.status === 'activated' ? 'Désactiver' : 'Activer'}
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             size="sm"
//                             onClick={() => deleteNurse(nurse.nurseId)}
//                             className="hover:bg-red-600 transition-colors"
//                           >
//                             <Trash2 className="h-4 w-4 mr-1" />
//                             Supprimer
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//         <DialogContent className="sm:max-w-lg bg-white">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold text-gray-800">Ajouter une Infirmière</DialogTitle>
//             <DialogDescription className="text-gray-600">
//               Remplissez les informations pour créer une nouvelle infirmière.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleAddNurse} className="space-y-4 mt-4">
//             <div>
//               <Input
//                 placeholder="Prénom"
//                 value={formData.first_name}
//                 onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 placeholder="Nom"
//                 value={formData.last_name}
//                 onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 placeholder="Surnom"
//                 value={formData.nickname}
//                 onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 type="email"
//                 placeholder="Adresse email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 type="tel"
//                 placeholder="Numéro de téléphone"
//                 value={formData.phone_number}
//                 onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Select
//                 value={formData.city_id}
//                 onValueChange={(value) => setFormData({ ...formData, city_id: value, zone_id: '' })}
//                 required
//               >
//                 <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                   <SelectValue placeholder="Sélectionnez une ville" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {cities.map((city) => (
//                     <SelectItem key={city.id} value={city.id.toString()}>
//                       {city.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Select
//                 value={formData.zone_id}
//                 onValueChange={(value) => setFormData({ ...formData, zone_id: value })}
//                 required
//                 disabled={!formData.city_id}
//               >
//                 <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                   <SelectValue placeholder="Sélectionnez une zone" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredZones.map((zone) => (
//                     <SelectItem key={zone.id} value={zone.id.toString()}>
//                       {zone.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Input
//                 type="password"
//                 placeholder="Mot de passe"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Services (max 3)</label>
//               {formData.selectedServices.map((service, index) => (
//                 <div key={index} className="flex space-x-2 mt-2">
//                   <Select
//                     value={service.id}
//                     onValueChange={(value) => handleServiceChange(index, 'id', value)}
//                     required
//                   >
//                     <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                       <SelectValue placeholder="Sélectionnez un service" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {services.map((s) => (
//                         <SelectItem key={s.id} value={s.id.toString()}>
//                           {s.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <Input
//                     type="number"
//                     placeholder="Prix (€)"
//                     value={service.price}
//                     onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
//                     required
//                     className="focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formData.selectedServices.length > 1 && (
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeServiceField(index)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//               {formData.selectedServices.length < 3 && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={addServiceField}
//                   className="mt-2"
//                 >
//                   <Plus className="h-4 w-4 mr-1" />
//                   Ajouter un service
//                 </Button>
//               )}
//             </div>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="is_active_add"
//                 checked={formData.isActive}
//                 onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label htmlFor="is_active_add" className="text-sm font-medium text-gray-700">
//                 Compte activé
//               </label>
//             </div>
//             <div className="flex justify-end space-x-3 pt-4">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setIsAddModalOpen(false)}
//                 className="hover:bg-gray-50"
//               >
//                 Annuler
//               </Button>
//               <Button 
//                 type="submit"
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//               >
//                 Ajouter
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//         <DialogContent className="sm:max-w-lg bg-white">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold text-gray-800">Modifier une Infirmière</DialogTitle>
//             <DialogDescription className="text-gray-600">
//               Modifiez les informations de l'infirmière sélectionnée.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleEditNurse} className="space-y-4 mt-4">
//             <div>
//               <Input
//                 placeholder="Prénom"
//                 value={formData.first_name}
//                 onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 placeholder="Nom"
//                 value={formData.last_name}
//                 onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 placeholder="Surnom"
//                 value={formData.nickname}
//                 onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 type="email"
//                 placeholder="Adresse email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Input
//                 type="tel"
//                 placeholder="Numéro de téléphone"
//                 value={formData.phone_number}
//                 onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
//                 required
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <Select
//                 value={formData.city_id}
//                 onValueChange={(value) => setFormData({ ...formData, city_id: value, zone_id: '' })}
//                 required
//               >
//                 <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                   <SelectValue placeholder="Sélectionnez une ville" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {cities.map((city) => (
//                     <SelectItem key={city.id} value={city.id.toString()}>
//                       {city.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Select
//                 value={formData.zone_id}
//                 onValueChange={(value) => setFormData({ ...formData, zone_id: value })}
//                 required
//                 disabled={!formData.city_id}
//               >
//                 <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                   <SelectValue placeholder="Sélectionnez une zone" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredZones.map((zone) => (
//                     <SelectItem key={zone.id} value={zone.id.toString()}>
//                       {zone.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Input
//                 type="password"
//                 placeholder="Nouveau mot de passe (facultatif)"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Services (max 3)</label>
//               {formData.selectedServices.map((service, index) => (
//                 <div key={index} className="flex space-x-2 mt-2">
//                   <Select
//                     value={service.id}
//                     onValueChange={(value) => handleServiceChange(index, 'id', value)}
//                     required
//                   >
//                     <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
//                       <SelectValue placeholder="Sélectionnez un service" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {services.map((s) => (
//                         <SelectItem key={s.id} value={s.id.toString()}>
//                           {s.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <Input
//                     type="number"
//                     placeholder="Prix (€)"
//                     value={service.price}
//                     onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
//                     required
//                     className="focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formData.selectedServices.length > 1 && (
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       onClick={() => removeServiceField(index)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               ))}
//               {formData.selectedServices.length < 3 && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={addServiceField}
//                   className="mt-2"
//                 >
//                   <Plus className="h-4 w-4 mr-1" />
//                   Ajouter un service
//                 </Button>
//               )}
//             </div>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 id="is_active_edit"
//                 checked={formData.isActive}
//                 onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//               />
//               <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
//                 Compte activé
//               </label>
//             </div>
//             <div className="flex justify-end space-x-3 pt-4">
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={() => setIsEditModalOpen(false)}
//                 className="hover:bg-gray-50"
//               >
//                 Annuler
//               </Button>
//               <Button 
//                 type="submit"
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//               >
//                 Mettre à jour
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default NurseManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, Lock, Unlock, AlertCircle, ArrowLeft, Plus, Users, UserCheck, UserX, MapPin, Phone } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface Service {
  id: number;
  name: string;
  price: string;
}

interface City {
  id: number;
  name: string;
}

interface Zone {
  id: number;
  name: string;
  city_id: number;
}

interface Nurse {
  nurseId: number;
  first_name: string;
  last_name: string;
  email: string;
  city_name?: string;
  phone_number?: string;
  zone_name?: string;
  nickname?: string;
  services?: Service[];
  status: 'activated' | 'disabled';
  user_id: number;
}

const NurseManagement: React.FC = () => {
  const navigate = useNavigate();
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [filteredNurses, setFilteredNurses] = useState<Nurse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city_name: '',
    phone_number: '',
    zone_name: '',
    nickname: '',
    password: '',
    selectedServices: [{ name: '', price: '' }],
    isActive: true,
  });

  // Calcul des statistiques
  const totalNurses = nurses.length;
  const activatedNurses = nurses.filter(nurse => nurse.status === 'activated').length;
  const disabledNurses = nurses.filter(nurse => nurse.status === 'disabled').length;
  const uniqueCities = [...new Set(nurses.map(nurse => nurse.city_name).filter(Boolean))].length;

  // Fetch nurses, services, cities, and zones from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch nurses
        const nursesResponse = await axiosInstance.get('GetAllNurses');
        const mappedNurses = nursesResponse.data.data.map((nurse: any) => ({
          nurseId: nurse.id || nurse.nurseId,
          user_id: nurse.user_id,
          first_name: nurse.first_name,
          last_name: nurse.last_name,
          email: nurse.email,
          city_name: nurse.city_name,
          phone_number: nurse.phone_number,
          zone_name: nurse.zone_name,
          nickname: nurse.nickname,
          services: Array.isArray(nurse.services) ? nurse.services : [],
          status: nurse.status || 'activated',
        }));
        setNurses(mappedNurses);
        setFilteredNurses(mappedNurses);

        // Fetch services
        const servicesResponse = await axiosInstance.get('auth/GetAllServices');
        setServices(servicesResponse.data.data);

        // Fetch cities
        const citiesResponse = await axiosInstance.get('auth/GetAllCities');
        setCities(citiesResponse.data.data);

        // Fetch zones
        const zonesResponse = await axiosInstance.get('auth/GetAllZones');
        setZones(zonesResponse.data.data);
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
      }
    };
    fetchData();
  }, []);

  // Recherche améliorée incluant la ville et numéro de téléphone
  useEffect(() => {
    const filtered = nurses.filter(
      (nurse) =>
        `${nurse.first_name} ${nurse.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nurse.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (nurse.city_name && nurse.city_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (nurse.phone_number && nurse.phone_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredNurses(filtered);
  }, [searchQuery, nurses]);

  // Activer/Désactiver une infirmière
  const toggleNurseStatus = async (nurseId: number, status: 'activated' | 'disabled') => {
    try {
      const newStatus = status === 'activated' ? 'disabled' : 'activated';
      const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
      document.cookie = `nurseId=${nurseId}; path=/; expires=${expires}; SameSite=Strict; Secure`;
      document.cookie = `status=${status}; path=/; expires=${expires}; SameSite=Strict; Secure`;

      const response = await axiosInstance.put('toggleNurseStatus', {}, {
        withCredentials: true,
      });

      const updatedNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
      setNurses((prev) =>
        prev.map((n) => (n.nurseId === nurseId ? updatedNurse : n))
      );
      setFilteredNurses((prev) =>
        prev.map((n) => (n.nurseId === nurseId ? updatedNurse : n))
      );

      document.cookie = `nurseId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `status=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

      toast({
        title: 'Succès',
        description: `Infirmière ${newStatus === 'activated' ? 'activée' : 'désactivée'} avec succès.`,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour du statut.',
        variant: 'destructive',
      });
      console.error('Toggle status error:', axiosError);
    }
  };

  // Supprimer une infirmière
  const deleteNurse = async (nurseId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette infirmière ?')) return;
    try {
      await axiosInstance.delete(`nurses/${nurseId}`);
      setNurses((prev) => prev.filter((n) => n.nurseId !== nurseId));
      setFilteredNurses((prev) => prev.filter((n) => n.nurseId !== nurseId));
      toast({
        title: 'Succès',
        description: 'Infirmière supprimée avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la suppression de l\'infirmière.',
        variant: 'destructive',
      });
    }
  };

  // Gérer les services dynamiques
  const handleServiceChange = (index: number, field: 'name' | 'price', value: string) => {
    const newServices = [...formData.selectedServices];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, selectedServices: newServices });
  };

  const addServiceField = () => {
    if (formData.selectedServices.length < 3) {
      setFormData({ ...formData, selectedServices: [...formData.selectedServices, { name: '', price: '' }] });
    } else {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez pas ajouter plus de 3 services.',
        variant: 'destructive',
      });
    }
  };

  const removeServiceField = (index: number) => {
    if (formData.selectedServices.length > 1) {
      const newServices = formData.selectedServices.filter((_, i) => i !== index);
      setFormData({ ...formData, selectedServices: newServices });
    } else {
      toast({
        title: 'Erreur',
        description: 'Vous devez avoir au moins un service.',
        variant: 'destructive',
      });
    }
  };

  // Ajouter une infirmière
  const handleAddNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        city_name: formData.city_name,
        phone_number: formData.phone_number,
        zone_name: formData.zone_name,
        nickname: formData.nickname,
        password: formData.password,
        services: formData.selectedServices.map(service => ({
          name: service.name,
          price: parseFloat(service.price),
        })),
      };
      if (formData.isActive) {
        payload.status = 'activated';
      }
      const response = await axiosInstance.post('auth/CreateNurse', payload);
      const newNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
      setNurses((prev) => [...prev, newNurse]);
      setFilteredNurses((prev) => [...prev, newNurse]);
      setIsAddModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        city_name: '',
        phone_number: '',
        zone_name: '',
        nickname: '',
        password: '',
        selectedServices: [{ name: '', price: '' }],
        isActive: true,
      });
      toast({
        title: 'Succès',
        description: 'Infirmière ajoutée avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'ajout de l\'infirmière.';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Modifier une infirmière
  const handleEditNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurse) return;
    try {
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        city_name: formData.city_name,
        phone_number: formData.phone_number,
        zone_name: formData.zone_name,
        nickname: formData.nickname,
        password: formData.password || undefined,
        services: formData.selectedServices.map(service => ({
          name: service.name,
          price: parseFloat(service.price),
        })),
      };
      if (formData.isActive) {
        payload.status = 'activated';
      }
      const response = await axiosInstance.put(`nurses/${selectedNurse.nurseId}`, payload);
      const updatedNurse = { ...response.data.data, nurseId: response.data.data.id || response.data.data.nurseId };
      setNurses((prev) =>
        prev.map((n) => (n.nurseId === selectedNurse.nurseId ? updatedNurse : n))
      );
      setFilteredNurses((prev) =>
        prev.map((n) => (n.nurseId === selectedNurse.nurseId ? updatedNurse : n))
      );
      setIsEditModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        city_name: '',
        phone_number: '',
        zone_name: '',
        nickname: '',
        password: '',
        selectedServices: [{ name: '', price: '' }],
        isActive: true,
      });
      toast({
        title: 'Succès',
        description: 'Infirmière mise à jour avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string, errors?: any }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour de l\'infirmière.',
        variant: 'destructive',
      });
    }
  };

  // Ouvrir la modale de modification
  const openEditModal = (nurse: Nurse) => {
    setSelectedNurse(nurse);
    setFormData({
      first_name: nurse.first_name,
      last_name: nurse.last_name,
      email: nurse.email,
      city_name: nurse.city_name || '',
      phone_number: nurse.phone_number || '',
      zone_name: nurse.zone_name || '',
      nickname: nurse.nickname || '',
      password: '',
      selectedServices: Array.isArray(nurse.services) ? nurse.services.map(s => ({ name: s.name, price: s.price.toString() })) : [{ name: '', price: '' }],
      isActive: nurse.status === 'activated',
    });
    setIsEditModalOpen(true);
  };

  // Filtrer les zones par ville sélectionnée
  const filteredZones = zones.filter(zone => zone.city_id === parseInt(cities.find(city => city.name === formData.city_name)?.id.toString() || '0'));

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
                Gestion des Infirmières
              </h1>
              <p className="text-gray-600 mt-1">Administrez votre équipe médicale</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un praticien</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Infirmières</p>
              <p className="text-2xl font-bold text-blue-600">{loading ? '...' : totalNurses}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Infirmières Activées</p>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : activatedNurses}</p>
            </div>
            <UserCheck className="h-10 w-10 text-green-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Infirmières Désactivées</p>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : disabledNurses}</p>
            </div>
            <UserX className="h-10 w-10 text-red-500 opacity-20" />
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Villes Couvertes</p>
              <p className="text-2xl font-bold text-purple-600">{loading ? '...' : uniqueCities}</p>
            </div>
            <MapPin className="h-10 w-10 text-purple-500 opacity-20" />
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
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
              placeholder="Rechercher par nom, email, ville ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Liste des Infirmières ({filteredNurses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Chargement des infirmières...</p>
            </div>
          ) : filteredNurses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucune infirmière trouvée.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nom</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Téléphone</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Services</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ville</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Zone</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statut</TableHead>
                    <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNurses.map((nurse, index) => (
                    <TableRow 
                      key={nurse.nurseId} 
                      className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                      }`}
                    >
                      <TableCell
                        className="px-6 py-4 cursor-pointer hover:text-blue-600 font-medium transition-colors"
                        onClick={() => openEditModal(nurse)}
                      >
                        {nurse.first_name} {nurse.last_name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{nurse.email}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{nurse.phone_number || 'Non renseigné'}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">
                        {Array.isArray(nurse.services) && nurse.services.length 
                          ? nurse.services.map(s => `${s.name} (${s.price}€)`).join(', ') 
                          : 'Non renseigné'}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {nurse.city_name ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <MapPin className="h-3 w-3 mr-1" />
                            {nurse.city_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">Non renseigné</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-gray-600">{nurse.zone_name || 'Non renseigné'}</TableCell>
                      <TableCell className="px-6 py-4">
                        {nurse.status === 'activated' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                            Activé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></div>
                            Désactivé
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleNurseStatus(nurse.nurseId, nurse.status)}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {nurse.status === 'activated' ? (
                              <Lock className="h-4 w-4 mr-1 text-red-500" />
                            ) : (
                              <Unlock className="h-4 w-4 mr-1 text-green-500" />
                            )}
                            {nurse.status === 'activated' ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteNurse(nurse.nurseId)}
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
            <DialogTitle className="text-xl font-semibold text-gray-800">Ajouter une Infirmière</DialogTitle>
            <DialogDescription className="text-gray-600">
              Remplissez les informations pour créer une nouvelle infirmière.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNurse} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Surnom"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Select
                value={formData.city_name}
                onValueChange={(value) => setFormData({ ...formData, city_name: value, zone_name: '' })}
                required
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={formData.zone_name}
                onValueChange={(value) => setFormData({ ...formData, zone_name: value })}
                required
                disabled={!formData.city_name}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez une zone" />
                </SelectTrigger>
                <SelectContent>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Services (max 3)</label>
              {formData.selectedServices.map((service, index) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <Select
                    value={service.name}
                    onValueChange={(value) => handleServiceChange(index, 'name', value)}
                    required
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Prix (€)"
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.selectedServices.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeServiceField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {formData.selectedServices.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un service
                </Button>
              )}
            </div>
            {/* <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active_add"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active_add" className="text-sm font-medium text-gray-700">
                Compte activé
              </label>
            </div> */}
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
            <DialogTitle className="text-xl font-semibold text-gray-800">Modifier une Infirmière</DialogTitle>
            <DialogDescription className="text-gray-600">
              Modifiez les informations de l'infirmière sélectionnée.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditNurse} className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Prénom"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Nom"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                placeholder="Surnom"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Select
                value={formData.city_name}
                onValueChange={(value) => setFormData({ ...formData, city_name: value, zone_name: '' })}
                required
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={formData.zone_name}
                onValueChange={(value) => setFormData({ ...formData, zone_name: value })}
                required
                disabled={!formData.city_name}
              >
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez une zone" />
                </SelectTrigger>
                <SelectContent>
                  {filteredZones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.name}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="password"
                placeholder="Nouveau mot de passe (facultatif)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Services (max 3)</label>
              {formData.selectedServices.map((service, index) => (
                <div key={index} className="flex space-x-2 mt-2">
                  <Select
                    value={service.name}
                    onValueChange={(value) => handleServiceChange(index, 'name', value)}
                    required
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Sélectionnez un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Prix (€)"
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.selectedServices.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeServiceField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {formData.selectedServices.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addServiceField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un service
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active_edit" className="text-sm font-medium text-gray-700">
                Compte activé
              </label>
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

export default NurseManagement;
