<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\City;
use App\Models\Zone;
use App\Models\Service;
use App\Models\Nurse;
use App\Models\User;
use App\Models\NurseService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Helpers\JwtHelper;
use Carbon\Carbon;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;

class NursesController extends Controller
{


    public function CreateNurse(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nickname' => 'required|string|unique:users,nickname',
            'password' => 'required|string|min:6',
            'phone_number' => 'required|string|max:20|unique:users,phone_number', // Validation ajoutée
            'city_name' => 'required|string',
            'zone_name' => 'required|string',
            'services' => 'required|array|min:1|max:3',
            'services.*.name' => 'required|string|exists:services,name',
            'services.*.price' => 'required|numeric|min:0',
            'status'=>'string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $city = City::where('name', $request->city_name)->first();
        if (!$city) {
            return response()->json(['message' => 'Ville introuvable.'], 404);
        }

        $zone = Zone::where('name', $request->zone_name)
            ->where('city_id', $city->id)
            ->first();
        if (!$zone) {
            return response()->json(['message' => 'La zone sélectionnée ne correspond pas à la ville choisie.'], 400);
        }

        // Création de l'utilisateur avec numéro de téléphone
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'phone_number' => $request->phone_number, // Ajout ici
            'password' => Hash::make($request->password),
            'role' => 'nurse',
        ]);

        $nurse = Nurse::create([
            'user_id' => $user->id,
            'city_id' => $city->id,
            'zone_id' => $zone->id,
        ]);

        foreach ($request->services as $serviceData) {
            $service = Service::where('name', $serviceData['name'])->first();
            if ($service) {
                DB::table('nurse_service')->insert([
                    'nurse_id' => $nurse->id,
                    'service_id' => $service->id,
                    'price' => $serviceData['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Infirmier créé avec succès',
            'data' => [
                'id' => $nurse->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'city_name' => $city->name,
                'zone_name' => $zone->name,
                'services' => $request->services,
            ]
        ], 201);
    }

    public function GetAllNurses()
    {
        try {
            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurseId',
                    'nurses.status',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'nurses.status','users.last_name', 'users.email', 'users.nickname', 'cities.name', 'zones.name')
                ->get();

            if ($nurses->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun infirmier trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmiers récupérés avec succès',
                'data' => $nurses
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des infirmiers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function GetNurseInfosById(Request $request)
    {
        try {
            $nurse_id = JWTHelper::getNurseId($request);
            //$laboId = JWTHelper::getLaboId($request) ?? $request->input('laboId');

            $nurse = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('nurses.id', $nurse_id)
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'nurses.status','users.last_name', 'users.email', 'users.nickname', 'cities.name', 'zones.name')
                ->first();

            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé',
                    'id' => $nurse_id
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmier récupéré avec succès',
                'data' => $nurse
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'infirmier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function GetNurseByUserId(Request $request)
    {
        try {
            $User_id = JWTHelper::getUserId($request);

            $nurse = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('nurses.user_id', $User_id)
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.nickname', 'cities.name', 'zones.name')
                ->first();

            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmier récupéré avec succès',
                'data' => $nurse
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'infirmier',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function GetNursesByServices(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'service_name' => 'required|string|exists:services,name'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $service_name = $request->input('service_name');

            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->join('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->join('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('services.name', $service_name)
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.nickname', 'cities.name', 'zones.name')
                ->get();

            if ($nurses->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun infirmier trouvé pour ce service'
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmiers récupérés avec succès',
                'data' => $nurses
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des infirmiers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getNurseByServiceId(Request $request)
    {
        try {
            // Récupérer l'ID du service depuis le cookie nommé 'serviceId'
            $service_id = $request->cookie('serviceId') ?? $request->input("serviceId");

            // Validation de l'ID du service
            $validator = Validator::make(['service_id' => $service_id], [
                'service_id' => 'required|integer|exists:services,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Requête pour récupérer les infirmiers associés au service
            $nurses = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->join('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->join('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('services.id', $service_id)
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'users.phone_number',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.nickname', 'users.phone_number', 'cities.name', 'zones.name')
                ->get();

            if ($nurses->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun infirmier trouvé pour ce service'
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmiers récupérés avec succès',
                'data' => $nurses
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des infirmiers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function GetNurseByUserName(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $first_name = $request->input('first_name');
            $last_name = $request->input('last_name');

            $nurse = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->join('cities', 'nurses.city_id', '=', 'cities.id')
                ->join('zones', 'nurses.zone_id', '=', 'zones.id')
                ->leftJoin('nurse_service', 'nurses.id', '=', 'nurse_service.nurse_id')
                ->leftJoin('services', 'nurse_service.service_id', '=', 'services.id')
                ->where('users.first_name', $first_name)
                ->where('users.last_name', $last_name)
                ->where('users.role', 'nurse')
                ->select(
                    'nurses.id as nurse_id',
                    'users.id as user_id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.nickname',
                    'cities.name as city_name',
                    'zones.name as zone_name',
                    DB::raw('GROUP_CONCAT(services.name) as services')
                )
                ->groupBy('nurses.id', 'users.id', 'users.first_name', 'users.last_name', 'users.email', 'users.nickname', 'cities.name', 'zones.name')
                ->first();

            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Infirmier récupéré avec succès',
                'data' => $nurse
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération de l\'infirmier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getNurseStats(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID de l'infirmier à partir du token JWT ou de la requête
            $nurse_id = JWTHelper::getNurseId($request) ?? $request->input("nurseId");
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Définir les intervalles de dates
            $now = Carbon::now(); // 2025-07-06 18:40:00 +01
            $sevenDaysFromNow = $now->copy()->addDays(7); // Jusqu'au 2025-07-13 18:40:00
            $sevenDaysAgo = $now->copy()->subDays(7); // À partir du 2025-06-29 18:40:00

            // Nombre de rendez-vous à venir dans les 7 prochains jours
            $upcomingAppointmentsCount = Appointment::where('statut', '!=', 'annule')
                ->whereBetween('apointementsDate', [$now, $sevenDaysFromNow])
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->count();

            // Rendez-vous terminés dans les 7 derniers jours
            $completedAppointments = Appointment::where('statut', 'termine')
                ->whereBetween('apointementsDate', [$sevenDaysAgo, $now])
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->with('serviceNurse')
                ->get();

            // Nombre de rendez-vous terminés
            $completedAppointmentsCount = $completedAppointments->count();

            // Calcul du revenu total des rendez-vous terminés
            $totalRevenue = $completedAppointments->sum(function ($appointment) {
                return $appointment->serviceNurse->price ?? 0;
            });

            return response()->json([
                'data' => [
                    'upcoming_appointments_count' => $upcomingAppointmentsCount,
                    'completed_appointments_count' => $completedAppointmentsCount,
                    'total_revenue' => $totalRevenue,
                ],
                'message' => 'Statistiques récupérées avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function toggleNurseStatus(Request $request)
    {
        try {
            // Retrieve nurseId and status from cookies
            $nurseId = $request->cookie('nurseId') ;
            $currentStatus = $request->cookie('status') ;

            // Validate inputs
            if (!$nurseId || !is_numeric($nurseId)) {
                return response()->json([
                    'message' => 'ID de l\'infirmier invalide ou non trouvé dans les cookies.',
                ], 400);
            }

            if (!in_array($currentStatus, ['activated', 'disabled'])) {
                return response()->json([
                    'message' => 'Statut invalide ou non trouvé dans les cookies.',
                ], 400);
            }

            // Determine new status
            $newStatus = $currentStatus === 'activated' ? 'disabled' : 'activated';

            // Check if nurse exists
            $nurse = DB::table('nurses')->where('id', $nurseId)->first();
            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé.',
                ], 404);
            }

            // Update nurse status in the database
            DB::table('nurses')
                ->where('id', $nurseId)
                ->update(['status' => $newStatus]);

            return response()->json([
                'message' => 'Statut de l\'infirmier mis à jour avec succès.',
                'data' => [
                    'nurse_id' => $nurseId,
                    'status' => $newStatus,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour du statut de l\'infirmier.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    // Dans le contrôleur
// Dans votre contrôleur, par exemple PatientController.php
public function getPatientCount()
{
    $count = Patient::count(); // Compte tous les enregistrements dans la table patients
    return response()->json(['patient_count' => $count]);
}

}


