// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { AlertCircle, User, ArrowLeft, LogOut, Trash2, Lock } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../../axiosConfig';
// import { toast } from '@/hooks/use-toast';
// import { AxiosError } from 'axios';

// interface NurseData {
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_number: string;
//   note_over_5?: number;
// }

// const NurseProfile: React.FC = () => {
//   const navigate = useNavigate();
//   const [nurseData, setNurseData] = useState<NurseData>({
//     first_name: '',
//     last_name: '',
//     email: '',
//     phone_number: '',
//     note_over_5: undefined,
//   });
//   const [formData, setFormData] = useState<NurseData>({ ...nurseData });
//   const [passwordData, setPasswordData] = useState({
//     current_password: '',
//     new_password: '',
//     confirm_password: '',
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

//   // Fetch nurse profile data
//   useEffect(() => {
//     const fetchNurseData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axiosInstance.get('GetNurseInfosById');
//         const data = response.data.data;
//         setNurseData(data);
//         setFormData(data);
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         setError('Impossible de charger les informations du profil.');
//         toast({
//           title: 'Erreur',
//           description: axiosError.response?.data?.message || 'Erreur lors du chargement du profil.',
//           variant: 'destructive',
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchNurseData();
//   }, []);

//   // Handle form input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle password input changes
//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPasswordData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Validate profile form data
//   const isFormValid = () => {
//     return (
//       formData.first_name.trim() !== '' &&
//       formData.last_name.trim() !== '' &&
//       formData.email.trim() !== '' &&
//       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
//       formData.phone_number.trim() !== '' &&
//       /^\+?\d{10,15}$/.test(formData.phone_number)
//     );
//   };

//   // Validate password form data
//   const isPasswordFormValid = () => {
//     return (
//       passwordData.current_password.trim() !== '' &&
//       passwordData.new_password.trim() !== '' &&
//       passwordData.new_password.length >= 8 &&
//       passwordData.new_password === passwordData.confirm_password
//     );
//   };

//   // Handle profile form submission
//   const handleSubmit = async () => {
//     if (!isFormValid()) {
//       toast({
//         title: 'Erreur',
//         description: 'Veuillez remplir tous les champs correctement (email valide, numéro de téléphone valide).',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       const response = await axiosInstance.put('auth/updateNurseProfile', {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         phone_number: formData.phone_number,
//       });
//       setNurseData(response.data.data);
//       setIsEditing(false);
//       toast({
//         title: 'Succès',
//         description: 'Profil mis à jour avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour du profil.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Handle password change
//   const handlePasswordSubmit = async () => {
//     if (!isPasswordFormValid()) {
//       toast({
//         title: 'Erreur',
//         description:
//           'Veuillez vérifier que le nouveau mot de passe a au moins 8 caractères et correspond à la confirmation.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       await axiosInstance.post('auth/changeNursePassword', {
//         current_password: passwordData.current_password,
//         new_password: passwordData.new_password,
//       });
//       setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
//       setIsPasswordDialogOpen(false);
//       toast({
//         title: 'Succès',
//         description: 'Mot de passe changé avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors du changement de mot de passe.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       await axiosInstance.post('auth/logout');
//       localStorage.removeItem('token');
//       navigate('/login');
//       toast({
//         title: 'Succès',
//         description: 'Vous êtes déconnecté.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la déconnexion.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Handle account deletion
//   const handleDeleteAccount = async () => {
//     try {
//       await axiosInstance.delete('auth/deleteNurseAccount');
//       localStorage.removeItem('token');
//       navigate('/login');
//       toast({
//         title: 'Succès',
//         description: 'Compte supprimé avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de la suppression du compte.',
//         variant: 'destructive',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-light">
//       <header className="bg-white shadow-sm">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <Button variant="outline" size="sm" onClick={() => navigate('/nurse/dashboard')}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Retour au tableau de bord
//               </Button>

