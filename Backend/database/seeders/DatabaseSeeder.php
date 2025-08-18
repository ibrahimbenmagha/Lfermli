<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Désactiver les contraintes de clés étrangères
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Vider les tables dans l'ordre inverse des dépendances
        DB::table('appointments')->truncate();
        DB::table('nurse_service')->truncate();
        DB::table('nurses')->truncate();
        DB::table('patients')->truncate();
        DB::table('users')->truncate();
        DB::table('services')->truncate();
        DB::table('zones')->truncate();
        DB::table('cities')->truncate();

        // Réactiver les contraintes de clés étrangères
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Cities
        DB::table('cities')->insert([
            ['id' => 1, 'name' => 'Casablanca', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Rabat', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Marrakech', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Fès', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Tanger', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Zones
// Zones
DB::table('zones')->insert([
    ['id' => 1, 'name' => 'Maarif', 'city_id' => 1, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 2, 'name' => 'Gauthier', 'city_id' => 1, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 3, 'name' => 'Agdal', 'city_id' => 2, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 4, 'name' => 'Hay Riad', 'city_id' => 2, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 5, 'name' => 'Gueliz', 'city_id' => 3, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 6, 'name' => 'Ain Diab', 'city_id' => 1, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 7, 'name' => 'Oasis', 'city_id' => 1, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 8, 'name' => 'Yacoub El Mansour', 'city_id' => 2, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 9, 'name' => 'Souissi', 'city_id' => 2, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 10, 'name' => 'Daoudiate', 'city_id' => 3, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 11, 'name' => 'Sidi Boujida', 'city_id' => 4, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 12, 'name' => 'Ziat', 'city_id' => 4, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 13, 'name' => 'Malabata', 'city_id' => 5, 'created_at' => now(), 'updated_at' => now()],
    ['id' => 14, 'name' => 'Iberia', 'city_id' => 5, 'created_at' => now(), 'updated_at' => now()],
]);


        // Services
        DB::table('services')->insert([
            ['id' => 1, 'name' => 'Prélèvement sanguin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Soin diabétique', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Injection intramusculaire', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Change de pansement', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Surveillance tension artérielle', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Users
        DB::table('users')->insert([
            // Admins
            ['id' => 1, 'role' => 'admin', 'first_name' => 'Admin', 'last_name' => 'One', 'email' => 'admin1@example.com', 'nickname' => 'adminone', 'phone_number' => '0600000001', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'role' => 'admin', 'first_name' => 'Admin', 'last_name' => 'Two', 'email' => 'admin2@example.com', 'nickname' => 'admintwo', 'phone_number' => '0600000002', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'role' => 'admin', 'first_name' => 'Admin', 'last_name' => 'Three', 'email' => 'admin3@example.com', 'nickname' => 'adminthree', 'phone_number' => '0600000003', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            // Nurses
            ['id' => 4, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Alpha', 'email' => 'nurse1@example.com', 'nickname' => 'nursealpha', 'phone_number' => '0612345671', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Beta', 'email' => 'nurse2@example.com', 'nickname' => 'nursebeta', 'phone_number' => '0612345672', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Gamma', 'email' => 'nurse3@example.com', 'nickname' => 'nursegamma', 'phone_number' => '0612345673', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Delta', 'email' => 'nurse4@example.com', 'nickname' => 'nursedelta', 'phone_number' => '0612345674', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Epsilon', 'email' => 'nurse5@example.com', 'nickname' => 'nurseepsilon', 'phone_number' => '0612345675', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Zeta', 'email' => 'nurse6@example.com', 'nickname' => 'nursezeta', 'phone_number' => '0612345676', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Eta', 'email' => 'nurse7@example.com', 'nickname' => 'nurseeta', 'phone_number' => '0612345677', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'role' => 'nurse', 'first_name' => 'Infirmier', 'last_name' => 'Theta', 'email' => 'nurse8@example.com', 'nickname' => 'nursetheta', 'phone_number' => '0612345678', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            // Patients
            ['id' => 12, 'role' => 'patient', 'first_name' => 'Patient', 'last_name' => 'One', 'email' => 'patient1@example.com', 'nickname' => 'patientone', 'phone_number' => '0623456781', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'role' => 'patient', 'first_name' => 'Patient', 'last_name' => 'Two', 'email' => 'patient2@example.com', 'nickname' => 'patienttwo', 'phone_number' => '0623456782', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'role' => 'patient', 'first_name' => 'Patient', 'last_name' => 'Three', 'email' => 'patient3@example.com', 'nickname' => 'patientthree', 'phone_number' => '0623456783', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'role' => 'patient', 'first_name' => 'Patient', 'last_name' => 'Four', 'email' => 'patient4@example.com', 'nickname' => 'patientfour', 'phone_number' => '0623456784', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'role' => 'patient', 'first_name' => 'Patient', 'last_name' => 'Five', 'email' => 'patient5@example.com', 'nickname' => 'patientfive', 'phone_number' => '0623456785', 'password' => Hash::make('password123'), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Nurses (avec champ status)
        DB::table('nurses')->insert([
            ['id' => 1, 'user_id' => 4, 'city_id' => 1, 'zone_id' => 1, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'user_id' => 5, 'city_id' => 1, 'zone_id' => 2, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'user_id' => 6, 'city_id' => 2, 'zone_id' => 3, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'user_id' => 7, 'city_id' => 2, 'zone_id' => 4, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'user_id' => 8, 'city_id' => 3, 'zone_id' => 5, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'user_id' => 9, 'city_id' => 4, 'zone_id' => 1, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'user_id' => 10, 'city_id' => 5, 'zone_id' => 1, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'user_id' => 11, 'city_id' => 1, 'zone_id' => 1, 'status' => 'activated', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Patients
        DB::table('patients')->insert([
            ['id' => 1, 'user_id' => 12, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'user_id' => 13, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'user_id' => 14, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'user_id' => 15, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'user_id' => 16, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // NurseService
        DB::table('nurse_service')->insert([
            ['nurse_id' => 1, 'service_id' => 1, 'price' => 100.00, 'created_at' => now(), 'updated_at' => now()],
            ['nurse_id' => 1, 'service_id' => 2, 'price' => 150.00, 'created_at' => now(), 'updated_at' => now()],
            ['nurse_id' => 2, 'service_id' => 1, 'price' => 120.00, 'created_at' => now(), 'updated_at' => now()],
            ['nurse_id' => 2, 'service_id' => 3, 'price' => 80.00, 'created_at' => now(), 'updated_at' => now()],
            ['nurse_id' => 3, 'service_id' => 4, 'price' => 90.00, 'created_at' => now(), 'updated_at' => now()],
            ['nurse_id' => 4, 'service_id' => 5, 'price' => 110.00, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Appointments (commentés)
        // DB::table('appointments')->insert([
        //     ['id' => 1, 'nurse_id' => 1, 'patient_id' => 5, 'service_id' => 1, 'appointment_date' => '2025-07-04 10:00:00', 'status' => 'scheduled', 'created_at' => now(), 'updated_at' => now()],
        // ]);
    }
}
