<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'city_id'];

    /**
     * Une zone appartient à une ville
     */
    public function city()
    {
        return $this->belongsTo(City::class, 'cityId');
    }

    /**
     * Une zone a plusieurs infirmiers (si besoin)
     */
    public function nurses()
    {
        return $this->hasMany(Nurse::class);
    }
}
