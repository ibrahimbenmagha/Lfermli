<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;
use App\Helpers\JwtHelper;

/**
 * AuthController
 * 
 * Handles user authentication operations including login, logout, 
 * token refresh, and authentication status checks for different 
 * user roles (admin, nurse, patient).
 */
class AuthController extends Controller
{
    // Cookie configuration constants
    private const TOKEN_COOKIE_NAME = 'access_token';
    private const TOKEN_COOKIE_MINUTES = 240;
    private const TOKEN_COOKIE_PATH = '/';

    // User roles
    private const ROLE_ADMIN = 'admin';
    private const ROLE_NURSE = 'nurse';
    private const ROLE_PATIENT = 'patient';

    // Token type
    private const TOKEN_TYPE_BEARER = 'bearer';

    /**
     * Role-specific table and ID field mappings.
     */
    private const ROLE_CONFIG = [
        self::ROLE_NURSE => [
            'table' => 'nurses',
            'id_field' => 'nurse_id',
            'error_message' => "Ce compte n'est pas un compte infirmière",
        ],
        self::ROLE_PATIENT => [
            'table' => 'patients',
            'id_field' => 'patient_id',
            'error_message' => "Ce compte n'est pas un compte patient",
        ],
        self::ROLE_ADMIN => [
            'table' => null,
            'id_field' => 'admin_id',
            'error_message' => "Ce compte n'est pas un compte administrateur",
        ],
    ];

    /**
     * Generic login for any user role.
     *
     * @param Request $request The HTTP request containing credentials
     * @return JsonResponse JSON response with authentication result
     */
    public function login(Request $request): JsonResponse
    {
        return $this->performLogin($request);
    }

    /**
     * Login specifically for patient users.
     *
     * @param Request $request The HTTP request containing credentials
     * @return JsonResponse JSON response with authentication result
     */
    public function loginPatient(Request $request): JsonResponse
    {
        return $this->performLogin($request, self::ROLE_PATIENT);
    }

    /**
     * Login specifically for nurse users.
     *
     * @param Request $request The HTTP request containing credentials
     * @return JsonResponse JSON response with authentication result
     */
    public function loginNurse(Request $request): JsonResponse
    {
        return $this->performLogin($request, self::ROLE_NURSE);
    }

    /**
     * Login specifically for admin users.
     *
     * @param Request $request The HTTP request containing credentials
     * @return JsonResponse JSON response with authentication result
     */
    public function loginAdmin(Request $request): JsonResponse
    {
        return $this->performLogin($request, self::ROLE_ADMIN);
    }

    /**
     * Check if the current request is authenticated.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with authentication status
     */
    public function checkAuth(Request $request): JsonResponse
    {
        try {
            $userData = JwtHelper::getTokenUserData($request);

            if (!$userData) {
                return $this->authStatusResponse(false);
            }

            return $this->authStatusResponse(true, $userData['user.role'] ?? null);
        } catch (\Exception $e) {
            return $this->authStatusResponse(false, null, $e->getMessage());
        }
    }

