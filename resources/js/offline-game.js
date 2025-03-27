import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const playerName = document.querySelector('meta[name="player-name"]').content;
    app.innerHTML = `
        <style>
            .game-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                max-width: 240px;
                margin: 0 auto;
                background: #f8fafc;
                padding: 10px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .game-cell {
                aspect-ratio: 1;
                background: #ffffff;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 60px;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            .game-cell:hover {
                background: #f1f5f9;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            }
            .game-cell.x {
                color: #3b82f6;
                border-color: #93c5fd;
            }
            .game-cell.o {
                color: #22c55e;
                border-color: #86efac;
            }
            .game-container {
                display: flex;
                gap: 20px;
                max-width: 600px;
                margin: 0 auto;
                align-items: center;
            }
            .game-actions {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 240px;
            }
            .reset-button {
                background: #4f46e5;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            .reset-button:hover {
                background: #4338ca;
            }
            .game-status {
                text-align: center;
                margin: 20px 0;
                font-size: 1.2em;
                font-weight: bold;
                min-height: 30px;
                color: #333;
            }
            .back-button {
                position: absolute;
                top: 20px;
                right: 20px;
                background: #64748b;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .back-button:hover {
                background: #475569;
            }
        </style>
        <div class="container mx-auto px-4 py-8">
            <button class="back-button" onclick="window.location.href='/'">العودة للرئيسية</button>
            <h1 class="text-4xl font-bold text-center mb-8">لعبة XO - وضع غير متصل</h1>
            
            <!-- إحصائيات اللعبة -->
            <div class="flex justify-center gap-4 mb-8">
                <div class="w-24 h-24 bg-blue-100 rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div class="text-blue-800 font-bold">X فوز</div>
                    <div id="x-wins" class="text-3xl font-bold text-blue-600">0</div>
                </div>
                <div class="w-24 h-24 bg-gray-100 rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div class="text-gray-800 font-bold">تعادل</div>
                    <div id="draws" class="text-3xl font-bold text-gray-600">0</div>
                </div>
                <div class="w-24 h-24 bg-green-100 rounded-lg flex flex-col items-center justify-center shadow-lg">
                    <div class="text-green-800 font-bold">O فوز</div>
                    <div id="o-wins" class="text-3xl font-bold text-green-600">0</div>
                </div>
            </div>
            
            <!-- إدخال معرفات اللاعبين -->
            <div class="flex justify-center gap-4 mb-8">
                <div class="flex flex-col">
                    <label class="text-sm mb-1">معرف اللاعب X</label>
                    <input type="number" id="player-x" class="border rounded px-3 py-2" value="1" min="1">
                </div>
                <div class="flex flex-col">
                    <label class="text-sm mb-1">معرف اللاعب O</label>
                    <input type="number" id="player-o" class="border rounded px-3 py-2" value="2" min="1">
                </div>
            </div>

            <div class="game-container">
                <div class="game-board">
                    ${Array(9).fill('').map((_, i) => `
                        <div class="game-cell" data-cell-index="${i}"></div>
                    `).join('')}
                </div>
                <div class="game-actions">
                    <button class="reset-button">لعبة جديدة</button>
                </div>
            </div>
            <div class="game-status text-center text-xl font-bold mt-4">دور اللاعب X</div>
        </div>
    `;

    let currentPlayer = 'X';
    let gameBoard = Array(9).fill('');
    let gameActive = true;
    
    // تهيئة عناصر اللعبة
    const statusDisplay = document.querySelector('.game-status');
    const cells = document.querySelectorAll('.game-cell');
    const resetButton = document.querySelector('.reset-button');
    const xWinsDisplay = document.getElementById('x-wins');
    const oWinsDisplay = document.getElementById('o-wins');
    const drawsDisplay = document.getElementById('draws');

    // تهيئة النقاط
    let scores = {
        X: 0,
        O: 0,
        draw: 0
    };

    function updateScoreDisplay() {
        xWinsDisplay.textContent = scores.X;
        oWinsDisplay.textContent = scores.O;
        drawsDisplay.textContent = scores.draw;
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameBoard[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameBoard[clickedCellIndex] = currentPlayer;
        clickedCell.textContent = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
    }

    function handleResultValidation() {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `اللاعب ${currentPlayer} فاز! 🎉`;
            gameActive = false;
            scores[currentPlayer]++;
            updateScoreDisplay();
            return;
        }

        const roundDraw = !gameBoard.includes('');
        if (roundDraw) {
            statusDisplay.textContent = 'تعادل! 🤝';
            gameActive = false;
            scores.draw++;
            updateScoreDisplay();
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.textContent = `دور اللاعب ${currentPlayer}`;
    }

    function handleReset() {
        currentPlayer = 'X';
        gameBoard = Array(9).fill('');
        gameActive = true;
        statusDisplay.textContent = `دور اللاعب ${currentPlayer}`;
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });
    }

    // إضافة الأحداث
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetButton.addEventListener('click', handleReset);
}); 