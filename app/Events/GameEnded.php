<?php

namespace App\Events;

use App\Models\GameMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $match;

    /**
     * إنشاء حالة الحدث الجديدة.
     *
     * @param  \App\Models\GameMatch  $match
     * @return void
     */
    public function __construct(GameMatch $match)
    {
        $this->match = $match;
    }

    /**
     * الحصول على قنوات البث التي يجب بث الحدث عليها.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PresenceChannel('match.' . $this->match->id);
    }

    public function broadcastAs()
    {
        return 'game.ended';
    }

    public function broadcastWith()
    {
        return [
            'winner' => $this->match->winner,
            'board_state' => $this->match->board_state
        ];
    }
}