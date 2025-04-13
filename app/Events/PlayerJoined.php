<?php

namespace App\Events;

use App\Models\GameMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $player_name;
    public $player_symbol;
    public $match_id;
    public $match;

    /**
     * Create a new event instance.
     */
    public function __construct(GameMatch $match)
    {
        $this->player_name = $match->player2_name;
        $this->player_symbol = $match->player2_symbol;
        $this->match_id = $match->id;
        $this->match = $match;
    }

    public function broadcastOn()
    {
        return new Channel('game.match.' . $this->match_id);
    }

    public function broadcastWith()
    {
        return [
            'match' => $this->match
        ];
    }
} 