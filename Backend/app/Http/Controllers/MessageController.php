<?php

namespace App\Http\Controllers;

use App\Helpers\JWTHelper;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * MessageController
 * 
 * Handles messaging operations including sending messages,
 * retrieving conversations, and managing read status.
 */
class MessageController extends Controller
{
    // Message status constants
    private const STATUS_UNREAD = 'non_lu';
    private const STATUS_READ = 'lu';

    /**
     * Send a new message.
     *
     * @param Request $request The HTTP request with message data
     * @return JsonResponse JSON response with created message
     */
    public function sendMessage(Request $request): JsonResponse
    {
        try {
            // Validate request data
            $validator = Validator::make($request->all(), [
                'id_destinataire' => 'required|integer|exists:users,id',
                'contenu' => 'required|string|min:1|max:1000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Get sender ID from JWT
            $senderId = $this->getUserIdFromRequest($request);
            if (!$senderId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            // Verify sender exists
            if (!$this->userExists($senderId)) {
                return $this->unauthorizedResponse('Expéditeur non valide');
            }

            // Prevent sending message to self
            if ($senderId == $request->id_destinataire) {
                return $this->badRequestResponse('Vous ne pouvez pas vous envoyer un message à vous-même');
            }

            // Create new message
            $message = Message::create([
                'id_expediteur' => $senderId,
                'id_destinataire' => $request->id_destinataire,
                'contenu' => $request->contenu,
                'statut' => self::STATUS_UNREAD,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $this->successResponse(
                $this->formatMessage($message),
                'Message envoyé avec succès',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de l\'envoi du message',
                $e->getMessage()
            );
        }
    }

    /**
     * Get all received messages grouped by sender.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with received messages
     */
    public function getReceivedMessages(Request $request): JsonResponse
    {
        try {
            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            if (!$this->userExists($userId)) {
                return $this->unauthorizedResponse('Utilisateur non valide');
            }

            // Get received messages grouped by sender
            $messages = $this->fetchReceivedMessages($userId);
            $formattedMessages = $this->formatReceivedMessagesBySender($messages);

            return $this->successResponse(
                $formattedMessages,
                'Messages reçus récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des messages',
                $e->getMessage()
            );
        }
    }

    /**
     * Get full conversations with all users.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with all conversations
     */
    public function getFullConversation(Request $request): JsonResponse
    {
        try {
            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            if (!$this->userExists($userId)) {
                return $this->unauthorizedResponse('Utilisateur non valide');
            }

            // Fetch all conversations for the user
            $conversations = $this->fetchUserConversations($userId);
            $formattedConversations = $this->formatConversations($conversations, $userId);

            return $this->successResponse(
                $formattedConversations,
                'Conversations récupérées avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des conversations',
                $e->getMessage()
            );
        }
    }

    /**
     * Get conversation with a specific user.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with conversation
     */
    public function getConversationWith(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'interlocuteur_id' => 'required|integer|exists:users,id',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            $interlocuteurId = $request->interlocuteur_id;

            // Prevent conversation with self
            if ($userId == $interlocuteurId) {
                return $this->badRequestResponse('Vous ne pouvez pas avoir une conversation avec vous-même');
            }

            // Fetch specific conversation
            $messages = $this->fetchConversationBetweenUsers($userId, $interlocuteurId);
            $formattedMessages = $messages->map(fn($msg) => $this->formatConversationMessage($msg, $userId));

            // Get interlocutor info
            $interlocutor = DB::table('users')
                ->where('id', $interlocuteurId)
                ->select('id', DB::raw("CONCAT(first_name, ' ', last_name) as nom_complet"))
                ->first();

            return $this->successResponse([
                'interlocuteur_id' => $interlocuteurId,
                'interlocuteur_nom_complet' => $interlocutor->nom_complet ?? null,
                'messages' => $formattedMessages,
            ], 'Conversation récupérée avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de la conversation',
                $e->getMessage()
            );
        }
    }

    /**
     * Mark messages from a specific sender as read.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with update result
     */
    public function markAsRead(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'id_expediteur' => 'required|integer|exists:users,id',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            if (!$this->userExists($userId)) {
                return $this->unauthorizedResponse('Utilisateur non valide');
            }

            // Mark messages as read
            $updatedCount = Message::where('id_expediteur', $request->id_expediteur)
                ->where('id_destinataire', $userId)
                ->where('statut', self::STATUS_UNREAD)
                ->update([
                    'statut' => self::STATUS_READ,
                    'updated_at' => now(),
                ]);

            $message = $updatedCount > 0 
                ? 'Messages marqués comme lus' 
                : 'Aucun message à marquer comme lu';

            return $this->successResponse([
                'updated_count' => $updatedCount,
            ], $message);

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors du marquage des messages comme lus',
                $e->getMessage()
            );
        }
    }

    /**
     * Get count of conversations with unread messages.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with count
     */
    public function getUnreadConversationsCount(Request $request): JsonResponse
    {
        try {
            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            // Count conversations with unread messages
            $unreadCount = Message::where('id_destinataire', $userId)
                ->where('statut', self::STATUS_UNREAD)
                ->distinct('id_expediteur')
                ->count('id_expediteur');

            return $this->successResponse([
                'unread_conversations_count' => $unreadCount,
            ], 'Nombre de conversations non lues récupéré');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération du nombre de conversations non lues',
                $e->getMessage()
            );
        }
    }

    /**
     * Get count of unread messages from a specific sender.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with count
     */
    public function getUnreadMessagesCount(Request $request): JsonResponse
    {
        try {
            $userId = $this->getUserIdFromRequest($request);
            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            // Get total unread messages count
            $unreadCount = Message::where('id_destinataire', $userId)
                ->where('statut', self::STATUS_UNREAD)
                ->count();

            return $this->successResponse([
                'unread_messages_count' => $unreadCount,
            ], 'Nombre de messages non lus récupéré');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération du nombre de messages non lus',
                $e->getMessage()
            );
        }
    }

