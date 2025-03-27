<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameArchiveController;
use App\Http\Controllers\GuestAuthController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\GameController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// الصفحة الرئيسية
Route::get('/', function () {
    return view('welcome');
});

// مسارات المصادقة للزوار فقط
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
                ->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
                ->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // مسار تسجيل دخول الضيوف
    Route::post('guest-login', [GuestAuthController::class, 'login'])->name('guest.login');
});

// مسارات محمية تتطلب تسجيل الدخول
Route::middleware(['auth'])->group(function () {
    // تسجيل الخروج
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
                ->name('logout');

    // صفحة اختيار نوع اللعبة (الصفحة الرئيسية بعد تسجيل الدخول)
    Route::get('/games/choose', function () {
        return view('games.choose');
    })->name('games.choose');

    // اللعب ضد الكمبيوتر
    Route::get('/offline-game', function () {
        return view('offline-game');
    })->name('offline.game');

    // اللعب اونلاين
    Route::get('/online-game', function () {
        return view('online-game');
    })->name('online.game');

    // اللعب ضد الكمبيوتر
    Route::get('/ai-game', [GameController::class, 'aiGame'])->name('ai-game');

    // لوحة التحكم (اختياري)
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});
