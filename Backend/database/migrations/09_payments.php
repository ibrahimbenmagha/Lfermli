<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration  
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment')->references('id')->on('appointments');
            $table->double('value');
            $table->enum('methode_paiement', ["cash", 'credit_card']);
            $table->enum('statut', ['Waiting', 'done'])->default('Waiting');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
  
  
    }
};