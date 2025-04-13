import './bootstrap';
import '../css/app.css';

document.addEventListener('DOMContentLoaded', async () => {
    // الحصول على بيانات المستخدم
    const username = document.querySelector('meta[name="player-name"]')?.content || 'لاعب';
    const userId = document.querySelector('meta[name="user-id"]')?.content || '0';
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // حالة اللعبة
    const gameState = {
        match: null,
        board: Array(9).fill(''),
        playerSymbol: null,
        isMyTurn: false,
        gameActive: false,
        currentTurn: 'X',
        scores: {
            X: 0,
            O: 0,
            draw: 0
        }
    };

    // عناصر واجهة المستخدم
    const gameBoard = document.getElementById('game-board');
    const gameStatus = document.getElementById('game-status');
    const createGameBtn = document.getElementById('create-game');
    const joinGameBtn = document.getElementById('join-game');
    const gameCodeContainer = document.getElementById('game-code-container');
    const gameCodeDisplay = document.getElementById('game-code');
    const copyCodeBtn = document.getElementById('copy-code');
    const joinForm = document.getElementById('join-form');
    const codeInput = document.getElementById('code-input');
    const submitCodeBtn = document.getElementById('submit-code');
    const matchIdDisplay = document.getElementById('match-id');
    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');
    const player1Status = document.getElementById('player1-status');
    const player2Status = document.getElementById('player2-status');
    const player1Card = document.getElementById('player1-card');
    const player2Card = document.getElementById('player2-card');
    const player1Initial = document.getElementById('player1-initial');
    const player2Initial = document.getElementById('player2-initial');
    const statsX = document.getElementById('stats-x');
    const statsO = document.getElementById('stats-o');
    const statsDraw = document.getElementById('stats-draw');
    const statsXMobile = document.getElementById('stats-x-mobile');
    const statsOMobile = document.getElementById('stats-o-mobile');
    const statsDrawMobile = document.getElementById('stats-draw-mobile');
    const movesCount = document.getElementById('moves-count');
    const movesProgress = document.getElementById('moves-progress');
    const winModal = document.getElementById('win-modal');
    const winMessage = document.getElementById('win-message');
    const winDescription = document.getElementById('win-description');
    const winnerSymbol = document.getElementById('winner-symbol');
    const playAgainBtn = document.getElementById('play-again');
    const returnHomeBtn = document.getElementById('return-home');
    const chatContainer = document.getElementById('chat-container');
    const chatContainerMobile = document.getElementById('chat-container-mobile');
    const chatInput = document.getElementById('chat-input');
    const chatInputMobile = document.getElementById('chat-input-mobile');
    const sendMessageBtn = document.getElementById('send-message');
    const sendMessageMobilBtn = document.getElementById('send-message-mobile');

    // إنشاء لوحة اللعبة
    function createGameBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer relative';
            cell.dataset.index = i;
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }

    // معالجة النقر على خلية
    async function handleCellClick(event) {
        const cellIndex = parseInt(event.target.dataset.index);
        
        // التحقق من صحة الحركة
        if (!gameState.gameActive || !gameState.isMyTurn || gameState.board[cellIndex] !== '') {
            return;
        }
        
        try {
            // تحديث حالة اللعبة محلياً
            gameState.board[cellIndex] = gameState.playerSymbol;
            gameState.isMyTurn = false;
            
            // تحديث واجهة المستخدم
            updateGameBoard();
            updatePlayerStatus();
            
            // إرسال الحركة للخادم
            const response = await fetch(`/api/game/matches/${gameState.match.id}/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    position: cellIndex,
                    symbol: gameState.playerSymbol,
                    board_state: gameState.board
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            // التحقق من نهاية اللعبة
            checkGameEnd();
            
        } catch (error) {
            console.error('Error making move:', error);
            showNotification(error.message || 'حدث خطأ أثناء إرسال الحركة', 'error');
        }
    }

    // التحقق من نهاية اللعبة
    function checkGameEnd() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // صفوف
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // أعمدة
            [0, 4, 8], [2, 4, 6]             // قطري
        ];
        
        // التحقق من الفوز
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState.board[a] && 
                gameState.board[a] === gameState.board[b] && 
                gameState.board[a] === gameState.board[c]) {
                
                // تمييز الخلايا الفائزة
                highlightWinningCells(pattern);
                
                // إرسال نتيجة المباراة للخادم
                endMatch(gameState.board[a]);
                
                return;
            }
        }
        
        // التحقق من التعادل
        if (!gameState.board.includes('')) {
            endMatch('draw');
        }
    }

    // تمييز الخلايا الفائزة
    function highlightWinningCells(cells) {
        const gameCells = document.querySelectorAll('.game-cell');
        cells.forEach(index => {
            gameCells[index].classList.add('winning-cell');
        });
    }

    // إنهاء المباراة
    async function endMatch(winner) {
        try {
            gameState.gameActive = false;
            
            // تحديث النتائج
            if (winner !== 'draw') {
                gameState.scores[winner]++;
            } else {
                gameState.scores.draw++;
            }
            
            updateScores();
            showWinModal(winner);
            
            // إرسال نتيجة المباراة للخادم
            const response = await fetch(`/api/game/matches/${gameState.match.id}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    winner: winner,
                    board_state: gameState.board
                })
            });
            
            await response.json();
            
        } catch (error) {
            console.error('Error ending match:', error);
        }
    }

    // إظهار نافذة الفوز
    function showWinModal(winner) {
        if (winner === 'draw') {
            winMessage.textContent = 'تعادل!';
            winDescription.textContent = 'انتهت المباراة بالتعادل، جرب مرة أخرى!';
            winnerSymbol.textContent = '=';
            winnerSymbol.className = 'mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mb-4 bg-gray-500/30 text-white';
        } else {
            const isWinner = winner === gameState.playerSymbol;
            winMessage.textContent = isWinner ? 'مبروك، لقد فزت!' : 'للأسف، لقد خسرت';
            winDescription.textContent = isWinner ? 'أحسنت! لقد فزت في هذه المباراة.' : 'لا بأس، يمكنك المحاولة مرة أخرى.';
            winnerSymbol.textContent = winner;
            winnerSymbol.className = `mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mb-4 bg-${winner === 'X' ? 'blue' : 'purple'}-500/30 text-${winner === 'X' ? 'blue' : 'purple'}-300`;
        }
        
        winModal.classList.remove('hidden');
    }

    // إخفاء نافذة الفوز
    function hideWinModal() {
        winModal.classList.add('hidden');
    }

    // تحديث لوحة اللعبة
    function updateGameBoard() {
        const gameCells = document.querySelectorAll('.game-cell');
        gameState.board.forEach((value, index) => {
            if (value) {
                gameCells[index].classList.add(value.toLowerCase());
                gameCells[index].textContent = '';
            } else {
                gameCells[index].classList.remove('x', 'o');
                gameCells[index].textContent = '';
            }
        });
        
        // تحديث عدد الحركات وشريط التقدم
        const movesMade = gameState.board.filter(cell => cell !== '').length;
        movesCount.textContent = `${movesMade}/9`;
        const progressPercentage = (movesMade / 9) * 100;
        movesProgress.style.width = `${progressPercentage}%`;
    }

    // تحديث حالة اللاعبين
    function updatePlayerStatus() {
        // إزالة التنشيط من بطاقات اللاعبين
        player1Card.classList.remove('active');
        player2Card.classList.remove('active');
        
        // تحديث حالة اللعبة
        if (gameState.gameActive) {
            if (gameState.currentTurn === 'X') {
                player1Status.textContent = 'دورك للعب';
                player2Status.textContent = 'في انتظار الدور';
                player1Card.classList.add('active');
                gameStatus.textContent = 'دور اللاعب X';
                gameStatus.className = 'px-3 py-1 rounded-full bg-blue-500 text-sm font-bold text-white';
            } else {
                player1Status.textContent = 'في انتظار الدور';
                player2Status.textContent = 'دورك للعب';
                player2Card.classList.add('active');
                gameStatus.textContent = 'دور اللاعب O';
                gameStatus.className = 'px-3 py-1 rounded-full bg-purple-500 text-sm font-bold text-white';
            }
            
            // تحديث حالة الدور للاعب الحالي
            if (gameState.isMyTurn) {
                if (gameState.playerSymbol === 'X') {
                    player1Status.textContent = 'دورك للعب';
                } else {
                    player2Status.textContent = 'دورك للعب';
                }
            }
        } else {
            player1Status.textContent = 'غير نشط';
            player2Status.textContent = 'غير نشط';
            gameStatus.textContent = 'المباراة غير نشطة';
            gameStatus.className = 'px-3 py-1 rounded-full bg-gray-500 text-sm font-bold text-white';
        }
    }

    // تحديث النتائج
    function updateScores() {
        statsX.textContent = gameState.scores.X;
        statsO.textContent = gameState.scores.O;
        statsDraw.textContent = gameState.scores.draw;
        statsXMobile.textContent = gameState.scores.X;
        statsOMobile.textContent = gameState.scores.O;
        statsDrawMobile.textContent = gameState.scores.draw;
    }

    // إنشاء مباراة جديدة
    async function createNewMatch() {
        try {
            const response = await fetch('/api/game/matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    mode: 'online'
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            // تحديث حالة اللعبة
            gameState.match = data.match;
            gameState.playerSymbol = 'X';
            gameState.board = Array(9).fill('');
            gameState.currentTurn = 'X';
            gameState.isMyTurn = true;
            gameState.gameActive = false; // سيتم تفعيلها عند انضمام اللاعب الثاني
            
            // تحديث واجهة المستخدم
            matchIdDisplay.textContent = data.match.id;
            gameCodeDisplay.textContent = data.match.match_code;
            gameCodeContainer.classList.remove('hidden');
            joinForm.classList.add('hidden');
            
            // تحديث معلومات اللاعبين
            player1Name.textContent = username;
            player1Initial.textContent = username.charAt(0).toUpperCase();
            player1Status.textContent = 'في انتظار اللاعب الثاني';
            player2Name.textContent = 'في انتظار اللاعب...';
            player2Initial.textContent = '?';
            player2Status.textContent = 'غير متصل';
            
            // تحديث حالة اللعبة
            gameStatus.textContent = 'في انتظار انضمام اللاعب الثاني';
            gameStatus.className = 'px-3 py-1 rounded-full bg-yellow-500 text-sm font-bold text-yellow-900';
            
            // إعادة تهيئة لوحة اللعبة
            createGameBoard();
            updateGameBoard();
            
            // الاشتراك في قناة المباراة
            subscribeToMatch(data.match.id);
            
            showNotification('تم إنشاء مباراة جديدة، شارك الرمز مع صديقك!', 'success');
            
        } catch (error) {
            console.error('Error creating match:', error);
            showNotification(error.message || 'حدث خطأ أثناء إنشاء المباراة', 'error');
        }
    }

    // الانضمام إلى مباراة
    async function joinMatch(matchCode) {
        try {
            // البحث عن المباراة بواسطة الرمز
            const response = await fetch(`/api/game/matches/by-code/${matchCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            const match = data.match;
            
            // التحقق من أن المباراة في حالة انتظار
            if (match.status !== 'waiting') {
                throw new Error('المباراة غير متاحة للانضمام');
            }
            
            // التحقق من أن المستخدم ليس هو اللاعب الأول
            if (match.player1_id === parseInt(userId)) {
                throw new Error('لا يمكنك الانضمام إلى مباراتك الخاصة');
            }
            
            // الانضمام إلى المباراة
            const joinResponse = await fetch(`/api/game/matches/${match.id}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    player2_id: userId,
                    player2_name: username
                })
            });
            
            const joinData = await joinResponse.json();
            
            if (!joinData.success) {
                throw new Error(joinData.message);
            }
            
            // تحديث حالة اللعبة
            gameState.match = joinData.match;
            gameState.playerSymbol = 'O';
            gameState.board = Array(9).fill('');
            gameState.currentTurn = 'X';
            gameState.isMyTurn = false; // دور اللاعب الأول أولاً
            gameState.gameActive = true;
            
            // تحديث واجهة المستخدم
            matchIdDisplay.textContent = joinData.match.id;
            gameCodeContainer.classList.add('hidden');
            joinForm.classList.add('hidden');
            
            // تحديث معلومات اللاعبين
            player1Name.textContent = joinData.match.player1_name;
            player1Initial.textContent = joinData.match.player1_name.charAt(0).toUpperCase();
            player1Status.textContent = 'دوره للعب';
            player2Name.textContent = username;
            player2Initial.textContent = username.charAt(0).toUpperCase();
            player2Status.textContent = 'في انتظار الدور';
            
            // تحديث حالة اللعبة
            gameStatus.textContent = 'دور اللاعب X';
            gameStatus.className = 'px-3 py-1 rounded-full bg-blue-500 text-sm font-bold text-white';
            
            // إعادة تهيئة لوحة اللعبة
            createGameBoard();
            updateGameBoard();
            updatePlayerStatus();
            
            // الاشتراك في قناة المباراة
            subscribeToMatch(joinData.match.id);
            
            showNotification('تم الانضمام إلى المباراة بنجاح!', 'success');
            
        } catch (error) {
            console.error('Error joining match:', error);
            showNotification(error.message || 'حدث خطأ أثناء الانضمام للمباراة', 'error');
        }
    }

    // الاشتراك في قناة المباراة
    function subscribeToMatch(matchId) {
        const channel = window.Echo.private(`match.${matchId}`);
        
        channel.listen('PlayerJoined', (e) => {
            console.log('Player joined:', e);
            
            // تحديث معلومات اللاعب الثاني
            player2Name.textContent = e.player2_name;
            player2Initial.textContent = e.player2_name.charAt(0).toUpperCase();
            player2Status.textContent = 'في انتظار الدور';
            
            // تفعيل اللعبة
            gameState.gameActive = true;
            gameStatus.textContent = 'دور اللاعب X';
            gameStatus.className = 'px-3 py-1 rounded-full bg-blue-500 text-sm font-bold text-white';
            
            updatePlayerStatus();
            
            showNotification(`انضم ${e.player2_name} إلى المباراة!`, 'info');
        });
        
        channel.listen('GameMove', (e) => {
            console.log('Move received:', e);
            
            // تحديث اللوحة
            gameState.board[e.position] = e.symbol;
            gameState.currentTurn = e.symbol === 'X' ? 'O' : 'X';
            
            // إذا كان الرمز المستلم هو رمز الخصم، فهذا يعني أن دورنا الآن
            if (e.symbol !== gameState.playerSymbol) {
                gameState.isMyTurn = true;
            }
            
            updateGameBoard();
            updatePlayerStatus();
            
            // التحقق من نهاية اللعبة
            checkGameEnd();
        });
        
        channel.listen('GameEnded', (e) => {
            console.log('Game ended:', e);
            
            // تحديث حالة اللعبة
            gameState.gameActive = false;
            
            // تحديث اللوحة النهائية
            gameState.board = e.board_state;
            updateGameBoard();
            
            // تحديث النتائج
            if (e.winner !== 'draw') {
                gameState.scores[e.winner]++;
            } else {
                gameState.scores.draw++;
            }
            
            updateScores();
            showWinModal(e.winner);
            updatePlayerStatus();
        });
        
        channel.listen('ChatMessage', (e) => {
            console.log('Chat message:', e);
            addChatMessage(e.player_name, e.message);
        });
    }

    // إضافة رسالة محادثة
    function addChatMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message mb-2';
        
        const isCurrentUser = sender === username;
        
        messageElement.innerHTML = `
            <div class="flex items-start ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs px-3 py-2 rounded-lg ${isCurrentUser ? 'bg-indigo-500/30 text-white ml-2' : 'bg-white/10 text-white mr-2'}">
                    <div class="text-xs font-bold mb-1 ${isCurrentUser ? 'text-indigo-300' : 'text-gray-300'}">${sender}</div>
                    <div>${text}</div>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(messageElement);
        chatContainerMobile.appendChild(messageElement.cloneNode(true));
        
        // التمرير للأسفل
        chatContainer.scrollTop = chatContainer.scrollHeight;
        chatContainerMobile.scrollTop = chatContainerMobile.scrollHeight;
    }

    // إرسال رسالة محادثة
    async function sendChatMessage(text) {
        if (!text.trim() || !gameState.match) return;
        
        try {
            const response = await fetch(`/api/game/matches/${gameState.match.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    player_id: userId,
                    player_name: username,
                    message: text
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            // إضافة الرسالة محلياً
            addChatMessage(username, text);
            
            // مسح حقل الإدخال
            chatInput.value = '';
            chatInputMobile.value = '';
            
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification(error.message || 'حدث خطأ أثناء إرسال الرسالة', 'error');
        }
    }

    // عرض إشعار
    function showNotification(message, type = 'info') {
        // يمكن استخدام مكتبة إشعارات مثل toastify
        // هنا سنستخدم console.log كبديل بسيط
        console.log(`[${type}] ${message}`);
        alert(message);
    }

    // إعادة بدء اللعبة
    function resetGame() {
        hideWinModal();
        gameState.board = Array(9).fill('');
        gameState.currentTurn = 'X';
        gameState.isMyTurn = gameState.playerSymbol === 'X';
        gameState.gameActive = true;
        
        createGameBoard();
        updateGameBoard();
        updatePlayerStatus();
    }

    // إضافة أحداث
    createGameBtn.addEventListener('click', createNewMatch);
    joinGameBtn.addEventListener('click', () => {
        joinForm.classList.toggle('hidden');
        gameCodeContainer.classList.add('hidden');
    });
    
    submitCodeBtn.addEventListener('click', () => {
        const code = codeInput.value.trim();
        if (code) {
            joinMatch(code);
        } else {
            showNotification('الرجاء إدخال رمز المباراة', 'error');
        }
    });
    
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(gameCodeDisplay.textContent)
            .then(() => showNotification('تم نسخ الرمز بنجاح', 'success'))
            .catch(() => showNotification('فشل نسخ الرمز', 'error'));
    });
    
    playAgainBtn.addEventListener('click', resetGame);
    returnHomeBtn.addEventListener('click', () => {
        window.location.href = '/games/choose';
    });
    
    sendMessageBtn.addEventListener('click', () => {
        sendChatMessage(chatInput.value);
    });
    
    sendMessageMobilBtn.addEventListener('click', () => {
        sendChatMessage(chatInputMobile.value);
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage(chatInput.value);
        }
    });
    
    chatInputMobile.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage(chatInputMobile.value);
        }
    });
    
    // تهيئة اللعبة
    createGameBoard();
}); 