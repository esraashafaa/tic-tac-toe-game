<?php

namespace App\Services;

use App\Models\PointsBalance;
use App\Models\PointsTransaction;
use App\Models\User;
use App\Models\Game;

class PointsService
{
    /**
     * منح النقاط للفوز في اللعبة
     */
    public function awardGameWinPoints($userId, $gameMode)
    {
        // تحديد عدد النقاط بناءً على وضع اللعبة
        $points = $this->getPointsForWin($gameMode);
        
        // تطبيق مضاعف عند الوجود (مثل سلاسل الفوز)
        $multiplier = $this->getWinStreakMultiplier($userId);
        $points = round($points * $multiplier);
        
        // إنشاء معاملة النقاط
        $transaction = new PointsTransaction();
        $transaction->user_id = $userId;
        $transaction->amount = $points;
        $transaction->transaction_type = 'game_win';
        $transaction->description = "الفوز في لعبة {$gameMode}";
        $transaction->save();
        
        // تحديث رصيد النقاط
        $this->updatePointsBalance($userId, $points);
        
        // تحديث إحصائيات المستخدم (عدد الفوز)
        $this->updateUserStats($userId, 'win');
        
        return $points;
    }
    
    /**
     * منح النقاط للتعادل في اللعبة
     */
    public function awardGameDrawPoints($userId)
    {
        $points = 20; // نقاط التعادل الثابتة
        
        // إنشاء معاملة النقاط
        $transaction = new PointsTransaction();
        $transaction->user_id = $userId;
        $transaction->amount = $points;
        $transaction->transaction_type = 'game_draw';
        $transaction->description = "التعادل في لعبة";
        $transaction->save();
        
        // تحديث رصيد النقاط
        $this->updatePointsBalance($userId, $points);
        
        // تحديث إحصائيات المستخدم (عدد التعادلات)
        $this->updateUserStats($userId, 'draw');
        
        return $points;
    }
    
    /**
     * منح نقاط المشاركة (للخسارة)
     */
    public function awardGameParticipationPoints($userId)
    {
        $points = 10; // نقاط المشاركة الثابتة
        
        // إنشاء معاملة النقاط
        $transaction = new PointsTransaction();
        $transaction->user_id = $userId;
        $transaction->amount = $points;
        $transaction->transaction_type = 'game_loss';
        $transaction->description = "المشاركة في لعبة";
        $transaction->save();
        
        // تحديث رصيد النقاط
        $this->updatePointsBalance($userId, $points);
        
        // تحديث إحصائيات المستخدم (عدد الخسائر)
        $this->updateUserStats($userId, 'loss');
        
        return $points;
    }
    
    /**
     * منح نقاط اللعبة الأولى في اليوم
     */
    public function awardFirstGameOfDayPoints($userId)
    {
        // التحقق مما إذا كانت هذه أول لعبة في اليوم
        $today = now()->startOfDay();
        $gamesPlayedToday = PointsTransaction::where('user_id', $userId)
                                            ->where('created_at', '>=', $today)
                                            ->whereIn('transaction_type', ['game_win', 'game_draw', 'game_loss'])
                                            ->count();
        
        if ($gamesPlayedToday > 1) {
            return 0; // ليست أول لعبة في اليوم
        }
        
        $points = 25; // نقاط أول لعبة في اليوم
        
        // إنشاء معاملة النقاط
        $transaction = new PointsTransaction();
        $transaction->user_id = $userId;
        $transaction->amount = $points;
        $transaction->transaction_type = 'daily_login';
        $transaction->description = "اللعبة الأولى من اليوم";
        $transaction->save();
        
        // تحديث رصيد النقاط
        $this->updatePointsBalance($userId, $points);
        
        return $points;
    }
    
    /**
     * الحصول على عدد النقاط للفوز بناءً على وضع اللعبة
     */
    private function getPointsForWin($gameMode)
    {
        switch ($gameMode) {
            case 'classic':
                return 50;
            case 'ultimate':
                return 75;
            case 'connect_five':
                return 100;
            default:
                return 50;
        }
    }
    
