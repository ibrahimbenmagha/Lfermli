<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'role',
        'first_name',
        'last_name',
        'email',
        'nickname',
        'password',
        'phone_number',
        'latitude',
        'longitude',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Relations
     */
    public function nurse()
    {
        return $this->hasOne(Nurse::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function messagesSent()
    {
        return $this->hasMany(Message::class, 'id_expediteur');
    }

    public function messagesReceived()
    {
        return $this->hasMany(Message::class, 'id_destinataire');
    }

    /**
     * JWT Implementation
     */
    public function getJWTIdentifier()
    {
        return $this->getKey(); // id utilisateur
    }

    public function getJWTCustomClaims()
    {
        return []; // tu peux ajouter des données custom ici si nécessaire
    }
}
