<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameMatch extends Model
{
    use HasFactory;

    protected $table = 'game_matches';

    protected $fillable = [
        'match_code',
        'status',
        'player1_symbol',
        'player2_symbol',
        'player1_id',
        'player2_id',
        'player1_name',
        'player2_name',
        'board_state',
        'moves_count',
        'current_turn',
        'winner',
        'started_at',
        'ended_at'
    ];

    protected $casts = [
        'board_state' => 'array',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'player1_id' => 'integer',
        'player2_id' => 'integer',
        'moves_count' => 'integer'
    ];

    protected $attributes = [
        'board_state' => '["","","","","","","","",""]',
        'moves_count' => 0,
        'status' => 'waiting',
        'player1_symbol' => 'X',
        'player2_symbol' => 'O',
        'current_turn' => 'X'
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

    // التحقق مما إذا كانت المباراة ممتلئة
    public function isFull()
    {
        return $this->player1_id !== null && $this->player2_id !== null;
    }

    // التحقق مما إذا كان اللاعب في المباراة
    public function hasPlayer($playerId)
    {
        return $this->player1_id === $playerId || $this->player2_id === $playerId;
    }

    // الحصول على رمز اللاعب في المباراة
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
        return $this->current_turn === $playerSymbol;
    }

    // توليد رمز مباراة فريد
    public static function generateMatchCode()
    {
        do {
            $code = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        } while (static::where('match_code', $code)->exists());

        return $code;
    }

    // التحقق مما إذا كانت المباراة جاهزة للبدء
    public function isReadyToStart()
    {
        return $this->status === 'waiting' && 
               $this->player1_id && 
               $this->player2_id;
    }

    // بدء المباراة
    public function start()
    {
        $this->update([
            'status' => 'playing',
            'started_at' => now()
        ]);
    }

    // إنهاء المباراة
    public function end($winner)
    {
        $this->update([
            'status' => 'ended',
            'winner' => $winner,
            'ended_at' => now()
        ]);
    }

    // تحديث حالة اللوحة
    public function updateBoard($position, $symbol)
    {
        $board = $this->board_state;
        $board[$position] = $symbol;
        
        $this->update([
            'board_state' => $board,
            'moves_count' => $this->moves_count + 1
        ]);
    }

    // التحقق من الفوز
    public function checkWin()
    {
        $board = $this->board_state;
        $winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        foreach ($winningCombinations as $combination) {
            [$a, $b, $c] = $combination;
            if ($board[$a] && $board[$a] === $board[$b] && $board[$a] === $board[$c]) {
                return $board[$a];
            }
        }

        // التحقق من التعادل فقط إذا لم يكن هناك فائز
        if (!in_array('', $board)) {
            return 'draw';
        }

        return null;
    }
}
