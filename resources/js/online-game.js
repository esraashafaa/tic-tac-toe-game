import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // الحصول على اسم المستخدم من العنوان
        const usernameElement = document.querySelector('nav .navbar-brand');
        console.log('عنصر اسم المستخدم:', usernameElement);
        const username = usernameElement ? usernameElement.textContent.replace('مرحباً ', '').trim() : 'لاعب';
        console.log('اسم المستخدم المستخرج:', username);
        
        // تسجيل دخول كضيف
        const response = await fetch('/api/guest-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
                name: username
            })
        });

        if (!response.ok) {
            throw new Error('فشل في تسجيل الدخول كضيف');
        }

        const userData = await response.json();
        
        // تخزين التوكن
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        
        // تهيئة حالة اللعبة
        const gameState = {
            playerId: userData.user.id,
            playerName: userData.user.name,
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

            .game-layout {
                display: grid;
                grid-template-columns: 250px 1fr 250px;
                gap: 1rem;
                height: calc(100vh - 2rem);
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
                background: rgba(99, 102, 241, 0.2);
                color: #fff;
            }

            .player-symbol.o {
                background: rgba(168, 85, 247, 0.2);
                color: #fff;
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
                font-size: 2rem;
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
            }

            .game-cell.x {
                color: #818cf8;
                border-color: #818cf8;
            }

            .game-cell.o {
                color: #c084fc;
                border-color: #c084fc;
            }

            .game-cell.disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
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
            subscribeToMatch(gameState.match?.id);
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
        if (!gameState.gameActive || 
            !gameState.isMyTurn || 
            !validateMove(clickedCellIndex, gameState.playerSymbol)) {
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
            const response = await fetch(`/api/game/matches/${gameState.match.id}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    player_id: parseInt(gameState.playerId),
                    position: clickedCellIndex,
                    symbol: gameState.playerSymbol
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'حدث خطأ أثناء إرسال الحركة');
            }

            const data = await response.json();
            console.log('تم إرسال الحركة بنجاح:', data);

            // تحديث حالة اللعبة المحلية فقط بعد نجاح الحركة
            gameState.board[clickedCellIndex] = gameState.playerSymbol;
            gameState.isMyTurn = false;
            gameState.movesCount++;

            // تحديث واجهة المستخدم
            updateGameBoard();
            updateGameStatus();

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
                    
                    // تعطيل الزر أثناء الإنشاء
                    createMatchButton.disabled = true;
                    createMatchButton.textContent = 'جاري إنشاء المباراة...';

                    // التحقق من وجود CSRF token
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                    if (!csrfToken) {
                        throw new Error('CSRF token غير موجود');
                    }

                    console.log('إرسال طلب إنشاء المباراة...');
                    const response = await fetch('/api/game/matches', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            player1_id: parseInt(gameState.playerId),
                            player1_name: username,
                            status: 'waiting'
                        })
                    });

                    console.log('استلام الرد من الخادم:', response.status);
                    const data = await response.json();
                    console.log('بيانات الرد:', data);

                    if (!response.ok) {
                        throw new Error(data.message || `خطأ في الخادم: ${response.status}`);
                    }

                    if (!data.match) {
                        throw new Error('لم يتم استلام بيانات المباراة من الخادم');
                    }

                    console.log('تم إنشاء المباراة بنجاح:', data.match);
                    
                        // تحديث حالة اللعبة
                        gameState.match = data.match;
                    gameState.playerSymbol = 'X';
                    gameState.isMyTurn = true;
                        gameState.gameActive = true;
                        gameState.board = Array(9).fill('');

                    // الاشتراك في قناة المباراة
                    await subscribeToMatch(data.match.id);

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

        // إنشاء عنصر المباراة
        const matchElement = document.createElement('div');
        matchElement.className = 'match-item';
        matchElement.dataset.matchId = match.id;
        matchElement.innerHTML = `
            <div class="flex justify-between items-center w-full">
                <div class="flex flex-col">
                    <div class="text-white font-semibold">مباراة #${match.id}</div>
                    <div class="text-white/70 text-sm">
                        أنشأها ${match.player1_name}
                    </div>
                    <div class="text-white/50 text-xs mt-1">
                        في انتظار اللاعب الثاني...
                    </div>
                </div>
                <button class="join-match px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all">
                    انضم للمباراة
                </button>
            </div>
        `;

        // إضافة المباراة في بداية القائمة
        matchList.insertBefore(matchElement, matchList.firstChild);

        // إضافة معالج النقر على زر الانضمام
        const joinButton = matchElement.querySelector('.join-match');
        joinButton.addEventListener('click', () => joinMatch(match.id));
    }

    // تحديث دالة تحميل المباريات
    async function loadMatches() {
        try {
            const response = await fetch('/api/game/matches', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('فشل في تحميل قائمة المباريات');
            }

            const data = await response.json();
            const matchList = document.querySelector('.match-list');
            
            if (!matchList) return;

            // تحقق من وجود مباراة في حالة الانتظار
            const waitingMatch = data.matches.find(match => match.status === 'waiting');

            // تحديث زر إنشاء المباراة
            const createMatchButton = document.querySelector('.create-match');
            if (createMatchButton) {
                if (waitingMatch) {
                    // تعطيل الزر إذا كانت هناك مباراة في حالة الانتظار
                    createMatchButton.disabled = true;
                    createMatchButton.style.opacity = '0.5';
                    createMatchButton.style.cursor = 'not-allowed';
                    createMatchButton.title = 'يوجد مباراة في انتظار لاعب آخر';
                } else {
                    // تفعيل الزر إذا لم تكن هناك مباراة في حالة الانتظار
                    createMatchButton.disabled = false;
                    createMatchButton.style.opacity = '1';
                    createMatchButton.style.cursor = 'pointer';
                    createMatchButton.title = 'إنشاء مباراة جديدة';
                }
            }

            // تصفية المباريات المتاحة فقط (التي في حالة الانتظار ولم ينشئها اللاعب الحالي)
            const availableMatches = data.matches.filter(match => 
                match.status === 'waiting' && 
                match.player1_id !== parseInt(gameState.playerId)
            );

            // عرض رسالة إذا لم تكن هناك مباريات متاحة
            if (availableMatches.length === 0) {
                matchList.innerHTML = '<div class="text-white/70 text-center p-4">لا توجد مباريات متاحة</div>';
                return;
            }

            // حفظ معرفات المباريات الحالية
            const currentMatchIds = Array.from(matchList.children)
                .filter(el => el.dataset.matchId)
                .map(el => el.dataset.matchId);

            // إضافة المباريات الجديدة فقط
            availableMatches.forEach(match => {
                if (!currentMatchIds.includes(match.id.toString())) {
                    addMatchToList(match);
                }
            });

            // إزالة المباريات التي لم تعد متاحة
            currentMatchIds.forEach(matchId => {
                if (!availableMatches.find(m => m.id.toString() === matchId)) {
                    const matchElement = matchList.querySelector(`[data-match-id="${matchId}"]`);
                    if (matchElement) {
                        matchElement.remove();
                    }
                }
            });

        } catch (error) {
            console.error('خطأ في تحميل المباريات:', error);
            showMessage('حدث خطأ في تحميل المباريات', 'error');
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

    // تحديث دالة subscribeToMatch
    async function subscribeToMatch(matchId) {
        if (!matchId) {
            console.error('معرف المباراة غير موجود');
            return null;
        }

        try {
            console.log('بدء الاشتراك في قناة المباراة:', matchId);
            
            // التحقق من وجود Echo
            if (!window.Echo) {
                console.error('Laravel Echo غير موجود');
                showMessage('خطأ في الاتصال: Laravel Echo غير موجود', 'error');
                return null;
            }

            // التحقق من حالة الاتصال
            if (!echo.connector.pusher) {
                console.error('Pusher غير موجود');
                showMessage('خطأ في الاتصال: Pusher غير موجود', 'error');
                return null;
            }

            console.log('حالة الاتصال بـ Pusher:', echo.connector.pusher.connection.state);
            
            // محاولة إعادة الاتصال إذا كان مقطوعاً
            if (echo.connector.pusher.connection.state !== 'connected') {
                console.log('محاولة إعادة الاتصال...');
                echo.connector.pusher.connect();
                
                // انتظار الاتصال
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('انتهت مهلة الاتصال'));
                    }, 5000);

                    echo.connector.pusher.connection.bind('connected', () => {
                        clearTimeout(timeout);
                        resolve();
                    });
                });
            }

            // إلغاء الاشتراك من القناة السابقة إذا وجدت
            if (gameState.currentChannel) {
                console.log('إلغاء الاشتراك من القناة السابقة:', gameState.currentChannel);
                echo.leave(gameState.currentChannel);
            }

            // الاشتراك في القناة الجديدة
            const channelName = `presence-match.${matchId}`;
            console.log('محاولة الاشتراك في القناة:', channelName);
            
            const channel = echo.join(channelName);
            
            // التحقق من نجاح الاشتراك
            if (!channel) {
                throw new Error('فشل في الاشتراك في القناة');
            }

            // إضافة معالجات الأحداث
            channel
                .here((users) => {
                    console.log('المستخدمون الحاليون في القناة:', users);
                    showMessage(`تم الاتصال بنجاح! عدد اللاعبين: ${users.length}`, 'success');
                })
                .joining((user) => {
                    console.log('انضم مستخدم للقناة:', user);
                    showMessage(`انضم ${user.name} للمباراة`, 'info');
                })
                .leaving((user) => {
                    console.log('غادر مستخدم القناة:', user);
                    showMessage(`غادر ${user.name} المباراة`, 'warning');
                })
                .error((error) => {
                    console.error('خطأ في القناة:', error);
                    showMessage('حدث خطأ في الاتصال بالقناة', 'error');
                });

            // تخزين اسم القناة الحالية
            gameState.currentChannel = channelName;
            console.log('تم الاشتراك في القناة بنجاح:', channelName);

            // إعداد معالجات الأحداث
            setupChannelHandlers(channel);

            return channel;
        } catch (error) {
            console.error('خطأ في الاشتراك بالقناة:', error);
            showMessage(`خطأ في الاتصال: ${error.message}`, 'error');
            return null;
        }
    }

    // تحديث معالجات الأحداث للقناة
    function setupChannelHandlers(channel) {
        if (!channel) {
            console.error('لا يمكن إعداد معالجات الأحداث: القناة غير موجودة');
            return;
        }

        console.log('بدء إعداد معالجات الأحداث للقناة');

        // معالج حدث انضمام لاعب جديد
        channel.listen('.PlayerJoinedEvent', (data) => {
            console.log('تم استلام حدث انضمام لاعب جديد:', data);
            if (!data.match) {
                console.error('بيانات غير صالحة للاعب الجديد');
                return;
            }

            // تحديث حالة المباراة
            gameState.match = data.match;
            gameState.gameActive = true;
            
            // تحديث حالة الدور بناءً على رمز اللاعب
            if (gameState.playerSymbol === 'X') {
                gameState.isMyTurn = true;
                showMessage('دورك للعب!', 'info');
            } else {
                gameState.isMyTurn = false;
                showMessage('دور اللاعب الآخر', 'info');
            }

            // تحديث معلومات اللاعبين
            const playerInfos = document.querySelectorAll('.player-info');
            if (playerInfos[0]) {
                playerInfos[0].querySelector('span').textContent = 
                    gameState.match.player1_name + 
                    (gameState.playerId === gameState.match.player1_id ? ' (أنت)' : '');
            }
            
            if (playerInfos[1]) {
                playerInfos[1].querySelector('span').textContent = 
                    gameState.match.player2_name +
                    (gameState.playerId === gameState.match.player2_id ? ' (أنت)' : '');
            }

            // تحديث حالة اللعبة في واجهة المستخدم
            updateGameStatus();
            updateGameBoard();
            showMessage('انضم منافس جديد للمباراة!', 'success');
        });

        // معالج حدث الحركة
        channel.listen('.GameMoveEvent', (data) => {
            console.log('تم استلام حدث حركة جديدة:', data);
            if (!data.move) {
                console.error('بيانات غير صالحة للحركة');
                return;
            }

            const { position, symbol, moves_count } = data.move;
            
            // التحقق من صحة الحركة
            if (typeof position !== 'number' || position < 0 || position > 8) {
                console.error('موقع غير صالح:', position);
                return;
            }
            
            // التحقق من صحة الدور
            if (symbol === gameState.playerSymbol) {
                console.error('ليس دورك للعب');
                return;
            }
            
            // تحديث حالة اللوحة
            gameState.board[position] = symbol;
            gameState.match.moves_count = moves_count;
            
            // تحديث واجهة المستخدم
            updateGameBoard();
            
            // تحديث حالة الدور
            gameState.isMyTurn = true;
            updateGameStatus();
        });

        // معالج حدث انتهاء المباراة
        channel.listen('.GameEndedEvent', (data) => {
            console.log('تم استلام حدث انتهاء المباراة:', data);
            if (!data.winner || !data.board_state) {
                console.error('بيانات غير صالحة لنهاية المباراة');
                return;
            }

            const { winner, board_state } = data;
            
            // التحقق من صحة البيانات
            if (!Array.isArray(board_state) || board_state.length !== 9) {
                console.error('حالة اللوحة غير صالحة');
                return;
            }
            
            // تحديث حالة اللعبة
            gameState.board = board_state;
            gameState.match.status = 'ended';
            gameState.gameActive = false;
            
            // تحديث واجهة المستخدم
            updateGameBoard();
            updateGameStatus();
            
            // عرض رسالة النتيجة
            let message = '';
            if (winner === 'draw') {
                message = 'تعادل!';
            } else if (winner === gameState.playerSymbol) {
                message = 'فزت!';
            } else {
                message = 'خسرت!';
            }
            
            showMessage(message, winner === 'draw' ? 'info' : winner === gameState.playerSymbol ? 'success' : 'error');
        });

        console.log('تم إكمال إعداد معالجات الأحداث للقناة');
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

    async function joinMatch(matchId) {
        try {
            const response = await fetch(`/api/game/matches/${matchId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    player2_id: gameState.playerId,
                    player2_name: username
                })
            });

            if (!response.ok) {
                throw new Error('فشل في الانضمام للمباراة');
            }

            const data = await response.json();
            console.log('تم الانضمام للمباراة:', data);

            // تحديث حالة اللعبة
            gameState.match = data.match;
                gameState.playerSymbol = 'O';
                gameState.isMyTurn = false;
            gameState.gameActive = true;
            gameState.board = Array(9).fill('');

            // الاشتراك في قناة المباراة
            await subscribeToMatch(data.match.id);

            // تحديث معلومات اللاعب O
            updatePlayerInfo('O', username);

            // تحديث واجهة المستخدم
            updateUI();

            showMessage('تم الانضمام للمباراة بنجاح!', 'success');
        } catch (error) {
            console.error('خطأ في الانضمام للمباراة:', error);
            showMessage(error.message || 'حدث خطأ في الانضمام للمباراة', 'error');
        }
    }

    // تحميل المباريات عند بدء اللعبة
    await loadMatches();

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

    // إضافة دالة للتحقق من حالة تسجيل الدخول
    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            // تحديث واجهة المستخدم
            updateUserInterface(user);
            return true;
        }
        return false;
    }

    // دالة لتحديث واجهة المستخدم
    function updateUserInterface(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const userInfo = document.querySelector('.user-info');
        
        if (user) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            document.querySelector('.user-name').textContent = user.name;
            document.querySelector('.user-stats').innerHTML = `
                <span>المباريات: ${user.total_games}</span>
                <span>الانتصارات: ${user.wins}</span>
                <span>الخسائر: ${user.losses}</span>
            `;
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }

    // دالة لحفظ بيانات المستخدم في localStorage
    function saveUserData(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('تم حفظ بيانات المستخدم في localStorage:', { token: !!token, user: !!user });
    }

    // دالة لحفظ الرابط المطلوب
    function saveIntendedUrl() {
        const currentUrl = window.location.pathname;
        const excludedPaths = ['/', '/login', '/register', '/guest-login'];
        
        if (!excludedPaths.includes(currentUrl)) {
            console.log('حفظ الرابط المطلوب:', currentUrl);
            localStorage.setItem('intendedUrl', currentUrl);
        }
    }

    // دالة للتحقق من المصادقة وإعادة التوجيه
    function checkAuthAndRedirect() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const intendedUrl = localStorage.getItem('intendedUrl');
        
        console.log('التحقق من المصادقة:', {
            token: !!token,
            user: !!user,
            intendedUrl: intendedUrl
        });
        
        if (!token || !user) {
            console.log('المستخدم غير مسجل الدخول، حفظ الرابط وإعادة التوجيه');
            saveIntendedUrl();
            window.location.href = '/login';
            return false;
        }
        
        if (intendedUrl) {
            console.log('إعادة التوجيه إلى:', intendedUrl);
            localStorage.removeItem('intendedUrl');
            window.location.href = intendedUrl;
        }
        
        return true;
    }

    // تحديث دالة تسجيل الدخول
    async function login(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            // الحصول على معلمة next من URL
            const urlParams = new URLSearchParams(window.location.search);
            const nextParam = urlParams.get('next');
            
            // إضافة معلمة next إلى endpoint إذا وجدت
            const endpoint = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : '/login';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('استجابة تسجيل الدخول:', data);
            
            if (response.ok) {
                // حفظ بيانات المستخدم في localStorage
                saveUserData(data.token, data.user);
                
                // استخدام رابط إعادة التوجيه من الخادم
                const redirectUrl = data.redirect || '/games/choose';
                console.log('إعادة التوجيه إلى:', redirectUrl);
                window.location.href = redirectUrl;
            } else {
                alert(data.message || 'فشل تسجيل الدخول');
            }
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            alert('حدث خطأ أثناء تسجيل الدخول');
        }
    }

    // تحديث دالة تسجيل الدخول كضيف
    async function loginAsGuest(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            // الحصول على معلمة next من URL
            const urlParams = new URLSearchParams(window.location.search);
            const nextParam = urlParams.get('next');
            
            // إضافة معلمة next إلى endpoint إذا وجدت
            const endpoint = nextParam ? `/guest-login?next=${encodeURIComponent(nextParam)}` : '/guest-login';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            console.log('استجابة تسجيل الدخول كضيف:', data);
            
            if (response.ok) {
                // حفظ بيانات المستخدم في localStorage
                saveUserData(data.token, data.user);
                
                // استخدام رابط إعادة التوجيه من الخادم
                const redirectUrl = data.redirect || '/games/choose';
                console.log('إعادة التوجيه إلى:', redirectUrl);
                window.location.href = redirectUrl;
            } else {
                alert(data.message || 'فشل تسجيل الدخول كضيف');
            }
        } catch (error) {
            console.error('خطأ في تسجيل الدخول كضيف:', error);
            alert('حدث خطأ أثناء تسجيل الدخول كضيف');
        }
    }

    // تحديث دالة تسجيل الخروج
    async function logout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                // حذف معلومات المستخدم من localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // تحديث واجهة المستخدم
                updateUserInterface(null);
                
                // تحديث قائمة المباريات
                loadMatches();
            } else {
                alert('فشل تسجيل الخروج');
            }
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
            alert('حدث خطأ أثناء تسجيل الخروج');
        }
    }

    // تحديث دالة إنشاء حساب جديد
    async function register(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // حفظ معلومات المستخدم في localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // تحديث واجهة المستخدم
                updateUserInterface(data.user);
                
                // إخفاء نموذج إنشاء حساب جديد
                document.getElementById('registerModal').style.display = 'none';
                
                // تحديث قائمة المباريات
                loadMatches();
            } else {
                alert(data.message || 'فشل إنشاء الحساب');
            }
        } catch (error) {
            console.error('خطأ في إنشاء الحساب:', error);
            alert('حدث خطأ أثناء إنشاء الحساب');
        }
    }

    // إضافة استدعاء للتحقق من المصادقة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthAndRedirect();
        loadMatches();
    });
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