    /**
     * Get the authenticated user's information.
     *
     * @return JsonResponse JSON response with user data
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return $this->unauthorizedResponse('Non authentifié');
        }

        return $this->successResponse($user, 'Informations utilisateur récupérées');
    }

    /**
     * Refresh the authentication token.
     *
     * @return JsonResponse JSON response with new token
     */
    public function refresh(): JsonResponse
    {
        try {
            $newToken = auth()->refresh();
            return $this->respondWithToken($newToken);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Impossible de rafraîchir le token',
                Response::HTTP_UNAUTHORIZED
            );
        }
    }

    /**
     * Log the user out and invalidate the token.
     *
     * @param Request $request The HTTP request
     * @return JsonResponse JSON response with logout confirmation
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $response = JwtHelper::expireToken($request);

            if ($response instanceof JsonResponse) {
                return $response;
            }

            return response()
                ->json([
                    'success' => true,
                    'message' => 'Déconnexion réussie'
                ], Response::HTTP_OK)
                ->cookie(
                    self::TOKEN_COOKIE_NAME,
                    '',
                    -1,
                    self::TOKEN_COOKIE_PATH,
                    null,
                    true,
                    true
                );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Échec de la déconnexion: ' . $e->getMessage(),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    // =========================================================================
    // Private Helper Methods
    // =========================================================================

    /**
     * Perform the login operation with optional role restriction.
     *
     * @param Request $request The HTTP request containing credentials
     * @param string|null $requiredRole If set, validates user has this role
     * @return JsonResponse JSON response with authentication result
     */
    private function performLogin(Request $request, ?string $requiredRole = null): JsonResponse
    {
        // Validate credentials
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors());
        }

        $credentials = $request->only(['email', 'password']);

        if (!auth()->attempt($credentials)) {
            return $this->unauthorizedResponse('Identifiants incorrects');
        }

        $user = Auth::user();

        // Validate role if a specific role is required
        if ($requiredRole !== null && $user->role !== $requiredRole) {
            // Logout the user since they don't have the correct role
            auth()->logout();
            
            $errorMessage = self::ROLE_CONFIG[$requiredRole]['error_message'] ?? 'Rôle non autorisé';
            return $this->unauthorizedResponse($errorMessage);
        }

        try {
            $claims = $this->buildTokenClaims($user);
            $customToken = auth()->claims($claims)->refresh();

            return $this->generateTokenResponse($user->role, $customToken);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Erreur lors de la génération du token',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Build the JWT claims array for a user.
     *
     * @param mixed $user The authenticated user
     * @return array JWT claims array
     */
    private function buildTokenClaims($user): array
    {
        $claims = [
            'user.first_name' => $user->first_name,
            'user.last_name' => $user->last_name,
            'user.role' => $user->role,
        ];

        // Add role-specific ID to claims
        $roleSpecificId = $this->getRoleSpecificId($user);
        if ($roleSpecificId !== null) {
            $idField = self::ROLE_CONFIG[$user->role]['id_field'] ?? null;
            if ($idField) {
                $claims[$idField] = $roleSpecificId;
            }
        }

        return $claims;
    }

    /**
     * Get the role-specific ID for a user (nurse_id, patient_id, etc.).
     *
     * @param mixed $user The authenticated user
     * @return int|null Role-specific ID or null
     */
    private function getRoleSpecificId($user): ?int
    {
        $config = self::ROLE_CONFIG[$user->role] ?? null;

        if (!$config || !$config['table']) {
            return null;
        }

        $record = DB::table($config['table'])
            ->where('user_id', $user->id)
            ->first();

        return $record?->id;
    }

    /**
     * Generate a successful login response with token cookie.
     *
     * @param string $role User's role
     * @param string $token JWT authentication token
     * @return JsonResponse JSON response with role and token cookie
     */
    private function generateTokenResponse(string $role, string $token): JsonResponse
    {
        return response()
            ->json([
                'success' => true,
                'role' => $role,
                'message' => 'Connexion réussie'
            ], Response::HTTP_OK)
            ->cookie(
                self::TOKEN_COOKIE_NAME,
                $token,
                self::TOKEN_COOKIE_MINUTES,
                self::TOKEN_COOKIE_PATH,
                null,
                true,  // secure
                true   // httpOnly
            );
    }

    /**
     * Generate an authentication status response.
     *
     * @param bool $authenticated Whether the user is authenticated
     * @param string|null $role User's role if authenticated
     * @param string|null $error Error message if any
     * @return JsonResponse JSON response with authentication status
     */
    private function authStatusResponse(bool $authenticated, ?string $role = null, ?string $error = null): JsonResponse
    {
        $response = [
            'authenticated' => $authenticated,
            'role' => $role,
        ];

        if ($error !== null) {
            $response['error'] = $error;
        }

        return response()->json($response);
    }

    /**
     * Generate a token response with metadata.
     *
     * @param string $token JWT authentication token
     * @return JsonResponse JSON response with token details
     */
    private function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            'success' => true,
            'access_token' => $token,
            'token_type' => self::TOKEN_TYPE_BEARER,
            'expires_in' => auth()->factory()->getTTL() * 60,
        ]);
    }

    /**
     * Return a standardized success response.
     *
     * @param mixed $data Response data
     * @param string $message Success message
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    private function successResponse($data, string $message, int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $statusCode);
    }

    /**
     * Return a standardized error response.
     *
     * @param string $message Error message
     * @param int $statusCode HTTP status code
     * @return JsonResponse
     */
    private function errorResponse(string $message, int $statusCode): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], $statusCode);
    }

    /**
     * Return a validation error response.
     *
     * @param mixed $errors Validation errors
     * @return JsonResponse
     */
    private function validationErrorResponse($errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Erreur de validation',
            'errors' => $errors,
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Return an unauthorized response.
     *
     * @param string $message Error message
     * @return JsonResponse
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], Response::HTTP_UNAUTHORIZED);
    }
}
