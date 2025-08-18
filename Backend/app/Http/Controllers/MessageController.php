<?php

namespace App\Http\Controllers;

use App\Helpers\JWTHelper;
use App\Models\Message;
use App\Models\Patient;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;


class MessageController extends Controller
{
    public function sendMessage(Request $request)
    {
        try {
            // Valider les données de la requête
            $validator = Validator::make($request->all(), [
                'id_destinataire' => 'required|exists:users,id',
                'contenu' => 'required|string|min:1|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Récupérer l'ID de l'expéditeur (infirmier) via JWTHelper
            $Expediteur = JWTHelper::getUserId($request);

            // Vérifier si l'expéditeur existe dans la table users
            if (!$Expediteur || !DB::table('users')->where('id', $Expediteur)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expéditeur non valide ou non authentifié'
                ], 401);
            }

            // Créer un nouveau message
            $message = Message::create([
                'id_expediteur' => $Expediteur,
                'id_destinataire' => $request->id_destinataire,
                'contenu' => $request->contenu,
                'statut' => 'non_lu',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message envoyé avec succès',
                'data' => $message
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi du message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getReceivedMessages(Request $request)
    {
        try {
            // Récupérer l'ID du destinataire via JWTHelper
            $destinataire = JWTHelper::getUserId($request) ?? $request->input('id_destinataire');

            // Vérifier si le destinataire existe dans la table users
            if (!$destinataire || !DB::table('users')->where('id', $destinataire)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destinataire non valide ou non authentifié'
                ], 401);
            }

            // Récupérer les messages reçus, groupés par expéditeur
            $messages = Message::select(
                'users.id as expediteur_id',
                DB::raw("CONCAT(users.first_name, ' ', users.last_name) as expediteur_nom_complet"),
                'messages.contenu',
                'messages.statut',
                'messages.created_at'
            )
                ->join('users', 'messages.id_expediteur', '=', 'users.id')
                ->where('messages.id_destinataire', $destinataire)
                ->orderBy('messages.created_at', 'desc')
                ->get()
                ->groupBy('expediteur_id');

            // Formatter la réponse pour regrouper les messages par expéditeur
            $formattedMessages = $messages->map(function ($messageGroup, $expediteurId) {
                return [
                    'expediteur_id' => $expediteurId,
                    'expediteur_nom_complet' => $messageGroup->first()->expediteur_nom_complet,
                    'messages' => $messageGroup->map(function ($message) {
                        return [
                            'contenu' => $message->contenu,
                            'statut' => $message->statut,
                            'created_at' => $message->created_at
                        ];
                    })->toArray()
                ];
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Messages reçus récupérés avec succès',
                'data' => $formattedMessages
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getFullConversation(Request $request)
    {
        try {
            // Récupérer l'ID de l'utilisateur via JWTHelper
            $userId = JWTHelper::getUserId($request);

            // Vérifier si l'utilisateur existe dans la table users
            if (!$userId || !DB::table('users')->where('id', $userId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non valide ou non authentifié'
                ], 401);
            }

            // Récupérer les messages envoyés et reçus
            $messages = Message::select(
                'messages.id',
                DB::raw("CASE 
                    WHEN messages.id_expediteur = $userId THEN messages.id_destinataire 
                    ELSE messages.id_expediteur 
                END as interlocuteur_id"),
                DB::raw("CONCAT(users.first_name, ' ', users.last_name) as interlocuteur_nom_complet"),
                'messages.contenu',
                'messages.statut',
                'messages.created_at',
                'messages.id_expediteur'
            )
                ->join('users', function ($join) use ($userId) {
                    $join->on('users.id', '=', DB::raw("CASE 
                        WHEN messages.id_expediteur = $userId THEN messages.id_destinataire 
                        ELSE messages.id_expediteur 
                    END"));
                })
                ->where(function ($query) use ($userId) {
                    $query->where('messages.id_expediteur', $userId)
                        ->orWhere('messages.id_destinataire', $userId);
                })
                ->orderBy('messages.created_at', 'asc') // Changement de 'desc' à 'asc'
                ->get()
                ->groupBy('interlocuteur_id');

            // Formatter la réponse pour regrouper les messages par interlocuteur
            $formattedConversations = $messages->map(function ($messageGroup, $interlocuteurId) {
                return [
                    'interlocuteur_id' => $interlocuteurId,
                    'interlocuteur_nom_complet' => $messageGroup->first()->interlocuteur_nom_complet,
                    'messages' => $messageGroup->map(function ($message) {
                        return [
                            'id' => $message->id,
                            'contenu' => $message->contenu,
                            'statut' => $message->statut,
                            'created_at' => $message->created_at->toDateTimeString(),
                            'sent_by_user' => $message->id_expediteur == $message->interlocuteur_id ? false : true
                        ];
                    })->toArray()
                ];
            })->values();

            return response()->json([
                'success' => true,
                'message' => 'Conversations récupérées avec succès',
                'data' => $formattedConversations
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des conversations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function markAsRead(Request $request)
    {
        try {
            // Valider les données de la requête
            $validator = Validator::make($request->all(), [
                'id_expediteur' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Récupérer l'ID de l'utilisateur connecté (destinataire) via JWTHelper
            $destinataireId = JWTHelper::getUserId($request);

            // Vérifier si le destinataire existe dans la table users
            if (!$destinataireId || !DB::table('users')->where('id', $destinataireId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destinataire non valide ou non authentifié'
                ], 401);
            }

            // Mettre à jour le statut des messages non lus de l'expéditeur vers le destinataire
            $updated = Message::where('id_expediteur', $request->id_expediteur)
                ->where('id_destinataire', $destinataireId)
                ->where('statut', 'non_lu')
                ->update(['statut' => 'lu']);

            return response()->json([
                'success' => true,
                'message' => $updated > 0 ? 'Messages marqués comme lus' : 'Aucun message à marquer comme lu',
                'data' => ['updated_count' => $updated]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du marquage des messages comme lus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUnreadConversationsCount(Request $request)
    {
        try {
            $nurseId = JWTHelper::getUserId($request);
            // Récupère l'ID de l'infirmier connecté

            // Compter le nombre de discussions avec au moins un message non lu
            $unreadConversationsCount = Message::where('id_destinataire', $nurseId)
                ->where('statut', 'non_lu')
                ->distinct('id_expediteur')
                ->count('id_expediteur');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'unread_conversations_count' => $unreadConversationsCount,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération du nombre de discussions non lues.',
            ], 500);
        }
    }



}
