<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\City;
use App\Models\Zone;
use App\Models\Service;
use App\Models\Nurse;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Helpers\JwtHelper;
use Carbon\Carbon;
use App\Models\Appointment;

/**
 * NursesController
 * 
 * Handles nurse-related operations including creation, retrieval,
 * filtering, statistics, and status management.
 */
class NursesController extends Controller
{
    // User role constant
    private const ROLE_NURSE = 'nurse';

    // Nurse status constants
    private const STATUS_ACTIVATED = 'activated';
    private const STATUS_DISABLED = 'disabled';

    // Appointment status constants
    private const APPOINTMENT_STATUS_CANCELLED = 'annule';
    private const APPOINTMENT_STATUS_COMPLETED = 'termine';

    // Statistics time period
    private const STATS_DAYS_PERIOD = 7;

    // Service limits
    private const MIN_SERVICES = 1;
    private const MAX_SERVICES = 3;

    /**
     * Create a new nurse with services.
     *
     * @param Request $request The HTTP request with nurse data
     * @return JsonResponse JSON response with created nurse
     */
    public function createNurse(Request $request): JsonResponse
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), $this->getNurseValidationRules());

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            // Verify city and zone
            $city = City::where('name', $request->city_name)->first();
            if (!$city) {
                return $this->notFoundResponse('Ville introuvable');
            }

            $zone = Zone::where('name', $request->zone_name)
                ->where('city_id', $city->id)
                ->first();

            if (!$zone) {
                return $this->badRequestResponse('La zone sélectionnée ne correspond pas à la ville choisie');
            }

            // Create user
            $user = $this->createNurseUser($request);

            // Create nurse
            $nurse = Nurse::create([
                'user_id' => $user->id,
                'city_id' => $city->id,
                'zone_id' => $zone->id,
                'status' => self::STATUS_ACTIVATED,
            ]);

            // Link services to nurse
            $this->linkServicesToNurse($nurse->id, $request->services);

            return $this->successResponse(
                $this->formatNurseCreationResponse($nurse, $user, $city, $zone, $request->services),
                'Infirmier créé avec succès',
                201
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la création de l\'infirmier',
                $e->getMessage()
            );
        }
    }

    /**
     * Get all nurses with their information.
     *
     * @return JsonResponse JSON response with all nurses
     */
    public function getAllNurses(): JsonResponse
    {
        try {
            $nurses = $this->fetchAllNurses();

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse information by nurse ID from JWT.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with nurse info
     */
    public function getNurseInfosById(Request $request): JsonResponse
    {
        try {
            $nurseId = JwtHelper::getNurseId($request);

            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            $nurse = $this->fetchNurseById($nurseId);

            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            return $this->successResponse(
                $nurse,
                'Infirmier récupéré avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de l\'infirmier',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse information by user ID from JWT.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with nurse info
     */
    public function getNurseByUserId(Request $request): JsonResponse
    {
        try {
            $userId = JwtHelper::getUserId($request);

            if (!$userId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié');
            }

            $nurse = $this->fetchNurseByUserId($userId);

            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            return $this->successResponse(
                $nurse,
                'Infirmier récupéré avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de l\'infirmier',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurses by service name.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with filtered nurses
     */
    public function getNursesByServices(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'service_name' => 'required|string|exists:services,name'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurses = $this->fetchNursesByServiceName($request->service_name);

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé pour ce service');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurses by service ID.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with filtered nurses
     */
    public function getNurseByServiceId(Request $request): JsonResponse
    {
        try {
            $serviceId = $request->cookie('serviceId') ?? $request->input("serviceId");

            $validator = Validator::make(['service_id' => $serviceId], [
                'service_id' => 'required|integer|exists:services,id'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurses = $this->fetchNursesByServiceId($serviceId);

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé pour ce service');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse by full name.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with nurse info
     */
    public function getNurseByUserName(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurse = $this->fetchNurseByName(
                $request->first_name,
                $request->last_name
            );

            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            return $this->successResponse(
                $nurse,
                'Infirmier récupéré avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération de l\'infirmier',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurse statistics for the last 7 days.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with statistics
     */
    public function getNurseStats(Request $request): JsonResponse
    {
        try {
            $nurseId = JwtHelper::getNurseId($request) ?? $request->input("nurseId");

            if (!$nurseId) {
                return $this->unauthorizedResponse('Utilisateur non authentifié ou infirmier non trouvé');
            }

            $now = Carbon::now();
            $stats = $this->calculateNurseStats($nurseId, $now);

            return $this->successResponse(
                $stats,
                'Statistiques récupérées avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des statistiques',
                $e->getMessage()
            );
        }
    }

    /**
     * Toggle nurse status between activated and disabled.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with updated status
     */
    public function toggleNurseStatus(Request $request): JsonResponse
    {
        try {
            $nurseId = $request->cookie('nurseId') ?? $request->input('nurseId');
            $currentStatus = $request->cookie('status') ?? $request->input('status');

            // Validate nurse ID
            if (!$nurseId || !is_numeric($nurseId)) {
                return $this->badRequestResponse('ID de l\'infirmier invalide ou non trouvé');
            }

            // Validate current status
            if (!in_array($currentStatus, [self::STATUS_ACTIVATED, self::STATUS_DISABLED])) {
                return $this->badRequestResponse('Statut invalide');
            }

            // Check if nurse exists
            $nurse = DB::table('nurses')->where('id', $nurseId)->first();
            if (!$nurse) {
                return $this->notFoundResponse('Infirmier non trouvé');
            }

            // Toggle status
            $newStatus = $currentStatus === self::STATUS_ACTIVATED 
                ? self::STATUS_DISABLED 
                : self::STATUS_ACTIVATED;

            // Update status
            DB::table('nurses')
                ->where('id', $nurseId)
                ->update([
                    'status' => $newStatus,
                    'updated_at' => now(),
                ]);

            return $this->successResponse([
                'nurse_id' => $nurseId,
                'status' => $newStatus,
            ], 'Statut de l\'infirmier mis à jour avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la mise à jour du statut de l\'infirmier',
                $e->getMessage()
            );
        }
    }

    /**
     * Get total patient count.
     *
     * @return JsonResponse JSON response with patient count
     */
    public function getPatientCount(): JsonResponse
    {
        try {
            $count = Patient::count();

            return $this->successResponse([
                'patient_count' => $count,
            ], 'Nombre de patients récupéré avec succès');

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération du nombre de patients',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurses by city name.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with filtered nurses
     */
    public function getNursesByCity(Request $request): JsonResponse
    {
        try {
            $cityName = $request->cookie('city_name') ?? $request->input('city_name');

            $validator = Validator::make(['city_name' => $cityName], [
                'city_name' => 'required|string|exists:cities,name'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('cities.name', $cityName)
                ->where('users.role', self::ROLE_NURSE)
                ->where('nurses.status', self::STATUS_ACTIVATED)
                ->select($this->getNurseSelectFields(true))
                ->groupBy($this->getNurseGroupByFields(true, false))
                ->get();

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé dans cette ville');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurses by zone name.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with filtered nurses
     */
    public function getNursesByZone(Request $request): JsonResponse
    {
        try {
            $zoneName = $request->cookie('zone_name') ?? $request->input('zone_name');

            $validator = Validator::make(['zone_name' => $zoneName], [
                'zone_name' => 'required|string|exists:zones,name'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('zones.name', $zoneName)
                ->where('users.role', self::ROLE_NURSE)
                ->where('nurses.status', self::STATUS_ACTIVATED)
                ->select($this->getNurseSelectFields(true))
                ->groupBy($this->getNurseGroupByFields(true, false))
                ->get();

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé dans cette zone');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    /**
     * Get nurses by service and zone (combined filter).
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with filtered nurses
     */
    public function getNursesByServiceAndZone(Request $request): JsonResponse
    {
        try {
            $serviceId = $request->cookie('serviceId') ?? $request->input('serviceId');
            $zoneName = $request->cookie('zone_name') ?? $request->input('zone_name');

            $validator = Validator::make([
                'service_id' => $serviceId,
                'zone_name' => $zoneName
            ], [
                'service_id' => 'required|integer|exists:services,id',
                'zone_name' => 'required|string|exists:zones,name'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->join('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->join('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('services.id', $serviceId)
                ->where('zones.name', $zoneName)
                ->where('users.role', self::ROLE_NURSE)
                ->where('nurses.status', self::STATUS_ACTIVATED)
                ->select([
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'users.phone_number',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    'services.name as service_name',
                    'nurse_service.price as service_price',
                ])
                ->get();

            if ($nurses->isEmpty()) {
                return $this->successResponse([], 'Aucun infirmier trouvé pour ce service dans cette zone');
            }

            return $this->successResponse(
                $nurses,
                'Infirmiers récupérés avec succès'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la récupération des infirmiers',
                $e->getMessage()
            );
        }
    }

    // =========================================================================
    // Private Helper Methods
    // =========================================================================

    /**
     * Get validation rules for nurse creation.
     *
     * @return array Validation rules
     */
    private function getNurseValidationRules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nickname' => 'required|string|unique:users,nickname',
            'password' => 'required|string|min:6',
            'phone_number' => 'required|string|max:20|unique:users,phone_number',
            'city_name' => 'required|string',
            'zone_name' => 'required|string',
            'services' => 'required|array|min:' . self::MIN_SERVICES . '|max:' . self::MAX_SERVICES,
            'services.*.name' => 'required|string|exists:services,name',
            'services.*.price' => 'required|numeric|min:0',
        ];
    }

    /**
     * Create a user for the nurse.
     *
     * @param Request $request
     * @return User
     */
    private function createNurseUser(Request $request): User
    {
        return User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => self::ROLE_NURSE,
        ]);
    }

    /**
     * Link services to a nurse.
     *
     * @param int $nurseId
     * @param array $services
     * @return void
     */
    private function linkServicesToNurse(int $nurseId, array $services): void
    {
        foreach ($services as $serviceData) {
            $service = Service::where('name', $serviceData['name'])->first();
            if ($service) {
                DB::table('nurse_service')->insert([
                    'nurse_id' => $nurseId,
                    'service_id' => $service->id,
                    'price' => $serviceData['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Get base nurse query with all joins.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    private function getNurseBaseQuery()
    {
        return DB::table('nurses')
            ->join('users', 'nurses.user_id', '=', 'users.id')
            ->join('cities', 'nurses.city_id', '=', 'cities.id')
            ->join('zones', 'nurses.zone_id', '=', 'zones.id')
            ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
            ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
            ->where('users.role', self::ROLE_NURSE);
    }

    /**
     * Get standard nurse select fields.
     *
     * @param bool $includePhone Whether to include phone number
     * @return array
     */
    private function getNurseSelectFields(bool $includePhone = false): array
    {
        $fields = [
            'nurses.id as nurse_id',
            'nurses.status',
            'users.id as user_id',
            'users.first_name',
            'users.last_name',
            'users.email',
            'users.nickname',
            'cities.name as city_name',
            'zones.name as zone_name',
            DB::raw('GROUP_CONCAT(services.name) as services'),
        ];

        if ($includePhone) {
            array_splice($fields, 7, 0, ['users.phone_number']);
        }

        return $fields;
    }

    /**
     * Get standard group by fields for nurse queries.
     *
     * @param bool $includePhone Whether to include phone number
     * @param bool $includeStatus Whether to include status
     * @return array
     */
    private function getNurseGroupByFields(bool $includePhone = false, bool $includeStatus = true): array
    {
        $fields = ['nurses.id', 'users.id', 'users.first_name', 'users.last_name', 
                   'users.email', 'users.nickname', 'cities.name', 'zones.name'];

        if ($includeStatus) {
            array_splice($fields, 1, 0, ['nurses.status']);
        }

        if ($includePhone) {
            array_splice($fields, $includeStatus ? 8 : 7, 0, ['users.phone_number']);
        }

        return $fields;
    }

    /**
     * Fetch all nurses.
     *
     * @return \Illuminate\Support\Collection
     */
    private function fetchAllNurses()
    {
        return $this->getNurseBaseQuery()
            ->select($this->getNurseSelectFields())
            ->groupBy($this->getNurseGroupByFields())
            ->get();
    }

    /**
     * Fetch nurse by ID.
     *
     * @param int $nurseId
     * @return object|null
     */
    private function fetchNurseById(int $nurseId): ?object
    {
        return $this->getNurseBaseQuery()
            ->where('nurses.id', $nurseId)
            ->select($this->getNurseSelectFields())
            ->groupBy($this->getNurseGroupByFields())
            ->first();
    }

    /**
     * Fetch nurse by user ID.
     *
     * @param int $userId
     * @return object|null
     */
    private function fetchNurseByUserId(int $userId): ?object
    {
        return $this->getNurseBaseQuery()
            ->where('nurses.user_id', $userId)
            ->select($this->getNurseSelectFields())
            ->groupBy($this->getNurseGroupByFields(false, false))
            ->first();
    }

    /**
     * Fetch nurses by service name.
     *
     * @param string $serviceName
     * @return \Illuminate\Support\Collection
     */
    private function fetchNursesByServiceName(string $serviceName)
    {
        return DB::table('nurses')
            ->join('users', 'nurses.user_id', '=', 'users.id')
            ->join('cities', 'nurses.city_id', '=', 'cities.id')
            ->join('zones', 'nurses.zone_id', '=', 'zones.id')
            ->join('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
            ->join('services', 'nurse_service.service_id', '=', 'services.id')
            ->where('services.name', $serviceName)
            ->where('users.role', self::ROLE_NURSE)
            ->select($this->getNurseSelectFields())
            ->groupBy($this->getNurseGroupByFields(false, false))
            ->get();
    }

    /**
     * Fetch nurses by service ID.
     *
     * @param int $serviceId
     * @return \Illuminate\Support\Collection
     */
    private function fetchNursesByServiceId(int $serviceId)
    {
        return DB::table('nurses')
            ->join('users', 'nurses.user_id', '=', 'users.id')
            ->join('cities', 'nurses.city_id', '=', 'cities.id')
            ->join('zones', 'nurses.zone_id', '=', 'zones.id')
            ->join('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
            ->join('services', 'nurse_service.service_id', '=', 'services.id')
            ->where('services.id', $serviceId)
            ->where('users.role', self::ROLE_NURSE)
            ->select($this->getNurseSelectFields(true))
            ->groupBy($this->getNurseGroupByFields(true, false))
            ->get();
    }

    /**
     * Fetch nurse by full name.
     *
     * @param string $firstName
     * @param string $lastName
     * @return object|null
     */
    private function fetchNurseByName(string $firstName, string $lastName): ?object
    {
        return $this->getNurseBaseQuery()
            ->where('users.first_name', $firstName)
            ->where('users.last_name', $lastName)
            ->select($this->getNurseSelectFields())
            ->groupBy($this->getNurseGroupByFields(false, false))
            ->first();
    }

    /**
     * Calculate nurse statistics.
     *
     * @param int $nurseId
     * @param Carbon $now
     * @return array
     */
    private function calculateNurseStats(int $nurseId, Carbon $now): array
    {
        $futureDate = $now->copy()->addDays(self::STATS_DAYS_PERIOD);
        $pastDate = $now->copy()->subDays(self::STATS_DAYS_PERIOD);

        // Upcoming appointments count
        $upcomingCount = Appointment::where('statut', '!=', self::APPOINTMENT_STATUS_CANCELLED)
            ->whereBetween('apointementsDate', [$now, $futureDate])
            ->whereHas('serviceNurse', fn($query) => $query->where('nurse_id', $nurseId))
            ->count();

        // Completed appointments with revenue
        $completedAppointments = Appointment::where('statut', self::APPOINTMENT_STATUS_COMPLETED)
            ->whereBetween('apointementsDate', [$pastDate, $now])
            ->whereHas('serviceNurse', fn($query) => $query->where('nurse_id', $nurseId))
            ->with('serviceNurse')
            ->get();

        $completedCount = $completedAppointments->count();
        $totalRevenue = $completedAppointments->sum(fn($apt) => $apt->serviceNurse->price ?? 0);

        return [
            'upcoming_appointments_count' => $upcomingCount,
            'completed_appointments_count' => $completedCount,
            'total_revenue' => $totalRevenue,
            'period_days' => self::STATS_DAYS_PERIOD,
        ];
    }

    /**
     * Format nurse creation response.
     *
     * @param Nurse $nurse
     * @param User $user
     * @param City $city
     * @param Zone $zone
     * @param array $services
     * @return array
     */
    private function formatNurseCreationResponse(Nurse $nurse, User $user, City $city, Zone $zone, array $services): array
    {
        return [
            'id' => $nurse->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'city_name' => $city->name,
            'zone_name' => $zone->name,
            'services' => $services,
            'status' => $nurse->status,
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
