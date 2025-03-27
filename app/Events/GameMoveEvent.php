namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameMoveEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $move;
    public $matchId;

    public function __construct($move, $matchId)
    {
        $this->move = $move;
        $this->matchId = $matchId;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('match.' . $this->matchId);
    }

    public function broadcastAs()
    {
        return 'game.move';
    }
} 