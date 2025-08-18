<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Helpers\JwtHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class PatientController extends Controller
{

    public function CreatePatient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email|max:255',
            'nickname' => 'required|string|unique:users,nickname|max:20',
            'password' => 'required|string|min:6',
            'phone_number' => 'required|string|max:20|unique:users,phone_number',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Créer l'utilisateur avec le type patient
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'nickname' => $request->nickname,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'type' => 'patient',
        ]);

        // Créer le patient
        $patient = Patient::create([
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Patient créé avec succès',
            'data' => [
                'id' => $patient->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'nickname' => $user->nickname,
            ]
        ], 201);
    }

    public function getPatientById(Request $request)
    {
        try {
            // Récupérer l'ID du patient depuis le JWT
            $patientId = JWTHelper::getPatientId($request);

            // Vérifier que l'ID du patient est valide
            if (!$patientId) {
                return response()->json([
                    'message' => 'ID du patient invalide ou non fourni'
                ], 401);
            }

            // Récupérer le patient avec les données de l'utilisateur associé
            $patient = Patient::find($patientId)
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->select(
                    'patients.id',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone_number'
                )
                ->first();

            if (!$patient) {
                return response()->json([
                    'message' => 'Patient non trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Patient récupéré avec succès',
                'data' => [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'email' => $patient->email,
                    'phone_number' => $patient->phone_number
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function updatePatient(Request $request)
    {
        $patient = Auth::user();
        $validated = $request->validate([
            'first_name' => 'required|string|min:2',
            'last_name' => 'required|string|min:2',
            'email' => 'required|email|unique:patients,email,' . $patient->id,
            'phone_number' => 'required|string|min:10',
            'address' => 'required|string|min:10',
        ]);
        $patient->update($validated);
        return response()->json(['data' => $patient], 200);
    }
    public function updatePatientPhoto(Request $request)
    {
        $patient = Auth::user();
        if (!$patient) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        $request->validate([
            'profile_photo' => 'required|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            $path = $file->store('profile_photos', 'public'); // Stocke dans storage/app/public/profile_photos
            $url = asset('storage/' . $path);
            $patient->update(['profile_photo_url' => $url]);
            return response()->json(['profile_photo_url' => $url], 200);
        }

        return response()->json(['message' => 'Aucune photo fournie'], 400);
    }
    public function getPatientAppointments(Request $request): JsonResponse
    {
        $patientId = JWTHelper::getPatientId($request);

        if (!$patientId) {
            return response()->json([
                'message' => 'ID du patient invalide ou non fourni'
            ], 401);
        }


        // Récupérer les rendez-vous à venir
        $appointments = Appointment::where('patient_id', $patientId)
            ->where('appointment_date', '>=', now())
            ->with(['service', 'nurse'])
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'service_id' => $appointment->service_id,
                    'service_name' => $appointment->service->name,
                    'nurse_id' => $appointment->nurse_id,
                    'nurse_first_name' => $appointment->nurse->first_name,
                    'nurse_last_name' => $appointment->nurse->last_name,
                    'appointment_date' => $appointment->appointment_date->toISOString(),
                    'address' => $appointment->address,
                    'emergency_level' => $appointment->emergency_level,
                ];
            });

        return response()->json([
            'data' => $appointments,
            'message' => 'Rendez-vous récupérés avec succès',
        ], 200);
    }

    public function getAllPatients()
    {
        try {
            $patients = Patient::all();
            if ($patients->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun patient trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Patients récupérés avec succès',
                'data' => $patients
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des patients',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    public function getAllPatientsInfos()
    {
        try {
            $patients = DB::table('patients')
                ->join('users', 'users.id', '=', 'patients.user_id')
                ->select(
                    // 'patients.id',
                    'users.id',
                    'users.nickname',
                    'users.first_name',
                    'users.last_name',
                    'users.email',
                    'users.phone_number'
                )
                ->groupBy( 'users.id', 'users.first_name', 'users.last_name', 'users.email','phone_number','users.nickname')
                ->get();
            return response()->json([
                'message' => 'Patients récupérés avec succès',
                'data' => $patients
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des patients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // fonction (Nombre des patient qui n'ont pas reserver aucun rendez vous)
    public function getPatientsWithoutAppointmentsCount()
    {
        try {
            $count = DB::table('patients')
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->leftJoin('appointments', 'patients.id', '=', 'appointments.patient_id')
                ->where('users.role', 'patient')
                ->whereNull('appointments.patient_id')
                ->count();

            return response()->json([
                'message' => 'Nombre de patients sans rendez-vous récupéré avec succès',
                'patient_without_appointments_count' => $count
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du nombre de patients sans rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // FONCTION (le service le plus reserve cette semaine )
    public function getMostReservedServiceLastWeek()
    {
        try {
            $lastWeek = Carbon::now()->subDays(7);

            $mostReservedService = DB::table('appointments')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->join('patients', 'appointments.patient_id', '=', 'patients.id')
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->where('users.role', 'patient')
                ->where('appointments.created_at', '>=', $lastWeek)
                ->groupBy('services.id', 'services.name')
                ->select('services.name', DB::raw('COUNT(*) as reservation_count'))
                ->orderBy('reservation_count', 'desc')
                ->orderBy('services.name', 'asc') // Pour un tri déterministe en cas d'égalité
                ->first();

            if (!$mostReservedService) {
                return response()->json([
                    'message' => 'Aucun rendez-vous trouvé pour la dernière semaine.',
                    'service' => null,
                    'reservation_count' => 0
                ], 200);
            }

            return response()->json([
                'message' => 'Service le plus réservé de la dernière semaine récupéré avec succès',
                'service' => $mostReservedService->name,
                'reservation_count' => $mostReservedService->reservation_count
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du service le plus réservé',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // fonction (Nombres des patient qui ont reserver une ou plus la deniere semaine)


    public function getPatientsWithAppointmentsLastWeekCount()
    {
        try {
            $lastWeek = Carbon::now()->subDays(7);

            $count = DB::table('patients')
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->join('appointments', 'patients.id', '=', 'appointments.patient_id')
                ->where('users.role', 'patient')
                ->where('appointments.created_at', '>=', $lastWeek)
                ->distinct('patients.id')
                ->count('patients.id');

            return response()->json([
                'message' => 'Nombre de patients avec rendez-vous la dernière semaine récupéré avec succès',
                'patients_with_appointments_last_week_count' => $count
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du nombre de patients avec rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // fonction tartib dial les services 3la hassab x7al mn mrra t reservaw
    public function getServicesRankedByReservationsLastWeek()
    {
        try {
            $lastWeek = Carbon::now()->subDays(7);

            $services = DB::table('services')
                ->leftJoin('appointments', function ($join) use ($lastWeek) {
                    $join->on('services.id', '=', 'appointments.service_id')
                        ->where('appointments.created_at', '>=', $lastWeek);
                })
                ->join('patients', 'appointments.patient_id', '=', 'patients.id')
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->where('users.role', 'patient')
                ->groupBy('services.id', 'services.name')
                ->select('services.name', DB::raw('COUNT(appointments.id) as reservation_count'))
                ->orderBy('reservation_count', 'desc')
                ->orderBy('services.name', 'asc') // Tri déterministe en cas d'égalité
                ->get();

            return response()->json([
                'message' => 'Services classés par nombre de réservations (dernière semaine) récupérés avec succès',
                'services' => $services
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des services classés',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPatientStatistics(): array
    {
        // Calculate total number of patients
        $totalPatients = DB::table('patients')->count();

        // Calculate number of patients who have never made an appointment
        $patientsWithoutAppointments = DB::table('patients')
            ->leftJoin('appointments', 'patients.id', '=', 'appointments.patient_id')
            ->whereNull('appointments.id')
            ->count();

        // Calculate number of patients with appointments in the last 7 days
        $last7Days = Carbon::now()->subDays(7);
        $patientsWithRecentAppointments = DB::table('patients')
            ->join('appointments', 'patients.id', '=', 'appointments.patient_id')
            ->where('appointments.created_at', '>=', $last7Days)
            ->distinct('patients.id')
            ->count('patients.id');

        // Calculate number of patients created in the last 7 days
        $newPatientsLast7Days = DB::table('patients')
            ->where('created_at', '>=', $last7Days)
            ->count();

        return [
            'total_patients' => $totalPatients,
            'patients_without_appointments' => $patientsWithoutAppointments,
            'patients_with_recent_appointments' => $patientsWithRecentAppointments,
            'new_patients_last_7_days' => $newPatientsLast7Days,
        ];
    }

}

