<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Appointment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use Carbon\Carbon;

/**
 * AdminController
 * 
 * Handles all administrative operations including user management,
 * statistics retrieval, and appointment monitoring.
 */
class AdminController extends Controller
{
    // Constants for roles
    private const ROLE_ADMIN = 'admin';
    private const ROLE_NURSE = 'nurse';
    private const ROLE_PATIENT = 'patient';

    // Constants for appointment statuses
    private const STATUS_PENDING = 'en_attente';
    private const STATUS_CONFIRMED = 'confirme';
    private const STATUS_CANCELLED = 'annule';
    private const STATUS_COMPLETED = 'termine';

    // Constants for time periods
    private const RECENT_APPOINTMENTS_DAYS = 7;
    private const TIMEZONE = 'Europe/Paris';

    /**
     * Create a new administrator user.
     *
     * @param Request $request The HTTP request containing admin data
     * @return JsonResponse JSON response with success or error message
     */
    public function createAdmin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), $this->getAdminValidationRules());

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        try {
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'nickname' => $request->nickname,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => self::ROLE_ADMIN,
            ]);

            return $this->successResponse(
                ['admin' => $user],
                'Administrateur créé avec succès',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la création de l\'administrateur',
                $e->getMessage()
            );
        }
    }

    /**
     * Get the total count of nurses in the system.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with nurse count
     */
    public function getNurseCount(Request $request): JsonResponse
    {
        try {
            $totalNurses = User::where('role', self::ROLE_NURSE)->count();

            return $this->successResponse(
                ['total_nurses' => $totalNurses],
                'Nombre d\'infirmières récupéré avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération du nombre d\'infirmières',
                $e->getMessage()
            );
        }
    }

    /**
     * Get comprehensive administrative statistics.
     * 
     * Includes nurse count, patient count, appointment statistics by status,
     * and total revenue from completed appointments.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with admin statistics
     */
    public function getAdminStats(Request $request): JsonResponse
    {
        try {
            $nurseCount = User::where('role', self::ROLE_NURSE)->count();
            $patientCount = User::where('role', self::ROLE_PATIENT)->count();
            $appointmentsByStatus = $this->getAppointmentsByStatus();
            $totalAppointments = Appointment::count();
            $totalRevenue = $this->calculateTotalRevenue();

            return $this->successResponse([
                'nurse_count' => $nurseCount,
                'patient_count' => $patientCount,
                'total_appointments' => $totalAppointments,
                'appointments_by_status' => $appointmentsByStatus,
                'total_revenue' => $totalRevenue,
            ], 'Statistiques globales récupérées avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des statistiques',
                $e->getMessage()
            );
        }
    }

    /**
     * Get recent appointments from the last 7 days.
     * 
     * Returns detailed appointment information including patient, nurse,
     * service, and location details.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with recent appointments
     */
    public function getRecentAppointments(Request $request): JsonResponse
    {
        try {
            $dateRange = $this->getRecentDateRange();
            $appointments = $this->fetchRecentAppointments($dateRange);
            $formattedAppointments = $this->formatAppointments($appointments);

            return $this->successResponse(
                $formattedAppointments,
                'Rendez-vous des 7 derniers jours récupérés avec succès'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des rendez-vous récents',
                $e->getMessage()
            );
        }
    }

    /**
     * Get validation rules for admin creation.
     *
     * @return array Validation rules
     */
    private function getAdminValidationRules(): array
    {
        return [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|max:255',
            'nickname' => 'required|string|unique:users,nickname|max:20',
            'password' => 'required|string|min:6',
        ];
    }

    /**
     * Get appointment counts grouped by status.
     *
     * @return array Appointment counts by status
     */
    private function getAppointmentsByStatus(): array
    {
        return [
            'en_attente' => Appointment::where('statut', self::STATUS_PENDING)->count(),
            'confirme' => Appointment::where('statut', self::STATUS_CONFIRMED)->count(),
            'annule' => Appointment::where('statut', self::STATUS_CANCELLED)->count(),
            'termine' => Appointment::where('statut', self::STATUS_COMPLETED)->count(),
        ];
    }

    /**
     * Calculate total revenue from completed appointments.
     *
     * @return float Total revenue
     */
    private function calculateTotalRevenue(): float
    {
        $completedAppointments = Appointment::where('statut', self::STATUS_COMPLETED)
            ->with('serviceNurse')
            ->get();

        return $completedAppointments->sum(function ($appointment) {
            return $appointment->serviceNurse->price ?? 0;
        });
    }

    /**
     * Get date range for recent appointments (last 7 days).
     *
     * @return array Array with 'start' and 'end' Carbon instances
     */
    private function getRecentDateRange(): array
    {
        return [
            'start' => Carbon::now(self::TIMEZONE)->subDays(self::RECENT_APPOINTMENTS_DAYS)->startOfDay(),
            'end' => Carbon::now(self::TIMEZONE)->endOfDay(),
        ];
    }

    /**
     * Fetch recent appointments with all related data.
     *
     * @param array $dateRange Date range with 'start' and 'end' keys
     * @return \Illuminate\Support\Collection Collection of appointments
     */
    private function fetchRecentAppointments(array $dateRange)
    {
        return DB::table('appointments')
            ->join('patients', 'appointments.patient_id', '=', 'patients.id')
            ->join('users as patient_users', 'patients.user_id', '=', 'patient_users.id')
            ->join('nurse_service', 'appointments.service_nurse_id', '=', 'nurse_service.id')
            ->join('nurses', 'nurse_service.nurse_id', '=', 'nurses.id')
            ->join('users as nurse_users', 'nurses.user_id', '=', 'nurse_users.id')
            ->join('services', 'nurse_service.service_id', '=', 'services.id')
            ->join('cities', 'nurses.city_id', '=', 'cities.id')
            ->whereBetween('appointments.created_at', [$dateRange['start'], $dateRange['end']])
            ->select(
                'appointments.id',
                'patient_users.id as patient_id',
                'patient_users.first_name as patient_first_name',
                'patient_users.last_name as patient_last_name',
                'patient_users.email as patient_email',
                'nurse_users.id as nurse_id',
                'nurse_users.first_name as nurse_first_name',
                'nurse_users.last_name as nurse_last_name',
                'nurse_users.email as nurse_email',
                'services.id as service_id',
                'services.name as service_name',
                'cities.id as city_id',
                'cities.name as city_name',
                'appointments.apointementsDate',
                'appointments.statut',
                'appointments.emergency_level',
                'appointments.adress',
                'appointments.created_at'
            )
            ->get();
    }

    /**
     * Format appointments collection into structured array.
     *
     * @param \Illuminate\Support\Collection $appointments Raw appointments data
     * @return array Formatted appointments
     */
    private function formatAppointments($appointments): array
    {
        return $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'patient' => [
                    'id' => $appointment->patient_id,
                    'first_name' => $appointment->patient_first_name,
                    'last_name' => $appointment->patient_last_name,
                    'email' => $appointment->patient_email,
                ],
                'nurse' => [
                    'id' => $appointment->nurse_id,
                    'first_name' => $appointment->nurse_first_name,
                    'last_name' => $appointment->nurse_last_name,
                    'email' => $appointment->nurse_email,
                ],
                'service' => [
                    'id' => $appointment->service_id,
                    'name' => $appointment->service_name,
                ],
                'city' => [
                    'id' => $appointment->city_id,
                    'name' => $appointment->city_name,
                ],
                'date' => Carbon::parse($appointment->apointementsDate)->format('Y-m-d'),
                'time' => Carbon::parse($appointment->apointementsDate)->format('H:i:s'),
                'status' => $appointment->statut,
                'emergency_level' => $appointment->emergency_level,
                'address' => $appointment->adress,
                'created_at' => Carbon::parse($appointment->created_at)->toDateTimeString(),
            ];
        })->toArray();
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
}