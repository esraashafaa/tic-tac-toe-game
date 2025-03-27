<?php

namespace App\Services;

use App\Models\Game;
use App\Models\GameMove;
use App\Models\GamePlayer;

class GameService
{
    /**
     * الحصول على حالة اللوحة الأولية بناءً على وضع اللعبة
     */
    public function getInitialBoardState($gameMode)
    {
        switch ($gameMode) {
            case 'classic':
                // لوحة 3x3 فارغة
                return [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ];
            case 'ultimate':
                // لوحة Ultimate Tic-Tac-Toe (9 لوحات صغيرة)
                $board = [];
                for ($i = 0; $i < 3; $i++) {
                    $row = [];
                    for ($j = 0; $j < 3; $j++) {
                        $row[] = [
                            [null, null, null],
                            [null, null, null],
                            [null, null, null]
                        ];
                    }
                    $board[] = $row;
                }
                return [
                    'mainBoard' => [[null, null, null], [null, null, null], [null, null, null]],
                    'subBoards' => $board,
                    'nextSubBoard' => null // يمكن للاعب الأول اللعب في أي لوحة فرعية
                ];
            case 'connect_five':
                // لوحة 6x6 فارغة
                $board = [];
                for ($i = 0; $i < 6; $i++) {
                    $row = [];
                    for ($j = 0; $j < 6; $j++) {
                        $row[] = null;
                    }
                    $board[] = $row;
                }
                return $board;
            default:
                return [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ];
        }
    }

    /**
     * الحصول على معرف اللاعب الأول في اللعبة (من يبدأ)
     */
    public function getFirstPlayerForGame($gameId)
    {
        // في معظم الحالات، اللاعب بالرمز X يبدأ
        return GamePlayer::where('game_id', $gameId)
                         ->where('player_symbol', 'X')
                         ->value('user_id');
    }

    /**
     * إجراء حركة في اللعبة
     */
    public function makeMove(Game $game, $userId, $posX, $posY, $subPosX = null, $subPosY = null)
    {
        // التحقق من صحة الحركة بناءً على وضع اللعبة
        if ($game->game_mode === 'classic') {
            return $this->makeClassicMove($game, $userId, $posX, $posY);
        } else if ($game->game_mode === 'ultimate') {
            return $this->makeUltimateMove($game, $userId, $posX, $posY, $subPosX, $subPosY);
        } else if ($game->game_mode === 'connect_five') {
            return $this->makeConnectFiveMove($game, $userId, $posX, $posY);
        }

        return [
            'success' => false,
            'message' => 'وضع اللعبة غير مدعوم'
        ];
    }

    /**
     * إجراء حركة في وضع Classic
     */
    private function makeClassicMove(Game $game, $userId, $posX, $posY)
    {
        $boardState = $game->board_state;

        // التحقق من صحة الإحداثيات
        if ($posX < 0 || $posX > 2 || $posY < 0 || $posY > 2) {
            return [
                'success' => false,
                'message' => 'إحداثيات غير صالحة'
            ];
        }

        // التحقق مما إذا كانت الخلية متاحة
        if ($boardState[$posY][$posX] !== null) {
            return [
                'success' => false,
                'message' => 'هذه الخلية مشغولة بالفعل'
            ];
        }

        // الحصول على رمز اللاعب
        $playerSymbol = GamePlayer::where('game_id', $game->id)
                                 ->where('user_id', $userId)
                                 ->value('player_symbol');

        // تحديث حالة اللوحة
        $boardState[$posY][$posX] = $playerSymbol;
        $game->board_state = $boardState;

        // إنشاء سجل الحركة
        $moveNumber = GameMove::where('game_id', $game->id)->count() + 1;
        $move = new GameMove();
        $move->game_id = $game->id;
        $move->user_id = $userId;
        $move->position_x = $posX;
        $move->position_y = $posY;
        $move->move_number = $moveNumber;
        $move->save();

        // التحقق من الفوز
        if ($this->checkClassicWin($boardState, $playerSymbol)) {
            $game->status = 'completed';
            $game->winner_id = $userId;
        }
        // التحقق من التعادل
        else if ($this->isBoardFull($boardState)) {
            $game->status = 'completed';
            $game->winner_id = null; // تعادل، لا يوجد فائز
        }
        // تغيير الدور إلى اللاعب التالي
        else {
            $nextPlayerId = GamePlayer::where('game_id', $game->id)
                                    ->where('user_id', '!=', $userId)
                                    ->value('user_id');
            $game->current_turn_player_id = $nextPlayerId;
        }

        $game->save();

        return [
            'success' => true,
            'game' => $game,
            'move' => $move
        ];
    }

