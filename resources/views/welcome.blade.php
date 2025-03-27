<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لعبة XO - مرحباً بك!</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/app.css'])
</head>
<body class="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-4xl mx-auto">
        <!-- رسالة الترحيب -->
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold text-white mb-4">
                <span class="text-indigo-400">X</span>
                <span class="text-green-400">O</span>
                <span class="text-white"> لعبة</span>
            </h1>
            <p class="text-xl text-gray-300">مرحباً بك في أفضل لعبة XO على الإنترنت!</p>
            <p class="text-gray-400 mt-2">العب مع أصدقائك أو تحدى الكمبيوتر</p>
        </div>

        <!-- بطاقات الخيارات -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- تسجيل الدخول -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:transform hover:scale-105 transition duration-300">
                <div class="text-center">
                    <svg class="w-12 h-12 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-white mb-2">تسجيل الدخول</h2>
                    <p class="text-gray-400 mb-4">لديك حساب بالفعل؟ سجل دخولك وابدأ اللعب!</p>
                    <a href="{{ route('login') }}" 
                       class="inline-block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200">
                        تسجيل الدخول
                    </a>
                </div>
            </div>

            <!-- إنشاء حساب -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:transform hover:scale-105 transition duration-300">
                <div class="text-center">
                    <svg class="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-white mb-2">إنشاء حساب</h2>
                    <p class="text-gray-400 mb-4">جديد هنا؟ أنشئ حسابك واستمتع بجميع المميزات!</p>
                    <a href="{{ route('register') }}" 
                       class="inline-block w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200">
                        إنشاء حساب
                    </a>
                </div>
            </div>

            <!-- الدخول كضيف -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:transform hover:scale-105 transition duration-300">
                <div class="text-center">
                    <svg class="w-12 h-12 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-white mb-2">دخول كضيف</h2>
                    <p class="text-gray-400 mb-4">جرب اللعبة سريعاً بدون تسجيل حساب!</p>
                    <form method="POST" action="{{ route('guest.login') }}">
                        @csrf
                        <div class="mb-3">
                            <input type="text" 
                                   name="name" 
                                   required 
                                   class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                   placeholder="أدخل اسمك">
                        </div>
                        <button type="submit" 
                                class="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200">
                            دخول كضيف
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
