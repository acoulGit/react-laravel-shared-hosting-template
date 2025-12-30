<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Map Authorization header on some Apache/shared hosting setups.
 * Ensures Laravel can read Bearer tokens via $request->bearerToken().
 */
class MapAuthHeader
{
    public function handle(Request $request, Closure $next)
    {
        // Some servers place Authorization header in alternate keys
        $auth = $request->server('HTTP_AUTHORIZATION')
            ?? $request->server('REDIRECT_HTTP_AUTHORIZATION')
            ?? null;

        if ($auth && !$request->headers->has('Authorization')) {
            $request->headers->set('Authorization', $auth);
        }

        return $next($request);
    }
}
