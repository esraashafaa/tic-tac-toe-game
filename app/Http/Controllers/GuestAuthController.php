<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class GuestAuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'بيانات غير صالحة', 'errors' => $validator->errors()], 422);
        }

        // تسجيل معلومات الطلب
        Log::info('تسجيل دخول كضيف - بداية', [
            'name' => $request->name,
            'has_next_param' => $request->has('next'),
            'next_param' => $request->query('next'),
            'request_url' => $request->url(),
            'full_url' => $request->fullUrl()
        ]);

        // إنشاء مستخدم جديد كضيف
        $user = User::create([
            'name' => $request->name,
            'email' => 'guest_' . Str::random(10) . '@example.com',
            'password' => Hash::make(Str::random(16)),
            'is_guest' => true,
        ]);

        // إنشاء توكن للمصادقة
        $token = $user->createToken('guest-token')->plainTextToken;

        // الحصول على الرابط المطلوب من معلمة next أو من الجلسة
        $next = $request->query('next');
        $redirectUrl = $next ? '/' . ltrim($next, '/') : $request->session()->get('url.intended', route('games.choose'));
        
        // تسجيل معلومات إعادة التوجيه
        Log::info('تسجيل دخول كضيف - إعادة التوجيه', [
            'next_param' => $next,
            'redirect_url' => $redirectUrl,
            'session_intended' => $request->session()->get('url.intended'),
            'user_id' => $user->id
        ]);

        // تسجيل دخول المستخدم
        Auth::login($user);

        return response()->json([
            'token' => $token,
            'user' => $user,
            'message' => 'تم تسجيل الدخول كضيف بنجاح',
            'redirect' => $redirectUrl
        ], 200);
    }

    public function logout(Request $request)
    {
        try {
            // حذف التوكن الحالي
            $request->user()->currentAccessToken()->delete();

            Log::info('تم تسجيل خروج المستخدم الضيف بنجاح', [
                'user_id' => $request->user()->id,
                'name' => $request->user()->name
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الخروج بنجاح'
            ]);

        } catch (\Exception $e) {
            Log::error('خطأ في تسجيل خروج المستخدم الضيف', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسجيل الخروج'
            ], 500);
        }
    }
} 