    /**
     * إجراء حركة في وضع Ultimate
     */
    private function makeUltimateMove(Game $game, $userId, $posX, $posY, $subPosX, $subPosY)
    {
        $boardState = $game->board_state;

        // التحقق من أن اللعبة في وضع Ultimate
        if (!isset($boardState['mainBoard']) || !isset($boardState['subBoards'])) {
            return [
                'success' => false,
                'message' => 'حالة اللوحة غير صالحة للوضع Ultimate'
            ];
        }

        // التحقق من صحة الإحداثيات
        if ($posX < 0 || $posX > 2 || $posY < 0 || $posY > 2 ||
            $subPosX < 0 || $subPosX > 2 || $subPosY < 0 || $subPosY > 2) {
            return [
                'success' => false,
                'message' => 'إحداثيات غير صالحة'
            ];
        }

        // التحقق من أن اللوحة الفرعية التالية صحيحة
        $nextSubBoard = $boardState['nextSubBoard'];
        if ($nextSubBoard !== null && ($nextSubBoard['x'] != $posX || $nextSubBoard['y'] != $posY)) {
            return [
                'success' => false,
                'message' => 'يجب اللعب في اللوحة الفرعية المحددة'
            ];
        }

        // التحقق من أن اللوحة الفرعية لم تكتمل بعد
        if ($boardState['mainBoard'][$posY][$posX] !== null) {
            return [
                'success' => false,
                'message' => 'هذه اللوحة الفرعية مكتملة بالفعل'
            ];
        }

        // التحقق من أن الخلية متاحة في اللوحة الفرعية
        if ($boardState['subBoards'][$posY][$posX][$subPosY][$subPosX] !== null) {
            return [
                'success' => false,
                'message' => 'هذه الخلية مشغولة بالفعل'
            ];
        }

        // الحصول على رمز اللاعب
        $playerSymbol = GamePlayer::where('game_id', $game->id)
                                 ->where('user_id', $userId)
                                 ->value('player_symbol');

        // تحديث حالة اللوحة الفرعية
        $boardState['subBoards'][$posY][$posX][$subPosY][$subPosX] = $playerSymbol;

        // التحقق من الفوز في اللوحة الفرعية
        $subBoard = $boardState['subBoards'][$posY][$posX];
        if ($this->checkClassicWin($subBoard, $playerSymbol)) {
            $boardState['mainBoard'][$posY][$posX] = $playerSymbol;
        }
        // التحقق من التعادل في اللوحة الفرعية
        else if ($this->isSubBoardFull($subBoard)) {
            $boardState['mainBoard'][$posY][$posX] = 'T'; // T للتعادل
        }

        // تحديد اللوحة الفرعية التالية بناءً على الحركة الحالية
        if ($boardState['mainBoard'][$subPosY][$subPosX] === null) {
            $boardState['nextSubBoard'] = ['x' => $subPosX, 'y' => $subPosY];
        } else {
            $boardState['nextSubBoard'] = null; // يمكن للاعب التالي اللعب في أي لوحة فرعية غير مكتملة
        }

        $game->board_state = $boardState;

        // إنشاء سجل الحركة
        $moveNumber = GameMove::where('game_id', $game->id)->count() + 1;
        $move = new GameMove();
        $move->game_id = $game->id;
        $move->user_id = $userId;
        $move->position_x = $posX;
        $move->position_y = $posY;
        $move->sub_position_x = $subPosX;
        $move->sub_position_y = $subPosY;
        $move->move_number = $moveNumber;
        $move->save();

        // التحقق من الفوز في اللوحة الرئيسية
        if ($this->checkClassicWin($boardState['mainBoard'], $playerSymbol)) {
            $game->status = 'completed';
            $game->winner_id = $userId;
        }
        // التحقق من التعادل في اللوحة الرئيسية
        else if ($this->isMainBoardFull($boardState['mainBoard'])) {
            $game->status = 'completed';
            $game->winner_id = null; // تعادل، لا يوجد فائز
        }
        // تغيير الدور إلى اللاعب التالي
        else {
            $nextPlayerId = GamePlayer::where('game_id', $game->id)
                                    ->where('user_id', '!=', $userId)
                                    ->value('user_id');
            $game->current_turn_player_id = $nextPlayerId;
        }

        $game->save();

        return [
            'success' => true,
            'game' => $game,
            'move' => $move
        ];
    }

