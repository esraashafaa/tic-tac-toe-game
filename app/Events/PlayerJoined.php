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

    public $match;

    public function __construct(GameMatch $match)
    {
        $this->match = $match;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('match.' . $this->match->id);
    }

    public function broadcastAs()
    {
        return 'player.joined';
    }

    public function broadcastWith()
    {
        return [
            'match' => $this->match
        ];
    }
} 