<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'player1_id',
        'player2_id',
        'player1_symbol',
        'player2_symbol',
        'status'
    ];

    protected $casts = [
        'player1_id' => 'integer',
        'player2_id' => 'integer',
    ];

    // العلاقة مع اللاعب الأول
    public function player1()
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    // العلاقة مع اللاعب الثاني
    public function player2()
    {
        return $this->belongsTo(User::class, 'player2_id');
    }

    // التحقق مما إذا كانت الغرفة ممتلئة
    public function isFull()
    {
        return $this->player1_id !== null && $this->player2_id !== null;
    }

    // التحقق مما إذا كان اللاعب في الغرفة
    public function hasPlayer($playerId)
    {
        return $this->player1_id === $playerId || $this->player2_id === $playerId;
    }

    // الحصول على رمز اللاعب في الغرفة
    public function getPlayerSymbol($playerId)
    {
        if ($this->player1_id === $playerId) {
            return $this->player1_symbol;
        }
        if ($this->player2_id === $playerId) {
            return $this->player2_symbol;
        }
        return null;
    }

    // التحقق مما إذا كان دور اللاعب
    public function isPlayerTurn($playerId)
    {
        if (!$this->hasPlayer($playerId)) {
            return false;
        }

        $playerSymbol = $this->getPlayerSymbol($playerId);
        return $playerSymbol === 'X'; // اللاعب X يبدأ دائماً
    }
} 