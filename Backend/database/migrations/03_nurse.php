<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration  
{
    public function up()
    {
        Schema::create('nurses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users');
            // $table->foreignId('speciality_id')->references('id')->on('specialities');
            $table->foreignId('city_id')->references('id')->on('cities');
            $table->foreignId('zone_id')->references('id')->on('zones');
            $table->enum('status', ['activated','disabled'])->default('disabled');
            $table->float('note_over_5')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('nurses');
    }
};