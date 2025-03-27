<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Events\PlayerJoinedEvent;
use App\Events\GameMoveEvent;
use App\Events\GameEndedEvent;

class GameMatchController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        try {
            $matches = GameMatch::where('status', 'waiting')
                ->orWhere('status', 'playing')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'matches' => $matches
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching matches:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المباريات'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // التحقق من نوع المباراة (فردي أو ثنائي)
            $isOfflineMode = $request->input('mode') === 'offline';
            
            // تجهيز بيانات المباراة
            $matchData = [
                'match_code' => GameMatch::generateMatchCode(),
                'player1_id' => Auth::id(),
                'player1_name' => Auth::user()->name,
                'player1_symbol' => 'X',
                'board_state' => array_fill(0, 9, ''),
                'moves_count' => 0,
                'status' => $isOfflineMode ? 'playing' : 'waiting',
                'current_turn' => 'X'
            ];

            // إضافة بيانات الكمبيوتر في حالة اللعب الفردي
            if ($isOfflineMode) {
                $matchData['player2_id'] = 0; // معرف خاص للكمبيوتر
                $matchData['player2_name'] = 'الكمبيوتر';
                $matchData['player2_symbol'] = 'O';
                $matchData['is_offline'] = true;
            }

            Log::info('Creating new match with data:', $matchData);

            $match = GameMatch::create($matchData);

            // إضافة معلومات إضافية للاستجابة
            $response = [
                'success' => true,
                'message' => 'تم إنشاء المباراة بنجاح',
                'match' => $match,
                'match_code' => $match->match_code,
                'your_symbol' => 'X'
            ];

            Log::info('Match created successfully:', [
                'match_id' => $match->id,
                'match_code' => $match->match_code
            ]);

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error creating match:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء المباراة: ' . $e->getMessage()
            ], 500);
        }
    }

    public function join(Request $request, GameMatch $match)
    {
                $match->update([
            'player2_id' => $request->player2_id,
            'player2_name' => $request->player2_name,
                    'status' => 'playing'
                ]);

        // بث حدث انضمام اللاعب
        broadcast(new PlayerJoinedEvent($match))->toOthers();

        return response()->json(['match' => $match]);
    }

    public function move(Request $request, GameMatch $match)
    {
        $move = [
            'position' => $request->position,
            'symbol' => $request->symbol,
            'moves_count' => $match->moves_count + 1
        ];

        $match->update([
            'moves_count' => $move['moves_count'],
            'board_state' => $request->board_state
        ]);

        // بث حدث الحركة
        broadcast(new GameMoveEvent($move, $match->id))->toOthers();

        return response()->json(['move' => $move]);
    }

    public function end(Request $request, GameMatch $match)
    {
        $match->update([
            'status' => 'ended',
            'winner' => $request->winner,
            'board_state' => $request->board_state
        ]);

        // بث حدث نهاية اللعبة
        broadcast(new GameEndedEvent(
            $request->winner,
            $request->board_state,
            $match->id
        ))->toOthers();

        return response()->json(['status' => 'success']);
    }

    public function message(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'player_id' => 'required|string',
                'player_name' => 'required|string|max:50',
                'message' => 'required|string|max:500'
            ]);

            $match = GameMatch::findOrFail($id);

            // التحقق من أن المرسل هو أحد اللاعبين
            if ($match->player1_id !== $validated['player_id'] && $match->player2_id !== $validated['player_id']) {
                throw new \Exception('غير مصرح لك بإرسال رسائل في هذه المباراة');
            }

            event(new \App\Events\ChatMessage($match, [
                'player_id' => $validated['player_id'],
                'player_name' => $validated['player_name'],
                'message' => $validated['message']
            ]));

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الرسالة بنجاح'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error sending message:', [
                'match_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    private function updatePlayerStats(GameMatch $match)
    {
        try {
            DB::transaction(function () use ($match) {
                // تحديث إحصائيات اللاعب الأول
                $player1 = \App\Models\User::find($match->player1_id);
                if ($player1) {
                    $player1->total_games++;
                    
                    if ($match->winner === 'draw') {
                        $player1->draws++;
                        $player1->current_streak = 0;
                    } elseif ($match->winner === $match->player1_symbol) {
                        $player1->wins++;
                        $player1->current_streak++;
                        $player1->points += 3;
                        
                        // تحديث أفضل سلسلة انتصارات
                        if ($player1->current_streak > $player1->highest_streak) {
                            $player1->highest_streak = $player1->current_streak;
                        }
                    } else {
                        $player1->losses++;
                        $player1->current_streak = 0;
                    }
                    
                    $player1->save();
                }

                // تحديث إحصائيات اللاعب الثاني
                $player2 = \App\Models\User::find($match->player2_id);
                if ($player2) {
                    $player2->total_games++;
                    
                    if ($match->winner === 'draw') {
                        $player2->draws++;
                        $player2->current_streak = 0;
                    } elseif ($match->winner === $match->player2_symbol) {
                        $player2->wins++;
                        $player2->current_streak++;
                        $player2->points += 3;
                        
                        // تحديث أفضل سلسلة انتصارات
                        if ($player2->current_streak > $player2->highest_streak) {
                            $player2->highest_streak = $player2->current_streak;
                        }
                    } else {
                        $player2->losses++;
                        $player2->current_streak = 0;
                    }
                    
                    $player2->save();
                }
            });
        } catch (\Exception $e) {
            Log::error('Error updating player stats:', [
                'match_id' => $match->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
