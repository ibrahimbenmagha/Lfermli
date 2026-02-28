<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NurseAvailability extends Model
{
    protected $fillable = [
        'nurse_id',
        'day_of_week',
        'start_time',
        'end_time',
        'specific_date',
        'is_available'
    ];

    public function nurse()
    {
        return $this->belongsTo(User::class, 'nurse_id');
    }
}
