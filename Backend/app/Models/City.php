<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Une ville a plusieurs zones
     */
    public function zones()
    {
        return $this->hasMany(Zone::class, 'cityId');
    }

    /**
     * Une ville a plusieurs infirmiers (si besoin)
     */
    public function nurses()
    {
        return $this->hasMany(Nurse::class);
    }
}
