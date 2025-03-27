<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfflineStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'x_wins',
        'o_wins',
        'draws'
    ];

    protected $casts = [
        'x_wins' => 'integer',
        'o_wins' => 'integer',
        'draws' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function updateGameResult(?string $winner)
    {
        if ($winner === 'X') {
            $this->increment('x_wins');
        } elseif ($winner === 'O') {
            $this->increment('o_wins');
        } else {
            $this->increment('draws');
        }
        
        $this->user->increment('total_games');
        
        if ($winner) {
            $this->user->increment('wins');
            $this->user->increment('current_streak');
            $this->user->highest_streak = max($this->user->highest_streak, $this->user->current_streak);
            $this->user->save();
        } elseif ($winner === null) {
            $this->user->increment('draws');
        } else {
            $this->user->increment('losses');
            $this->user->current_streak = 0;
            $this->user->save();
        }
    }

    public function getTotalGames()
    {
        return $this->x_wins + $this->o_wins + $this->draws;
    }

    /**
     * الحصول على إحصائيات اللعب للعرض في العداد
     */
    public function getCounterStats(): array
    {
        return [
            'x_wins' => $this->x_wins,
            'o_wins' => $this->o_wins,
            'draws' => $this->draws
        ];
    }

    /**
     * الحصول على نسبة الفوز لكل لاعب
     */
    public function getWinRates(): array
    {
        $totalGames = $this->getTotalGames();
        
        if ($totalGames === 0) {
            return [
                'x_rate' => 0,
                'o_rate' => 0
            ];
        }

        return [
            'x_rate' => round(($this->x_wins / $totalGames) * 100, 1),
            'o_rate' => round(($this->o_wins / $totalGames) * 100, 1)
        ];
    }
} 