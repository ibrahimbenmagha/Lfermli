<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Relations
     */
public function nurses()
{
    return $this->belongsToMany(Nurse::class, 'nurse_service');
}

}
