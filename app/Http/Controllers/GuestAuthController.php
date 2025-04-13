<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class GuestAuthController extends Controller
{
    /**
     * تسجيل دخول المستخدم كضيف
     */
    public function login(Request $request)
    {
        try {
            Log::info('محاولة تسجيل دخول ضيف', [
                'payload' => $request->all(),
                'headers' => $request->header()
            ]);
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            Log::info('البيانات صالحة', $validated);

            // إنشاء اسم مستخدم فريد
            $username = 'guest_' . Str::random(8);
            
            // إنشاء بريد إلكتروني فريد للضيف
            $email = 'guest_' . Str::random(8) . '@guest.tictactoe.com';
            
            // إنشاء كلمة مرور عشوائية
            $password = Str::random(12);
            
            // إنشاء مستخدم جديد
            $user = User::create([
                'name' => $request->name,
                'email' => $email,
                'username' => $username,
                'password' => Hash::make($password),
                'is_guest' => true,
            ]);
            
            Log::info('تم إنشاء المستخدم الضيف', ['user_id' => $user->id]);
            
            // إنشاء توكن للمصادقة
            $token = $user->createToken('guest_token')->plainTextToken;
            
            Log::info('تم إنشاء توكن للمستخدم', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'message' => 'تم تسجيل الدخول كضيف بنجاح'
            ]);
            
        } catch (ValidationException $e) {
            Log::error('خطأ في التحقق من صحة البيانات', [
                'errors' => $e->errors(),
                'payload' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('خطأ في تسجيل الدخول كضيف', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسجيل الدخول: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * تسجيل خروج المستخدم الضيف
     */
    public function logout(Request $request)
    {
        try {
            // حذف جميع التوكنات
            $request->user()->tokens()->delete();
            
            // إذا كان مستخدم ضيف، قم بحذفه من قاعدة البيانات
            if ($request->user()->is_guest) {
                $request->user()->delete();
            }
            
            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الخروج بنجاح'
            ]);
        } catch (\Exception $e) {
            Log::error('خطأ في تسجيل الخروج', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسجيل الخروج: ' . $e->getMessage()
            ], 500);
        }
    }
} 