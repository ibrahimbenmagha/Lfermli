<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
     
    ];

    /**
     * Relations
     */

    // Patient appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Patient a plusieurs rendez-vous
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
