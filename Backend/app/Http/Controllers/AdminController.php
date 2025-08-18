<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Appointment;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use App\Helpers\JwtHelper;
use App\Models\User;
use App\Models\Nurse;
use App\Models\Patient;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Créer une instance du contrôleur avec middleware pour vérifier le rôle admin.
     *  
     */

    public function CreateAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [

            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|max:255',
            'nickname' => 'required|string|unique:users,nickname|max:20',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Créer l'utilisateur avec le rôle admin
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        return response()->json(['message' => 'Administrateur créé avec succès'], 201);
    }

    public function getNurseCount(Request $request)
    {
        try {
            $totalNurses = User::where('role', 'nurse')->count();

            return response()->json([
                'data' => [
                    'totalNurses' => $totalNurses,
                ],
                'message' => 'Nombre d\'infirmières récupéré avec succès',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du nombre d\'infirmières',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAdminStats(Request $request): JsonResponse
    {
        try {

            $nurseCount = User::where('role', 'nurse')->count();

            $patientCount = User::where('role', 'patient')->count();

            // Nombre total de rendez-vous par statut
            $appointmentsByStatus = [
                'en_attente' => Appointment::where('statut', 'en_attente')->count(),
                'confirme' => Appointment::where('statut', 'confirme')->count(),
                'annule' => Appointment::where('statut', 'annule')->count(),
                'termine' => Appointment::where('statut', 'termine')->count(),
            ];

            // Nombre total de rendez-vous
            $totalAppointments = Appointment::count();

            // Revenu total des rendez-vous terminés
            $completedAppointments = Appointment::where('statut', 'termine')
                ->with('serviceNurse')
                ->get();

            $totalRevenue = $completedAppointments->sum(function ($appointment) {
                return $appointment->serviceNurse->price ?? 0;
            });

            return response()->json([
                'data' => [
                    'nurse_count' => $nurseCount,
                    'patient_count' => $patientCount,
                    'total_appointments' => $totalAppointments,
                    'appointments_by_status' => $appointmentsByStatus,
                    'total_revenue' => $totalRevenue,
                ],
                'message' => 'Statistiques globales récupérées avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getRecentAppointments(Request $request)
    {


        // Définir la période des 7 derniers jours
        $startDate = Carbon::now('Europe/Paris')->subDays(7)->startOfDay();
        $endDate = Carbon::now('Europe/Paris')->endOfDay();

        // Requête avec jointures pour récupérer les rendez-vous
        $appointments = DB::table('appointments')
            ->join('patients', 'appointments.patient_id', '=', 'patients.id')
            ->join('users as patient_users', 'patients.user_id', '=', 'patient_users.id')
            ->join('nurse_service', 'appointments.service_nurse_id', '=', 'nurse_service.id')
            ->join('nurses', 'nurse_service.nurse_id', '=', 'nurses.id')
            ->join('users as nurse_users', 'nurses.user_id', '=', 'nurse_users.id')
            ->join('services', 'nurse_service.service_id', '=', 'services.id')
            ->join('cities', 'nurses.city_id', '=', 'cities.id')
            ->whereBetween('appointments.created_at', [$startDate, $endDate])
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
            ->get()
            ->map(function ($appointment) {
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
            });

        return response()->json([
            'data' => $appointments,
            'message' => 'Rendez-vous des 7 derniers jours récupérés avec succès'
        ], 200);
    }

}