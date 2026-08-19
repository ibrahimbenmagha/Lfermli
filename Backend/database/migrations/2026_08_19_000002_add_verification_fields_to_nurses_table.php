<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('nurses', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('status');
            $table->string('license_number')->nullable()->after('is_verified');
            $table->string('diploma_document')->nullable()->after('license_number');
            $table->timestamp('verified_at')->nullable()->after('diploma_document');
        });
    }

    public function down()
    {
        Schema::table('nurses', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'license_number', 'diploma_document', 'verified_at']);
        });
    }
};