//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">Profil Professionnel</h1>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         {error && (
//           <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 flex items-center">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             <p>{error} Veuillez réessayer ou contacter le support.</p>
//           </div>
//         )}

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <User className="h-5 w-5 mr-2 text-primary" />
//               Profil de l'infirmier(e)
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <p className="text-gray-500 text-center py-4">Chargement du profil...</p>
//             ) : (
//               <div className="space-y-6">
//                 {isEditing ? (
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="first_name">Prénom</Label>
//                       <Input
//                         id="first_name"
//                         name="first_name"
//                         value={formData.first_name}
//                         onChange={handleInputChange}
//                         placeholder="Entrez votre prénom"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="last_name">Nom</Label>
//                       <Input
//                         id="last_name"
//                         name="last_name"
//                         value={formData.last_name}
//                         onChange={handleInputChange}
//                         placeholder="Entrez votre nom"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="email">Email</Label>
//                       <Input
//                         id="email"
//                         name="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         placeholder="Entrez votre email"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="phone_number">Numéro de téléphone</Label>
//                       <Input
//                         id="phone_number"
//                         name="phone_number"
//                         value={formData.phone_number}
//                         onChange={handleInputChange}
//                         placeholder="Entrez votre numéro de téléphone"
//                         required
//                       />
//                     </div>
//                     <div className="flex space-x-4">
//                       <Button
//                         variant="outline"
//                         onClick={() => {
//                           setIsEditing(false);
//                           setFormData(nurseData);
//                         }}
//                       >
//                         Annuler
//                       </Button>
//                       <Button onClick={handleSubmit} disabled={!isFormValid()}>
//                         Enregistrer
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <div>
//                       <p className="text-sm text-gray-600">Prénom</p>
//                       <p className="text-lg font-semibold">{nurseData.first_name}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Nom</p>
//                       <p className="text-lg font-semibold">{nurseData.last_name}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Email</p>
//                       <p className="text-lg font-semibold">{nurseData.email}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-gray-600">Numéro de téléphone</p>
//                       <p className="text-lg font-semibold">{nurseData.phone_number}</p>
//                     </div>
//                     {nurseData.note_over_5 && (
//                       <div>
//                         <p className="text-sm text-gray-600">Note moyenne</p>
//                         <p className="text-lg font-semibold">{nurseData.note_over_5}/5</p>
//                       </div>
//                     )}
//                     <div className="flex space-x-4">
//                       <Button onClick={() => setIsEditing(true)}>
//                         <User className="h-4 w-4 mr-2" />
//                         Modifier le profil
//                       </Button>
//                       <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
//                         <Lock className="h-4 w-4 mr-2" />
//                         Changer le mot de passe
//                       </Button>
//                       <Button variant="outline" onClick={handleLogout}>
//                         <LogOut className="h-4 w-4 mr-2" />
//                         Déconnexion
//                       </Button>
//                       <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Supprimer le compte
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Password Change Dialog */}
//         <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Changer le mot de passe</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="current_password">Mot de passe actuel</Label>
//                 <Input
//                   id="current_password"
//                   name="current_password"
//                   type="password"
//                   value={passwordData.current_password}
//                   onChange={handlePasswordChange}
//                   placeholder="Entrez votre mot de passe actuel"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="new_password">Nouveau mot de passe</Label>
//                 <Input
//                   id="new_password"
//                   name="new_password"
//                   type="password"
//                   value={passwordData.new_password}
//                   onChange={handlePasswordChange}
//                   placeholder="Entrez votre nouveau mot de passe"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe</Label>
//                 <Input
//                   id="confirm_password"
//                   name="confirm_password"
//                   type="password"
//                   value={passwordData.confirm_password}
//                   onChange={handlePasswordChange}
//                   placeholder="Confirmez votre nouveau mot de passe"
//                   required
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
//                 Annuler
//               </Button>
//               <Button onClick={handlePasswordSubmit} disabled={!isPasswordFormValid()}>
//                 Enregistrer
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Delete Account Confirmation Dialog */}
//         <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Supprimer le compte</DialogTitle>
//             </DialogHeader>
//             <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
//                 Annuler
//               </Button>
//               <Button variant="destructive" onClick={handleDeleteAccount}>
//                 Supprimer
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </main>
//     </div>
//   );
// };

