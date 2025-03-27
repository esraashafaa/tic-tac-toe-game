namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameEndedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $winner;
    public $board_state;
    public $matchId;

    public function __construct($winner, $board_state, $matchId)
    {
        $this->winner = $winner;
        $this->board_state = $board_state;
        $this->matchId = $matchId;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('match.' . $this->matchId);
    }

    public function broadcastAs()
    {
        return 'game.ended';
    }
} 