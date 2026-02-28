<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the users table with role-based access control.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // Primary key
            $table->id();
            
            // Role-based access control
            $table->enum('role', ['patient', 'nurse', 'admin'])
                ->default('patient')
                ->comment('User role for access control');
            
            // Personal information
            $table->string('first_name', 100)->index();
            $table->string('last_name', 100)->index();
            
            // Authentication and contact
            $table->string('email', 255)->unique();
            $table->string('phone_number')->nullable()->index();
            $table->string('nickname', 20)->unique();
            $table->string('password', 255);
            
            // Timestamps
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['role', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     * Drops the users table.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