    // =========================================================================
    // Private Helper Methods
    // =========================================================================

    /**
     * Get user ID from JWT token or request.
     *
     * @param Request $request
     * @return int|null
     */
    private function getUserIdFromRequest(Request $request): ?int
    {
        return JWTHelper::getUserId($request) ?? $request->input('user_id');
    }

    /**
     * Check if a user exists.
     *
     * @param int $userId
     * @return bool
     */
    private function userExists(int $userId): bool
    {
        return DB::table('users')->where('id', $userId)->exists();
    }

    /**
     * Fetch received messages for a user.
     *
     * @param int $userId
     * @return \Illuminate\Support\Collection
     */
    private function fetchReceivedMessages(int $userId)
    {
        return Message::select(
            'users.id as expediteur_id',
            DB::raw("CONCAT(users.first_name, ' ', users.last_name) as expediteur_nom_complet"),
            'messages.id',
            'messages.contenu',
            'messages.statut',
            'messages.created_at'
        )
            ->join('users', 'messages.id_expediteur', '=', 'users.id')
            ->where('messages.id_destinataire', $userId)
            ->orderBy('messages.created_at', 'desc')
            ->get()
            ->groupBy('expediteur_id');
    }

    /**
     * Fetch all conversations for a user.
     *
     * @param int $userId
     * @return \Illuminate\Support\Collection
     */
    private function fetchUserConversations(int $userId)
    {
        return Message::select(
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
            ->orderBy('messages.created_at', 'asc')
            ->get()
            ->groupBy('interlocuteur_id');
    }

    /**
     * Fetch conversation between two specific users.
     *
     * @param int $userId
     * @param int $interlocuteurId
     * @return \Illuminate\Support\Collection
     */
    private function fetchConversationBetweenUsers(int $userId, int $interlocuteurId)
    {
        return Message::where(function ($query) use ($userId, $interlocuteurId) {
            $query->where('id_expediteur', $userId)
                ->where('id_destinataire', $interlocuteurId);
        })
            ->orWhere(function ($query) use ($userId, $interlocuteurId) {
                $query->where('id_expediteur', $interlocuteurId)
                    ->where('id_destinataire', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Format received messages grouped by sender.
     *
     * @param \Illuminate\Support\Collection $messages
     * @return array
     */
    private function formatReceivedMessagesBySender($messages): array
    {
        return $messages->map(function ($messageGroup, $senderId) {
            return [
                'expediteur_id' => $senderId,
                'expediteur_nom_complet' => $messageGroup->first()->expediteur_nom_complet,
                'unread_count' => $messageGroup->where('statut', self::STATUS_UNREAD)->count(),
                'last_message' => [
                    'contenu' => $messageGroup->first()->contenu,
                    'statut' => $messageGroup->first()->statut,
                    'created_at' => $messageGroup->first()->created_at->toDateTimeString(),
                ],
                'messages_count' => $messageGroup->count(),
            ];
        })->values()->toArray();
    }

    /**
     * Format conversations grouped by interlocutor.
     *
     * @param \Illuminate\Support\Collection $conversations
     * @param int $userId
     * @return array
     */
    private function formatConversations($conversations, int $userId): array
    {
        return $conversations->map(function ($messageGroup, $interlocuteurId) use ($userId) {
            $unreadCount = $messageGroup->where('statut', self::STATUS_UNREAD)
                ->where('id_destinataire', $userId)
                ->count();

            return [
                'interlocuteur_id' => $interlocuteurId,
                'interlocuteur_nom_complet' => $messageGroup->first()->interlocuteur_nom_complet,
                'unread_count' => $unreadCount,
                'last_message' => [
                    'contenu' => $messageGroup->last()->contenu,
                    'created_at' => $messageGroup->last()->created_at->toDateTimeString(),
                    'sent_by_user' => $messageGroup->last()->id_expediteur == $userId,
                ],
                'messages' => $messageGroup->map(function ($message) use ($userId) {
                    return $this->formatConversationMessage($message, $userId);
                })->toArray(),
            ];
        })->values()->toArray();
    }

    /**
     * Format a single conversation message.
     *
     * @param mixed $message
     * @param int $userId
     * @return array
     */
    private function formatConversationMessage($message, int $userId): array
    {
        return [
            'id' => $message->id,
            'contenu' => $message->contenu,
            'statut' => $message->statut,
            'created_at' => $message->created_at instanceof \Carbon\Carbon 
                ? $message->created_at->toDateTimeString() 
                : $message->created_at,
            'sent_by_user' => $message->id_expediteur == $userId,
        ];
    }

    /**
     * Format a single message.
     *
     * @param Message $message
     * @return array
     */
    private function formatMessage(Message $message): array
    {
        return [
            'id' => $message->id,
            'id_expediteur' => $message->id_expediteur,
            'id_destinataire' => $message->id_destinataire,
            'contenu' => $message->contenu,
            'statut' => $message->statut,
            'created_at' => $message->created_at->toDateTimeString(),
        ];
    }

    /**
     * Return a standardized success response.
     *
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    private function successResponse($data, string $message, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $statusCode);
    }

    /**
     * Return a standardized error response.
     *
     * @param string $message Error message
     * @param string|null $error Detailed error information
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    private function errorResponse(string $message, ?string $error = null, int $statusCode = 500): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($error !== null) {
            $response['error'] = $error;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a validation error response.
     *
     * @param mixed $errors Validation errors
     * @return JsonResponse
     */
    private function validationErrorResponse($errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation',
            'errors' => $errors,
        ], 422);
    }

    /**
     * Return an unauthorized response.
     *
     * @param string $message Error message
     * @return JsonResponse
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }

    /**
     * Return a bad request response.
     *
     * @param string $message Error message
     * @return JsonResponse
     */
    private function badRequestResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 400);
    }
}
