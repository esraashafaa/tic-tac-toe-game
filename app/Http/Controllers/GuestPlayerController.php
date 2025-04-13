<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GuestPlayerController extends Controller
{
    public function login(Request $request)
    {
        Log::info('Guest login attempt started', ['request' => $request->all()]);

        try {
            // التحقق من البيانات
            $request->validate([
                'name' => 'required|string|max:255'
            ], [
                'name.required' => 'الرجاء إدخال اسم المستخدم',
                'name.max' => 'اسم المستخدم طويل جداً'
            ]);

            Log::info('Validation passed for guest login');

            // إنشاء مستخدم مؤقت
            $userData = [
                'name' => $request->name,
                'email' => 'guest_' . Str::random(10) . '@example.com',
                'password' => Hash::make(Str::random(16)),
                'is_guest' => true,
                'total_games' => 0,
                'wins' => 0,
                'losses' => 0,
                'draws' => 0,
                'current_streak' => 0,
                'highest_streak' => 0
            ];

            Log::info('Creating guest user', ['userData' => $userData]);
            
            $user = User::create($userData);
            Log::info('Guest user created', ['user' => $user]);

            // تسجيل الدخول
            Auth::login($user);
            Log::info('Guest user logged in', ['is_logged_in' => Auth::check()]);

            // إنشاء توكن مصادقة
            $token = $user->createToken('guest-token')->plainTextToken;
            Log::info('Guest token created', ['token' => $token]);

            // الحصول على الرابط المطلوب من معلمة next أو من الجلسة
            $next = $request->query('next');
            $redirectUrl = $next ? '/' . ltrim($next, '/') : $request->session()->get('url.intended', route('games.choose'));

            Log::info('Guest redirect URL', [
                'next_param' => $next,
                'redirect_url' => $redirectUrl
            ]);

            // إرجاع استجابة JSON للطلبات AJAX
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'user' => $user,
                    'token' => $token,
                    'message' => 'تم تسجيل الدخول بنجاح! مرحباً ' . $user->name,
                    'redirect' => $redirectUrl
                ]);
            }

            // إعادة التوجيه للطلبات العادية
            return redirect($redirectUrl)->with('success', 'تم تسجيل الدخول بنجاح! مرحباً ' . $user->name);
            
        } catch (\Exception $e) {
            Log::error('Guest login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // إرجاع استجابة JSON للطلبات AJAX
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'حدث خطأ أثناء تسجيل الدخول: ' . $e->getMessage()
                ], 422);
            }

            // إعادة التوجيه للطلبات العادية
            return back()->withErrors([
                'guest_error' => 'حدث خطأ أثناء تسجيل الدخول: ' . $e->getMessage()
            ])->withInput();
        }
    }
} 