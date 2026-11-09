<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class JWTHelper
{
    /**
     * Get validated user payload data from the JWT token.
     * Cryptographically validates HMAC signature, claims, and expiration.
     */
    public static function getTokenUserData(?Request $request = null)
    {
        try {
            if ($request === null) {
                $request = request();
            }

            $token = $request->cookie('access_token') ?? $request->bearerToken();
            if (!$token) {
                return null;
            }

            try {
                // Cryptographically verify token signature and validity
                if (auth('api')->setToken($token)->check()) {
                    $payload = auth('api')->setToken($token)->getPayload();
                    return $payload ? $payload->toArray() : null;
                }
            } catch (JWTException $e) {
                // Invalid signature, expired, or malformed
                return null;
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getNurseId(?Request $request = null)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData['nurse_id'] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getNuersFirst_name(?Request $request = null)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["user.first_name"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getUserId(?Request $request = null)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["sub"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getUserRole(?Request $request = null)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["user.role"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function getPatientId(?Request $request = null)
    {
        try {
            $userData = self::getTokenUserData($request);
            return $userData["patient_id"] ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function expireToken(?Request $request = null)
    {
        try {
            if ($request === null) {
                $request = request();
            }

            $token = $request->cookie('access_token') ?? $request->bearerToken();

            if (!$token) {
                return response()->json(['error' => 'Token not found'], 400);
            }

            try {
                auth('api')->setToken($token)->invalidate(true);
            } catch (\Exception $e) {
                // Continue to allow cookie clearing even if already expired
            }

            return true;
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to expire token: ' . $e->getMessage()], 500);
        }
    }
}
