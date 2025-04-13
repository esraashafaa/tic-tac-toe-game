<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Events\PlayerJoined;
use App\Events\GameMove;
use App\Events\GameEnded;

class GameMatchController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['getByCode', 'index']);
    }

    public function index()
    {
        try {
            // الحصول على المباريات المنتظرة
            $waitingMatches = GameMatch::where('status', 'waiting')
                ->orderBy('created_at', 'desc')
                ->get();
                
            // الحصول على المباريات النشطة
            $activeMatches = GameMatch::where('status', 'playing')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'waiting_matches' => $waitingMatches,
                'active_matches' => $activeMatches,
                'can_create_match' => $waitingMatches->isEmpty(), // يمكن إنشاء مباراة جديدة فقط إذا لم تكن هناك مباريات منتظرة
                'total_waiting' => $waitingMatches->count(),
                'total_active' => $activeMatches->count()
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
            // التحقق إذا كانت هناك مباريات متاحة
            $availableMatches = GameMatch::where('status', 'waiting')->count();
            
            // لا يسمح بإنشاء مباراة جديدة إلا إذا لم تكن هناك مباريات متاحة
            if ($availableMatches > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'توجد بالفعل مباراة متاحة. يرجى الانضمام إليها بدلاً من إنشاء مباراة جديدة.',
                    'available_matches' => $availableMatches
                ], 400);
            }

            // التحقق من البيانات المدخلة
            $validated = $request->validate([
                'mode' => 'required|in:offline,online',
                'player1_name' => 'required|string|max:255',
            ]);
            
            // التحقق من نوع المباراة (فردي أو ثنائي)
            $isOfflineMode = $validated['mode'] === 'offline';
            
            // تجهيز بيانات المباراة
            $matchData = [
                'match_code' => GameMatch::generateMatchCode(),
                'player1_id' => Auth::id(),
                'player1_name' => $validated['player1_name'],
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
        } catch (ValidationException $e) {
            Log::error('Validation error creating match:', [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $e->errors()
            ], 422);
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
        try {
            Log::info('Join match request:', [
                'match_id' => $match->id,
                'player_name' => $request->input('player2_name'),
                'user_id' => Auth::id() ?? 'غير مسجل دخول'
            ]);
            
            // التحقق من المصادقة
            if (!Auth::check()) {
                Log::error('Unauthorized join attempt');
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تسجيل الدخول أولاً للانضمام إلى المباراة'
                ], 401);
            }

            // التحقق من حالة المباراة
            if ($match->status !== 'waiting') {
                Log::error('Attempt to join non-waiting match', [
                    'match_id' => $match->id,
                    'status' => $match->status
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'المباراة غير متاحة للانضمام'
                ], 400);
            }
            
            // التحقق من عدم الانضمام للمباراة الخاصة بالمستخدم
            if ($match->player1_id === Auth::id()) {
                Log::error('Player attempting to join own match', [
                    'player_id' => Auth::id(),
                    'match_id' => $match->id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكنك الانضمام إلى مباراتك الخاصة'
                ], 400);
            }
            
            // التحقق من البيانات المدخلة
            $validated = $request->validate([
                'player2_name' => 'required|string|max:255',
            ]);
            
            $match->update([
                'player2_id' => Auth::id(),
                'player2_name' => $validated['player2_name'],
                'player2_symbol' => 'O',
                'status' => 'playing',
                'started_at' => now()
            ]);

            // بث حدث انضمام اللاعب
            broadcast(new PlayerJoined($match))->toOthers();

            Log::info('Player joined match successfully', [
                'match_id' => $match->id,
                'player_id' => Auth::id(),
                'player_name' => $validated['player2_name']
            ]);

            return response()->json([
                'success' => true,
                'match' => $match,
                'your_symbol' => 'O'
            ]);
        } catch (ValidationException $e) {
            Log::error('Validation error joining match:', [
                'match_id' => $match->id,
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة: ' . implode(', ', array_map(function($error) {
                    return implode(' ', $error);
                }, $e->errors())),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error joining match:', [
                'match_id' => $match->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الانضمام للمباراة: ' . $e->getMessage()
            ], 500);
        }
    }

    public function move(Request $request, GameMatch $match)
    {
        try {
            // طباعة بيانات الطلب للتشخيص
            Log::info('بيانات طلب الحركة:', [
                'match_id' => $match->id,
                'request_data' => $request->all(),
                'player_id' => $request->input('player_id'),
                'position' => $request->input('position'),
                'symbol' => $request->input('symbol'),
                'board_state_type' => gettype($request->input('board_state')),
            ]);

            // التحقق من البيانات المدخلة بشكل أكثر مرونة
            $validated = $request->validate([
                'position' => 'required|integer|min:0|max:8',
                'symbol' => 'required|in:X,O',
                'board_state' => 'required',
                'player_id' => 'required|integer'
            ]);
            
            // التحقق من أن المباراة نشطة
            if ($match->status !== 'playing') {
                return response()->json([
                    'success' => false,
                    'message' => 'المباراة غير نشطة'
                ], 400);
            }
            
            // التحقق من أن الدور الحالي هو دور اللاعب
            if ($match->current_turn !== $validated['symbol']) {
                return response()->json([
                    'success' => false,
                    'message' => 'ليس دورك'
                ], 400);
            }
            
            $move = [
                'position' => $validated['position'],
                'symbol' => $validated['symbol'],
                'player_id' => $validated['player_id'],
                'moves_count' => $match->moves_count + 1
            ];

            // تحديث حالة المباراة
            $match->update([
                'moves_count' => $move['moves_count'],
                'board_state' => $request->input('board_state'),
                'current_turn' => $validated['symbol'] === 'X' ? 'O' : 'X'
            ]);

            // بث حدث الحركة
            broadcast(new GameMove($match, $move));

            return response()->json([
                'success' => true,
                'move' => $move,
                'match' => $match
            ]);
        } catch (ValidationException $e) {
            Log::error('خطأ التحقق من صحة البيانات:', [
                'match_id' => $match->id,
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error making move:', [
                'match_id' => $match->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تنفيذ الحركة: ' . $e->getMessage()
            ], 500);
        }
    }

    public function end(Request $request, GameMatch $match)
    {
        try {
            // التحقق من البيانات المدخلة
            $validated = $request->validate([
                'winner' => 'required|in:X,O,draw',
                'board_state' => 'required|array',
                'board_state.*' => 'string'
            ]);
            
            $match->update([
                'status' => 'completed',
                'winner' => $validated['winner'],
                'board_state' => $validated['board_state'],
                'ended_at' => now()
            ]);

            // تحديث إحصائيات اللاعبين
            $this->updatePlayerStats($match);

            // بث حدث نهاية اللعبة
            broadcast(new GameEnded(
                $validated['winner'],
                $validated['board_state'],
                $match->id
            ))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'تم إنهاء المباراة بنجاح',
                'match' => $match
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صالحة',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error ending match:', [
                'match_id' => $match->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنهاء المباراة'
            ], 500);
        }
    }

    public function getByCode($code)
    {
        try {
            $match = GameMatch::where('match_code', $code)->first();
            
            if (!$match) {
                return response()->json([
                    'success' => false,
                    'message' => 'لم يتم العثور على مباراة بهذا الرمز'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'match' => $match
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching match by code:', [
                'code' => $code,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء البحث عن المباراة'
            ], 500);
        }
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
                        $player1->points += 1; // نقطة واحدة للتعادل
                    } elseif ($match->winner === $match->player1_symbol) {
                        $player1->wins++;
                        $player1->current_streak++;
                        $player1->points += 3; // 3 نقاط للفوز
                        
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
                if ($player2 && $match->player2_id > 0) { // تجاهل الكمبيوتر
                    $player2->total_games++;
                    
                    if ($match->winner === 'draw') {
                        $player2->draws++;
                        $player2->current_streak = 0;
                        $player2->points += 1; // نقطة واحدة للتعادل
                    } elseif ($match->winner === $match->player2_symbol) {
                        $player2->wins++;
                        $player2->current_streak++;
                        $player2->points += 3; // 3 نقاط للفوز
                        
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
