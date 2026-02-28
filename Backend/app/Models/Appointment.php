<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient;
use App\Models\NurseService;
use App\Models\MedicalRecord;
use App\Models\Payment;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'apointementsDate',
        'service_nurse_id',
        'statut',
        'emergency_level',
        'adress',
    ];

    protected $casts = [
        'apointementsDate' => 'datetime',
        'statut' => 'string',
        'emergency_level' => 'string',
    ];

    /**
     * Relations
     */

    // Rendez-vous appartient à un patient
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    // Rendez-vous appartient à une association service-infirmier
    public function serviceNurse()
    {
        return $this->belongsTo(NurseService::class, 'service_nurse_id');
    }

    // Rendez-vous a un dossier médical
    public function medicalRecord()
    {
        return $this->hasOne(MedicalRecord::class);
    }

    // Rendez-vous a plusieurs paiements (si besoin)
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Rendez-vous a une facture
    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
}