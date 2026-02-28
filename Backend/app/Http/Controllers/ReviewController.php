<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Review;
use App\Models\Appointment;
use App\Models\Nurse;
use App\Helpers\JwtHelper;

/**
 * ReviewController
 * 
 * Handles review/rating operations for nurses after completed appointments.
 */
class ReviewController extends Controller
{
    // Rating constraints
    private const MIN_RATING = 1;
    private const MAX_RATING = 5;

    // Appointment status required for review
    private const STATUS_COMPLETED = 'termine';

    /**
     * Create a review for a completed appointment.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with created review
     */
    public function createReview(Request $request): JsonResponse
    {
        try {
            $patientId = JwtHelper::getPatientId($request) ?? $request->input('patientId');
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            // Validate request data
            $validator = Validator::make($request->all(), [
                'appointment_id' => 'required|integer|exists:appointments,id',
                'rating' => 'required|integer|min:' . self::MIN_RATING . '|max:' . self::MAX_RATING,
                'comment' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $appointmentId = $request->input('appointment_id');

            // Verify appointment belongs to patient and is completed
            $appointment = Appointment::where('id', $appointmentId)
                ->where('patient_id', $patientId)
                ->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou non associé à ce patient');
            }

            if ($appointment->statut !== self::STATUS_COMPLETED) {
                return $this->badRequestResponse('Vous ne pouvez noter que les rendez-vous terminés');
            }

            // Check if review already exists for this appointment
            $existingReview = Review::where('appointment_id', $appointmentId)->first();
            if ($existingReview) {
                return $this->badRequestResponse('Vous avez déjà laissé un avis pour ce rendez-vous');
            }

            // Get nurse ID from the appointment
            $nurseId = DB::table('nurse_service')
                ->where('id', $appointment->service_nurse_id)
                ->value('nurse_id');

            if (!$nurseId) {
                return $this->notFoundResponse('Infirmier non trouvé pour ce rendez-vous');
            }

            // Create the review
            $review = Review::create([
                'patient_id' => $patientId,
                'nurse_id' => $nurseId,
                'appointment_id' => $appointmentId,
                'rating' => $request->input('rating'),
                'comment' => $request->input('comment'),
            ]);

            // Update nurse average rating
            $this->updateNurseAverageRating($nurseId);

            return $this->successResponse(
                $this->formatReview($review),
                'Avis créé avec succès',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la création de l\'avis',
                $e->getMessage()
            );
        }
    }

    /**
     * Get all reviews for a nurse.
     *
     * @param int $nurseId The nurse ID
     * @return JsonResponse JSON response with reviews list
     */
    public function getReviewsByNurse(int $nurseId): JsonResponse
    {
        try {
            // Verify nurse exists
            $nurse = Nurse::find($nurseId);
            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            $reviews = Review::where('nurse_id', $nurseId)
                ->with(['patient.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($review) => $this->formatReviewWithPatient($review));

            return $this->successResponse(
                $reviews,
                $reviews->isEmpty() 
                    ? 'Aucun avis trouvé pour cet infirmier' 
                    : 'Avis récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des avis',
                $e->getMessage()
            );
        }
    }

    /**
     * Get average rating for a nurse.
     *
     * @param int $nurseId The nurse ID
     * @return JsonResponse JSON response with average rating
     */
    public function getNurseAverageRating(int $nurseId): JsonResponse
    {
        try {
            // Verify nurse exists
            $nurse = Nurse::find($nurseId);
            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            $stats = Review::where('nurse_id', $nurseId)
                ->selectRaw('AVG(rating) as average_rating, COUNT(*) as total_reviews')
                ->first();

            return $this->successResponse([
                'nurse_id' => $nurseId,
                'average_rating' => round($stats->average_rating ?? 0, 2),
                'total_reviews' => $stats->total_reviews ?? 0,
                'current_note' => $nurse->note_over_5,
            ], 'Note moyenne récupérée avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de la note moyenne',
                $e->getMessage()
            );
        }
    }

    /**
     * Get reviews created by the current patient.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with patient's reviews
     */
    public function getReviewsByPatient(Request $request): JsonResponse
    {
        try {
            $patientId = JwtHelper::getPatientId($request) ?? $request->input('patientId');
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $reviews = Review::where('patient_id', $patientId)
                ->with(['nurse.user', 'appointment'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($review) => $this->formatReviewWithNurse($review));

            return $this->successResponse(
                $reviews,
                $reviews->isEmpty() 
                    ? 'Aucun avis trouvé' 
                    : 'Avis récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des avis',
                $e->getMessage()
            );
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Update nurse average rating in database.
     *
     * @param int $nurseId
     * @return void
     */
    private function updateNurseAverageRating(int $nurseId): void
    {
        $averageRating = Review::where('nurse_id', $nurseId)->avg('rating');
        
        DB::table('nurses')
            ->where('id', $nurseId)
            ->update([
                'note_over_5' => round($averageRating, 2),
                'updated_at' => now(),
            ]);
    }

    /**
     * Format review data for response.
     *
     * @param Review $review
     * @return array
     */
    private function formatReview(Review $review): array
    {
        return [
            'id' => $review->id,
            'patient_id' => $review->patient_id,
            'nurse_id' => $review->nurse_id,
            'appointment_id' => $review->appointment_id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format review with patient information.
     *
     * @param Review $review
     * @return array
     */
    private function formatReviewWithPatient(Review $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'patient_name' => trim(
                ($review->patient->user->first_name ?? '') . ' ' . 
                ($review->patient->user->last_name ?? '')
            ),
            'created_at' => $review->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format review with nurse information.
     *
     * @param Review $review
     * @return array
     */
    private function formatReviewWithNurse(Review $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'nurse_name' => trim(
                ($review->nurse->user->first_name ?? '') . ' ' . 
                ($review->nurse->user->last_name ?? '')
            ),
            'appointment_date' => $review->appointment->apointementsDate->format('Y-m-d H:i:s'),
            'created_at' => $review->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Return a standardized success response.
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
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 401);
    }

    /**
     * Return a not found response.
     */
    private function notFoundResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 404);
    }

    /**
     * Return a bad request response.
     */
    private function badRequestResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], 400);
    }
}
