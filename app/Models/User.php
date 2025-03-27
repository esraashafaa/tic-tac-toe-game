<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'provider_name',
        'provider_id',
        'avatar',
        'total_games',
        'wins',
        'losses',
        'draws',
        'current_streak',
        'highest_streak',
        'is_guest',
        'points'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'provider_id',
        'provider_name',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'total_games' => 'integer',
        'wins' => 'integer',
        'losses' => 'integer',
        'draws' => 'integer',
        'current_streak' => 'integer',
        'highest_streak' => 'integer',
        'is_guest' => 'boolean',
        'points' => 'integer'
    ];

    /**
     * Get the points balance for the user.
     */
    public function pointsBalance()
    {
        return $this->hasOne(PointsBalance::class);
    }

    /**
     * Get the points transactions for the user.
     */
    public function pointsTransactions()
    {
        return $this->hasMany(PointsTransaction::class);
    }

    /**
     * Get the inventory items for the user.
     */
    public function inventory()
    {
        return $this->belongsToMany(ShopItem::class, 'user_inventory')
            ->withPivot(['acquired_at', 'acquisition_method'])
            ->withTimestamps();
    }

    /**
     * Get the equipped items for the user.
     */
    public function equippedItems()
    {
        return $this->belongsToMany(ShopItem::class, 'equipped_items')
            ->withPivot(['category', 'equipped_at']);
    }

    /**
     * Get the games the user has participated in.
     */
    public function games()
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->withPivot(['player_symbol', 'joined_at']);
    }

    /**
     * Get the games the user has won.
     */
    public function gamesWon()
    {
        return $this->hasMany(Game::class, 'winner_id');
    }
    
    /**
     * Get the moves made by the user.
     */
    public function moves()
    {
        return $this->hasMany(GameMove::class);
    }

    /**
     * Get active games where it's the user's turn.
     */
    public function activeGamesMyTurn()
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->where('status', 'in_progress')
            ->where('current_turn_player_id', $this->id);
    }

    /**
     * Get active games where it's the opponent's turn.
     */
    public function activeGamesOpponentTurn()
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->where('status', 'in_progress')
            ->where('current_turn_player_id', '!=', $this->id);
    }

    /**
     * Get completed games.
     */
    public function completedGames()
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->where('status', 'completed');
    }

    /**
     * Calculate win rate percentage.
     */
    public function getWinRateAttribute()
    {
        if ($this->total_games == 0) {
            return 0;
        }
        
        return round(($this->wins / $this->total_games) * 100, 2);
    }

    /**
     * Get the offline statistics for the user.
     */
    public function offlineStatistics()
    {
        return $this->hasOne(OfflineStatistic::class);
    }

    /**
     * Update user stats after a game.
     */
    public function updateStats($isWinner, $isDraw)
    {
        $this->total_games += 1;
        
        if ($isWinner) {
            $this->wins += 1;
            $this->current_streak += 1;
            $this->highest_streak = max($this->highest_streak, $this->current_streak);
        } elseif ($isDraw) {
            $this->draws += 1;
            // No change to streak on draw
        } else {
            $this->losses += 1;
            $this->current_streak = 0; // Reset streak on loss
        }
        
        $this->save();
    }

    /**
     * Get the current streak bonus multiplier.
     */
    public function getStreakMultiplier()
    {
        if ($this->current_streak >= 20) return 3.0;
        if ($this->current_streak >= 10) return 2.0;
        if ($this->current_streak >= 5) return 1.5;
        if ($this->current_streak >= 3) return 1.2;
        return 1.0;
    }

    public function matches()
    {
        return $this->hasMany(GameMatch::class, 'player1_id')
            ->orWhere('player2_id', $this->id);
    }
}
