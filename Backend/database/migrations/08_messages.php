<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration  
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_expediteur')->references('id')->on('users');
            $table->foreignId('id_destinataire')->references('id')->on('users');
            $table->text('contenu');
            $table->enum('statut', ['lu', 'non_lu'])->default('non_lu');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
};