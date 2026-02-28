<?php

namespace App\Http\Controllers;

use App\Models\NurseAvailability;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    /**
     * Set recurrent weekly schedule for a nurse
     */
    public function setWeeklySchedule(Request $request)
    {
        $request->validate([
            'schedules' => 'required|array',
            'schedules.*.day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
        ]);

        $nurseId = Auth::id();

        // Remove old weekly schedule
        NurseAvailability::where('nurse_id', $nurseId)->whereNotNull('day_of_week')->delete();

        foreach ($request->schedules as $sched) {
            NurseAvailability::create([
                'nurse_id' => $nurseId,
                'day_of_week' => $sched['day_of_week'],
                'start_time' => $sched['start_time'],
                'end_time' => $sched['end_time'],
            ]);
        }

        return response()->json(['message' => 'Emploi du temps mis à jour avec succès']);
    }

    /**
     * Get available slots for a nurse on a specific date
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'nurse_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $nurseId = $request->nurse_id;
        $date = Carbon::parse($request->date);
        $dayName = strtolower($date->format('l'));

        // 1. Get base availability for that day
        $availabilities = NurseAvailability::where('nurse_id', $nurseId)
            ->where(function($query) use ($dayName, $date) {
                $query->where('day_of_week', $dayName)
                      ->orWhere('specific_date', $date->toDateString());
            })
            ->where('is_available', true)
            ->get();

        if ($availabilities->isEmpty()) {
            return response()->json(['data' => []]);
        }

        // 2. Get existing appointments for that day to exclude them
        $appointments = Appointment::where('service_nurse_id', $nurseId)
            ->whereDate('apointementsDate', $date->toDateString())
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->get();

        $slots = [];
        $slotDuration = 60; // 60 minutes slots

        foreach ($availabilities as $avail) {
            $start = Carbon::parse($avail->start_time);
            $end = Carbon::parse($avail->end_time);

            while ($start->copy()->addMinutes($slotDuration)->lte($end)) {
                $slotStart = $start->format('H:i');
                $slotEnd = $start->copy()->addMinutes($slotDuration)->format('H:i');
                
                // Check if slot is taken
                $isOccupied = $appointments->contains(function ($appt) use ($date, $slotStart) {
                    return Carbon::parse($appt->apointementsDate)->format('H:i') === $slotStart;
                });

                if (!$isOccupied) {
                    // Check if it's in the past (if date is today)
                    if ($date->isToday()) {
                        if (Carbon::parse($slotStart)->gt(now())) {
                            $slots[] = $slotStart;
                        }
                    } else {
                        $slots[] = $slotStart;
                    }
                }
                
                $start->addMinutes($slotDuration);
            }
        }

        return response()->json(['data' => array_unique($slots)]);
    }

    /**
     * Add a specific date availability (one-off)
     */
    public function setSpecificAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        NurseAvailability::create([
            'nurse_id' => Auth::id(),
            'specific_date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
        ]);

        return response()->json(['message' => 'Disponibilité ponctuelle ajoutée']);
    }
}
