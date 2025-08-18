<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Http\Request;
use App\Models\Service;
use App\Models\Nurse;

use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{

    public function CreateService(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|unique:services,name|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation échouée',
                    'errors' => $validator->errors()
                ], 422);
            }

            $service = Service::create([
                'name' => $request->name
            ]);

            return response()->json([
                'message' => 'Service créé avec succès',
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du service',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function GetServiceById($id)
    {
        try {
            $service = Service::find($id);

            if (!$service) {
                return response()->json([
                    'message' => 'Service non trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Service récupéré avec succès',
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'created_at' => $service->created_at,
                    'updated_at' => $service->updated_at
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération du service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

 
    public function GetAllServices()
    {
        try {
            $services = Service::select('id', 'name', 'created_at', 'updated_at')->get();

            if ($services->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun service trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Services récupérés avec succès',
                'data' => $services
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des services',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function GetAllCities()
    {
        try {
            $Cities = City::select('id', 'name', 'created_at', 'updated_at')->get();

            if ($Cities->isEmpty()) {
                return response()->json([
                    'message' => 'Aucune ville trouvé'
                ], 404);
            }

            return response()->json([
                'message' => 'Villes récupérés avec succès',
                'data' => $Cities
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des villesS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function GetAllZones()
    {
        try {
            $zones = Zone::select('id', 'name', 'created_at', 'city_id')->get();

            if ($zones->isEmpty()) {
                return response()->json([
                    'message' => 'Aucune zonne trouvée'
                ], 404);
            }

            return response()->json([
                'message' => 'Zones récupérées avec succès',
                'data' => $zones
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des zones',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function GetServiceByNurse($nurse_id)
    {
        try {
            $nurse = Nurse::find($nurse_id);

            if (!$nurse) {
                return response()->json([
                    'message' => 'Infirmier non trouvé'
                ], 404);
            }

            $services = DB::table('services')
                ->join('nurse_service', 'services.id', '=', 'nurse_service.service_id')
                ->where('nurse_service.nurse_id', $nurse_id)
                ->select('services.id', 'services.name', 'services.created_at', 'services.updated_at')
                ->get();

            if ($services->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun service associé à cet infirmier'
                ], 404);
            }

            return response()->json([
                'message' => 'Services récupérés avec succès',
                'data' => $services
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des services',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
?>