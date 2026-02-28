<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\MedicalRecord;
use App\Models\Appointment;
use App\Helpers\JwtHelper;

/**
 * MedicalRecordController
 * 
 * Handles medical record operations for nurses to add notes
 * and for patients to view their medical history.
 */
class MedicalRecordController extends Controller
{
    // Appointment status required for adding medical record
    private const STATUS_COMPLETED = 'termine';
    private const STATUS_CONFIRMED = 'confirme';

    /**
     * Create or update a medical record for an appointment.
     * Only nurses can create medical records.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with created/updated record
     */
    public function createMedicalRecord(Request $request): JsonResponse
    {
        try {
            $nurseId = JwtHelper::getNurseId($request) ?? $request->input('nurseId');
            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou infirmier non trouvé');
            }

            // Validate request data
            $validator = Validator::make($request->all(), [
                'appointment_id' => 'required|integer|exists:appointments,id',
                'prescriptions' => 'nullable|string|max:2000',
                'resultats_tests' => 'nullable|string|max:2000',
                'notes_infirmier' => 'nullable|string|max:3000',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $appointmentId = $request->input('appointment_id');

            // Verify appointment belongs to this nurse
            $appointment = Appointment::where('id', $appointmentId)
                ->whereHas('serviceNurse', function ($query) use ($nurseId) {
                    $query->where('nurse_id', $nurseId);
                })
                ->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou non associé à cet infirmier');
            }

            // Only allow adding records for confirmed or completed appointments
            if (!in_array($appointment->statut, [self::STATUS_CONFIRMED, self::STATUS_COMPLETED])) {
                return $this->badRequestResponse('Les notes médicales ne peuvent être ajoutées que pour les rendez-vous confirmés ou terminés');
            }

            // Check if record already exists
            $existingRecord = MedicalRecord::where('appointment_id', $appointmentId)->first();

            if ($existingRecord) {
                // Update existing record
                $existingRecord->update([
                    'prescriptions' => $request->input('prescriptions') ?? $existingRecord->prescriptions,
                    'resultats_tests' => $request->input('resultats_tests') ?? $existingRecord->resultats_tests,
                    'notes_infirmier' => $request->input('notes_infirmier') ?? $existingRecord->notes_infirmier,
                ]);

                return $this->successResponse(
                    $this->formatMedicalRecord($existingRecord),
                    'Dossier médical mis à jour avec succès'
                );
            }

            // Create new record
            $medicalRecord = MedicalRecord::create([
                'appointment_id' => $appointmentId,
                'prescriptions' => $request->input('prescriptions'),
                'resultats_tests' => $request->input('resultats_tests'),
                'notes_infirmier' => $request->input('notes_infirmier'),
            ]);

            return $this->successResponse(
                $this->formatMedicalRecord($medicalRecord),
                'Dossier médical créé avec succès',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la création du dossier médical',
                $e->getMessage()
            );
        }
    }

    /**
     * Get medical record by appointment ID.
     *
     * @param int $id The appointment ID
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with medical record
     */
    public function getMedicalRecordByAppointment(int $id, Request $request): JsonResponse
    {
        try {
            $nurseId = JwtHelper::getNurseId($request);
            $patientId = JwtHelper::getPatientId($request);

            // One of them must be authenticated
            if (!$nurseId && !$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            // Verify appointment access
            $appointmentQuery = Appointment::where('id', $id);
            
            if ($nurseId) {
                $appointmentQuery->whereHas('serviceNurse', function ($query) use ($nurseId) {
                    $query->where('nurse_id', $nurseId);
                });
            } elseif ($patientId) {
                $appointmentQuery->where('patient_id', $patientId);
            }

            $appointment = $appointmentQuery->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou accès non autorisé');
            }

            // Get medical record
            $medicalRecord = MedicalRecord::where('appointment_id', $id)
                ->with('appointment')
                ->first();

            if (!$medicalRecord) {
                return $this->notFoundResponse('Aucun dossier médical trouvé pour ce rendez-vous');
            }

            return $this->successResponse(
                $this->formatMedicalRecordWithAppointment($medicalRecord),
                'Dossier médical récupéré avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération du dossier médical',
                $e->getMessage()
            );
        }
    }

    /**
     * Get all medical records for the current patient.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with medical history
     */
    public function getPatientMedicalHistory(Request $request): JsonResponse
    {
        try {
            $patientId = JwtHelper::getPatientId($request) ?? $request->input('patientId');
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            // Get all appointments for this patient
            $appointmentIds = Appointment::where('patient_id', $patientId)
                ->pluck('id');

            // Get all medical records for these appointments
            $medicalRecords = MedicalRecord::whereIn('appointment_id', $appointmentIds)
                ->with(['appointment.serviceNurse.service', 'appointment.serviceNurse.nurse.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($record) => $this->formatMedicalRecordWithDetails($record));

            return $this->successResponse(
                $medicalRecords,
                $medicalRecords->isEmpty() 
                    ? 'Aucun dossier médical trouvé' 
                    : 'Historique médical récupéré avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de l\'historique médical',
                $e->getMessage()
            );
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Format medical record data for response.
     *
     * @param MedicalRecord $record
     * @return array
     */
    private function formatMedicalRecord(MedicalRecord $record): array
    {
        return [
            'id' => $record->id,
            'appointment_id' => $record->appointment_id,
            'prescriptions' => $record->prescriptions,
            'resultats_tests' => $record->resultats_tests,
            'notes_infirmier' => $record->notes_infirmier,
            'created_at' => $record->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $record->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format medical record with appointment info.
     *
     * @param MedicalRecord $record
     * @return array
     */
    private function formatMedicalRecordWithAppointment(MedicalRecord $record): array
    {
        return [
            'id' => $record->id,
            'appointment_id' => $record->appointment_id,
            'appointment_date' => $record->appointment->apointementsDate->format('Y-m-d H:i:s'),
            'prescriptions' => $record->prescriptions,
            'resultats_tests' => $record->resultats_tests,
            'notes_infirmier' => $record->notes_infirmier,
            'created_at' => $record->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $record->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format medical record with full details including nurse info.
     *
     * @param MedicalRecord $record
     * @return array
     */
    private function formatMedicalRecordWithDetails(MedicalRecord $record): array
    {
        return [
            'id' => $record->id,
            'appointment_id' => $record->appointment_id,
            'appointment_date' => $record->appointment->apointementsDate->format('Y-m-d H:i:s'),
            'service_name' => $record->appointment->serviceNurse->service->name ?? null,
            'nurse_name' => trim(
                ($record->appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . 
                ($record->appointment->serviceNurse->nurse->user->last_name ?? '')
            ),
            'prescriptions' => $record->prescriptions,
            'resultats_tests' => $record->resultats_tests,
            'notes_infirmier' => $record->notes_infirmier,
            'created_at' => $record->created_at->format('Y-m-d H:i:s'),
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
