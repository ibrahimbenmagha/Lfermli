<?php


namespace App\Helpers;

use Illuminate\Http\Request;

class JWTHelper

{
    private static function parseToken($token)
    {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) != 3) {
            return null;
        }
        $payload = base64_decode(str_replace(
            ['-', '_'],
            ['+', '/'],
            $tokenParts[1]
        ));
        return json_decode($payload, true);
    }

    public static function getTokenUserData(Request $request)
    {
        try {
            if ($request === null) {
                $request = request();
            }

            $token = $request->cookie('access_token') ?? $request->bearerToken();
            if (!$token) {
                return null;
            }
            return self::parseToken($token);
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getNurseId(Request $request)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData['nurse_id'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }


    public static function getNuersFirst_name(Request $request)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["user.first_name"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
    public static function getUserId(Request $request)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["sub"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
    public static function getUserRole(Request $request)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["user.role"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getPatientId(Request $request)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["patient_id"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }
    public static function expireToken(Request $request)
    {
        try {
            if ($request === null) {
                $request = request();
            }
    
            $token = $request->cookie('access_token') ?? $request->bearerToken();
    
            if (!$token) {
                return response()->json(['error' => 'Token not found'], 400);
            }
    
            $payloadData = self::parseToken($token);
    
            if ($payloadData === null) {
                return response()->json(['error' => 'Invalid token format'], 400);
            }
    
            // Modification importante: invalider le token au lieu de le rafraîchir
            try {
                auth()->setToken($token)->invalidate(true);
            } catch (\Exception $e) {
                // Si l'invalidation échoue, on continue quand même
                // car nous allons supprimer le cookie client de toute façon
            }
    
            // Ne pas renvoyer de réponse ici, mais laisser logout() s'en charger
            return true;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to expire token: ' . $e->getMessage()], 500);
        }
    }
}