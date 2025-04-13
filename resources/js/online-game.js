import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // الحصول على اسم المستخدم ومعرف المستخدم من meta tags
        const username = document.querySelector('meta[name="player-name"]')?.content || 'لاعب';
        const userId = document.querySelector('meta[name="user-id"]')?.content || '0';
        console.log('اسم المستخدم المستخرج:', username);
        console.log('معرف المستخدم:', userId);
        
        // تهيئة حالة اللعبة مباشرة بدون تسجيل دخول كضيف
        const gameState = {
            playerId: parseInt(userId),
            playerName: username,
            match: null,
            board: Array(9).fill(''),
            playerSymbol: null,
            isMyTurn: false,
            gameActive: false,
            currentChannel: null
        };

        // إنشاء واجهة المستخدم
        const app = document.getElementById('app');
    app.innerHTML = `
            <div class="main-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <!-- شريط التنقل العلوي -->
                <div class="navigation-bar">
                    <div class="user-info">
                        <span class="user-name">مرحباً، <strong>${gameState.playerName}</strong></span>
                    </div>
                    <div class="nav-buttons">
                        <a href="/games/choose" class="back-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            العودة
                        </a>
                        <span class="logout-button" onclick="document.getElementById('logout-form').submit()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                            </svg>
                            تسجيل الخروج
                        </span>
                    </div>
                </div>
                
                <form id="logout-form" action="/logout" method="POST" style="display: none">
                    <input type="hidden" name="_token" value="${document.querySelector('meta[name="csrf-token"]').content}">
                </form>

                <div class="game-layout">
                    <!-- القسم الأيسر: معلومات اللعبة -->
                    <div class="left-section">
                        <h1 class="text-2xl font-bold text-center mb-4 text-white">لعبة XO</h1>
                        
                        <!-- حالة الاتصال -->
                        <div class="connection-status">
                            <div class="status-dot w-2 h-2 rounded-full bg-red-500"></div>
                            <span class="text-sm text-white">غير متصل</span>
                        </div>

                        <!-- معلومات اللاعبين -->
                        <div class="players-info">
                            <div class="player-info">
                                <div class="flex items-center gap-2">
                                    <div class="player-symbol x">X</div>
                                    <span class="text-sm text-white">في انتظار اللاعب الأول</span>
                                </div>
                            </div>
                            <div class="player-info">
                                <div class="flex items-center gap-2">
                                    <div class="player-symbol o">O</div>
                                    <span class="text-sm text-white">في انتظار اللاعب الثاني</span>
                                </div>
                            </div>
                        </div>

                        <!-- حالة اللعبة -->
                        <div class="game-status text-center text-lg font-semibold text-white">
                            انقر على "إنشاء مباراة جديدة" للبدء
                        </div>
                    </div>

                    <!-- القسم الأوسط: لوحة اللعب -->
                    <div class="center-section">
                        <!-- أزرار التحكم -->
                        <div class="control-buttons">
                            <button class="create-match">
                                إنشاء مباراة جديدة
                            </button>
                        </div>

                        <!-- لوحة اللعب -->
                        <div class="game-board">
                            ${Array(9).fill('').map((_, i) => `
                                <div class="game-cell" data-index="${i}"></div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- القسم الأيمن: المباريات المتاحة -->
                    <div class="right-section">
                        <div class="available-matches">
                            <div class="flex justify-between items-center mb-2">
                                <h2 class="text-lg font-bold text-white">المباريات المتاحة</h2>
                                <button class="refresh-button">🔄</button>
                            </div>
                            <div class="match-list">
                                <!-- سيتم تحديث هذا القسم ديناميكياً -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // تحديث نمط الخلايا
        const style = document.createElement('style');
        style.textContent = `
            .main-container {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                height: 100vh;
                padding: 1rem;
                font-family: 'Cairo', sans-serif;
                overflow: hidden;
            }

            /* شريط التنقل الجديد */
            .navigation-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 0.75rem;
                margin-bottom: 1rem;
            }

            .user-info {
                display: flex;
                align-items: center;
            }

            .user-name {
                color: white;
                font-size: 1.1rem;
            }

            .nav-buttons {
                display: flex;
                gap: 1rem;
            }

            .back-button, .logout-button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }

            .back-button:hover, .logout-button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            .back-button {
                background: rgba(59, 130, 246, 0.3);
            }

            .back-button:hover {
                background: rgba(59, 130, 246, 0.4);
            }

            .logout-button {
                background: rgba(239, 68, 68, 0.3);
            }

            .logout-button:hover {
                background: rgba(239, 68, 68, 0.4);
            }

            .game-layout {
                display: grid;
                grid-template-columns: 250px 1fr 250px;
                gap: 1rem;
                height: calc(100vh - 6rem);
                max-width: 1200px;
                margin: 0 auto;
            }

            .left-section, .right-section {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 1rem;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .center-section {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 1rem;
            }

            .connection-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
            }

            .players-info {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .player-info {
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
            }

            .player-symbol {
                width: 2rem;
                height: 2rem;
                font-size: 1rem;
                border-radius: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .player-symbol.x {
                background: rgba(59, 130, 246, 0.3);
                color: #3b82f6;
                text-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
            }

            .player-symbol.o {
                background: rgba(239, 68, 68, 0.3);
                color: #ef4444;
                text-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
            }

            .game-board {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 1rem;
                padding: 1rem;
                aspect-ratio: 1;
                max-width: 400px;
                margin: 0 auto;
            }

            .game-cell {
                aspect-ratio: 1;
                font-size: 2.5rem;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
            }

            .game-cell:hover:not(.disabled) {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
            }

            .game-cell.x {
                color: #3b82f6;
                border-color: #3b82f6;
                text-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
            }

            .game-cell.o {
                color: #ef4444;
                border-color: #ef4444;
                text-shadow: 0 0 10px rgba(239, 68, 68, 0.7);
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
            }

            .game-cell.winning {
                animation: pulse-win 1.5s infinite;
                box-shadow: 0 0 20px rgba(16, 185, 129, 0.7);
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.2);
            }

            .game-cell.disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }

            @keyframes pulse-win {
                0% { transform: scale(1); box-shadow: 0 0 10px rgba(16, 185, 129, 0.7); }
                50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(16, 185, 129, 0.9); }
                100% { transform: scale(1); box-shadow: 0 0 10px rgba(16, 185, 129, 0.7); }
            }

            .create-match {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                transition: all 0.3s ease;
                border: none;
                margin: 0 auto;
                display: block;
            }

            .create-match:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            .match-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                overflow-y: auto;
                max-height: calc(100vh - 200px);
            }

            .match-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 0.5rem;
                padding: 0.75rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
            }

            .match-info {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .match-code, .player-name {
                font-size: 0.875rem;
                color: white;
            }

            .join-button {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                transition: all 0.3s ease;
            }

            .join-button:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .refresh-button {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .refresh-button:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(180deg);
            }

            .status-dot.connected {
                background: #10b981;
                box-shadow: 0 0 8px #10b981;
            }

            .status-dot.disconnected {
                background: #ef4444;
                box-shadow: 0 0 8px #ef4444;
            }

            .game-result {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }

            .game-result.active {
                opacity: 1;
                pointer-events: all;
            }

            .result-content {
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 1rem;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                transform: translateY(-20px);
                transition: transform 0.5s ease;
            }

            .game-result.active .result-content {
                transform: translateY(0);
            }

            .result-title {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }

            .result-title.win {
                color: #10b981;
            }

            .result-title.lose {
                color: #ef4444;
            }

            .result-title.draw {
                color: #f59e0b;
            }

            .result-message {
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
            }

            .result-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .result-button {
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                transition: all 0.3s ease;
                border: none;
            }

            .result-button.primary {
                background: #3b82f6;
                color: white;
            }

            .result-button.secondary {
                background: rgba(0, 0, 0, 0.1);
                color: #333;
            }

            .result-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }

            .your-turn {
                animation: pulse 2s infinite;
                color: #10b981;
            }
        `;
        document.head.appendChild(style);

    // تهيئة Pusher
    const echo = window.Echo;
    if (!echo) {
        throw new Error('لم يتم تهيئة Laravel Echo');
    }

    // إضافة معالج الحدث للخلايا
    const gameCells = document.querySelectorAll('.game-cell');
    gameCells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // تحديث حالة الاتصال
    echo.connector.pusher.connection.bind('connected', () => {
        console.log('تم الاتصال بـ Pusher');
        updateConnectionStatus(true);
        // إعادة الاشتراك في القناة الحالية إذا وجدت
        if (gameState.currentChannel) {
            subscribeToRoom(gameState.match?.id);
        }
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('فقد الاتصال بـ Pusher');
        updateConnectionStatus(false);
        showMessage('فقد الاتصال بالخادم', 'error');
    });

    echo.connector.pusher.connection.bind('error', (error) => {
        console.error('خطأ في اتصال Pusher:', error);
        showMessage('حدث خطأ في الاتصال', 'error');
    });

    // إضافة رسالة ترحيبية
    addMessage('مرحباً بك في لعبة XO المتصلة!', 'system');

    // تحديث دالة handleCellClick
    async function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // التحقق من صحة الحركة
        if (!validateMove(clickedCellIndex, gameState.playerSymbol)) {
            console.log('حركة غير صالحة:', {
                gameActive: gameState.gameActive,
                isMyTurn: gameState.isMyTurn,
                position: clickedCellIndex,
                symbol: gameState.playerSymbol
            });
            return;
        }

        try {
            // إرسال الحركة للخادم
            // تحديث لوحة اللعبة المحلية مؤقتاً (سيتم التأكيد بعد استجابة الخادم)
            const newBoard = [...gameState.board];
            newBoard[clickedCellIndex] = gameState.playerSymbol;
            
            // طباعة بيانات الحركة والحالة قبل الإرسال
            console.log('معلومات الحركة الكاملة:', {
                position: clickedCellIndex,
                symbol: gameState.playerSymbol,
                board_state: newBoard,
                game_state: {
                    match_id: gameState.match?.id,
                    player_id: gameState.playerId,
                    playerSymbol: gameState.playerSymbol,
                    isMyTurn: gameState.isMyTurn,
                    currentPlayer: gameState.currentPlayer
                }
            });

            // تحويل مصفوفة اللوحة إلى التنسيق المناسب (إما مصفوفة أو سلسلة JSON)
            // بعض الخوادم قد تتوقع مصفوفة سلاسل نصية وليس مصفوفة كائنات JSON
            const boardStateString = JSON.stringify(newBoard);

            const requestBody = {
                player_id: parseInt(gameState.playerId),
                position: clickedCellIndex,
                symbol: gameState.playerSymbol,
                board_state: newBoard // المصفوفة المحدثة
            };

            console.log('إرسال طلب للخادم:', {
                url: `/api/game/matches/${gameState.match.id}/move`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const response = await fetch(`/api/game/matches/${gameState.match.id}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('استجابة الخادم:', {
                status: response.status,
                statusText: response.statusText
            });

            const responseText = await response.text();
            console.log('نص الاستجابة:', responseText);

            if (!response.ok) {
                let errorMessage = 'بيانات غير صالحة';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorMessage;
                    console.error('تفاصيل الخطأ من الخادم:', errorData);
                    
                    // طباعة معلومات إضافية عن الخطأ
                    if (errorData.errors) {
                        console.error('أخطاء التحقق من الصحة:', errorData.errors);
                    }
                } catch (e) {
                    console.error('خطأ في تحليل استجابة الخطأ:', e);
                }
                throw new Error(errorMessage);
            }

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('بيانات الاستجابة المحللة:', data);
            } catch (e) {
                console.error('خطأ في تحليل استجابة النجاح:', e);
                throw new Error('خطأ في تحليل استجابة الخادم');
            }

            // تحديث حالة اللعبة المحلية فقط بعد نجاح الحركة
            gameState.board = newBoard;
            gameState.isMyTurn = false;
            gameState.movesCount++;

            // تحديث واجهة المستخدم
            updateGameBoard();
            updateGameStatus();
            
            // فحص انتهاء المباراة بعد كل حركة
            const gameEnded = checkGameEnd();
            
            // إذا لم تنته المباراة، أضف رسالة بالحركة
            if (!gameEnded) {
                addMessage(`قمت بالنقر على الخلية ${clickedCellIndex + 1}`, 'system');
            }

        } catch (error) {
                // طباعة الخطأ في التيرمينال
                console.log('=== بداية الخطأ ===');
                console.log('نوع الخطأ:', error.name);
                console.log('رسالة الخطأ:', error.message);
                console.log('تفاصيل الخطأ:', error.stack);
                console.log('=== نهاية الخطأ ===');

            console.error('خطأ في إرسال الحركة:', error);
            showMessage(error.message || 'حدث خطأ أثناء إرسال الحركة', 'error');
        }
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        // تحديث حالة اللوحة
        gameState.board[clickedCellIndex] = gameState.currentPlayer;
        
        // تحديث الخلية في واجهة المستخدم
        clickedCell.textContent = gameState.currentPlayer;
        clickedCell.classList.add(gameState.currentPlayer.toLowerCase());
        
        // تحديث حالة الدور
        gameState.isMyTurn = false;
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        
        // تحديث حالة اللعبة في واجهة المستخدم
        updateGameStatus();
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
            if (gameState.board[a] && 
                gameState.board[a] === gameState.board[b] && 
                gameState.board[a] === gameState.board[c]
            ) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            gameState.gameActive = false;
            const statusDisplay = document.querySelector('.game-status');
            statusDisplay.textContent = `الفائز هو ${gameState.currentPlayer}! 🎉`;
            addMessage(`فاز اللاعب ${gameState.currentPlayer}!`, 'system');

            // إرسال نتيجة اللعبة للخادم
            fetch(`/api/game/matches/${gameState.match.id}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    winner: gameState.currentPlayer,
                    board_state: gameState.board,
                    moves_count: gameState.movesCount
                })
            });
            return;
        }

        const roundDraw = !gameState.board.includes('');
        if (roundDraw) {
            gameState.gameActive = false;
            const statusDisplay = document.querySelector('.game-status');
            statusDisplay.textContent = 'تعادل! 🤝';
            addMessage('تعادل!', 'system');

            // إرسال نتيجة اللعبة للخادم
            fetch(`/api/game/matches/${gameState.match.id}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    winner: 'draw',
                    board_state: gameState.board,
                    moves_count: gameState.movesCount
                })
            });
            return;
        }

        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        const statusDisplay = document.querySelector('.game-status');
        statusDisplay.textContent = `دور ${gameState.currentPlayer}`;
    }

    // تحديث حالة اللعبة
    function updateGameStatus() {
        const gameStatus = document.querySelector('.game-status');
        if (gameStatus) {
            if (!gameState.match) {
                gameStatus.textContent = 'جاري انتظار اللاعبين...';
            } else if (gameState.match.status === 'waiting') {
                gameStatus.textContent = 'في انتظار اللاعب الثاني...';
            } else if (gameState.match.status === 'playing') {
                if (gameState.isMyTurn) {
                    gameStatus.textContent = 'دورك!';
                    gameStatus.style.color = '#4CAF50';
                } else {
                    gameStatus.textContent = 'دور اللاعب الآخر';
                    gameStatus.style.color = '#f44336';
                }
            } else if (gameState.match.status === 'ended') {
                gameStatus.textContent = 'انتهت اللعبة';
                gameStatus.style.color = '#666';
            }
        }
    }

    // تحديث لوحة اللعبة
    function updateGameBoard() {
        const cells = document.querySelectorAll('.game-cell');
        cells.forEach((cell, index) => {
            cell.textContent = gameState.board[index] || '';
            cell.classList.remove('x', 'o', 'disabled');
            
            if (gameState.board[index]) {
                cell.classList.add(gameState.board[index].toLowerCase());
            }
            
            // تعطيل الخلايا إذا لم يكن دور اللاعب أو كانت الخلية مشغولة
            if (!gameState.isMyTurn || gameState.board[index] || !gameState.gameActive) {
                cell.classList.add('disabled');
                cell.style.cursor = 'not-allowed';
            } else {
                cell.classList.remove('disabled');
                cell.style.cursor = 'pointer';
            }
        });
    }

    // دالة إضافة رسالة للدردشة
    function addMessage(message, type = 'normal') {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.textContent = message;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // طباعة الرسالة في وحدة التحكم للتصحيح
        console.log(`[${type}] ${message}`);
    }

    // دالة إظهار رسالة
    function showMessage(message, type = 'info') {
        const statusDisplay = document.querySelector('.game-status');
        if (statusDisplay) {
            statusDisplay.textContent = message;
        }
        
        // إضافة الرسالة للدردشة
        addMessage(message, type);
        
        // إخفاء الرسالة بعد 3 ثواني
        setTimeout(() => {
            if (gameState.match) {
                updateGameStatus();
            }
        }, 3000);
    }

        // إضافة معالج حدث لزر إنشاء مباراة جديدة
        const createMatchButton = document.querySelector('.create-match');
        if (createMatchButton) {
            createMatchButton.addEventListener('click', async () => {
                try {
                    console.log('بدء إنشاء مباراة جديدة...');
                    
                    // التحقق من صلاحية معرف المستخدم
                    if (!gameState.playerId || gameState.playerId === '0' || gameState.playerId === 0) {
                        console.error('معرف المستخدم غير صالح:', gameState.playerId);
                        showMessage('يجب تسجيل الدخول أولاً', 'error');
                        validateUser();
                        return;
                    }
                    
                    // تعطيل الزر أثناء الإنشاء
                    createMatchButton.disabled = true;
                    createMatchButton.textContent = 'جاري إنشاء المباراة...';

                    // طباعة معلومات حالة اللعبة الحالية
                    console.log('حالة اللعبة الحالية:', {
                        playerId: gameState.playerId,
                        playerName: gameState.playerName,
                        match: gameState.match ? 'موجودة' : 'غير موجودة',
                        gameActive: gameState.gameActive
                    });
                    
                    // إضافة طريقة بديلة للحصول على CSRF token
                    let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                    if (!csrfToken) {
                        // محاولة الحصول على CSRF token من الكوكيز
                        const cookies = document.cookie.split(';');
                        for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i].trim();
                            if (cookie.startsWith('XSRF-TOKEN=')) {
                                csrfToken = decodeURIComponent(cookie.substring(11));
                                break;
                            }
                        }
                    }
                    
                    if (!csrfToken) {
                        console.error('لم يتم العثور على CSRF token');
                        throw new Error('لم يتم العثور على CSRF token');
                    }
                    
                    console.log('معلومات الطلب المرسل:', {
                        url: '/api/game/matches',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken ? 'موجود' : 'غير موجود',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: {
                            mode: 'online',
                            player1_name: gameState.playerName
                        }
                    });
                    
                    const response = await fetch('/api/game/matches', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({
                            mode: 'online',
                            player1_name: gameState.playerName
                        })
                    });

                    console.log('استلام استجابة:', response.status, response.statusText);
                    
                    // طباعة معلومات أكثر عن الطلب والاستجابة
                    console.log('معلومات الطلب المرسل:', {
                        url: '/api/game/matches',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken ? 'موجود' : 'غير موجود',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: {
                            mode: 'online',
                            player1_name: gameState.playerName
                        }
                    });
                    
                    // التحقق من حالة المصادقة
                    if (response.status === 401) {
                        console.error('خطأ المصادقة: المستخدم غير مسجل دخوله أو انتهت الجلسة');
                        validateUser();
                        return;
                    }
                    
                    // قراءة نص الاستجابة
                    const responseText = await response.text();
                    console.log('نص استجابة الانضمام للمباراة:', responseText);
                    
                    // تحليل البيانات إذا كان هناك محتوى
                    let data;
                    try {
                        data = responseText ? JSON.parse(responseText) : {};
                        console.log('بيانات استجابة الانضمام:', data);
                        
                        // التحقق من وجود رسالة خطأ في الاستجابة
                        if (data.message && !data.success) {
                            throw new Error(data.message);
                        }
                    } catch (e) {
                        console.error('خطأ في تحليل JSON:', e);
                        throw new Error('استجابة الخادم ليست بتنسيق JSON صالح: ' + responseText.substring(0, 100));
                    }

                    if (!response.ok) {
                        console.error('استجابة الخادم غير ناجحة:', response.status, response.statusText);
                        console.error('محتوى الاستجابة:', data);
                        throw new Error(data.message || `خطأ في الخادم: ${response.status} - ${response.statusText}`);
                    }
                    
                    // التحقق من وجود بيانات المباراة في الاستجابة (في خاصية match أو room)
                    const matchData = data.match || data.room;
                    if (!matchData) {
                        console.error('لم يتم استلام بيانات المباراة بعد الانضمام:', data);
                        // البحث عن أي خاصية في الاستجابة قد تحتوي بيانات المباراة
                        const possibleMatches = Object.keys(data).filter(key => 
                            typeof data[key] === 'object' && data[key] !== null);
                        console.log('خصائص الكائنات الموجودة في الاستجابة:', possibleMatches);
                        throw new Error('لم يتم استلام بيانات المباراة - تحقق من استجابة الخادم');
                    }
                    
                    console.log('تم الانضمام إلى المباراة بنجاح:', matchData);
                    
                        // تحديث حالة اللعبة
                    gameState.match = matchData;
                    gameState.playerSymbol = 'X';
                    gameState.isMyTurn = true;
                        gameState.gameActive = true;
                        gameState.board = Array(9).fill('');

                    // الاشتراك في قناة المباراة
                    await subscribeToRoom(data.match.id);

                    // تحديث معلومات اللاعب X
                    updatePlayerInfo('X', gameState.playerName);
                    
                    // تحديث حالة اللعبة
                    updateGameStatus();
                    
                    // إضافة المباراة للقائمة
                    addMatchToList(data.match);

                    // تحديث واجهة المستخدم
                    updateUI();

                    showMessage('تم إنشاء المباراة بنجاح! في انتظار اللاعب الثاني', 'success');
                } catch (error) {
                    console.error('خطأ في إنشاء المباراة:', error);
                    showMessage(error.message || 'حدث خطأ في إنشاء المباراة', 'error');
                } finally {
                    // إعادة تفعيل الزر
                    createMatchButton.disabled = false;
                    createMatchButton.textContent = 'إنشاء مباراة جديدة';
                }
            });
        }

    // تحديث دالة إضافة المباراة للقائمة
    function addMatchToList(match) {
        const matchList = document.querySelector('.match-list');
        if (!matchList) return;

        // التحقق من عدم وجود المباراة مسبقاً
        const existingMatch = matchList.querySelector(`[data-match-id="${match.id}"]`);
        if (existingMatch) {
            return;
        }

        // عدم إضافة المباراة للقائمة إذا كانت خاصة باللاعب الحالي
        if (match.player1_id === gameState.playerId) {
            console.log('لا يتم إضافة المباراة للقائمة لأنها تخص اللاعب الحالي:', match.id);
            return;
        }

        // إنشاء عنصر المباراة
        const matchItem = document.createElement('div');
        matchItem.className = 'match-item';
        matchItem.dataset.matchId = match.id;
        matchItem.innerHTML = `
            <div class="match-info">
                <div class="player-name">${match.player1_name}</div>
                <div class="match-code">كود المباراة: ${match.match_code}</div>
                <div class="match-status">في انتظار اللاعب الثاني</div>
                    </div>
            <button class="join-match-btn" data-match-id="${match.id}">انضمام</button>
        `;

        // إضافة المباراة في بداية القائمة
        matchList.insertBefore(matchItem, matchList.firstChild);

        // إضافة معالج النقر على زر الانضمام
        const joinButton = matchItem.querySelector('.join-match-btn');
        joinButton.addEventListener('click', () => {
            console.log(`النقر على زر الانضمام للمباراة رقم ${match.id}`);
            joinMatch(match.id);
        });
    }

    // تحديث دالة تحميل المباريات
    async function loadMatches() {
        try {
            console.log('بدء تحميل المباريات...');
            
            // الحصول على CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            
            console.log('CSRF Token لتحميل المباريات:', csrfToken ? 'موجود' : 'غير موجود');
            
            const response = await fetch('/api/game/matches/all', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('استجابة تحميل المباريات:', response.status, response.statusText);
            
            // التحقق من المصادقة
            if (response.status === 401) {
                console.error('المستخدم غير مصادق');
                validateUser();
                return;
            }
            
            if (!response.ok) {
                console.error('خطأ في استجابة الخادم:', response.status);
                throw new Error('فشل في تحميل قائمة المباريات');
            }

            // قراءة نص الاستجابة
            const responseText = await response.text();
            console.log('استجابة الخادم لتحميل المباريات:', responseText.length > 100 ? responseText.substring(0, 100) + '...' : responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('خطأ في تحليل JSON:', error);
                throw new Error('خطأ في تحليل استجابة الخادم');
            }

            const matchList = document.querySelector('.match-list');
            
            // مسح قائمة المباريات الحالية
            if (matchList) {
                matchList.innerHTML = '';
                
                // إضافة المباريات المتاحة إلى القائمة
                if (data.waiting_matches && data.waiting_matches.length > 0) {
                    console.log(`تم العثور على ${data.waiting_matches.length} مباراة متاحة`);
                    data.waiting_matches.forEach(match => {
                        // عدم إضافة المباريات النشطة التي بدأت بالفعل
                        if (match.status === 'waiting') {
                            addMatchToList(match);
                        }
                    });
                } else {
                    console.log('لا توجد مباريات متاحة');
                    matchList.innerHTML = '<div class="no-matches">لا توجد مباريات متاحة. قم بإنشاء مباراة جديدة!</div>';
                }
            }
        } catch (error) {
            console.error('خطأ في تحميل المباريات:', error);
        }
    }

    // تحديث واجهة المستخدم بالكامل
    function updateUI() {
        // تحديث حالة اللعبة
        updateGameStatus();
        
        // تحديث لوحة اللعبة
        updateGameBoard();
        
        // تحديث معلومات اللاعبين
        const playerInfos = document.querySelectorAll('.player-info');
        if (gameState.match) {
            // تحديث معلومات اللاعب الأول
            if (playerInfos[0]) {
                playerInfos[0].querySelector('span').textContent = 
                    gameState.match.player1_name + 
                    (gameState.playerId === gameState.match.player1_id ? ' (أنت)' : '');
            }
            
            // تحديث معلومات اللاعب الثاني
            if (playerInfos[1]) {
                if (gameState.match.player2_name) {
                    playerInfos[1].querySelector('span').textContent = 
                        gameState.match.player2_name +
                        (gameState.playerId === gameState.match.player2_id ? ' (أنت)' : '');
                } else {
                    playerInfos[1].querySelector('span').textContent = 'في انتظار اللاعب الثاني...';
                }
            }
        }
        
        // تحديث زر إنشاء المباراة
        const createMatchButton = document.querySelector('.create-match');
        if (createMatchButton) {
            createMatchButton.disabled = !!gameState.match;
        }
    }

    // دالة للاشتراك في قناة المباراة
    async function subscribeToRoom(matchId) {
        try {
            console.log(`الاشتراك في قناة المباراة رقم ${matchId}...`);

            // إلغاء الاشتراك من القناة السابقة إذا وجدت
            if (gameState.currentChannel) {
                await gameState.currentChannel.unsubscribe();
                console.log('تم إلغاء الاشتراك من القناة السابقة');
            }

            // الاشتراك في القناة الجديدة
            const channel = window.Echo.channel(`game.match.${matchId}`);
            
            // الاستماع لحدث انضمام لاعب جديد
            channel.listen('PlayerJoined', (event) => {
                console.log('حدث انضمام لاعب جديد:', event);
                
                // تحديث بيانات المباراة إذا كانت موجودة في الحدث
                if (event.match) {
                    gameState.match = event.match;
                }
                
                // تحديث بيانات اللاعب الثاني
                const player2Name = event.player_name || event.match?.player2_name;
                console.log('تم استلام اسم اللاعب 2:', player2Name);
                
                // تحديث معلومات اللاعبين في واجهة المستخدم
                updatePlayerInfo('O', player2Name);
                
                // تأكد من ضبط الدور بشكل صحيح بناءً على الرمز
                if (gameState.playerSymbol === 'X') {
                    gameState.isMyTurn = true;
                } else {
                    gameState.isMyTurn = false;
                }
                
                // تحديث حالة اللعبة في واجهة المستخدم
                gameState.gameActive = true;
                updateGameStatus();
                updateGameBoard();
                updateUI();
                
                // عرض رسالة للاعب
                showMessage(`انضم ${player2Name} إلى المباراة!`, 'success');
            });
            
            // الاستماع لحدث حركة لاعب
            channel.listen('GameMove', (event) => {
                console.log('حدث حركة لاعب:', event);
                
                // تحديث لوحة اللعبة فقط إذا كانت الحركة من اللاعب الآخر
                if (event.player_id !== gameState.playerId) {
                    console.log('تحديث اللوحة بناءً على حركة الخصم:', {
                        position: event.position,
                        symbol: event.symbol,
                        player_id: event.player_id
                    });
                
                // تحديث لوحة اللعبة
                updateBoard(event.position, event.symbol);
                
                    // تحديث الدور للاعب الحالي
                    gameState.isMyTurn = true;
                
                // تحديث حالة اللعبة
                updateGameStatus();
                    updateGameBoard();
                
                    // إضافة رسالة إعلامية
                    addMessage(`اللاعب ${event.symbol} قام بالنقر على الخلية ${parseInt(event.position) + 1}`, 'system');
                
                // التحقق من انتهاء اللعبة بعد الحركة
                checkGameEnd();
                }
            });
            
            // الاستماع لحدث انتهاء المباراة
            channel.listen('GameEnded', (event) => {
                console.log('حدث انتهاء المباراة:', event);
                
                // تحديث حالة اللعبة
                gameState.gameActive = false;
                
                // عرض رسالة النتيجة
                if (event.winner === 'draw') {
                    showGameResult('draw', 'تعادل!', 'كانت مباراة متكافئة 🤝');
                } else if (event.winner === gameState.playerSymbol) {
                    showGameResult('win', 'أحسنت! لقد فزت بالمباراة!', 'استمر في التفوق 🎉');
            } else {
                    showGameResult('lose', 'للأسف، لقد خسرت المباراة', 'حاول مرة أخرى للفوز 💪');
                }
                
                // تعطيل لوحة اللعبة
                disableBoard();
            });
            
            // الاستماع لحدث رسالة دردشة
            channel.listen('ChatMessage', (event) => {
                console.log('رسالة دردشة جديدة:', event);
                
                // إضافة الرسالة إلى الدردشة
                addChatMessage(event.player_name, event.message);
            });
            
            // حفظ القناة في حالة اللعبة
            gameState.currentChannel = channel;
            
            console.log('تم الاشتراك في القناة بنجاح');
            
            // تحديث حالة الاتصال
            updateConnectionStatus(true);
            
            return channel;
        } catch (error) {
            console.error('خطأ في الاشتراك بالقناة:', error);
            updateConnectionStatus(false);
            throw error;
        }
    }

    // تعديل معالج حدث الدردشة
    const chatButton = document.querySelector('.chat-input button');
    if (chatButton) {
        chatButton.addEventListener('click', async () => {
            const input = document.querySelector('.chat-input input');
            const message = input.value.trim();
            
            if (message && gameState.match?.id) {
                try {
                    const response = await fetch(`/api/game/matches/${gameState.match.id}/message`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                        },
                        body: JSON.stringify({
                            player_id: gameState.playerId,
                            player_name: gameState.playerName,
                            message: message
                        })
                    });

                    if (response.ok) {
                        input.value = '';
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }
        });
        }

    function updatePlayerInfo(symbol, playerName) {
        const playerInfo = document.querySelector(`.player-info:nth-child(${symbol === 'X' ? 1 : 2})`);
        const nameSpan = playerInfo.querySelector('span');
        nameSpan.textContent = playerName;
    }

    // دالة للانضمام إلى مباراة
    async function joinMatch(matchId) {
        try {
            console.log(`محاولة الانضمام إلى المباراة رقم ${matchId}...`);
            
            // التحقق من صلاحية معرف المستخدم
            if (!gameState.playerId || gameState.playerId === '0' || gameState.playerId === 0) {
                console.error('معرف المستخدم غير صالح:', gameState.playerId);
                showMessage('يجب تسجيل الدخول أولاً', 'error');
                validateUser();
                return;
            }
            
            // عرض رسالة أثناء الانضمام
            showMessage('جاري الانضمام إلى المباراة...', 'info');
            
            // الحصول على CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            if (!csrfToken) {
                throw new Error('لم يتم العثور على CSRF token');
            }
            
            console.log('بيانات طلب الانضمام:', {
                url: `/api/game/matches/${matchId}/join`,
                player2_name: gameState.playerName
            });
            
            const response = await fetch(`/api/game/matches/${matchId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    player2_name: gameState.playerName
                })
            });
            
            console.log('استجابة الانضمام للمباراة:', response.status, response.statusText);
            
            // التحقق من المصادقة
            if (response.status === 401) {
                console.error('المستخدم غير مصادق');
                validateUser();
                return;
            }

            // قراءة نص الاستجابة
            const responseText = await response.text();
            console.log('نص استجابة الانضمام للمباراة:', responseText);
            
            // تحليل البيانات إذا كان هناك محتوى
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
                console.log('بيانات استجابة الانضمام:', data);
                
                // التحقق من وجود رسالة خطأ في الاستجابة
                if (data.message && !data.success) {
                    throw new Error(data.message);
                }
            } catch (e) {
                console.error('خطأ في تحليل JSON:', e);
                throw new Error('استجابة الخادم ليست بتنسيق JSON صالح: ' + responseText.substring(0, 100));
            }

            if (!response.ok) {
                console.error('استجابة الخادم غير ناجحة:', response.status, response.statusText);
                console.error('محتوى الاستجابة:', data);
                throw new Error(data.message || `خطأ في الخادم: ${response.status} - ${response.statusText}`);
            }
            
            // التحقق من وجود بيانات المباراة في الاستجابة (في خاصية match أو room)
            const matchData = data.match || data.room;
            if (!matchData) {
                console.error('لم يتم استلام بيانات المباراة بعد الانضمام:', data);
                // البحث عن أي خاصية في الاستجابة قد تحتوي بيانات المباراة
                const possibleMatches = Object.keys(data).filter(key => 
                    typeof data[key] === 'object' && data[key] !== null);
                console.log('خصائص الكائنات الموجودة في الاستجابة:', possibleMatches);
                throw new Error('لم يتم استلام بيانات المباراة - تحقق من استجابة الخادم');
            }
            
            console.log('تم الانضمام إلى المباراة بنجاح:', matchData);

            // تحديث حالة اللعبة
            gameState.match = matchData;
                gameState.playerSymbol = 'O';
            gameState.isMyTurn = false; // بدء اللعبة دور اللاعب الأول (X)
            gameState.gameActive = true;
            gameState.board = Array(9).fill('');

            // الاشتراك في قناة المباراة
            await subscribeToRoom(data.match.id);
            
            // تحديث معلومات اللاعبين
            updatePlayerInfo('X', data.match.player1_name);
            updatePlayerInfo('O', gameState.playerName);
            
            // تحديث حالة اللعبة
            updateGameStatus();

            // تحديث واجهة المستخدم
            updateUI();

            // إظهار رسالة نجاح
            showMessage('تم الانضمام إلى المباراة بنجاح!', 'success');
            
            // إزالة المباراة من قائمة المباريات المتاحة
            const matchList = document.querySelector('.match-list');
            const matchElement = matchList?.querySelector(`[data-match-id="${matchId}"]`);
            if (matchElement) {
                matchElement.remove();
            }
            
            // تحديث لوحة اللعب
            updateGameBoard();
        } catch (error) {
            console.error('خطأ في الانضمام إلى المباراة:', error);
            console.error('تفاصيل الخطأ:', error.message);
            
            // طباعة تفاصيل الاستدعاء
            console.error('تفاصيل الاستدعاء:', {
                matchId: matchId,
                playerInfo: {
                    name: gameState.playerName,
                    id: gameState.playerId
                },
                csrfToken: document.querySelector('meta[name="csrf-token"]')?.content ? 'موجود' : 'غير موجود'
            });
            
            // عرض رسالة الخطأ للمستخدم
            showMessage(error.message || 'حدث خطأ في الانضمام إلى المباراة', 'error');
        }
    }

    // إضافة وظيفة checkAuthAndRedirect المفقودة
    function checkAuthAndRedirect() {
        // التحقق من مصادقة المستخدم
        return validateUser();
    }

    // تحميل المباريات عند بدء اللعبة
    console.log('تحميل المباريات المتاحة عند بدء التطبيق...');
    try {
    await loadMatches();
        console.log('تم تحميل المباريات بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل المباريات عند البدء:', error);
    }

    // تحديث المباريات كل 5 ثواني
    setInterval(loadMatches, 5000);

    // إضافة معالج لزر التحديث
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            refreshButton.style.transform = 'rotate(360deg)';
            loadMatches();
            setTimeout(() => {
                refreshButton.style.transform = 'rotate(0deg)';
            }, 500);
        });
    }

    // فحص مباشر للمصادقة
    checkAuthAndRedirect();

    // تحديث حالة الاتصال
    function updateConnectionStatus(isConnected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.connection-status span');
        
        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.classList.remove('disconnected');
                statusDot.classList.add('connected');
                statusDot.style.background = '#10b981';
                statusText.textContent = 'متصل';
        } else {
                statusDot.classList.remove('connected');
                statusDot.classList.add('disconnected');
                statusDot.style.background = '#ef4444';
                statusText.textContent = 'غير متصل';
            }
        }
    }

    // التحقق من مصادقة المستخدم
    function validateUser() {
        // التحقق من وجود معرف مستخدم صالح
        if (!gameState.playerId || gameState.playerId === '0' || gameState.playerId === 0) {
            // إظهار رسالة الخطأ
            const gameContainer = document.querySelector('.main-container');
            if (gameContainer) {
                gameContainer.innerHTML = `
                    <div class="auth-error">
                        <div class="auth-error-message">
                            <h2>يجب تسجيل الدخول</h2>
                            <p>لا يمكنك استخدام وضع اللعب أونلاين إلا بعد تسجيل الدخول.</p>
                            <div class="auth-buttons">
                                <a href="/login" class="auth-button login">تسجيل الدخول</a>
                                <a href="/register" class="auth-button register">إنشاء حساب جديد</a>
                            </div>
                        </div>
                    </div>
                `;

                // إضافة أنماط للرسالة
                const style = document.createElement('style');
                style.textContent += `
                    .auth-error {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 80vh;
                    }
                    .auth-error-message {
                        background: rgba(255, 255, 255, 0.2);
                        backdrop-filter: blur(10px);
                        border-radius: 16px;
                        padding: 2rem;
                        text-align: center;
                        color: white;
                        max-width: 500px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    .auth-error-message h2 {
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                    }
                    .auth-error-message p {
                        margin-bottom: 1.5rem;
                    }
                    .auth-buttons {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                    }
                    .auth-button {
                        display: inline-block;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        text-decoration: none;
                    }
                    .auth-button.login {
                        background: rgba(99, 102, 241, 0.8);
                        color: white;
                    }
                    .auth-button.register {
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                    }
                    .auth-button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                `;
                document.head.appendChild(style);
                
                return false;
            }
        }
        return true;
    }

    // دالة للتحقق من صحة الحركة
    function validateMove(position, symbol) {
        // التحقق من أن الموقع صالح
        if (position < 0 || position > 8) {
            console.log('موقع غير صالح:', position);
            return false;
        }

        // التحقق من أن الخلية فارغة
        if (gameState.board[position] !== '') {
            console.log('الخلية مشغولة:', position);
            return false;
        }

        // التحقق من أن اللعبة نشطة
        if (!gameState.gameActive) {
            console.log('اللعبة غير نشطة');
            return false;
        }

        // التحقق من أن الرمز صحيح
        if (symbol !== gameState.playerSymbol) {
            console.log('رمز غير صحيح:', symbol);
            return false;
        }

        // التحقق من أنه دور اللاعب
        if (!gameState.isMyTurn) {
            console.log('ليس دورك');
            return false;
        }

        return true;
    }

    // دالة تحديث اللوحة عند استلام حركة من الخصم
    function updateBoard(position, symbol) {
        console.log(`تحديث اللوحة - الموقع: ${position}, الرمز: ${symbol}`);
        
        // تحديث حالة اللوحة في الذاكرة
        gameState.board[position] = symbol;
        
        // تحديث الخلية في واجهة المستخدم
        const cell = document.querySelector(`.game-cell[data-index="${position}"]`);
        if (cell) {
            cell.textContent = symbol;
            cell.classList.add(symbol.toLowerCase());
        }
        
        // تحديث حالة الدور
        const isMySymbol = symbol === gameState.playerSymbol;
        gameState.isMyTurn = !isMySymbol; // إذا كان الرمز لي، فالدور التالي ليس لي والعكس
        
        // تحديث اللوحة بالكامل
        updateGameBoard();
        
        // إضافة رسالة تفيد بالحركة
        addMessage(`اللاعب ${symbol} قام بالنقر على الخلية ${parseInt(position) + 1}`, 'system');
    }

    // دالة التحقق من انتهاء اللعبة
    function checkGameEnd() {
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        console.log("فحص انتهاء اللعبة - الحالة الحالية:", gameState.board);

        let roundWon = false;
        let winningCombo = null;
        let winningSymbol = '';
        
        // التحقق من حالات الفوز
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            // التأكد من أن المربع ليس فارغاً وأن القيم الثلاثة متطابقة
            if (gameState.board[a] && 
                gameState.board[a] === gameState.board[b] && 
                gameState.board[a] === gameState.board[c]
            ) {
                roundWon = true;
                winningCombo = [a, b, c];
                winningSymbol = gameState.board[a];
                console.log(`تم اكتشاف فوز: الخانات ${a}, ${b}, ${c} بالرمز ${winningSymbol}`);
                break;
            }
        }

        if (roundWon) {
            // إيقاف اللعبة
            gameState.gameActive = false;
            
            // إضافة تأثير الفوز للخلايا الفائزة
            const cells = document.querySelectorAll('.game-cell');
            winningCombo.forEach(index => {
                cells[index].classList.add('winning');
            });
            
            // تحديد ما إذا كان اللاعب الحالي هو الفائز
            const isWinner = winningSymbol === gameState.playerSymbol;
            console.log("الفائز: ", {
                winningSymbol: winningSymbol,
                playerSymbol: gameState.playerSymbol,
                isWinner: isWinner
            });
            
            // عرض رسالة النتيجة المناسبة
            if (isWinner) {
                showGameResult('win', 'أحسنت! لقد فزت بالمباراة!', 'استمر في التفوق 🎉');
                addMessage('لقد فزت بالمباراة! 🎉', 'success');
                
                // إرسال نتيجة اللعبة للخادم
                sendEndGameResult(gameState.playerSymbol);
            } else {
                showGameResult('lose', 'للأسف، لقد خسرت المباراة', 'حاول مرة أخرى للفوز 💪');
                addMessage('للأسف، لقد خسرت المباراة 😢', 'error');
            }
            
            // تعطيل لوحة اللعبة
            disableBoard();
            
            return true;
        }

        // التحقق من التعادل (امتلاء اللوحة)
        const roundDraw = !gameState.board.includes('');
        if (roundDraw) {
            gameState.gameActive = false;
            showGameResult('draw', 'تعادل!', 'كانت مباراة متكافئة 🤝');
            addMessage('انتهت المباراة بالتعادل! 🤝', 'info');
            
            // إرسال نتيجة التعادل للخادم
            sendEndGameResult('draw');
            
            // تعطيل لوحة اللعبة
            disableBoard();
            
            return true;
        }

        return false;
    }

    // دالة لإرسال نتيجة المباراة للخادم
    function sendEndGameResult(winner) {
        if (!gameState.match || !gameState.match.id) return;
        
        console.log("إرسال نتيجة المباراة للخادم:", {
            winner: winner,
            matchId: gameState.match.id
        });
        
        fetch(`/api/game/matches/${gameState.match.id}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
            },
            body: JSON.stringify({
                winner: winner,
                board_state: gameState.board,
                moves_count: gameState.movesCount || gameState.board.filter(cell => cell !== '').length
            })
        })
        .then(response => {
            console.log('استجابة إرسال نتيجة المباراة:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('محتوى استجابة إرسال النتيجة:', text);
        })
        .catch(error => {
            console.error('خطأ في إرسال نتيجة المباراة:', error);
        });
    }

    // دالة لعرض نتيجة اللعبة في نافذة منبثقة
    function showGameResult(result, title, message) {
        console.log(`عرض نتيجة اللعبة: ${result} - ${title} - ${message}`);
        
        // تعطيل لوحة اللعبة
        disableBoard();
        
        // إنشاء عنصر النتيجة إذا لم يكن موجوداً بالفعل
        let resultElement = document.querySelector('.game-result');
        
        if (!resultElement) {
            resultElement = document.createElement('div');
            resultElement.className = 'game-result';
            document.body.appendChild(resultElement);
        }
        
        // تحديد الأيقونة والألوان بناءً على النتيجة
        let icon = '🤝';
        let bgColor = '#f59e0b';
        let btnColor = '#f59e0b';
        
        if (result === 'win') {
            icon = '🏆';
            bgColor = '#10b981';
            btnColor = '#10b981';
        } else if (result === 'lose') {
            icon = '😢';
            bgColor = '#ef4444';
            btnColor = '#3b82f6';
        }
        
        // تحديث المحتوى مع تصميم محسن
        resultElement.innerHTML = `
            <div class="result-content" style="background-color: white; color: #333; border-radius: 1rem; padding: 1.5rem; text-align: center; max-width: 350px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); position: relative; border-top: 5px solid ${bgColor};">
                <div style="font-size: 4rem; margin-bottom: 0.5rem;">${icon}</div>
                <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: ${bgColor};">${title}</h2>
                <p style="font-size: 1rem; margin-bottom: 1.5rem; color: #666;">${message}</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="play-again-btn" style="background-color: ${btnColor}; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">لعبة جديدة</button>
                    <button class="close-result-btn" style="background-color: #e5e7eb; color: #4b5563; border: none; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">إغلاق</button>
                </div>
            </div>
        `;
        
        // إظهار النتيجة
        resultElement.style.position = 'fixed';
        resultElement.style.top = '0';
        resultElement.style.left = '0';
        resultElement.style.right = '0';
        resultElement.style.bottom = '0';
        resultElement.style.display = 'flex';
        resultElement.style.alignItems = 'center';
        resultElement.style.justifyContent = 'center';
        resultElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        resultElement.style.zIndex = '1000';
        resultElement.style.backdropFilter = 'blur(3px)';
        resultElement.classList.add('active');
        
        // إضافة معالجات الأحداث للأزرار
        resultElement.querySelector('.play-again-btn').addEventListener('click', () => {
            hideGameResult();
            createNewGame();
        });
        
        resultElement.querySelector('.close-result-btn').addEventListener('click', hideGameResult);
        
        // إظهار زر اللعب مرة أخرى في واجهة اللعبة الرئيسية أيضاً
        showPlayAgainButton();
    }

    // دالة لإخفاء نتيجة اللعبة
    function hideGameResult() {
        const resultElement = document.querySelector('.game-result');
        if (resultElement) {
            resultElement.classList.remove('active');
            resultElement.style.display = 'none';
        }
    }

    // دالة لإنشاء لعبة جديدة
    function createNewGame() {
        // إعادة تعيين لوحة اللعبة
        gameState.board = Array(9).fill('');
        gameState.gameActive = true;
        gameState.isMyTurn = gameState.playerSymbol === 'X';
        
        // تحديث واجهة المستخدم
        updateGameBoard();
        updateGameStatus();
        
        // إزالة تأثير الفوز من الخلايا
        const cells = document.querySelectorAll('.game-cell');
        cells.forEach(cell => {
            cell.classList.remove('winning');
        });
    }

    // دالة إضافة رسالة للدردشة
    function addChatMessage(playerName, message) {
        console.log(`رسالة من ${playerName}: ${message}`);
        addMessage(`${playerName}: ${message}`, 'chat');
    }

    // دالة لتعطيل لوحة اللعبة عند انتهاء المباراة
    function disableBoard() {
        gameState.gameActive = false;
        const cells = document.querySelectorAll('.game-cell');
        cells.forEach(cell => {
            cell.classList.add('disabled');
            cell.style.cursor = 'not-allowed';
        });
        
        // تحديث حالة اللعبة
        updateGameStatus();
    }

    // دالة لإظهار زر إعادة اللعب (تعريف الدالة المفقودة)
    function showPlayAgainButton() {
        const createMatchButton = document.querySelector('.create-match');
        if (createMatchButton) {
            createMatchButton.textContent = 'لعبة جديدة';
            createMatchButton.disabled = false;
            
            // إضافة تأثير لجذب الانتباه
            createMatchButton.classList.add('play-again');
            createMatchButton.style.animation = 'pulse 1.5s infinite';
            
            // تعديل أنماط الزر لجعله أكثر بروزًا
            createMatchButton.style.background = 'linear-gradient(45deg, #10b981, #3b82f6)';
            createMatchButton.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
        }
    }

    } catch (error) {
        // طباعة الخطأ في التيرمينال
        console.log('=== بداية الخطأ ===');
        console.log('نوع الخطأ:', error.name);
        console.log('رسالة الخطأ:', error.message);
        console.log('تفاصيل الخطأ:', error.stack);
        console.log('=== نهاية الخطأ ===');

        // عرض رسالة الخطأ للمستخدم
        const errorHtml = `
            <div class="error-container">
                <div class="error-message">
                    ${error.message}
                </div>
            </div>
        `;

        // إضافة أنماط CSS للخطأ
        const errorStyle = document.createElement('style');
        errorStyle.textContent = `
            .error-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                padding: 1rem;
                font-family: 'Cairo', sans-serif;
            }
            .error-message {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                padding: 2rem;
                border-radius: 1rem;
                text-align: center;
                font-size: 1.25rem;
                color: #ef4444;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(errorStyle);
        document.body.innerHTML = errorHtml;
        
        console.error('خطأ في تهيئة اللعبة:', error);
    }
}); 
