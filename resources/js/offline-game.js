import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const playerName = document.querySelector('meta[name="player-name"]').content;
    app.innerHTML = `
        <style>
            :root {
                --primary: #6366f1;
                --primary-dark: #4f46e5;
                --success: #10b981;
                --danger: #ef4444;
                --gray: #64748b;
                --gray-dark: #475569;
                --light: #f8fafc;
                --dark: #1e293b;
                --bg-dark: #121212;
                --card-bg: #1e1e1e;
                --text-light: #f8fafc;
            }
            body {
                background-color: var(--bg-dark);
                color: var(--text-light);
            }
            .game-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                max-width: 300px;
                width: 100%;
                margin: 0 auto;
                background: var(--card-bg);
                padding: 10px;
                border-radius: 16px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
            }
            .game-cell {
                aspect-ratio: 1;
                background: #2a2a2a;
                border: none;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                position: relative;
                overflow: hidden;
            }
            .game-cell:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .game-cell.x {
                color: transparent;
            }
            .game-cell.o {
                color: transparent;
            }
            .game-cell.x:after, .game-cell.x:before {
                content: '';
                position: absolute;
                width: 15%;
                height: 70%;
                background: var(--primary);
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            .game-cell.x:before {
                transform: rotate(45deg);
            }
            .game-cell.x:after {
                transform: rotate(-45deg);
            }
            .game-cell.o:after {
                content: '';
                position: absolute;
                width: 60%;
                height: 60%;
                border: 8px solid var(--success);
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .game-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                max-width: 400px;
                margin: 0 auto;
                align-items: center;
                padding: 10px;
            }
            .game-actions {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 12px;
                width: 100%;
                max-width: 300px;
            }
            .reset-button {
                background: var(--primary);
                color: white;
                padding: 10px 16px;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
                white-space: nowrap;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .reset-button:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .game-status {
                text-align: center;
                margin: 0;
                font-size: 1.1rem;
                font-weight: bold;
                min-height: 20px;
                color: var(--text-light);
                padding: 8px 12px;
                border-radius: 12px;
                background: var(--card-bg);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                width: 100%;
                max-width: 300px;
            }
            .back-button, .logout-button {
                position: absolute;
                padding: 8px 16px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: bold;
            }
            .back-button {
                top: 10px;
                right: 10px;
                background: var(--gray);
                color: white;
            }
            .back-button:hover {
                background: var(--gray-dark);
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .logout-button {
                top: 10px;
                left: 10px;
                background: var(--danger);
                color: white;
            }
            .logout-button:hover {
                background: #dc2626;
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .stats-container {
                display: flex;
                justify-content: center;
                gap: 10px;
                width: 100%;
                max-width: 260px;
            }
            .stat-card {
                flex: 1;
                aspect-ratio: 1;
                background: var(--card-bg);
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                position: relative;
                overflow: hidden;
                padding: 5px;
            }
            .stat-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }
            .stat-x {
                background: linear-gradient(135deg, #1a365d, #2a4365);
                border: 2px solid #2c5282;
            }
            .stat-draw {
                background: linear-gradient(135deg, #1a202c, #2d3748);
                border: 2px solid #4a5568;
            }
            .stat-o {
                background: linear-gradient(135deg, #1c4532, #276749);
                border: 2px solid #2f855a;
            }
            .stat-label {
                font-size: 14px;
                font-weight: bold;
                color: var(--text-light);
            }
            .stat-x .stat-label {
                color: var(--primary-dark);
            }
            .stat-o .stat-label {
                color: var(--success);
            }
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: var(--text-light);
            }
            .stat-x .stat-value {
                color: #a5b4fc;
            }
            .stat-o .stat-value {
                color: #6ee7b7;
            }
            .player-turn {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: var(--primary);
                transition: all 0.3s ease;
            }
            .player-o .player-turn {
                background: var(--success);
            }
            .page-title {
                font-size: 1.8rem;
                font-weight: bold;
                text-align: center;
                margin-bottom: 20px;
                color: var(--text-light);
            }
            @media (max-width: 768px) {
                .stats-container {
                    max-width: 280px;
                }
                .game-board {
                    max-width: 280px;
                }
                .game-status {
                    max-width: 280px;
                    font-size: 0.9rem;
                }
                .stat-value {
                    font-size: 20px;
                }
                .stat-label {
                    font-size: 11px;
                }
                .back-button, .logout-button {
                    padding: 7px 14px;
                    font-size: 13px;
                }
            }
            @media (max-height: 700px) {
                .game-container {
                    gap: 8px;
                }
                .game-board {
                    gap: 5px;
                    padding: 8px;
                }
                .game-cell {
                    font-size: 32px;
                }
                .reset-button {
                    padding: 8px 12px;
                }
            }
        </style>
        <div class="container mx-auto px-4 py-4">
            <button class="back-button" onclick="window.location.href='/games/choose'">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
                </svg>
                العودة
            </button>
            <span class="logout-button" onclick="document.getElementById('logout-form').submit()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                    <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
                تسجيل خروج
            </span>
            <form id="logout-form" action="/logout" method="POST" style="display: none">
                <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').content}">
            </form>
            
            <div class="game-container" style="margin-top: 20px;">
            <!-- إحصائيات اللعبة -->
                <div class="stats-container">
                    <div class="stat-card stat-x">
                        <div class="stat-label">X فوز</div>
                        <div id="x-wins" class="stat-value">0</div>
                </div>
                    <div class="stat-card stat-draw">
                        <div class="stat-label">تعادل</div>
                        <div id="draws" class="stat-value">0</div>
                </div>
                    <div class="stat-card stat-o">
                        <div class="stat-label">O فوز</div>
                        <div id="o-wins" class="stat-value">0</div>
                </div>
            </div>
            
                <div id="game-status" class="game-status">دور اللاعب X</div>
                <div class="game-board">
                    ${Array(9).fill('').map((_, i) => `
                        <div class="game-cell" data-cell-index="${i}"></div>
                    `).join('')}
                </div>
                <div class="game-actions">
                    <button class="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                        لعبة جديدة
                    </button>
                </div>
            </div>
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
        
        // إضافة تأثير حركي للخلية عند النقر
        clickedCell.style.transform = 'scale(0.9)';
        setTimeout(() => {
            clickedCell.style.transform = 'scale(1)';
        }, 150);
    }

    function handleResultValidation() {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        let roundWon = false;
        let winningCombo = [];
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                roundWon = true;
                winningCombo = [a, b, c];
                break;
            }
        }

        if (roundWon) {
            // إضافة تأثير للخلايا الفائزة
            winningCombo.forEach(index => {
                const cell = document.querySelector(`[data-cell-index="${index}"]`);
                cell.style.backgroundColor = currentPlayer === 'X' ? '#dbeafe' : '#dcfce7';
                cell.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)';
            });
            
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
        statusDisplay.classList.toggle('player-o', currentPlayer === 'O');
    }

    function handleReset() {
        // إضافة تأثير حركي لزر إعادة اللعبة
        resetButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            resetButton.style.transform = 'scale(1)';
        }, 150);
        
        currentPlayer = 'X';
        gameBoard = Array(9).fill('');
        gameActive = true;
        statusDisplay.textContent = `دور اللاعب ${currentPlayer}`;
        statusDisplay.classList.remove('player-o');
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
            
            // إضافة تأثير لتحديث اللوحة
            cell.style.opacity = '0';
            setTimeout(() => {
                cell.style.opacity = '1';
            }, 50 + Math.random() * 150);
        });
    }

    // إضافة الأحداث
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        
        // إضافة تأثير ظهور تدريجي للخلايا عند بدء اللعبة
        cell.style.opacity = '0';
        setTimeout(() => {
            cell.style.opacity = '1';
        }, 50 + Math.random() * 200);
    });
    
    resetButton.addEventListener('click', handleReset);
}); 