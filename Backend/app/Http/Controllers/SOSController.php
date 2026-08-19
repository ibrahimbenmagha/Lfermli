<?php

namespace App\Http\Controllers;

use App\Models\SosAlert;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Helpers\JwtHelper;

class SOSController extends Controller
{
    /**
     * Trigger an SOS alert (Patient)
     */
    public function triggerSOS(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'notes' => 'nullable|string|max:500',
        ]);

        $patientId = JwtHelper::getUserId($request) ?? Auth::id();
        if (!$patientId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        // 1. Create the alert
        $alert = SosAlert::create([
            'patient_id' => $patientId,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'active',
            'notes' => $request->notes ?? 'Demande de soins d\'urgence immédiate',
        ]);

        // 2. Find nearest nurses (within 15km)
        // Haversine formula
        $nearestNurses = User::where('role', 'nurse')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('users.id', 'users.name', 'users.email', 'users.phone', 'users.latitude', 'users.longitude')
            ->selectRaw('(6371 * acos(least(1.0, greatest(-1.0, cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))))) AS distance', [
                $request->latitude,
                $request->longitude,
                $request->latitude
            ])
            ->having('distance', '<', 15)
            ->orderBy('distance')
            ->limit(10)
            ->get();

        return response()->json([
            'message' => 'Alerte SOS d\'urgence envoyée avec succès. Les infirmiers à proximité ont été alertés.',
            'alert' => $alert->load('patient'),
            'nearby_nurses_count' => $nearestNurses->count(),
            'nearest_nurses' => $nearestNurses
        ]);
    }

    /**
     * Get active SOS alerts (for nurses)
     */
    public function getActiveAlerts()
    {
        $alerts = SosAlert::with(['patient:id,name,email,phone', 'responder:id,name,phone'])
            ->whereIn('status', ['active', 'in_progress'])
            ->where('created_at', '>=', now()->subHours(12))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $alerts]);
    }

    /**
     * Accept SOS alert (Nurse takes charge)
     */
    public function acceptAlert(Request $request, $id)
    {
        $nurseUserId = JwtHelper::getUserId($request) ?? Auth::id();
        if (!$nurseUserId) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }

        $alert = SosAlert::findOrFail($id);
        if ($alert->status === 'resolved') {
            return response()->json(['message' => 'Cette alerte a déjà été résolue.'], 400);
        }

        $alert->update([
            'status' => 'in_progress',
            'responder_id' => $nurseUserId,
            'responded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Alerte prise en charge. Le patient a été notifié de votre arrivée.',
            'alert' => $alert->load(['patient', 'responder'])
        ]);
    }

    /**
     * Resolve SOS alert
     */
    public function resolveAlert(Request $request, $id)
    {
        $alert = SosAlert::findOrFail($id);
        
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'notes' => $request->input('notes', $alert->notes),
        ]);

        return response()->json([
            'message' => 'Intervention d\'urgence marquée comme terminée.',
            'alert' => $alert
        ]);
    }

    /**
     * Get patient active SOS status
     */
    public function getPatientActiveSOS(Request $request)
    {
        $patientId = JwtHelper::getUserId($request) ?? Auth::id();
        
        $alert = SosAlert::with('responder:id,name,phone')
            ->where('patient_id', $patientId)
            ->whereIn('status', ['active', 'in_progress'])
            ->latest()
            ->first();

        return response()->json([
            'active_alert' => $alert
        ]);
    }
}
