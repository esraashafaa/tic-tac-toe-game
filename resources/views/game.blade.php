<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="player-name" content="{{ Auth::user()->name }}">
    <meta name="user-id" content="{{ Auth::id() }}">
    <title>لعبة XO - مباراة جديدة</title>
    @vite(['resources/css/app.css', 'resources/js/game.js'])
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            min-height: 100vh;
        }
        .game-cell {
            aspect-ratio: 1;
            font-size: 2.5rem;
            transition: all 0.3s ease;
            perspective: 1000px;
        }
        .game-cell.x::before, .game-cell.x::after {
            content: '';
            position: absolute;
            width: 20%;
            height: 80%;
            background: #818cf8;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        .game-cell.x::before {
            transform: rotate(45deg);
        }
        .game-cell.x::after {
            transform: rotate(-45deg);
        }
        .game-cell.o::before {
            content: '';
            position: absolute;
            width: 60%;
            height: 60%;
            border: 8px solid #c084fc;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        .winning-cell {
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .player-avatar {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: bold;
            color: white;
        }
        .player-card {
            transition: all 0.3s ease;
            transform-style: preserve-3d;
        }
        .player-card.active {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            transform: translateY(-5px);
        }
        .player-symbol {
            width: 2rem;
            height: 2rem;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.1rem;
        }
        .player-symbol.x {
            background: rgba(99, 102, 241, 0.3);
            color: #818cf8;
        }
        .player-symbol.o {
            background: rgba(168, 85, 247, 0.3);
            color: #c084fc;
        }
        .chat-container {
            max-height: 200px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .chat-container::-webkit-scrollbar {
            width: 5px;
        }
        .chat-container::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
        }
        .message {
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .btn {
            transition: all 0.3s ease;
        }
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .btn:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div class="container mx-auto px-4 py-8">
        <!-- رأس الصفحة -->
        <header class="flex justify-between items-center mb-6">
            <a href="/games/choose" class="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة
            </a>
            <h1 class="text-2xl font-bold text-white">لعبة XO</h1>
            <form id="logout-form" action="/logout" method="POST">
                @csrf
                <button type="submit" class="flex items-center gap-2 bg-red-500/20 backdrop-blur-md rounded-lg px-4 py-2 text-white hover:bg-red-500/30 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    خروج
                </button>
            </form>
        </header>

        <!-- محتوى اللعبة -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- اللاعب الأول -->
            <div class="lg:order-1 order-2">
                <div id="player1-card" class="player-card bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-4">
                    <div class="player-avatar bg-blue-500/30">
                        <span id="player1-initial">X</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center">
                            <h2 id="player1-name" class="font-bold text-white text-lg">في انتظار اللاعب...</h2>
                            <div class="player-symbol x">X</div>
                        </div>
                        <p id="player1-status" class="text-gray-300 text-sm">...</p>
                    </div>
                </div>
                
                <!-- الإحصائيات والمحادثة (للشاشات الكبيرة) -->
                <div class="hidden lg:block mt-6">
                    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4">
                        <h3 class="font-bold text-white mb-3">المحادثة</h3>
                        <div id="chat-container" class="chat-container mb-3">
                            <div class="text-center text-gray-400 text-sm">
                                يمكنك التواصل مع خصمك هنا
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <input id="chat-input" type="text" placeholder="اكتب رسالة..." class="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                            <button id="send-message" class="btn bg-indigo-500 text-white rounded-lg px-4 py-2">
                                إرسال
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- لوحة اللعب -->
            <div class="lg:order-2 order-1">
                <div class="bg-white/10 backdrop-blur-md rounded-xl p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="font-bold text-white">المباراة #<span id="match-id">-</span></h2>
                        <div id="game-status" class="px-3 py-1 rounded-full bg-yellow-500 text-sm font-bold text-yellow-900">
                            في انتظار بدء اللعبة
                        </div>
                    </div>
                    
                    <!-- لوحة اللعبة -->
                    <div id="game-board" class="grid grid-cols-3 gap-2 mb-4">
                        <!-- سيتم إنشاء الخلايا ديناميكياً باستخدام JavaScript -->
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-3 justify-center">
                        <button id="create-game" class="btn bg-indigo-600 text-white py-2 px-4 rounded-lg font-bold">
                            إنشاء مباراة جديدة
                        </button>
                        <button id="join-game" class="btn bg-purple-600 text-white py-2 px-4 rounded-lg font-bold">
                            الانضمام برمز
                        </button>
                    </div>
                    
                    <!-- رمز المباراة -->
                    <div id="game-code-container" class="hidden mt-4 text-center">
                        <p class="text-white mb-1">رمز المباراة:</p>
                        <div class="flex justify-center">
                            <div id="game-code" class="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-xl font-bold text-white tracking-wider"></div>
                            <button id="copy-code" class="ml-2 bg-white/10 hover:bg-white/20 rounded-lg p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <!-- إدخال رمز المباراة -->
                    <div id="join-form" class="hidden mt-4">
                        <div class="flex gap-2">
                            <input id="code-input" type="text" placeholder="أدخل رمز المباراة..." class="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                            <button id="submit-code" class="btn bg-purple-600 text-white rounded-lg px-4 py-2">
                                انضمام
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- اللاعب الثاني -->
            <div class="lg:order-3 order-3">
                <div id="player2-card" class="player-card bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-4">
                    <div class="player-avatar bg-purple-500/30">
                        <span id="player2-initial">O</span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center">
                            <h2 id="player2-name" class="font-bold text-white text-lg">في انتظار اللاعب...</h2>
                            <div class="player-symbol o">O</div>
                        </div>
                        <p id="player2-status" class="text-gray-300 text-sm">...</p>
                    </div>
                </div>
                
                <!-- الإحصائيات (للشاشات الكبيرة) -->
                <div class="hidden lg:block mt-6">
                    <div class="bg-white/10 backdrop-blur-md rounded-xl p-4">
                        <h3 class="font-bold text-white mb-3">إحصائيات المباراة</h3>
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div class="bg-blue-500/20 rounded-lg p-3">
                                <div class="text-blue-300 text-sm">فوز X</div>
                                <div id="stats-x" class="text-2xl font-bold text-white">0</div>
                            </div>
                            <div class="bg-gray-500/20 rounded-lg p-3">
                                <div class="text-gray-300 text-sm">تعادل</div>
                                <div id="stats-draw" class="text-2xl font-bold text-white">0</div>
                            </div>
                            <div class="bg-purple-500/20 rounded-lg p-3">
                                <div class="text-purple-300 text-sm">فوز O</div>
                                <div id="stats-o" class="text-2xl font-bold text-white">0</div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <div class="text-gray-300 text-sm mb-1">عدد الحركات</div>
                            <div class="flex items-center">
                                <div class="h-2 bg-white/10 rounded-full flex-1 mr-2">
                                    <div id="moves-progress" class="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style="width: 0%"></div>
                                </div>
                                <div id="moves-count" class="text-white font-bold">0/9</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- الإحصائيات والمحادثة (للشاشات الصغيرة) -->
        <div class="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <h3 class="font-bold text-white mb-3">إحصائيات المباراة</h3>
                <div class="grid grid-cols-3 gap-3 text-center">
                    <div class="bg-blue-500/20 rounded-lg p-3">
                        <div class="text-blue-300 text-sm">فوز X</div>
                        <div id="stats-x-mobile" class="text-2xl font-bold text-white">0</div>
                    </div>
                    <div class="bg-gray-500/20 rounded-lg p-3">
                        <div class="text-gray-300 text-sm">تعادل</div>
                        <div id="stats-draw-mobile" class="text-2xl font-bold text-white">0</div>
                    </div>
                    <div class="bg-purple-500/20 rounded-lg p-3">
                        <div class="text-purple-300 text-sm">فوز O</div>
                        <div id="stats-o-mobile" class="text-2xl font-bold text-white">0</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <h3 class="font-bold text-white mb-3">المحادثة</h3>
                <div id="chat-container-mobile" class="chat-container mb-3">
                    <div class="text-center text-gray-400 text-sm">
                        يمكنك التواصل مع خصمك هنا
                    </div>
                </div>
                <div class="flex gap-2">
                    <input id="chat-input-mobile" type="text" placeholder="اكتب رسالة..." class="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30">
                    <button id="send-message-mobile" class="btn bg-indigo-500 text-white rounded-lg px-4 py-2">
                        إرسال
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- نافذة الانتصار -->
    <div id="win-modal" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 hidden">
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div class="text-center">
                <div id="winner-symbol" class="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mb-4"></div>
                <h2 id="win-message" class="text-2xl font-bold text-white mb-2"></h2>
                <p id="win-description" class="text-gray-300 mb-6"></p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
                <button id="play-again" class="btn flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-bold">
                    لعب مباراة أخرى
                </button>
                <button id="return-home" class="btn flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-bold">
                    العودة للرئيسية
                </button>
            </div>
        </div>
    </div>
</body>
</html> 