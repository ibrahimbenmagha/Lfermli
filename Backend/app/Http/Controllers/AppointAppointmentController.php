<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Appointment;
use App\Helpers\JWTHelper;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * AppointAppointmentController
 * 
 * Handles all appointment-related operations including creation,
 * retrieval, and status updates for both patients and nurses.
 */
class AppointAppointmentController extends Controller
{
    // Constants for appointment statuses
    private const STATUS_PENDING = 'en_attente';
    private const STATUS_CONFIRMED = 'confirme';
    private const STATUS_CANCELLED = 'annule';
    private const STATUS_COMPLETED = 'termine';
    private const STATUS_REFUSED = 'refuse';

    // Constants for emergency levels
    private const EMERGENCY_NORMAL = 'normal';
    private const EMERGENCY_URGENT = 'urgent';
    private const EMERGENCY_SUPER_URGENT = 'super_urgent';

    // Constants for message statuses
    private const MESSAGE_STATUS_UNREAD = 'non_lu';

    /**
     * Create a new appointment with automatic message creation.
     *
     * @param Request $request The HTTP request containing appointment data
     * @return JsonResponse JSON response with created appointment or error
     */
    public function createAppointment(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            // Validate address
            $validator = Validator::make($request->all(), $this->getAppointmentValidationRules());
            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Retrieve appointment data from cookies or request body
            $appointmentData = $this->extractAppointmentData($request);

            // Validate required fields
            $missingFields = $this->validateRequiredFields($appointmentData);
            if (!empty($missingFields)) {
                return $this->badRequestResponse(
                    'Les champs suivants sont manquants : ' . implode(', ', $missingFields)
                );
            }

            // Validate emergency level
            if (!$this->isValidEmergencyLevel($appointmentData['emergencyLevel'])) {
                return $this->badRequestResponse('Niveau d\'urgence invalide');
            }

            // Parse and validate appointment date
            $appointmentDate = $this->parseAppointmentDate($appointmentData['date']);
            if (!$appointmentDate) {
                return $this->badRequestResponse('Format de date invalide');
            }

            // Validate date is in the future
            $now = Carbon::now();
            $appointmentCarbon = Carbon::instance($appointmentDate);
            if ($appointmentCarbon->lt($now)) {
                return $this->badRequestResponse('La date du rendez-vous doit être dans le futur');
            }

            // Validate date is not more than 90 days ahead
            $maxDate = $now->copy()->addDays(90);
            if ($appointmentCarbon->gt($maxDate)) {
                return $this->badRequestResponse('La date du rendez-vous ne peut pas dépasser 90 jours à partir d\'aujourd\'hui');
            }

            // Verify nurse-service association
            $serviceNurse = $this->findServiceNurse($appointmentData['nurseId'], $appointmentData['serviceId']);
            if (!$serviceNurse) {
                return $this->notFoundResponse('Aucune association trouvée entre l\'infirmier et le service');
            }

            // Get patient and nurse information
            $patient = $this->getPatientInfo($patientId);
            if (!$patient) {
                return $this->notFoundResponse('Patient non trouvé');
            }

            $nurse = $this->getNurseInfo($appointmentData['nurseId']);
            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            $service = $this->getServiceInfo($appointmentData['serviceId']);
            if (!$service) {
                return $this->notFoundResponse('Service non trouvé');
            }

            // Create the appointment
            $appointment = Appointment::create([
                'patient_id' => $patientId,
                'service_nurse_id' => $serviceNurse->id,
                'apointementsDate' => $appointmentDate,
                'adress' => $request->input('address'),
                'statut' => self::STATUS_PENDING,
                'emergency_level' => $appointmentData['emergencyLevel'],
            ]);

            // Create automatic notification message
            $this->createAppointmentNotificationMessage($patient, $nurse, $service, $appointmentDate);

            return $this->successResponse(
                $this->formatAppointmentData($appointment),
                'Rendez-vous créé avec succès',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la création du rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get patient's pending and upcoming appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with appointments list
     */
    public function getPatientAppointments(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $appointments = Appointment::where('patient_id', $patientId)
                ->where('statut', '!=', self::STATUS_COMPLETED)
                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(fn($appointment) => $this->formatAppointmentForPatient($appointment));

            return $this->successResponse(
                $appointments,
                $appointments->isEmpty() 
                    ? 'Aucun rendez-vous trouvé pour ce patient' 
                    : 'Rendez-vous récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get patient's non-cancelled and non-completed appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with appointments list
     */
    public function getPatientAppointmentsNotDone(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $appointments = Appointment::where('patient_id', $patientId)
                ->where('statut', '!=', self::STATUS_CANCELLED)
                ->where('statut', '!=', self::STATUS_COMPLETED)
                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(fn($appointment) => $this->formatAppointmentForPatient($appointment));

            return $this->successResponse(
                $appointments,
                $appointments->isEmpty() 
                    ? 'Aucun rendez-vous trouvé pour ce patient' 
                    : 'Rendez-vous récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get patient's completed appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with completed appointments list
     */
    public function getPatientAppointmentsTermine(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $appointments = Appointment::where('patient_id', $patientId)
                ->where('statut', '=', self::STATUS_COMPLETED)
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(fn($appointment) => $this->formatAppointmentForPatient($appointment));

            return $this->successResponse(
                $appointments,
                $appointments->isEmpty() 
                    ? 'Aucun rendez-vous trouvé pour ce patient' 
                    : 'Rendez-vous récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse's upcoming appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with appointments list
     */
    public function getNurseAppointments(Request $request): JsonResponse
    {
        try {
            $nurseId = $this->getNurseIdFromRequest($request);
            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou infirmier non trouvé');
            }

            $appointments = Appointment::whereHas('serviceNurse', function ($query) use ($nurseId) {
                $query->where('nurse_id', $nurseId);
            })
                ->where('statut', '!=', self::STATUS_CANCELLED)
                ->where('statut', '!=', self::STATUS_COMPLETED)
                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user', 'patient.user'])
                ->get()
                ->map(fn($appointment) => $this->formatAppointmentForNurse($appointment));

            return $this->successResponse(
                $appointments,
                $appointments->isEmpty() 
                    ? 'Aucun rendez-vous trouvé pour cet infirmier' 
                    : 'Rendez-vous récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse's completed appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with completed appointments list
     */
    public function getNurseAppointmentsTermine(Request $request): JsonResponse
    {
        try {
            $nurseId = $this->getNurseIdFromRequest($request);
            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou infirmier non trouvé');
            }

            $appointments = Appointment::whereHas('serviceNurse', function ($query) use ($nurseId) {
                $query->where('nurse_id', $nurseId);
            })
                ->where('statut', '=', self::STATUS_COMPLETED)
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user', 'patient.user'])
                ->get()
                ->map(fn($appointment) => $this->formatAppointmentForNurse($appointment));

            return $this->successResponse(
                $appointments,
                $appointments->isEmpty() 
                    ? 'Aucun rendez-vous trouvé pour cet infirmier' 
                    : 'Rendez-vous récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Update appointment status to confirmed.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function updateStatusToConfirmed(Request $request): JsonResponse
    {
        return $this->updateAppointmentStatus(
            $request,
            self::STATUS_CONFIRMED,
            self::STATUS_PENDING,
            'Le rendez-vous ne peut pas être confirmé (statut non en_attente)',
            'Rendez-vous confirmé avec succès'
        );
    }

    /**
     * Update appointment status to completed.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function updateStatusToTermine(Request $request): JsonResponse
    {
        return $this->updateAppointmentStatus(
            $request,
            self::STATUS_COMPLETED,
            self::STATUS_CONFIRMED,
            'Le rendez-vous ne peut pas être terminé (statut non confirmé)',
            'Rendez-vous terminé avec succès'
        );
    }

    /**
     * Update appointment status to refused.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function updateStatusToRefuse(Request $request): JsonResponse
    {
        return $this->updateAppointmentStatus(
            $request,
            self::STATUS_REFUSED,
            null,
            null,
            'Rendez-vous refusé avec succès'
        );
    }

    /**
     * Update appointment status to cancelled.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function updateStatusToAnnule(Request $request): JsonResponse
    {
        return $this->updateAppointmentStatus(
            $request,
            self::STATUS_CANCELLED,
            null,
            null,
            'Rendez-vous annulé avec succès'
        );
    }

    /**
     * Cancel appointment by patient (only if pending).
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function cancelAppointmentByPatient(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $appointmentId = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointmentId) {
                return $this->badRequestResponse('ID du rendez-vous non fourni');
            }

            $appointment = Appointment::where('id', $appointmentId)
                ->where('patient_id', $patientId)
                ->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou non associé à ce patient');
            }

            // Only allow cancellation if pending or confirmed
            if (!in_array($appointment->statut, [self::STATUS_PENDING, self::STATUS_CONFIRMED])) {
                return $this->badRequestResponse('Seuls les rendez-vous en attente ou confirmés peuvent être annulés');
            }

            // Update status to cancelled
            $appointment->statut = self::STATUS_CANCELLED;
            $appointment->save();

            return $this->successResponse(
                $this->formatAppointmentForPatient($appointment),
                'Rendez-vous annulé avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de l\'annulation du rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Update appointment by patient (only if pending - before nurse confirmation).
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated appointment
     */
    public function updateAppointmentByPatient(Request $request): JsonResponse
    {
        try {
            $patientId = $this->getPatientIdFromRequest($request);
            if (!$patientId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou patient non trouvé');
            }

            $appointmentId = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointmentId) {
                return $this->badRequestResponse('ID du rendez-vous non fourni');
            }

            $appointment = Appointment::where('id', $appointmentId)
                ->where('patient_id', $patientId)
                ->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou non associé à ce patient');
            }

            // Only allow modification if pending (before nurse confirmation)
            if ($appointment->statut !== self::STATUS_PENDING) {
                return $this->badRequestResponse('Seuls les rendez-vous en attente peuvent être modifiés');
            }

            // Validate new data if provided
            $newDate = $request->input('date');
            $newAddress = $request->input('address');
            $newEmergencyLevel = $request->input('emergencyLevel');

            // Update date if provided
            if ($newDate) {
                $parsedDate = $this->parseAppointmentDate($newDate);
                if (!$parsedDate) {
                    return $this->badRequestResponse('Format de date invalide');
                }

                // Validate date is in the future
                $now = Carbon::now();
                $appointmentCarbon = Carbon::instance($parsedDate);
                if ($appointmentCarbon->lt($now)) {
                    return $this->badRequestResponse('La date du rendez-vous doit être dans le futur');
                }

                // Validate date is not more than 90 days ahead
                $maxDate = $now->copy()->addDays(90);
                if ($appointmentCarbon->gt($maxDate)) {
                    return $this->badRequestResponse('La date du rendez-vous ne peut pas dépasser 90 jours');
                }

                $appointment->apointementsDate = $parsedDate;
            }

            // Update address if provided
            if ($newAddress) {
                if (strlen($newAddress) < 10) {
                    return $this->badRequestResponse('L\'adresse doit contenir au moins 10 caractères');
                }
                $appointment->adress = $newAddress;
            }

            // Update emergency level if provided
            if ($newEmergencyLevel) {
                if (!$this->isValidEmergencyLevel($newEmergencyLevel)) {
                    return $this->badRequestResponse('Niveau d\'urgence invalide');
                }
                $appointment->emergency_level = $newEmergencyLevel;
            }

            $appointment->save();

            return $this->successResponse(
                $this->formatAppointmentForPatient($appointment),
                'Rendez-vous modifié avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la modification du rendez-vous',
                $e->getMessage()
            );
        }
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Generic method to update appointment status.
     *
     * @param Request $request The HTTP request
     * @param string $newStatus The new status to set
     * @param string|null $requiredCurrentStatus Required current status (null to skip check)
     * @param string|null $errorMessage Error message if status check fails
     * @param string $successMessage Success message
     * @return JsonResponse
     */
    private function updateAppointmentStatus(
        Request $request,
        string $newStatus,
        ?string $requiredCurrentStatus,
        ?string $errorMessage,
        string $successMessage
    ): JsonResponse {
        try {
            $nurseId = $this->getNurseIdFromRequest($request);
            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou infirmier non trouvé');
            }

            $appointmentId = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointmentId) {
                return $this->badRequestResponse('ID du rendez-vous non fourni');
            }

            $appointment = Appointment::where('id', $appointmentId)
                ->whereHas('serviceNurse', function ($query) use ($nurseId) {
                    $query->where('nurse_id', $nurseId);
                })
                ->first();

            if (!$appointment) {
                return $this->notFoundResponse('Rendez-vous non trouvé ou non associé à cet infirmier');
            }

            // Check current status if required
            if ($requiredCurrentStatus && $appointment->statut !== $requiredCurrentStatus) {
                return $this->badRequestResponse($errorMessage);
            }

            // Update the appointment status
            $appointment->statut = $newStatus;
            $appointment->save();

            return $this->successResponse(
                $this->formatAppointmentForNurse($appointment),
                $successMessage
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la mise à jour du rendez-vous',
                $e->getMessage()
            );
        }
    }

    /**
     * Get patient ID from JWT token or request.
     *
     * @param Request $request
     * @return int|null
     */
    private function getPatientIdFromRequest(Request $request): ?int
    {
        return JWTHelper::getPatientId($request) ?? $request->input("patientId");
    }

    /**
     * Get nurse ID from JWT token or request.
     *
     * @param Request $request
     * @return int|null
     */
    private function getNurseIdFromRequest(Request $request): ?int
    {
        return JWTHelper::getNurseId($request) ?? $request->input("nurseId");
    }

    /**
     * Get validation rules for appointment creation.
     *
     * @return array
     */
    private function getAppointmentValidationRules(): array
    {
        return [
            'address' => 'required|string|min:10',
        ];
    }

    /**
     * Extract appointment data from request (cookies or body).
     *
     * @param Request $request
     * @return array
     */
    private function extractAppointmentData(Request $request): array
    {
        return [
            'date' => $request->cookie('date') ?? $request->input("date"),
            'emergencyLevel' => $request->cookie('emergencyLevel') ?? $request->input("emergencyLevel"),
            'serviceId' => $request->cookie('serviceId') ?? $request->input("serviceId"),
            'nurseId' => $request->cookie('nurseId') ?? $request->input("nurseId"),
        ];
    }

    /**
     * Validate that all required fields are present.
     *
     * @param array $data
     * @return array Array of missing field names
     */
    private function validateRequiredFields(array $data): array
    {
        $missingFields = [];
        $requiredFields = ['date', 'emergencyLevel', 'serviceId', 'nurseId'];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $missingFields[] = $field;
            }
        }

        return $missingFields;
    }

    /**
     * Check if emergency level is valid.
     *
     * @param string|null $emergencyLevel
     * @return bool
     */
    private function isValidEmergencyLevel(?string $emergencyLevel): bool
    {
        return in_array($emergencyLevel, [
            self::EMERGENCY_NORMAL,
            self::EMERGENCY_URGENT,
            self::EMERGENCY_SUPER_URGENT
        ]);
    }

    /**
     * Parse appointment date string to DateTime object.
     *
     * @param string|null $dateString
     * @return \DateTime|null
     */
    private function parseAppointmentDate(?string $dateString): ?\DateTime
    {
        try {
            return new \DateTime($dateString);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Find service-nurse association.
     *
     * @param int $nurseId
     * @param int $serviceId
     * @return object|null
     */
    private function findServiceNurse(int $nurseId, int $serviceId): ?object
    {
        return DB::table('nurse_service')
            ->where('nurse_id', $nurseId)
            ->where('service_id', $serviceId)
            ->first();
    }

    /**
     * Get patient information with user details.
     *
     * @param int $patientId
     * @return object|null
     */
    private function getPatientInfo(int $patientId): ?object
    {
        return DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('patients.id', $patientId)
            ->select('users.id as user_id', 'users.first_name', 'users.last_name')
            ->first();
    }

    /**
     * Get nurse information with user details.
     *
     * @param int $nurseId
     * @return object|null
     */
    private function getNurseInfo(int $nurseId): ?object
    {
        return DB::table('nurses')
            ->join('users', 'nurses.user_id', '=', 'users.id')
            ->where('nurses.id', $nurseId)
            ->select('users.id as user_id', 'users.first_name', 'users.last_name')
            ->first();
    }

    /**
     * Get service information.
     *
     * @param int $serviceId
     * @return object|null
     */
    private function getServiceInfo(int $serviceId): ?object
    {
        return DB::table('services')
            ->where('id', $serviceId)
            ->select('name')
            ->first();
    }

    /**
     * Create automatic notification message for new appointment.
     *
     * @param object $patient
     * @param object $nurse
     * @param object $service
     * @param \DateTime $appointmentDate
     * @return void
     */
    private function createAppointmentNotificationMessage($patient, $nurse, $service, $appointmentDate): void
    {
        $messageContent = sprintf(
            "Bonjour Mr %s %s, Je suis %s %s, Je fais une demande de consultation à domicile pour le service %s le %s.",
            $nurse->first_name,
            $nurse->last_name,
            $patient->first_name,
            $patient->last_name,
            $service->name,
            $appointmentDate->format('d/m/Y H:i')
        );

        Message::create([
            'id_expediteur' => $patient->user_id,
            'id_destinataire' => $nurse->user_id,
            'contenu' => $messageContent,
            'statut' => self::MESSAGE_STATUS_UNREAD,
            'created_at' => now(),
        ]);
    }

    /**
     * Format appointment data for response.
     *
     * @param Appointment $appointment
     * @return array
     */
    private function formatAppointmentData(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'service_nurse_id' => $appointment->service_nurse_id,
            'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
            'adress' => $appointment->adress,
            'statut' => $appointment->statut,
            'emergency_level' => $appointment->emergency_level,
        ];
    }

    /**
     * Format appointment for patient view.
     *
     * @param Appointment $appointment
     * @return array
     */
    private function formatAppointmentForPatient(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'service_nurse_id' => $appointment->service_nurse_id,
            'service_name' => $appointment->serviceNurse->service->name ?? null,
            'nurse_name' => trim(
                ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . 
                ($appointment->serviceNurse->nurse->user->last_name ?? '')
            ),
            'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
            'adress' => $appointment->adress,
            'statut' => $appointment->statut,
            'emergency_level' => $appointment->emergency_level,
            'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format appointment for nurse view (includes patient info).
     *
     * @param Appointment $appointment
     * @return array
     */
    private function formatAppointmentForNurse(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'patient_name' => trim(
                ($appointment->patient->user->first_name ?? '') . ' ' . 
                ($appointment->patient->user->last_name ?? '')
            ),
            'service_nurse_id' => $appointment->service_nurse_id,
            'service_name' => $appointment->serviceNurse->service->name ?? null,
            'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
            'adress' => $appointment->adress,
            'statut' => $appointment->statut,
            'emergency_level' => $appointment->emergency_level,
            'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
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
            'message' => 'Validation échouée',
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
     * Return a not found response.
     *
     * @param string $message Error message
     * @return JsonResponse
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
