<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameMove;
use App\Models\GamePlayer;
use App\Models\User;
use App\Events\GameCreated;
use App\Events\PlayerJoinedGame;
use App\Events\GameStateUpdated;
use App\Events\GameEnded;
use App\Services\GameService;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Pusher\Pusher;
use App\Events\GameMove as GameMoveEvent;
use App\Events\PlayerJoined as PlayerJoinedEvent;
use App\Events\PlayerLeft as PlayerLeftEvent;
use App\Events\GameStarted as GameStartedEvent;
use App\Events\ChatMessage as ChatMessageEvent;
use App\Models\GameRoom;
use App\Models\GameArchive;
use App\Models\GameMatch;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;

class GameController extends Controller
{
    protected $gameService;
    protected $pointsService;

    public function __construct(GameService $gameService, PointsService $pointsService)
    {
        $this->gameService = $gameService;
        $this->pointsService = $pointsService;
    }

    /**
     * إنشاء لعبة جديدة
     */
    public function create(Request $request)
    {
        $validated = $request->validate([
            'game_mode' => 'required|in:classic,ultimate,connect_five',
            'is_private' => 'boolean',
        ]);

        $user = auth()->user();
        
        // توليد رمز لعبة فريد
        $gameCode = $this->generateUniqueGameCode();
        
        // إنشاء سجل اللعبة
        $game = new Game();
        $game->game_mode = $validated['game_mode'];
        $game->status = 'waiting';
        $game->game_code = $gameCode;
        $game->board_state = $this->gameService->getInitialBoardState($validated['game_mode']);
        $game->is_private = $validated['is_private'] ?? false;
        $game->save();
        
        // إضافة اللاعب إلى اللعبة
        $playerSymbol = 'X'; // اللاعب الأول يكون X
        $gamePlayer = new GamePlayer();
        $gamePlayer->game_id = $game->id;
        $gamePlayer->user_id = $user->id;
        $gamePlayer->player_symbol = $playerSymbol;
        $gamePlayer->save();
        
        // بث حدث إنشاء اللعبة
        event(new GameCreated($game));
        
        return response()->json([
            'success' => true,
            'game' => $game,
            'player_symbol' => $playerSymbol,
            'game_code' => $gameCode,
        ]);
    }
    
    /**
     * الانضمام إلى لعبة موجودة باستخدام رمز اللعبة
     */
    public function join(Request $request)
    {
        $request->validate([
            'roomId' => 'required|string',
            'playerSymbol' => 'required|in:X,O'
        ]);

        $pusher = $this->getPusher();
        
        $pusher->trigger('game-' . $request->roomId, 'player-joined', [
            'playerSymbol' => $request->playerSymbol
        ]);

        return response()->json(['message' => 'تم الانضمام للغرفة بنجاح']);
    }
    
    /**
     * الحصول على تفاصيل اللعبة
     */
    public function show($gameId)
    {
        $user = auth()->user();
        
        $game = Game::findOrFail($gameId);
        
        // التحقق مما إذا كان المستخدم لاعبًا في هذه اللعبة
        $isPlayer = GamePlayer::where('game_id', $game->id)
                              ->where('user_id', $user->id)
                              ->exists();
        
        if (!$isPlayer && $game->is_private) {
            return response()->json([
                'success' => false,
                'message' => 'ليس لديك حق الوصول إلى هذه اللعبة'
            ], 403);
        }
        
        // الحصول على معلومات اللاعبين
        $players = GamePlayer::where('game_id', $game->id)
                            ->with('user:id,name')
                            ->get();
        
        // الحصول على حركات اللعبة
        $moves = GameMove::where('game_id', $game->id)
                         ->orderBy('move_number', 'asc')
                         ->get();
        
        return response()->json([
            'success' => true,
            'game' => $game,
            'players' => $players,
            'moves' => $moves,
            'is_your_turn' => $game->current_turn_player_id === $user->id
        ]);
    }
    
