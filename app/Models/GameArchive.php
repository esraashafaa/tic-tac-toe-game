<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameArchive extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_x',
        'player_o',
        'winner',
        'points_x',
        'points_o',
        'board_state',
        'moves_count'
    ];

    protected $casts = [
        'board_state' => 'array',
        'points_x' => 'integer',
        'points_o' => 'integer',
        'moves_count' => 'integer'
    ];
}
