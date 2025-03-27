<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            // حفظ الرابط المطلوب في الجلسة
            $request->session()->put('url.intended', $request->path());
            
            if ($request->is('api/*')) {
                return response()->json(['message' => 'غير مصرح'], 401);
            }
            // إضافة next parameter إلى URL تسجيل الدخول
            return route('login', ['next' => $request->path()]);
        }
    }

    protected function authenticate($request, array $guards)
    {
        if (empty($guards)) {
            $guards = [null];
        }

        foreach ($guards as $guard) {
            if ($this->auth->guard($guard)->check()) {
                return $this->auth->shouldUse($guard);
            }
        }

        // التحقق من التوكن في الطلب
        if ($request->bearerToken()) {
            $user = \App\Models\User::where('token', $request->bearerToken())->first();
            if ($user) {
                $this->auth->setUser($user);
                return;
            }
        }

        $this->unauthenticated($request, $guards);
    }
}
