<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

use Illuminate\Http\JsonResponse;
use App\Models\Appointment;
use App\Helpers\JWTHelper;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Carbon\Carbon;

// use App\Models\Appointment;


class AppointAppointmentController extends Controller
{


    public function createAppointment1(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID du patient à partir du token JWT ou de la requête
            $patient_id = JWTHelper::getPatientId($request) ?? $request->input("patientId");
            if (!$patient_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou patient non trouvé',
                ], 401);
            }

            // Valider l'adresse
            $validator = Validator::make($request->all(), [
                'address' => 'required|string|min:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Récupérer les données (cookie ou body)
            $date = $request->cookie('date') ?? $request->input("date");
            $emergencyLevel = $request->cookie('emergencyLevel') ?? $request->input("emergencyLevel");
            $serviceId = $request->cookie('serviceId') ?? $request->input("serviceId");
            $nurseId = $request->cookie('nurseId') ?? $request->input("nurseId");

            // Vérification des champs manquants
            $missingFields = [];
            if (!$date)
                $missingFields[] = 'date';
            if (!$emergencyLevel)
                $missingFields[] = 'emergencyLevel';
            if (!$serviceId)
                $missingFields[] = 'serviceId';
            if (!$nurseId)
                $missingFields[] = 'nurseId';

            if (count($missingFields) > 0) {
                return response()->json([
                    'message' => 'Les champs suivants sont manquants : ' . implode(', ', $missingFields),
                ], 400);
            }

            // Vérifier que emergencyLevel est valide
            if (!in_array($emergencyLevel, ['normal', 'urgent', 'super_urgent'])) {
                return response()->json([
                    'message' => 'Niveau d\'urgence invalide',
                ], 400);
            }

            // Vérifier le format de la date
            try {
                $appointmentDate = new \DateTime($date);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Format de date invalide',
                ], 400);
            }

            // Vérifier l'association nurse/service
            $serviceNurse = DB::table('nurse_service')
                ->where('nurse_id', $nurseId)
                ->where('service_id', $serviceId)
                ->first();

            if (!$serviceNurse) {
                return response()->json([
                    'message' => 'Aucune association trouvée entre l\'infirmier et le service',
                ], 404);
            }

            // Création du rendez-vous
            $appointment = Appointment::create([
                'patient_id' => $patient_id,
                'service_nurse_id' => $serviceNurse->id,
                'apointementsDate' => $appointmentDate,
                'adress' => $request->input('address'),
                'statut' => 'en_attente',
                'emergency_level' => $emergencyLevel,
            ]);

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                ],
                'message' => 'Rendez-vous créé avec succès',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function createAppointment(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID du patient à partir du token JWT ou de la requête
            $patient_id = JWTHelper::getPatientId($request) ?? $request->input("patientId");
            if (!$patient_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou patient non trouvé',
                ], 401);
            }

            // Valider l'adresse
            $validator = Validator::make($request->all(), [
                'address' => 'required|string|min:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Récupérer les données (cookie ou body)
            $date = $request->cookie('date') ?? $request->input("date");
            $emergencyLevel = $request->cookie('emergencyLevel') ?? $request->input("emergencyLevel");
            $serviceId = $request->cookie('serviceId') ?? $request->input("serviceId");
            $nurseId = $request->cookie('nurseId') ?? $request->input("nurseId");

            // Vérification des champs manquants
            $missingFields = [];
            if (!$date)
                $missingFields[] = 'date';
            if (!$emergencyLevel)
                $missingFields[] = 'emergencyLevel';
            if (!$serviceId)
                $missingFields[] = 'serviceId';
            if (!$nurseId)
                $missingFields[] = 'nurseId';

            if (count($missingFields) > 0) {
                return response()->json([
                    'message' => 'Les champs suivants sont manquants : ' . implode(', ', $missingFields),
                ], 400);
            }

            // Vérifier que emergencyLevel est valide
            if (!in_array($emergencyLevel, ['normal', 'urgent', 'super_urgent'])) {
                return response()->json([
                    'message' => 'Niveau d\'urgence invalide',
                ], 400);
            }

            // Vérifier le format de la date
            try {
                $appointmentDate = new \DateTime($date);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Format de date invalide',
                ], 400);
            }

            // Vérifier l'association nurse/service
            $serviceNurse = DB::table('nurse_service')
                ->where('nurse_id', $nurseId)
                ->where('service_id', $serviceId)
                ->first();

            if (!$serviceNurse) {
                return response()->json([
                    'message' => 'Aucune association trouvée entre l\'infirmier et le service',
                ], 404);
            }

            // Récupérer le user_id du patient depuis la table patients
            $patient = DB::table('patients')
                ->join('users', 'patients.user_id', '=', 'users.id')
                ->where('patients.id', $patient_id)
                ->select('users.id as user_id', 'users.first_name', 'users.last_name')
                ->first();

            if (!$patient) {
                return response()->json([
                    'message' => 'Patient non trouvé',
                ], 404);
            }

            // Récupérer le user_id de l'infirmier depuis la table nurses
            $nurse = DB::table('nurses')
                ->join('users', 'nurses.user_id', '=', 'users.id')
                ->where('nurses.id', $nurseId)
                ->select('users.id as user_id', 'users.first_name', 'users.last_name')
                ->first();

            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé',
                ], 404);
            }

            // Récupérer le nom du service
            $service = DB::table('services')
                ->where('id', $serviceId)
                ->select('name')
                ->first();

            if (!$service) {
                return response()->json([
                    'message' => 'Service non trouvé',
                ], 404);
            }

            // Création du rendez-vous
            $appointment = Appointment::create([
                'patient_id' => $patient_id,
                'service_nurse_id' => $serviceNurse->id,
                'apointementsDate' => $appointmentDate,
                'adress' => $request->input('address'),
                'statut' => 'en_attente',
                'emergency_level' => $emergencyLevel,
            ]);

            // Créer le message automatique
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
                'id_expediteur' => $patient->user_id, // Utiliser user_id du patient
                'id_destinataire' => $nurse->user_id, // Utiliser user_id de l'infirmier
                'contenu' => $messageContent,
                'statut' => 'non_lu',
                'created_at' => now(),
            ]);

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                ],
                'message' => 'Rendez-vous créé avec succès',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPatientAppointmentsNotDone(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID du patient à partir du token JWT ou de la requête
            $patient_id = JWTHelper::getPatientId($request) ?? $request->input("patientId");
            if (!$patient_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou patient non trouvé',
                ], 401);
            }

            // Récupérer les rendez-vous non annulés et non passés
            $appointments = Appointment::where('patient_id', $patient_id)
                ->where('statut', '!=', 'annule')
                ->where('statut', '!=', 'termine')

                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'service_nurse_id' => $appointment->service_nurse_id,
                        'service_name' => $appointment->serviceNurse->service->name ?? null,
                        'nurse_name' => ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . ($appointment->serviceNurse->nurse->user->last_name ?? ''),
                        'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                        'adress' => $appointment->adress,
                        'statut' => $appointment->statut,
                        'emergency_level' => $appointment->emergency_level,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($appointments->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun rendez-vous trouvé pour ce patient',
                ], 200);
            }

            return response()->json([
                'data' => $appointments,
                'message' => 'Rendez-vous récupérés avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPatientAppointmentsTermine(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID du patient à partir du token JWT ou de la requête
            $patient_id = JWTHelper::getPatientId($request) ?? $request->input("patientId");
            if (!$patient_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou patient non trouvé',
                ], 401);
            }

            // Récupérer les rendez-vous non annulés et non passés
            $appointments = Appointment::where('patient_id', $patient_id)
                ->where('statut', '=', 'termine')
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'service_nurse_id' => $appointment->service_nurse_id,
                        'service_name' => $appointment->serviceNurse->service->name ?? null,
                        'nurse_name' => ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . ($appointment->serviceNurse->nurse->user->last_name ?? ''),
                        'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                        'adress' => $appointment->adress,
                        'statut' => $appointment->statut,
                        'emergency_level' => $appointment->emergency_level,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($appointments->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun rendez-vous trouvé pour ce patient',
                ], 200);
            }

            return response()->json([
                'data' => $appointments,
                'message' => 'Rendez-vous récupérés avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getPatientAppointments(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID du patient à partir du token JWT ou de la requête
            $patient_id = JWTHelper::getPatientId($request) ?? $request->input("patientId");
            if (!$patient_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou patient non trouvé',
                ], 401);
            }

            // Récupérer les rendez-vous non annulés et non passés
            $appointments = Appointment::where('patient_id', $patient_id)
                ->where('statut', '!=', 'termine')

                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user'])
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'service_nurse_id' => $appointment->service_nurse_id,
                        'service_name' => $appointment->serviceNurse->service->name ?? null,
                        'nurse_name' => ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . ($appointment->serviceNurse->nurse->user->last_name ?? ''),
                        'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                        'adress' => $appointment->adress,
                        'statut' => $appointment->statut,
                        'emergency_level' => $appointment->emergency_level,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($appointments->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun rendez-vous trouvé pour ce patient',
                ], 200);
            }

            return response()->json([
                'data' => $appointments,
                'message' => 'Rendez-vous récupérés avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getNurseAppointments(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID de l'infirmier à partir du token JWT ou de la requête
            $nurse_id = JWTHelper::getNurseId($request) ?? $request->input("nurseId");
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Récupérer les rendez-vous associés à l'infirmier
            $appointments = Appointment::whereHas('serviceNurse', function ($query) use ($nurse_id) {
                $query->where('nurse_id', $nurse_id);
            })
                ->where('statut', '!=', 'annule')
                ->where('statut', '!=', 'termine')

                ->where('apointementsDate', '>=', Carbon::now())
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user', 'patient.user'])
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                        'service_nurse_id' => $appointment->service_nurse_id,
                        'service_name' => $appointment->serviceNurse->service->name ?? null,
                        'nurse_name' => ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . ($appointment->serviceNurse->nurse->user->last_name ?? ''),
                        'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                        'adress' => $appointment->adress,
                        'statut' => $appointment->statut,
                        'emergency_level' => $appointment->emergency_level,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($appointments->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun rendez-vous trouvé pour cet infirmier',
                ], 200);
            }

            return response()->json([
                'data' => $appointments,
                'message' => 'Rendez-vous récupérés avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getNurseAppointmentsTermine(Request $request): JsonResponse
    {
        try {
            // Récupérer l'ID de l'infirmier à partir du token JWT ou de la requête
            $nurse_id = JWTHelper::getNurseId($request) ?? $request->input("nurseId");
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Récupérer les rendez-vous associés à l'infirmier
            $appointments = Appointment::whereHas('serviceNurse', function ($query) use ($nurse_id) {
                $query->where('nurse_id', $nurse_id);
            })
                ->where('statut', '=', 'termine')
                ->with(['serviceNurse.service', 'serviceNurse.nurse.user', 'patient.user'])
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'patient_id' => $appointment->patient_id,
                        'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                        'service_nurse_id' => $appointment->service_nurse_id,
                        'service_name' => $appointment->serviceNurse->service->name ?? null,
                        'nurse_name' => ($appointment->serviceNurse->nurse->user->first_name ?? '') . ' ' . ($appointment->serviceNurse->nurse->user->last_name ?? ''),
                        'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                        'adress' => $appointment->adress,
                        'statut' => $appointment->statut,
                        'emergency_level' => $appointment->emergency_level,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            if ($appointments->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'Aucun rendez-vous trouvé pour cet infirmier',
                ], 200);
            }

            return response()->json([
                'data' => $appointments,
                'message' => 'Rendez-vous récupérés avec succès',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateStatusToConfirmed(Request $request): JsonResponse
    {
        try {
            // Retrieve nurse ID from JWT
            $nurse_id = JWTHelper::getNurseId($request);
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Retrieve appointment ID from cookie
            $appointment_id = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointment_id) {
                return response()->json([
                    'message' => 'ID du rendez-vous non fourni dans le cookie',
                ], 400);
            }

            // Find the appointment and verify it belongs to the nurse
            $appointment = Appointment::where('id', $appointment_id)
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->first();

            if (!$appointment) {
                return response()->json([
                    'message' => 'Rendez-vous non trouvé ou non associé à cet infirmier',
                ], 404);
            }

            // Check if the appointment is in a valid state to be confirmed
            if ($appointment->statut !== 'en_attente') {
                return response()->json([
                    'message' => 'Le rendez-vous ne peut pas être confirmé (statut non en_attente)',
                ], 400);
            }

            // Update the appointment status to confirme
            $appointment->statut = 'confirme';
            $appointment->save();

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'service_name' => $appointment->serviceNurse->service->name ?? null,
                    'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                ],
                'message' => 'Rendez-vous confirmé avec succès',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateStatusToTermine(Request $request): JsonResponse
    {
        try {
            // Retrieve nurse ID from JWT
            $nurse_id = JWTHelper::getNurseId($request);
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Retrieve appointment ID from cookie
            $appointment_id = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointment_id) {
                return response()->json([
                    'message' => 'ID du rendez-vous non fourni dans le cookie',
                ], 400);
            }

            // Find the appointment and verify it belongs to the nurse
            $appointment = Appointment::where('id', $appointment_id)
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->first();

            if (!$appointment) {
                return response()->json([
                    'message' => 'Rendez-vous non trouvé ou non associé à cet infirmier',
                ], 404);
            }

            // Check if the appointment is in a valid state to be confirmed
            if ($appointment->statut !== 'confirme') {
                return response()->json([
                    'message' => 'Le rendez-vous ne peut pas être terminé (statut non confirmé)',
                ], 400);
            }

            // Update the appointment status to confirme
            $appointment->statut = 'termine';
            $appointment->save();

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'service_name' => $appointment->serviceNurse->service->name ?? null,
                    'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                ],
                'message' => 'Rendez-vous confirmé avec succès',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateStatusToRefuse(Request $request): JsonResponse
    {
        try {
            // Retrieve nurse ID from JWT
            $nurse_id = JWTHelper::getNurseId($request);
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Retrieve appointment ID from cookie
            $appointment_id = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointment_id) {
                return response()->json([
                    'message' => 'ID du rendez-vous non fourni dans le cookie',
                ], 400);
            }

            // Find the appointment and verify it belongs to the nurse
            $appointment = Appointment::where('id', $appointment_id)
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->first();

            if (!$appointment) {
                return response()->json([
                    'message' => 'Rendez-vous non trouvé ou non associé à cet infirmier',
                ], 404);
            }
            // Update the appointment status to confirme
            $appointment->statut = 'refuse';
            $appointment->save();

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'service_name' => $appointment->serviceNurse->service->name ?? null,
                    'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                ],
                'message' => 'Rendez-vous confirmé avec succès',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateStatusToAnnule(Request $request): JsonResponse
    {
        try {
            // Retrieve nurse ID from JWT
            $nurse_id = JWTHelper::getNurseId($request);
            if (!$nurse_id) {
                return response()->json([
                    'message' => 'Utilisateur non authentifié ou infirmier non trouvé',
                ], 401);
            }

            // Retrieve appointment ID from cookie
            $appointment_id = $request->cookie('appointementId') ?? $request->input('appointementId');
            if (!$appointment_id) {
                return response()->json([
                    'message' => 'ID du rendez-vous non fourni dans le cookie',
                ], 400);
            }

            // Find the appointment and verify it belongs to the nurse
            $appointment = Appointment::where('id', $appointment_id)
                ->whereHas('serviceNurse', function ($query) use ($nurse_id) {
                    $query->where('nurse_id', $nurse_id);
                })
                ->first();

            if (!$appointment) {
                return response()->json([
                    'message' => 'Rendez-vous non trouvé ou non associé à cet infirmier',
                ], 404);
            }



            // Update the appointment status to confirme
            $appointment->statut = 'annule';
            $appointment->save();

            return response()->json([
                'data' => [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'service_nurse_id' => $appointment->service_nurse_id,
                    'service_name' => $appointment->serviceNurse->service->name ?? null,
                    'patient_name' => ($appointment->patient->user->first_name ?? '') . ' ' . ($appointment->patient->user->last_name ?? ''),
                    'apointementsDate' => $appointment->apointementsDate->format('Y-m-d H:i:s'),
                    'adress' => $appointment->adress,
                    'statut' => $appointment->statut,
                    'emergency_level' => $appointment->emergency_level,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $appointment->updated_at->format('Y-m-d H:i:s'),
                ],
                'message' => 'Rendez-vous confirmé avec succès',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du rendez-vous',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
