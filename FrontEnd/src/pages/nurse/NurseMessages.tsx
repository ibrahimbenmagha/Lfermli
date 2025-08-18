// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';
// import axiosInstance from '../../axiosConfig';
// import { toast } from '@/hooks/use-toast';
// import { AxiosError } from 'axios';

// interface Interlocuteur {
//   interlocuteur_id: number;
//   interlocuteur_nom_complet: string;
// }

// interface Message {
//   id: number;
//   contenu: string;
//   created_at: string;
//   statut: 'lu' | 'non_lu';
//   sent_by_user: boolean;
// }

// interface ConversationGroup {
//   interlocuteur_id: number;
//   interlocuteur_nom_complet: string;
//   messages: Message[];
// }

// const NurseMessages: React.FC = () => {
//   const navigate = useNavigate();
//   const [interlocuteurs, setInterlocuteurs] = useState<Interlocuteur[]>([]);
//   const [conversations, setConversations] = useState<ConversationGroup[]>([]);
//   const [selectedInterlocuteur, setSelectedInterlocuteur] = useState<Interlocuteur | null>(null);
//   const [newMessage, setNewMessage] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axiosInstance.get('getFullConversation');
//         setConversations(response.data.data);
//         setInterlocuteurs(
//           response.data.data.map((group: ConversationGroup) => ({
//             interlocuteur_id: group.interlocuteur_id,
//             interlocuteur_nom_complet: group.interlocuteur_nom_complet,
//           }))
//         );
//       } catch (error) {
//         const axiosError = error as AxiosError<{ message?: string }>;
//         const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des conversations.';
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
//     fetchConversations();
//   }, []);

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedInterlocuteur || !newMessage.trim()) {
//       toast({
//         title: 'Erreur',
//         description: 'Veuillez sélectionner un interlocuteur et entrer un message.',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       const response = await axiosInstance.post('sendMessage', {
//         id_destinataire: selectedInterlocuteur.interlocuteur_id,
//         contenu: newMessage,
//       });
//       const newMsg = {
//         id: response.data.data.id,
//         contenu: newMessage,
//         created_at: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
//         statut: 'non_lu',
//         sent_by_user: true,
//       };
//       setConversations((prev) =>
//         prev.map((group) =>
//           group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id
//             ? { ...group, messages: [...group.messages, newMsg] }
//             : group
//         )
//       );
//       setNewMessage('');
//       toast({
//         title: 'Succès',
//         description: 'Message envoyé avec succès.',
//       });
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors de l\'envoi du message.',
//         variant: 'destructive',
//       });
//     }
//   };

//   const markMessagesAsRead = async (interlocuteurId: number) => {
//     try {
//       await axiosInstance.post('markAsRead', { id_expediteur: interlocuteurId });
//       setConversations((prev) =>
//         prev.map((group) =>
//           group.interlocuteur_id === interlocuteurId
//             ? {
//                 ...group,
//                 messages: group.messages.map((msg) =>
//                   !msg.sent_by_user ? { ...msg, statut: 'lu' } : msg
//                 ),
//               }
//             : group
//         )
//       );
//     } catch (error) {
//       const axiosError = error as AxiosError<{ message?: string }>;
//       toast({
//         title: 'Erreur',
//         description: axiosError.response?.data?.message || 'Erreur lors du marquage des messages comme lus.',
//         variant: 'destructive',
//       });
//     }
//   };

//   // Fonction pour compter les messages non lus pour un interlocuteur
//   const getUnreadMessagesCount = (interlocuteurId: number) => {
//     const group = conversations.find((group) => group.interlocuteur_id === interlocuteurId);
//     if (!group) return 0;
//     return group.messages.filter((msg) => !msg.sent_by_user && msg.statut === 'non_lu').length;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
//       <header className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="outline"
//               onClick={() => navigate('/nurse/dashboard')}
//               className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span>Retour</span>
//             </Button>
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Messagerie
//               </h1>
//               <p className="text-gray-600 mt-1">Gérez vos messages avec les patients et collègues</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
//           <MessageSquare className="h-5 w-5 mr-2" />
//           <p>{error}</p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//             <CardTitle className="text-xl font-semibold text-gray-800">
//               Conversation {selectedInterlocuteur ? `avec ${selectedInterlocuteur.interlocuteur_nom_complet}` : ''}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <p className="text-gray-500 mt-4">Chargement des conversations...</p>
//               </div>
//             ) : !selectedInterlocuteur ? (
//               <div className="text-center py-12">
//                 <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                 <p className="text-gray-500">Sélectionnez un interlocuteur pour voir la conversation.</p>
//               </div>
//             ) : conversations.find((group) => group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id)?.messages.length === 0 ? (
//               <div className="text-center py-12">
//                 <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                 <p className="text-gray-500">Aucun message avec cet interlocuteur.</p>
//               </div>
//             ) : (
//               <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                 {conversations
//                   .find((group) => group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id)
//                   ?.messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex ${message.sent_by_user ? 'justify-end' : 'justify-start'}`}
//                     >
//                       <div
//                         className={`max-w-[70%] p-3 rounded-lg ${
//                           message.sent_by_user
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-100 text-gray-800'
//                         }`}
//                       >
//                         <p className="text-sm font-medium">
//                           {message.sent_by_user ? 'Vous' : selectedInterlocuteur.interlocuteur_nom_complet}
//                         </p>
//                         <p>{message.contenu}</p>
//                         <p className="text-xs text-gray-400 mt-1">{message.created_at}</p>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             )}
//             {selectedInterlocuteur && (
//               <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
//                 <Input
//                   placeholder="Écrivez votre message..."
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   className="flex-1 bg-white/50 border-gray-200 focus:bg-white transition-colors"
//                 />
//                 <Button
//                   type="submit"
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//                 >
//                   <Send className="h-4 w-4 mr-1" />
//                   Envoyer
//                 </Button>
//               </form>
//             )}
//           </CardContent>
//         </Card>

//         <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
//           <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
//             <CardTitle className="text-xl font-semibold text-gray-800">
//               Interlocuteurs ({interlocuteurs.length})
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-6">
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <p className="text-gray-500 mt-4">Chargement des interlocuteurs...</p>
//               </div>
//             ) : interlocuteurs.length === 0 ? (
//               <div className="text-center py-12">
//                 <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                 <p className="text-gray-500">Aucun interlocuteur trouvé.</p>
//               </div>
//             ) : (
//               <div className="space-y-2 max-h-[60vh] overflow-y-auto">
//                 {interlocuteurs.map((interlocuteur) => {
//                   const unreadCount = getUnreadMessagesCount(interlocuteur.interlocuteur_id);
//                   return (
//                     <div
//                       key={interlocuteur.interlocuteur_id}
//                       onClick={() => {
//                         setSelectedInterlocuteur(interlocuteur);
//                         markMessagesAsRead(interlocuteur.interlocuteur_id);
//                       }}
//                       className={`p-3 rounded-lg cursor-pointer hover:bg-blue-50/50 transition-colors ${
//                         selectedInterlocuteur?.interlocuteur_id === interlocuteur.interlocuteur_id ? 'bg-blue-100' : 'bg-white/50'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-gray-800">{interlocuteur.interlocuteur_nom_complet}</p>
//                         {unreadCount > 0 && (
//                           <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
//                             {unreadCount}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default NurseMessages;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User, MessageSquare } from 'lucide-react';
import axiosInstance from '../../axiosConfig';
import { toast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';

interface Interlocuteur {
  interlocuteur_id: number;
  interlocuteur_nom_complet: string;
}

interface Message {
  id: number;
  contenu: string;
  created_at: string;
  statut: 'lu' | 'non_lu';
  sent_by_user: boolean;
}

interface ConversationGroup {
  interlocuteur_id: number;
  interlocuteur_nom_complet: string;
  messages: Message[];
}

const NurseMessages: React.FC = () => {
  const navigate = useNavigate();
  const [interlocuteurs, setInterlocuteurs] = useState<Interlocuteur[]>([]);
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedInterlocuteur, setSelectedInterlocuteur] = useState<Interlocuteur | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('getFullConversation');
      const data = response.data.data || []; // Gestion si data est undefined
      const sortedConversations = data.sort((a: ConversationGroup, b: ConversationGroup) => {
        const lastMessageA = a.messages?.length ? new Date(a.messages[a.messages.length - 1].created_at) : new Date(0);
        const lastMessageB = b.messages?.length ? new Date(b.messages[b.messages.length - 1].created_at) : new Date(0);
        return lastMessageB.getTime() - lastMessageA.getTime();
      });
      setConversations(sortedConversations);
      setInterlocuteurs(
        sortedConversations.map((group: ConversationGroup) => ({
          interlocuteur_id: group.interlocuteur_id,
          interlocuteur_nom_complet: group.interlocuteur_nom_complet,
        }))
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors du chargement des conversations.';
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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Polling toutes les 10 secondes
    return () => clearInterval(interval); // Nettoyage à la désactivation du composant
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterlocuteur || !newMessage.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un interlocuteur et entrer un message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axiosInstance.post('sendMessage', {
        id_destinataire: selectedInterlocuteur.interlocuteur_id,
        contenu: newMessage,
      });
      const newMsg = {
        id: response.data.data.id,
        contenu: newMessage,
        created_at: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
        statut: 'non_lu',
        sent_by_user: true,
      };
      setConversations((prev) => {
        const updatedConversations = prev.map((group) =>
          group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id
            ? { ...group, messages: [...(group.messages || []), newMsg] }
            : group
        );
        return updatedConversations.sort((a, b) => {
          const lastMessageA = a.messages?.length ? new Date(a.messages[a.messages.length - 1].created_at) : new Date(0);
          const lastMessageB = b.messages?.length ? new Date(b.messages[b.messages.length - 1].created_at) : new Date(0);
          return lastMessageB.getTime() - lastMessageA.getTime();
        });
      });
      setInterlocuteurs((prev) =>
        prev.sort((a, b) => {
          const groupA = conversations.find((g) => g.interlocuteur_id === a.interlocuteur_id);
          const groupB = conversations.find((g) => g.interlocuteur_id === b.interlocuteur_id);
          const lastMessageA = groupA?.messages?.length ? new Date(groupA.messages[groupA.messages.length - 1].created_at) : new Date(0);
          const lastMessageB = groupB?.messages?.length ? new Date(groupB.messages[groupB.messages.length - 1].created_at) : new Date(0);
          return lastMessageB.getTime() - lastMessageA.getTime();
        })
      );
      setNewMessage('');
      toast({
        title: 'Succès',
        description: 'Message envoyé avec succès.',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors de l\'envoi du message.',
        variant: 'destructive',
      });
    }
  };

  const markMessagesAsRead = async (interlocuteurId: number) => {
    try {
      await axiosInstance.post('markAsRead', { id_expediteur: interlocuteurId });
      setConversations((prev) =>
        prev.map((group) =>
          group.interlocuteur_id === interlocuteurId
            ? {
                ...group,
                messages: (group.messages || []).map((msg) =>
                  !msg.sent_by_user ? { ...msg, statut: 'lu' } : msg
                ),
              }
            : group
        )
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast({
        title: 'Erreur',
        description: axiosError.response?.data?.message || 'Erreur lors du marquage des messages comme lus.',
        variant: 'destructive',
      });
    }
  };

  const getUnreadMessagesCount = (interlocuteurId: number) => {
    const group = conversations.find((group) => group.interlocuteur_id === interlocuteurId);
    if (!group || !group.messages) return 0;
    return group.messages.filter((msg) => !msg.sent_by_user && msg.statut === 'non_lu').length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/nurse/dashboard')}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Messagerie
              </h1>
              <p className="text-gray-600 mt-1">Gérez vos messages avec les patients et collègues</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-center shadow-sm">
          <MessageSquare className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Conversation {selectedInterlocuteur ? `avec ${selectedInterlocuteur.interlocuteur_nom_complet}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Chargement des conversations...</p>
              </div>
            ) : !selectedInterlocuteur ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Sélectionnez un interlocuteur pour voir la conversation.</p>
              </div>
            ) : conversations.find((group) => group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id)?.messages?.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun message avec cet interlocuteur.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {conversations
                  .find((group) => group.interlocuteur_id === selectedInterlocuteur.interlocuteur_id)
                  ?.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sent_by_user ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sent_by_user
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {message.sent_by_user ? 'Vous' : selectedInterlocuteur.interlocuteur_nom_complet}
                        </p>
                        <p>{message.contenu}</p>
                        <p className="text-xs text-gray-400 mt-1">{message.created_at}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {selectedInterlocuteur && (
              <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
                <Input
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-white/50 border-gray-200 focus:bg-white transition-colors"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Envoyer
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Interlocuteurs ({interlocuteurs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-4">Chargement des interlocuteurs...</p>
              </div>
            ) : interlocuteurs.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun interlocuteur trouvé.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {interlocuteurs.map((interlocuteur) => {
                  const unreadCount = getUnreadMessagesCount(interlocuteur.interlocuteur_id);
                  return (
                    <div
                      key={interlocuteur.interlocuteur_id}
                      onClick={() => {
                        setSelectedInterlocuteur(interlocuteur);
                        markMessagesAsRead(interlocuteur.interlocuteur_id);
                      }}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-blue-50/50 transition-colors ${
                        selectedInterlocuteur?.interlocuteur_id === interlocuteur.interlocuteur_id ? 'bg-blue-100' : 'bg-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{interlocuteur.interlocuteur_nom_complet}</p>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NurseMessages;