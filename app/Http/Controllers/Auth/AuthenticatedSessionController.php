<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        // إنشاء توكن للمصادقة
        $token = $request->user()->createToken('auth-token')->plainTextToken;

        // الحصول على الرابط المطلوب من معلمة next أو من الجلسة
        $next = $request->query('next');
        $redirectUrl = $next ? '/' . ltrim($next, '/') : $request->session()->get('url.intended', route('games.choose'));

        // إذا كان الطلب AJAX، نعيد استجابة JSON
        if ($request->ajax()) {
            return response()->json([
                'token' => $token,
                'user' => $request->user(),
                'message' => 'تم تسجيل الدخول بنجاح',
                'redirect' => $redirectUrl
            ]);
        }

        // إعادة التوجيه العادية للطلبات العادية
        return redirect($redirectUrl);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): mixed
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // إذا كان الطلب AJAX، نعيد استجابة JSON
        if ($request->ajax()) {
            return response()->json([
                'message' => 'تم تسجيل الخروج بنجاح',
                'redirect' => '/'
            ]);
        }

        return redirect('/');
    }

    protected function redirectTo(): string
    {
        return route('games.choose');
    }
}
