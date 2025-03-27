<?php

namespace App\Http\Controllers;

use App\Models\PointsBalance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * تسجيل مستخدم جديد (Register)
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'total_games' => 0,
            'wins' => 0,
            'losses' => 0,
            'draws' => 0,
            'current_streak' => 0,
            'highest_streak' => 0,
        ]);

        // إنشاء رصيد نقاط أولي للمستخدم
        PointsBalance::create([
            'user_id' => $user->id,
            'current_balance' => 0,
            'lifetime_earned' => 0,
        ]);

        // إنشاء توكن مصادقة
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'User registered successfully',
        ], 201);
    }

    /**
     * تسجيل الدخول (Login)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // محاولة المصادقة
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        // حذف التوكنات القديمة وإنشاء توكن جديد
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful',
        ]);
    }

    /**
     * تسجيل الخروج (Logout)
     */
    public function logout(Request $request)
    {
        // إلغاء التوكن الحالي
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * إعادة توجيه المستخدم إلى صفحة مصادقة Google
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * التعامل مع إعادة التوجيه من Google
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // البحث عن المستخدم باستخدام provider_id
            $user = User::where('provider_id', $googleUser->getId())
                        ->where('provider_name', 'google')
                        ->first();

            // إذا لم يكن المستخدم موجودًا، قم بإنشائه
            if (!$user) {
                // تحقق مما إذا كان البريد الإلكتروني مستخدمًا بالفعل
                $existingUser = User::where('email', $googleUser->getEmail())->first();
                
                if ($existingUser) {
                    // ربط حساب Google بالحساب الموجود
                    $existingUser->update([
                        'provider_name' => 'google',
                        'provider_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                    $user = $existingUser;
                } else {
                    // إنشاء مستخدم جديد
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'avatar' => $googleUser->getAvatar(),
                        'provider_name' => 'google',
                        'provider_id' => $googleUser->getId(),
                        'total_games' => 0,
                        'wins' => 0,
                        'losses' => 0,
                        'draws' => 0,
                        'current_streak' => 0,
                        'highest_streak' => 0,
                    ]);

                    // إنشاء رصيد نقاط أولي للمستخدم
                    PointsBalance::create([
                        'user_id' => $user->id,
                        'current_balance' => 0,
                        'lifetime_earned' => 0,
                    ]);
                }
            }

            // إنشاء توكن للمستخدم
            $token = $user->createToken('google-token')->plainTextToken;

            // للواجهات الأمامية (عند استخدام SPA أو تطبيق موبايل)
            return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/auth/callback?token=' . $token);
            
            // أو للتطبيقات الويب التقليدية
            // Auth::login($user);
            // return redirect()->route('home');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Google authentication failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * الحصول على بيانات المستخدم الحالي
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('pointsBalance')
        ]);
    }
}