    /**
     * الحصول على مضاعف سلسلة الفوز
     */
    private function getWinStreakMultiplier($userId)
    {
        // الحصول على سلسلة الفوز الحالية من نموذج المستخدم
        $user = User::find($userId);
        
        if (!$user) {
            return 1.0;
        }
        
        $streak = $user->current_streak;
        
        // تطبيق المضاعف بناءً على طول السلسلة
        if ($streak >= 20) {
            return 3.0;
        } else if ($streak >= 10) {
            return 2.0;
        } else if ($streak >= 5) {
            return 1.5;
        } else if ($streak >= 3) {
            return 1.2;
        }
        
        return 1.0;
    }
    
    /**
     * تحديث رصيد النقاط للمستخدم
     */
    private function updatePointsBalance($userId, $pointsToAdd)
    {
        // الحصول على رصيد النقاط الحالي أو إنشاء واحد جديد
        $pointsBalance = PointsBalance::firstOrNew(['user_id' => $userId]);
        
        if (!$pointsBalance->exists) {
            $pointsBalance->current_balance = 0;
            $pointsBalance->lifetime_earned = 0;
        }
        
        $pointsBalance->current_balance += $pointsToAdd;
        $pointsBalance->lifetime_earned += $pointsToAdd;
        $pointsBalance->save();
    }
    
    /**
     * تحديث إحصائيات المستخدم (الفوز، الخسارة، التعادل، السلسلة)
     */
    private function updateUserStats($userId, $outcome)
    {
        $user = User::find($userId);
        
        if (!$user) {
            return;
        }
        
        // زيادة عدد الألعاب الكلي
        $user->total_games += 1;
        
        // تحديث النتيجة المحددة
        switch ($outcome) {
            case 'win':
                $user->wins += 1;
                $user->current_streak += 1;
                // تحديث أعلى سلسلة فوز إذا لزم الأمر
                if ($user->current_streak > $user->highest_streak) {
                    $user->highest_streak = $user->current_streak;
                }
                break;
            case 'draw':
                $user->draws += 1;
                // سلاسل الفوز تستمر في حالة التعادل، لا نقوم بتعديلها
                break;
            case 'loss':
                $user->losses += 1;
                $user->current_streak = 0; // إعادة ضبط سلسلة الفوز
                break;
        }
        
        $user->save();
    }
    
    /**
     * خصم النقاط لشراء عناصر من المتجر
     */
    public function deductPointsForPurchase($userId, $itemId, $pointsCost)
    {
        // التحقق من رصيد النقاط الكافي
        $pointsBalance = PointsBalance::where('user_id', $userId)->first();
        
        if (!$pointsBalance || $pointsBalance->current_balance < $pointsCost) {
            return [
                'success' => false,
                'message' => 'رصيد النقاط غير كافٍ'
            ];
        }
    // إنشاء معاملة النقاط
    $transaction = new PointsTransaction();
    $transaction->user_id = $userId;
    $transaction->amount = -$pointsCost; // سالب لأنها خصم
    $transaction->transaction_type = 'purchase';
    $transaction->reference_id = (string) $itemId;
    $transaction->description = "شراء عنصر من المتجر";
    $transaction->save();
    
    // تحديث رصيد النقاط
    $pointsBalance->current_balance -= $pointsCost;
    $pointsBalance->save();
    
    return [
        'success' => true,
        'newBalance' => $pointsBalance->current_balance
    ];
}

    /**
     * الحصول على رصيد نقاط المستخدم
     */
    public function getUserPointsBalance($userId)
    {
        $pointsBalance = PointsBalance::where('user_id', $userId)->first();
        
        if (!$pointsBalance) {
            return [
                'current_balance' => 0,
                'lifetime_earned' => 0
            ];
        }
        
        return [
            'current_balance' => $pointsBalance->current_balance,
            'lifetime_earned' => $pointsBalance->lifetime_earned
        ];
    }

    /**
     * الحصول على سجل معاملات نقاط المستخدم
     */
    public function getUserPointsHistory($userId, $limit = 20)
    {
        return PointsTransaction::where('user_id', $userId)
                            ->orderBy('created_at', 'desc')
                            ->limit($limit)
                            ->get();
    }
}