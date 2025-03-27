@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-2xl mx-auto">
        <!-- معلومات اللعبة -->
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">اللعب ضد الكمبيوتر</h1>
            <p class="text-gray-400">أنت تلعب بـ <span class="text-blue-400 font-bold">X</span></p>
        </div>

        <!-- لوحة اللعبة -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div class="grid grid-cols-3 gap-4">
                @for ($i = 0; $i < 9; $i++)
                    <button 
                        class="aspect-square bg-white/5 rounded-xl text-4xl font-bold text-white hover:bg-white/10 transition duration-200 flex items-center justify-center game-cell"
                        data-index="{{ $i }}"
                    ></button>
                @endfor
            </div>
        </div>

        <!-- حالة اللعبة -->
        <div class="mt-8 text-center">
            <p class="text-xl text-white game-status">دورك للعب!</p>
            <button 
                class="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 restart-game hidden"
            >
                إعادة اللعب
            </button>
        </div>

        <!-- زر العودة -->
        <div class="mt-8 text-center">
            <a href="{{ route('games.choose') }}" 
               class="text-gray-400 hover:text-white transition duration-200">
                العودة لاختيار نوع اللعبة
            </a>
        </div>
    </div>
</div>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = true;
    const PLAYER_X = 'X';
    const COMPUTER_O = 'O';
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // الصفوف
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // الأعمدة
        [0, 4, 8], [2, 4, 6] // القطريات
    ];

    const cells = document.querySelectorAll('.game-cell');
    const gameStatus = document.querySelector('.game-status');
    const restartButton = document.querySelector('.restart-game');

    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });

    restartButton.addEventListener('click', restartGame);

    function handleCellClick(cell) {
        const index = cell.getAttribute('data-index');

        if (gameBoard[index] !== '' || !isGameActive) return;

        // حركة اللاعب
        gameBoard[index] = PLAYER_X;
        cell.textContent = PLAYER_X;
        cell.classList.add('text-blue-400');

        if (checkWin(PLAYER_X)) {
            endGame('فزت! 🎉');
            return;
        }

        if (isDraw()) {
            endGame('تعادل! 😅');
            return;
        }

        // حركة الكمبيوتر
        gameStatus.textContent = 'دور الكمبيوتر...';
        setTimeout(() => {
            makeComputerMove();
        }, 500);
    }

    function makeComputerMove() {
        const emptyIndices = gameBoard.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);

        if (emptyIndices.length === 0) return;

        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        gameBoard[randomIndex] = COMPUTER_O;
        cells[randomIndex].textContent = COMPUTER_O;
        cells[randomIndex].classList.add('text-red-400');

        if (checkWin(COMPUTER_O)) {
            endGame('الكمبيوتر فاز! 😔');
            return;
        }

        if (isDraw()) {
            endGame('تعادل! 😅');
            return;
        }

        gameStatus.textContent = 'دورك للعب!';
    }

    function checkWin(player) {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return gameBoard[index] === player;
            });
        });
    }

    function isDraw() {
        return !gameBoard.includes('');
    }

    function endGame(message) {
        isGameActive = false;
        gameStatus.textContent = message;
        restartButton.classList.remove('hidden');
    }

    function restartGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('text-blue-400', 'text-red-400');
        });
        gameStatus.textContent = 'دورك للعب!';
        restartButton.classList.add('hidden');
    }
});
</script>
@endpush
@endsection 