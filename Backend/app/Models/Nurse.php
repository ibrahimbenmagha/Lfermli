<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nurse extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'city_id',
        'zone_id',
        'note_over_5',
        'status',
        'is_verified',
        'license_number',
        'diploma_document',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    /**
     * Relations  fiin wslty?
     */

    // L'infirmier appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // L'infirmier appartient à une ville
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    // L'infirmier appartient à une zone
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    // L'infirmier peut proposer plusieurs services
public function services()
{
    return $this->belongsToMany(Service::class, 'nurse_service');
}


    // L'infirmier a plusieurs rendez-vous
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    // L'infirmier a plusieurs dossiers médicaux via ses rendez-vous (si nécessaire)
    public function medicalRecords()
    {
        return $this->hasManyThrough(MedicalRecord::class, Appointment::class);
    }
}
