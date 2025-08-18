<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Contracts\Console\Kernel;

$kernel = $app->make(Kernel::class);

try {
    $status = $kernel->call('db:seed', [
        '--class' => 'DatabaseSeeder',
        '--force' => true // Nécessaire en production
    ]);

    echo "<h3>Commande exécutée : php artisan db:seed --class=DatabaseSeeder</h3>";
    echo "<pre>" . $kernel->output() . "</pre>";
} catch (Exception $e) {
    echo "<strong>Erreur :</strong> " . $e->getMessage();
}
