<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Helpers\JwtHelper;

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * 
 * This middleware validates the user's JWT token and verifies that their role
 * is among the allowed roles for the requested route.
 */
class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Request  $request  The incoming HTTP request
     * @param  Closure  $next     The next middleware in the pipeline
     * @param  string   ...$roles The allowed roles for this route
     * @return Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $userData = JwtHelper::getTokenUserData($request);

        if (!$userData) {
            return $this->unauthorizedResponse('Authentification requise');
        }

        $userRole = JwtHelper::getUserRole($request);

        if (!$this->hasAuthorizedRole($userRole, $roles)) {
            return $this->forbiddenResponse($userRole, $roles);
        }

        $request->merge(['userData' => $userData]);

        return $next($request);
    }

    /**
     * Check if the user has one of the authorized roles.
     *
     * @param  string|null  $userRole  The user's current role
     * @param  array        $roles     The list of allowed roles
     * @return bool
     */
    private function hasAuthorizedRole(?string $userRole, array $roles): bool
    {
        return $userRole !== null && in_array($userRole, $roles, true);
    }

    /**
     * Return an unauthorized (401) response.
     *
     * @param  string  $message  The error message
     * @return JsonResponse
     */
    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'error' => $message,
            'authenticated' => false,
        ], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Return a forbidden (403) response.
     *
     * @param  string|null  $userRole  The user's current role
     * @param  array        $roles     The list of allowed roles
     * @return JsonResponse
     */
    private function forbiddenResponse(?string $userRole, array $roles): JsonResponse
    {
        return response()->json([
            'error' => 'Accès non autorisé',
            'authenticated' => false,
            'role' => $userRole,
            'required_roles' => $roles,
        ], Response::HTTP_FORBIDDEN);
    }
}