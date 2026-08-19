<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sos_alerts', function (Blueprint $table) {
            $table->foreignId('responder_id')->nullable()->after('status')->references('id')->on('users');
            $table->timestamp('responded_at')->nullable()->after('responder_id');
            $table->timestamp('resolved_at')->nullable()->after('responded_at');
            $table->text('notes')->nullable()->after('resolved_at');
        });
    }

    public function down()
    {
        Schema::table('sos_alerts', function (Blueprint $table) {
            $table->dropForeign(['responder_id']);
            $table->dropColumn(['responder_id', 'responded_at', 'resolved_at', 'notes']);
        });
    }
};
