<?php








return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://127.0.0.1:9090'], // frontend React local sur port 9090
    'allowed_headers' => ['*'],
    'supports_credentials' => true, // nécessaire pour cookies <httponly></httponly>
];