// export default NurseProfile;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, User, ArrowLeft, LogOut, Trash2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface NurseData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  note_over_5?: number;
}

const NurseProfile: React.FC = () => {
  const navigate = useNavigate();
  const [nurseData, setNurseData] = useState<NurseData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    note_over_5: undefined,
  });
  const [formData, setFormData] = useState<NurseData>({ ...nurseData });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch nurse profile data
  useEffect(() => {
    const fetchNurseData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('GetNurseInfosById');
        const data = response.data.data;
        setNurseData(data);
        setFormData(data);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError('Impossible de charger les informations du profil.');
        toast({
          title: 'Erreur',
          description: axiosError.response?.data?.message || 'Erreur lors du chargement du profil.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNurseData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate profile form data
  const isFormValid = () => {
    return (
      formData.first_name.trim() !== '' &&
      formData.last_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.phone_number.trim() !== '' &&
      /^\+?\d{10,15}$/.test(formData.phone_number)
    );
  };

  // Validate password form data
  const isPasswordFormValid = () => {
    return (
      passwordData.current_password.trim() !== '' &&
      passwordData.new_password.trim() !== '' &&
      passwordData.new_password.length >= 8 &&
      passwordData.new_password === passwordData.confirm_password
    );
  };

  // Handle profile form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs correctement (email valide, numéro de téléphone valide).',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.put('auth/updateNurseProfile', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
      });
      setNurseData(response.data.data);
      setIsEditing(false);
      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la mise à jour du profil.',
        variant: 'destructive',
      });
    }
  };

  // Handle password change
  const handlePasswordSubmit = async () => {
    if (!isPasswordFormValid()) {
      toast({
        title: 'Erreur',
        description:
          'Veuillez vérifier que le nouveau mot de passe a au moins 8 caractères et correspond à la confirmation.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axiosInstance.post('auth/changeNursePassword', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setIsPasswordDialogOpen(false);
      toast({
        title: 'Succès',
        description: 'Mot de passe changé avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors du changement de mot de passe.',
        variant: 'destructive',
      });
    }
  };

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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await axiosInstance.delete('auth/deleteNurseAccount');
      
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
        title: 'Succès',
        description: 'Compte supprimé avec succès.',
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de la suppression du compte.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/nurse/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Profil Professionnel</h1>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Profil de l'infirmier(e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 text-center py-4">Chargement du profil...</p>
            ) : (
              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Entrez votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Entrez votre nom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Entrez votre email"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone_number">Numéro de téléphone</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="Entrez votre numéro de téléphone"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(nurseData);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleSubmit} disabled={!isFormValid()}>
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Prénom</p>
                      <p className="text-lg font-semibold">{nurseData.first_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="text-lg font-semibold">{nurseData.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold">{nurseData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Numéro de téléphone</p>
                      <p className="text-lg font-semibold">{nurseData.phone_number}</p>
                    </div>
                    {nurseData.note_over_5 && (
                      <div>
                        <p className="text-sm text-gray-600">Note moyenne</p>
                        <p className="text-lg font-semibold">{nurseData.note_over_5}/5</p>
                      </div>
                    )}
                    <div className="flex space-x-4">
                      <Button onClick={() => setIsEditing(true)}>
                        <User className="h-4 w-4 mr-2" />
                        Modifier le profil
                      </Button>
                      <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                        <Lock className="h-4 w-4 mr-2" />
                        Changer le mot de passe
                      </Button>
                      <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </Button>
                      <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer le compte
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le mot de passe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_password">Mot de passe actuel</Label>
                <Input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre mot de passe actuel"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Entrez votre nouveau mot de passe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Confirmez votre nouveau mot de passe"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handlePasswordSubmit} disabled={!isPasswordFormValid()}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer le compte</DialogTitle>
            </DialogHeader>
            <p>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default NurseProfile;