    /**
     * إجراء حركة في وضع Connect Five
     */
    private function makeConnectFiveMove(Game $game, $userId, $posX, $posY)
    {
        $boardState = $game->board_state;

        // التحقق من صحة الإحداثيات
        if ($posX < 0 || $posX > 5 || $posY < 0 || $posY > 5) {
            return [
                'success' => false,
                'message' => 'إحداثيات غير صالحة'
            ];
        }

        // التحقق مما إذا كانت الخلية متاحة
        if ($boardState[$posY][$posX] !== null) {
            return [
                'success' => false,
                'message' => 'هذه الخلية مشغولة بالفعل'
            ];
        }

        // الحصول على رمز اللاعب
        $playerSymbol = GamePlayer::where('game_id', $game->id)
                                 ->where('user_id', $userId)
                                 ->value('player_symbol');

        // تحديث حالة اللوحة
        $boardState[$posY][$posX] = $playerSymbol;
        $game->board_state = $boardState;

        // إنشاء سجل الحركة
        $moveNumber = GameMove::where('game_id', $game->id)->count() + 1;
        $move = new GameMove();
        $move->game_id = $game->id;
        $move->user_id = $userId;
        $move->position_x = $posX;
        $move->position_y = $posY;
        $move->move_number = $moveNumber;
        $move->save();

        // التحقق من الفوز
        if ($this->checkConnectFiveWin($boardState, $playerSymbol, $posX, $posY)) {
            $game->status = 'completed';
            $game->winner_id = $userId;
        }
        // التحقق من التعادل
        else if ($this->isBoardFullConnectFive($boardState)) {
            $game->status = 'completed';
            $game->winner_id = null; // تعادل، لا يوجد فائز
        }
        // تغيير الدور إلى اللاعب التالي
        else {
            $nextPlayerId = GamePlayer::where('game_id', $game->id)
                                    ->where('user_id', '!=', $userId)
                                    ->value('user_id');
            $game->current_turn_player_id = $nextPlayerId;
        }

        $game->save();

        return [
            'success' => true,
            'game' => $game,
            'move' => $move
        ];
    }

    /**
     * التحقق من الفوز في وضع Classic
     */
    private function checkClassicWin($board, $symbol)
    {
        // التحقق من الصفوف
        for ($i = 0; $i < 3; $i++) {
            if ($board[$i][0] === $symbol && $board[$i][1] === $symbol && $board[$i][2] === $symbol) {
                return true;
            }
        }

        // التحقق من الأعمدة
        for ($i = 0; $i < 3; $i++) {
            if ($board[0][$i] === $symbol && $board[1][$i] === $symbol && $board[2][$i] === $symbol) {
                return true;
            }
        }

        // التحقق من القطر الرئيسي
        if ($board[0][0] === $symbol && $board[1][1] === $symbol && $board[2][2] === $symbol) {
            return true;
        }

        // التحقق من القطر الثانوي
        if ($board[0][2] === $symbol && $board[1][1] === $symbol && $board[2][0] === $symbol) {
            return true;
        }

        return false;
    }

    /**
     * التحقق من الفوز في وضع Connect Five
     */
    private function checkConnectFiveWin($board, $symbol, $posX, $posY)
    {
        $directions = [
            [0, 1],  // أفقي
            [1, 0],  // عمودي
            [1, 1],  // قطري من اليسار العلوي إلى اليمين السفلي
            [1, -1]  // قطري من اليسار السفلي إلى اليمين العلوي
        ];

        foreach ($directions as $dir) {
            $count = 1;  // بدء من الخلية الحالية
            $dx = $dir[0];
            $dy = $dir[1];

            // التحقق في اتجاه واحد
            for ($i = 1; $i <= 4; $i++) {
                $newX = $posX + $dx * $i;
                $newY = $posY + $dy * $i;

                if ($newX < 0 || $newX >= 6 || $newY < 0 || $newY >= 6 || $board[$newY][$newX] !== $symbol) {
                    break;
                }

                $count++;
            }

            // التحقق في الاتجاه المعاكس
            for ($i = 1; $i <= 4; $i++) {
                $newX = $posX - $dx * $i;
                $newY = $posY - $dy * $i;

                if ($newX < 0 || $newX >= 6 || $newY < 0 || $newY >= 6 || $board[$newY][$newX] !== $symbol) {
                    break;
                }

                $count++;
            }

            if ($count >= 5) {
                return true;
            }
        }

        return false;
    }

    /**
     * التحقق مما إذا كانت اللوحة ممتلئة (للوضع Classic)
     */
    private function isBoardFull($board)
    {
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                if ($board[$i][$j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * التحقق مما إذا كانت اللوحة الفرعية ممتلئة (للوضع Ultimate)
     */
    private function isSubBoardFull($subBoard)
    {
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                if ($subBoard[$i][$j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * التحقق مما إذا كانت اللوحة الرئيسية ممتلئة (للوضع Ultimate)
     */
    private function isMainBoardFull($mainBoard)
    {
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                if ($mainBoard[$i][$j] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * التحقق مما إذا كانت اللوحة ممتلئة (للوضع Connect Five)
     */
    private function isBoardFullConnectFive($board)
    {
        for ($i = 0; $i < 6; $i++) {
            for ($j = 0; $j < 6; $j++) {
                if ($board[$i][$j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
}