<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameArchiveController;
use App\Http\Controllers\GameMatchController;
use App\Http\Controllers\GameRoomController;
use App\Http\Controllers\GuestPlayerController;
use App\Http\Controllers\GuestAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// المسارات العامة (لا تتطلب مصادقة)
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('/guest-login', [GuestAuthController::class, 'login']);

// مسارات أرشيف اللعبة (متاحة للجميع)
Route::get('/game-archives', [GameArchiveController::class, 'index']);
Route::post('/game-archives', [GameArchiveController::class, 'store']);

// المسارات المحمية (تتطلب مصادقة)
Route::middleware('auth:sanctum')->group(function () {
    // الحصول على بيانات المستخدم الحالي
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
   
    // تسجيل الخروج
    Route::post('/logout', [AuthController::class, 'logout']);

    // مسارات المباريات
    Route::prefix('game/matches')->group(function () {
        Route::get('/', [GameMatchController::class, 'index']);
        Route::post('/', [GameMatchController::class, 'store']);
        Route::post('/{match}/join', [GameMatchController::class, 'join']);
        Route::post('/{match}/move', [GameMatchController::class, 'move']);
        Route::post('/{match}/end', [GameMatchController::class, 'end']);
    });
});

// مسارات الغرف
Route::prefix('game/rooms')->group(function () {
    Route::get('/', [GameRoomController::class, 'index']);
    Route::post('/', [GameRoomController::class, 'store']);
    Route::post('/{room}/join', [GameRoomController::class, 'join']);
    Route::post('/{room}/move', [GameRoomController::class, 'move']);
    Route::post('/{room}/message', [GameRoomController::class, 'message']);
    Route::post('/{room}/end', [GameRoomController::class, 'end']);
});

// مسارات تسجيل الدخول كضيف
Route::middleware('auth:sanctum')->post('/guest-logout', [GuestAuthController::class, 'logout']);
