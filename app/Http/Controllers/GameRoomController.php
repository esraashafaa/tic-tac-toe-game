<?php

namespace App\Http\Controllers;

use App\Models\GameRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

class GameRoomController extends Controller
{
    // عرض قائمة الغرف المتاحة
    public function index()
    {
        $rooms = GameRoom::where('status', 'waiting')
            ->orWhere('status', 'playing')
            ->get();
        return response()->json($rooms);
    }

    // إنشاء غرفة جديدة
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'player_id' => 'required|integer',
            'symbol' => 'required|in:X,O'
        ]);

        $room = GameRoom::create([
            'name' => $request->name,
            'player1_id' => $request->player_id,
            'player1_symbol' => $request->symbol,
            'player2_symbol' => $request->symbol === 'X' ? 'O' : 'X',
            'status' => 'waiting'
        ]);

        return response()->json([
            'message' => 'تم إنشاء الغرفة بنجاح',
            'room' => $room
        ]);
    }

    // الانضمام إلى غرفة
    public function join(Request $request, GameRoom $room)
    {
        if ($room->isFull()) {
            return response()->json([
                'message' => 'الغرفة ممتلئة'
            ], 400);
        }

        if ($room->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت موجود بالفعل في هذه الغرفة'
            ], 400);
        }

        $room->player2_id = $request->player_id;
        $room->status = 'playing';
        $room->save();

        // بث حدث انضمام اللاعب
        Broadcast::channel('game.' . $room->id)->send(new \App\Events\PlayerJoined($room));

        return response()->json([
            'message' => 'تم الانضمام للغرفة بنجاح',
            'room' => $room
        ]);
    }

    // إرسال حركة في اللعبة
    public function move(Request $request, GameRoom $room)
    {
        if (!$room->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        if (!$room->isPlayerTurn($request->player_id)) {
            return response()->json([
                'message' => 'ليس دورك'
            ], 400);
        }

        // التحقق من صحة الحركة
        $request->validate([
            'position' => 'required|integer|min:0|max:8',
            'symbol' => 'required|in:X,O'
        ]);

        // بث الحركة للاعبين
        Broadcast::channel('game.' . $room->id)->send(new \App\Events\GameMove([
            'position' => $request->position,
            'symbol' => $request->symbol
        ]));

        return response()->json([
            'message' => 'تم إرسال الحركة بنجاح'
        ]);
    }

    // إرسال رسالة في الدردشة
    public function message(Request $request, GameRoom $room)
    {
        if (!$room->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        $request->validate([
            'message' => 'required|string|max:255'
        ]);

        // بث الرسالة للاعبين
        Broadcast::channel('game.' . $room->id)->send(new \App\Events\ChatMessage([
            'player_id' => $request->player_id,
            'player_name' => $request->player_name,
            'message' => $request->message
        ]));

        return response()->json([
            'message' => 'تم إرسال الرسالة بنجاح'
        ]);
    }

    // إنهاء اللعبة
    public function end(Request $request, GameRoom $room)
    {
        if (!$room->hasPlayer($request->player_id)) {
            return response()->json([
                'message' => 'أنت غير موجود في هذه الغرفة'
            ], 400);
        }

        $request->validate([
            'winner' => 'required|in:X,O,draw',
            'board_state' => 'required|array',
            'moves_count' => 'required|integer'
        ]);

        $room->status = 'ended';
        $room->save();

        // بث حدث انتهاء اللعبة
        Broadcast::channel('game.' . $room->id)->send(new \App\Events\GameEnded([
            'winner' => $request->winner,
            'board_state' => $request->board_state,
            'moves_count' => $request->moves_count
        ]));

        return response()->json([
            'message' => 'تم إنهاء اللعبة بنجاح'
        ]);
    }
} 