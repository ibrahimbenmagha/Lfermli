<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'prescriptions',
        'resultats_tests',
        'notes_infirmier',
        'blood_pressure',
        'heart_rate',
        'blood_sugar',
        'temperature',
        'oxygen_saturation',
    ];

    /**
     * Relations
     */

    // Dossier médical appartient à un rendez-vous
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
