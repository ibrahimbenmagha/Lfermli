<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->string('blood_pressure')->nullable()->after('notes_infirmier');
            $table->integer('heart_rate')->nullable()->after('blood_pressure');
            $table->float('blood_sugar')->nullable()->after('heart_rate');
            $table->float('temperature')->nullable()->after('blood_sugar');
            $table->integer('oxygen_saturation')->nullable()->after('temperature');
        });
    }

    public function down()
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropColumn(['blood_pressure', 'heart_rate', 'blood_sugar', 'temperature', 'oxygen_saturation']);
        });
    }
};
