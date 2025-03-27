<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;
    
    // تحديد الحقول القابلة للتعبئة الجماعية (إذا كنت تستخدم create أو fill)
    protected $fillable = [
        'game_mode', 'status', 'game_code', 'board_state', 'is_private'
    ];
    
    // تحديد الحقول التي يجب معاملتها كنوع معين
    protected $casts = [
        'board_state' => 'array',
        'is_private' => 'boolean',
    ];
    
    // العلاقات مع النماذج الأخرى
    public function players()
    {
        return $this->hasMany(GamePlayer::class);
    }

    public function moves()
    {
        return $this->hasMany(GameMove::class);
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function currentPlayer()
    {
        return $this->belongsTo(User::class, 'current_turn_player_id');
    }
}