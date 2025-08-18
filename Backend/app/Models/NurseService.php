<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Payment;
class NurseService extends Model
{
    use HasFactory;

    protected $table = 'nurse_service';

    protected $fillable = [
        'nurse_id',
        'service_id',
        'price',
    ];

    // Relation avec l'infirmier
    public function nurse()
    {
        return $this->belongsTo(Nurse::class);
    }

    // Relation avec le service
    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
