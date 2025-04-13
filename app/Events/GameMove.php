<?php

namespace App\Events;

use App\Models\GameMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameMove implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $match;
    public $move;

    public function __construct(GameMatch $match, array $move)
    {
        $this->match = $match;
        $this->move = $move;
    }

    public function broadcastOn()
    {
        return new Channel('game.match.' . $this->match->id);
    }

    public function broadcastWith()
    {
        return [
            'position' => $this->move['position'],
            'symbol' => $this->move['symbol'],
            'player_id' => isset($this->move['player_id']) ? $this->move['player_id'] : null
        ];
    }
} 