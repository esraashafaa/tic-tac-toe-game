@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
    <div class="max-w-4xl mx-auto text-center">
        <!-- رسالة الترحيب -->
        <div class="mb-12">
            <h1 class="text-4xl font-bold text-white mb-4">
                مرحباً بك {{ auth()->user()->name }}!
                @if(auth()->user()->is_guest)
                    <span class="text-sm bg-yellow-500 text-black px-2 py-1 rounded-full mr-2">ضيف</span>
                @endif
            </h1>
            <p class="text-xl text-gray-300">اختر نوع اللعبة</p>
        </div>

        <!-- خيارات اللعب -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- اللعب ضد الكمبيوتر -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:transform hover:scale-105 transition duration-300">
                <div class="text-center">
                    <svg class="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-white mb-4">اللعب مع الاصدقاء على نفس الجهاز</h2>
                    <p class="text-gray-400 mb-6">تحدى الاصدقاء مباراة شيقة</p>
                    <a href="/offline-game" 
                       class="inline-block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold transition duration-200">
                        ابدأ اللعب
                    </a>
                </div>
            </div>

            <!-- اللعب اونلاين -->
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:transform hover:scale-105 transition duration-300">
                <div class="text-center">
                    <svg class="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <h2 class="text-2xl font-bold text-white mb-4">اللعب اونلاين</h2>
                    <p class="text-gray-400 mb-6">العب مع أصدقائك في مباريات حماسية</p>
                    <a href="/online-game" 
                       class="inline-block w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold transition duration-200">
                        ابدأ اللعب
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 