    /**
     * إجراء حركة في اللعبة
     */
    public function move(Request $request)
    {
        $request->validate([
            'roomId' => 'required|string',
            'index' => 'required|integer|min:0|max:8',
            'player' => 'required|in:X,O'
        ]);

        $pusher = $this->getPusher();
        
        $pusher->trigger('game-' . $request->roomId, 'move-made', [
            'index' => $request->index,
            'player' => $request->player
        ]);

        return response()->json(['message' => 'تم إرسال الحركة بنجاح']);
    }
    
    /**
     * الحصول على الألعاب النشطة للمستخدم الحالي
     */
    public function getActiveGames()
    {
        $user = auth()->user();
        
        $activeGameIds = GamePlayer::where('user_id', $user->id)
                                  ->pluck('game_id');
        
        $activeGames = Game::whereIn('id', $activeGameIds)
                           ->whereIn('status', ['waiting', 'in_progress'])
                           ->with(['players.user:id,name'])
                           ->get();
        
        return response()->json([
            'success' => true,
            'games' => $activeGames
        ]);
    }
    
    /**
     * الانسحاب من لعبة
     */
    public function forfeit($gameId)
    {
        $user = auth()->user();
        $game = Game::findOrFail($gameId);
        
        // التحقق من أن اللعبة نشطة
        if ($game->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن الانسحاب من لعبة ليست قيد التقدم'
            ], 400);
        }
        
        // التحقق من أن المستخدم لاعب في هذه اللعبة
        $isPlayer = GamePlayer::where('game_id', $game->id)
                              ->where('user_id', $user->id)
                              ->exists();
        
        if (!$isPlayer) {
            return response()->json([
                'success' => false,
                'message' => 'أنت لست لاعبًا في هذه اللعبة'
            ], 403);
        }
        
        // تعيين اللاعب الآخر كفائز
        $winner = GamePlayer::where('game_id', $game->id)
                           ->where('user_id', '!=', $user->id)
                           ->first();
        
        if ($winner) {
            $game->winner_id = $winner->user_id;
            
            // منح نقاط للفائز
            $this->pointsService->awardGameWinPoints($winner->user_id, $game->game_mode);
            
            // منح نقاط المشاركة للمستخدم الذي انسحب
            $this->pointsService->awardGameParticipationPoints($user->id);
        }
        
        // تحديث حالة اللعبة
        $game->status = 'completed';
        $game->save();
        
        // بث حدث انتهاء اللعبة
        event(new GameEnded($game));
        
        return response()->json([
            'success' => true,
            'message' => 'تم الانسحاب من اللعبة',
            'game' => $game
        ]);
    }
    
    /**
     * طلب مباراة إعادة
     */
    public function rematch($gameId)
    {
        $user = auth()->user();
        $originalGame = Game::findOrFail($gameId);
        
        // التحقق من أن اللعبة مكتملة
        if ($originalGame->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'يمكن طلب المباراة الإعادة فقط للألعاب المكتملة'
            ], 400);
        }
        
        // التحقق من أن المستخدم لاعب في هذه اللعبة
        $isPlayer = GamePlayer::where('game_id', $originalGame->id)
                              ->where('user_id', $user->id)
                              ->exists();
        
        if (!$isPlayer) {
            return response()->json([
                'success' => false,
                'message' => 'أنت لست لاعبًا في هذه اللعبة'
            ], 403);
        }
        
        // إنشاء لعبة جديدة بنفس الوضع
        $gameCode = $this->generateUniqueGameCode();
        
        $newGame = new Game();
        $newGame->game_mode = $originalGame->game_mode;
        $newGame->status = 'waiting';
        $newGame->game_code = $gameCode;
        $newGame->board_state = $this->gameService->getInitialBoardState($originalGame->game_mode);
        $newGame->is_private = true;
        $newGame->save();
        
        // إضافة اللاعب الطالب إلى اللعبة مع رمز معاكس من اللعبة الأصلية
        $originalPlayerSymbol = GamePlayer::where('game_id', $originalGame->id)
                                         ->where('user_id', $user->id)
                                         ->value('player_symbol');
        
        $newPlayerSymbol = $originalPlayerSymbol === 'X' ? 'O' : 'X';
        
        $gamePlayer = new GamePlayer();
        $gamePlayer->game_id = $newGame->id;
        $gamePlayer->user_id = $user->id;
        $gamePlayer->player_symbol = $newPlayerSymbol;
        $gamePlayer->save();
        
        // بث حدث إنشاء اللعبة
        event(new GameCreated($newGame));
        
        return response()->json([
            'success' => true,
            'game' => $newGame,
            'game_code' => $gameCode,
            'message' => 'تم إنشاء مباراة إعادة. شارك رمز اللعبة مع خصمك.'
        ]);
    }
    
    /**
     * توليد رمز لعبة فريد
     */
    private function generateUniqueGameCode()
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (Game::where('game_code', $code)->exists());
        
        return $code;
    }

    private function getPusher()
    {
        return new Pusher(
            env('PUSHER_APP_KEY'),
            env('PUSHER_APP_SECRET'),
            env('PUSHER_APP_ID'),
            [
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'useTLS' => true
            ]
        );
    }

    public function createRoom(Request $request)
    {
        $room = GameRoom::create([
            'name' => $request->name,
            'player1_id' => $request->player_id,
            'player1_symbol' => $request->symbol,
            'status' => 'waiting'
        ]);

        return response()->json([
            'room' => $room,
            'message' => 'تم إنشاء الغرفة بنجاح'
        ]);
    }

    public function joinRoom(Request $request, $roomId)
    {
        $room = GameRoom::findOrFail($roomId);

        if ($room->status !== 'waiting') {
            return response()->json([
                'message' => 'الغرفة غير متاحة'
            ], 400);
        }

        $room->update([
            'player2_id' => $request->player_id,
            'player2_symbol' => $request->symbol,
            'status' => 'playing'
        ]);

        broadcast(new PlayerJoinedEvent($room))->toOthers();

        return response()->json([
            'room' => $room,
            'message' => 'تم الانضمام للغرفة بنجاح'
        ]);
    }

    public function makeMove(Request $request, $roomId)
    {
        $room = GameRoom::findOrFail($roomId);
        
        if ($room->status !== 'playing') {
            return response()->json([
                'message' => 'اللعبة غير نشطة'
            ], 400);
        }

        $move = [
            'player_id' => $request->player_id,
            'position' => $request->position,
            'symbol' => $request->symbol
        ];

        broadcast(new GameMoveEvent($room, $move))->toOthers();

        return response()->json([
            'message' => 'تم تنفيذ الحركة بنجاح'
        ]);
    }

    public function endGame(Request $request, $roomId)
    {
        $room = GameRoom::findOrFail($roomId);
        
        $winner = $request->winner;
        $boardState = $request->board_state;
        $movesCount = $request->moves_count;

        // حفظ نتيجة اللعبة
        GameArchive::create([
            'player_x' => $room->player1_symbol === 'X' ? $room->player1_id : $room->player2_id,
            'player_o' => $room->player1_symbol === 'O' ? $room->player1_id : $room->player2_id,
            'winner' => $winner,
            'points_x' => $winner === 'X' ? 3 : ($winner === 'draw' ? 1 : 0),
            'points_o' => $winner === 'O' ? 3 : ($winner === 'draw' ? 1 : 0),
            'board_state' => $boardState,
            'moves_count' => $movesCount
        ]);

        broadcast(new GameEnded($room, $winner))->toOthers();

        $room->update(['status' => 'finished']);

        return response()->json([
            'message' => 'تم إنهاء اللعبة بنجاح'
        ]);
    }

    public function sendMessage(Request $request, $roomId)
    {
        $room = GameRoom::findOrFail($roomId);
        
        $message = [
            'player_id' => $request->player_id,
            'player_name' => $request->player_name,
            'message' => $request->message
        ];

        broadcast(new ChatMessageEvent($room, $message))->toOthers();

        return response()->json([
            'message' => 'تم إرسال الرسالة بنجاح'
        ]);
    }

    public function getAvailableRooms()
    {
        $rooms = GameRoom::where('status', 'waiting')->get();
        return response()->json($rooms);
    }

    public function leaveRoom(Request $request, $roomId)
    {
        $room = GameRoom::findOrFail($roomId);
        
        if ($room->player1_id === $request->player_id) {
            $room->update(['player1_id' => null]);
        } else if ($room->player2_id === $request->player_id) {
            $room->update(['player2_id' => null]);
        }

        if (!$room->player1_id && !$room->player2_id) {
            $room->delete();
        } else {
            $room->update(['status' => 'waiting']);
        }

        broadcast(new PlayerLeftEvent($room))->toOthers();

        return response()->json([
            'message' => 'تم مغادرة الغرفة بنجاح'
        ]);
    }

    public function choose()
    {
        return view('games.choose');
    }

    public function offline()
    {
        return view('offline-game');
    }

    public function online()
    {
        return view('online-game');
    }

    public function createMatch(Request $request)
    {
        try {
            $match = GameMatch::create([
                'player1_id' => Auth::id(),
                'player1_name' => Auth::user()->name,
                'player1_symbol' => 'X',
                'status' => 'waiting',
                'board_state' => array_fill(0, 9, ''),
                'current_turn' => 'X'
            ]);

            return response()->json([
                'success' => true,
                'match' => $match
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء المباراة'
            ], 500);
        }
    }

    public function joinMatch(Request $request, GameMatch $match)
    {
        try {
            if ($match->status !== 'waiting') {
                return response()->json([
                    'success' => false,
                    'message' => 'المباراة غير متاحة للانضمام'
                ], 400);
            }

            if ($match->player1_id === Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكنك الانضمام إلى مباراتك الخاصة'
                ], 400);
            }

            $match->update([
                'player2_id' => Auth::id(),
                'player2_name' => Auth::user()->name,
                'player2_symbol' => 'O',
                'status' => 'playing'
            ]);

            Event::dispatch('player-joined', $match);

            return response()->json([
                'success' => true,
                'match' => $match
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الانضمام للمباراة'
            ], 500);
        }
    }

    public function makeMoveForMatch(Request $request, GameMatch $match)
    {
        try {
            $validated = $request->validate([
                'position' => 'required|integer|min:0|max:8',
                'symbol' => 'required|in:X,O'
            ]);

            if ($match->status !== 'playing') {
                return response()->json([
                    'success' => false,
                    'message' => 'المباراة غير نشطة'
                ], 400);
            }

            if ($match->current_turn !== $validated['symbol']) {
                return response()->json([
                    'success' => false,
                    'message' => 'ليس دورك'
                ], 400);
            }

            $board = $match->board_state;
            if ($board[$validated['position']] !== '') {
                return response()->json([
                    'success' => false,
                    'message' => 'الخلية مشغولة'
                ], 400);
            }

            $board[$validated['position']] = $validated['symbol'];
            $match->board_state = $board;
            $match->current_turn = $validated['symbol'] === 'X' ? 'O' : 'X';
            $match->save();

            Event::dispatch('move-made', [
                'match' => $match,
                'position' => $validated['position'],
                'symbol' => $validated['symbol']
            ]);

            return response()->json([
                'success' => true,
                'match' => $match
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تنفيذ الحركة'
            ], 500);
        }
    }

    public function endMatch(Request $request, GameMatch $match)
    {
        try {
            $match->update([
                'status' => 'completed',
                'ended_at' => now()
            ]);

            Event::dispatch('match-ended', $match);

            return response()->json([
                'success' => true,
                'message' => 'تم إنهاء المباراة'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنهاء المباراة'
            ], 500);
        }
    }
}