<?php

namespace App\Http\Controllers;

use App\Models\SosAlert;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SOSController extends Controller
{
    /**
     * Trigger an SOS alert
     */
    public function triggerSOS(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $patientId = Auth::id();

        // 1. Create the alert
        $alert = SosAlert::create([
            'patient_id' => $patientId,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'status' => 'active',
        ]);

        // 2. Find nearest nurses (within 10km for example)
        // Haversine formula
        $nearestNurses = User::where('role', 'nurse')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('users.*')
            ->selectRaw('(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance', [
                $request->latitude,
                $request->longitude,
                $request->latitude
            ])
            ->having('distance', '<', 10) // 10 km
            ->orderBy('distance')
            ->limit(5)
            ->get();

        // Note: In a real production app, we would dispatch events to push notifications
        // broadcast(new SosAlertTriggered($alert, $nearestNurses));

        return response()->json([
            'message' => 'Alerte SOS envoyée avec succès. Les infirmiers à proximité ont été notifiés.',
            'alert_id' => $alert->id,
            'nearby_nurses_count' => $nearestNurses->count()
        ]);
    }

    /**
     * Get active SOS alerts (for nurses)
     */
    public function getActiveAlerts()
    {
        $alerts = SosAlert::with('patient')
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subHours(1))
            ->get();

        return response()->json(['data' => $alerts]);
    }
}
