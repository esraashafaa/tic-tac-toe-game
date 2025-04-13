<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GameRoomController extends Controller
{
    // عرض قائمة الغرف المتاحة (المباريات في وضع الانتظار)
    public function index()
    {
        // إضافة طباعة تصحيحية
        Log::info('تم استدعاء GameRoomController@index');
        
        $rooms = GameMatch::where('status', 'waiting')
            ->orWhere('status', 'playing')
            ->get();
        
        Log::info('تم العثور على ' . $rooms->count() . ' مباراة');
        
        return response()->json(['rooms' => $rooms]);
    }

    // إنشاء غرفة جديدة (مباراة)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'player_id' => 'required|integer',
            'symbol' => 'required|in:X,O'
        ]);

        $match = GameMatch::create([
            'match_code' => GameMatch::generateMatchCode(),
            'player1_id' => $request->player_id,
            'player1_name' => $request->name,
            'player1_symbol' => $request->symbol,
            'player2_symbol' => $request->symbol === 'X' ? 'O' : 'X',
            'status' => 'waiting',
            'board_state' => array_fill(0, 9, '')
        ]);

        return response()->json([
            'message' => 'تم إنشاء الغرفة بنجاح',
            'room' => $match
        ]);
    }

    // الانضمام إلى غرفة (مباراة)
    public function join(Request $request, $roomId)
    {
        $match = GameMatch::findOrFail($roomId);
        
        if ($match->isFull()) {
            return response()->json([
                'message' => 'الغرفة ممتلئة'
            ], 400);
        }

        if ($match->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت موجود بالفعل في هذه الغرفة'
            ], 400);
        }

        $match->update([
            'player2_id' => $request->player_id,
            'player2_name' => $request->player_name,
            'status' => 'playing'
        ]);

        // بث حدث انضمام اللاعب باستخدام broadcast helper
        broadcast(new \App\Events\PlayerJoined($match));

        return response()->json([
            'message' => 'تم الانضمام للغرفة بنجاح',
            'room' => $match
        ]);
    }

    // إرسال حركة في اللعبة
    public function move(Request $request, $roomId)
    {
        $match = GameMatch::findOrFail($roomId);
        
        if (!$match->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        if (!$match->isPlayerTurn($request->player_id)) {
            return response()->json([
                'message' => 'ليس دورك'
            ], 400);
        }

        // التحقق من صحة الحركة
        $request->validate([
            'position' => 'required|integer|min:0|max:8',
            'symbol' => 'required|in:X,O'
        ]);

        // تحديث اللوحة
        $match->updateBoard($request->position, $request->symbol);
        
        // تبديل الدور
        $newTurn = $request->symbol === 'X' ? 'O' : 'X';
        $match->update(['current_turn' => $newTurn]);

        // بث الحركة للاعبين
        broadcast(new \App\Events\GameMove($match, [
            'position' => $request->position,
            'symbol' => $request->symbol,
            'player_id' => $request->player_id
        ]));

        return response()->json([
            'message' => 'تم إرسال الحركة بنجاح',
            'move' => [
                'position' => $request->position,
                'symbol' => $request->symbol
            ]
        ]);
    }

    // إرسال رسالة في الدردشة
    public function message(Request $request, $roomId)
    {
        $match = GameMatch::findOrFail($roomId);
        
        if (!$match->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        $request->validate([
            'message' => 'required|string|max:255'
        ]);

        // بث الرسالة للاعبين
        broadcast(new \App\Events\ChatMessage($match, [
            'player_id' => $request->player_id,
            'player_name' => $request->player_name,
            'message' => $request->message
        ]));

        return response()->json([
            'message' => 'تم إرسال الرسالة بنجاح'
        ]);
    }

    // إنهاء اللعبة
    public function end(Request $request, $roomId)
    {
        $match = GameMatch::findOrFail($roomId);
        
        if (!$match->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        $request->validate([
            'winner' => 'required|in:X,O,draw',
            'board_state' => 'required|array',
            'moves_count' => 'required|integer'
        ]);

        $match->update([
            'status' => 'completed',
            'winner' => $request->winner,
            'board_state' => $request->board_state,
            'moves_count' => $request->moves_count,
            'ended_at' => now()
        ]);

        // بث حدث انتهاء اللعبة
        broadcast(new \App\Events\GameEnded($match, [
            'winner' => $request->winner,
            'board_state' => $request->board_state,
            'moves_count' => $request->moves_count
        ]));

        return response()->json([
            'message' => 'تم إنهاء اللعبة بنجاح'
        ]);
    }
} 