<?php

namespace App\Http\Controllers;

use App\Models\GameArchive;
use Illuminate\Http\Request;

class GameArchiveController extends Controller
{
    public function index()
    {
        return GameArchive::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'player_x' => 'required|string',
            'player_o' => 'required|string',
            'winner' => 'required|in:X,O,draw',
            'points_x' => 'required|integer',
            'points_o' => 'required|integer',
            'board_state' => 'required|array',
            'moves_count' => 'required|integer'
        ]);

        $archive = GameArchive::create($validated);
        return response()->json($archive, 201);
    }
}
