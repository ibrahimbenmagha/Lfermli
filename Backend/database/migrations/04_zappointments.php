<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration  
{
//table des rendez-vous
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->references('id')->on('patients');
            $table->foreignId('service_nurse_id')->references('id')->on('nurse_service');
            $table->dateTime('apointementsDate');
            $table->string('adress');

            // $table->string('type_soin', 100);
            $table->enum('statut', ['en_attente', 'confirme', 'annule', 'termine','refuse'])->default('en_attente');
            $table->enum('emergency_level', allowed: ['normal', 'urgent', 'super_urgent'])->default('normal');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('appointments');
    }
};