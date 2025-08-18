<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityByLabo;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Helpers\JwtHelper;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('auth:api', ['except' => ['login']]);
    // }




    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        $user = Auth::user();

        // Préparer les claims pour le token
        $claims = [
            'user.first_name' => $user->first_name,
            'user.last_name' => $user->last_name,
            'user.role' => $user->role,
        ];

        // Récupérer les informations spécifiques au rôle
        if ($user->role === 'nurse') {
            $nurse = DB::table('nurses')->where('user_id', $user->id)->first();
            $claims['nurse_id'] = $nurse ? $nurse->id : null;
        } elseif ($user->role === 'patient') {
            $patient = DB::table('patients')->where('user_id', $user->id)->first();
            $claims['patient_id'] = $patient ? $patient->id : null;
        } elseif ($user->role === 'admin') {
            // Pas de requête à la table admins
            $claims['admin_id'] = null; // Ou omettre cette clé si non nécessaire
        }

        // Générer un token personnalisé
        $customToken = auth()->claims($claims)->refresh();

        return response()->json([
            'role' => $user->role,
        ], 200)->cookie('access_token', $customToken, 240, '/', null, true, true);
    }




    public function loginPatient(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        $user = Auth::user();

        // Vérifier que l'utilisateur est un patient
        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Ce compte n\'est pas un compte patient'], 401);
        }

        // Préparer les claims pour le token
        $claims = [
            'user.first_name' => $user->first_name,
            'user.last_name' => $user->last_name,
            'user.role' => $user->role,
        ];

        // Ajouter l'ID patient
        $patient = DB::table('patients')->where('user_id', $user->id)->first();
        $claims['patient_id'] = $patient ? $patient->id : null;

        // Générer un token personnalisé
        $customToken = auth()->claims($claims)->refresh();

        return response()->json([
            'role' => $user->role,
        ], 200)->cookie('access_token', $customToken, 240, '/', null, true, true);
    }


    public function loginNurse(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        $user = Auth::user();

        // Vérifier que l'utilisateur est une infirmière
        if ($user->role !== 'nurse') {
            return response()->json(['error' => 'Ce compte n\'est pas un compte infirmière'], 401);
        }

        // Préparer les claims pour le token
        $claims = [
            'user.first_name' => $user->first_name,
            'user.last_name' => $user->last_name,
            'user.role' => $user->role,
        ];

        // Ajouter l'ID infirmière
        $nurse = DB::table('nurses')->where('user_id', $user->id)->first();
        $claims['nurse_id'] = $nurse ? $nurse->id : null;

        // Générer un token personnalisé
        $customToken = auth()->claims($claims)->refresh();

        return response()->json([
            'role' => $user->role,
        ], 200)->cookie('access_token', $customToken, 240, '/', null, true, true);
    }



    public function loginAdmin(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Identifiants incorrects'], 401);
        }

        $user = Auth::user();

        // Vérifier que l'utilisateur est un admin
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Ce compte n\'est pas un compte administrateur'], 401);
        }

        // Préparer les claims pour le token
        $claims = [
            'user.first_name' => $user->first_name,
            'user.last_name' => $user->last_name,
            'user.role' => $user->role,
            'admin_id' => null, // Pas de table spécifique pour admin
        ];

        // Générer un token personnalisé
        $customToken = auth()->claims($claims)->refresh();

        return response()->json([
            'role' => $user->role,
        ], 200)->cookie('access_token', $customToken, 240, '/', null, true, true);
    }


    public function checkAuth(Request $request)
    {
        try {
            $userData = JWTHelper::getTokenUserData($request);

            if (!$userData) {
                return response()->json([
                    'authenticated' => false,
                    'role' => null
                ]);
            }

            return response()->json([
                'authenticated' => true,
                'role' => $userData['user.role'] ?? null,
                // Ajoute d'autres informations si nécessaire
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'authenticated' => false,
                'role' => null,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }


    public function logout(Request $request)
    {
        try {
            // Récupérer et invalider le token
            $response = JwtHelper::expireToken($request);

            if ($response instanceof \Illuminate\Http\JsonResponse) {
                return $response;
            }

            return response()->json(['message' => 'Successfully logged out'], 200)
                ->cookie('access_token', '', -1, '/', null, true, true);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to logout, please try again. Error: ' . $e->getMessage()], 500);
        }
    }


}
