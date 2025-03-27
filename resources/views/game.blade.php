@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">مرحباً بك {{ $username }}!</h1>
        <h2 class="text-xl text-center mb-12 text-gray-600">اختر نوع اللعبة</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- اللعب اونلاين -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="p-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-center mb-2">اللعب اونلاين</h3>
                    <p class="text-gray-600 text-center text-sm mb-4">العب مع أصدقائك في مباريات حماسية</p>
                    <a href="{{ route('online-game') }}" class="block w-full py-2 px-4 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors duration-300">
                        ابدأ اللعب
                    </a>
                </div>
            </div>

            <!-- اللعب مع الاصدقاء على نفس الجهاز -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="p-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-center mb-2">اللعب مع الاصدقاء</h3>
                    <p class="text-gray-600 text-center text-sm mb-4">تحدى الاصدقاء مباراة شيقة</p>
                    <a href="{{ route('local-game') }}" class="block w-full py-2 px-4 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors duration-300">
                        ابدأ اللعب
                    </a>
                </div>
            </div>

            <!-- اللعب ضد الكمبيوتر -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div class="p-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-center mb-2">اللعب ضد الكمبيوتر</h3>
                    <p class="text-gray-600 text-center text-sm mb-4">تحدى الذكاء الاصطناعي في مباراة مثيرة</p>
                    <a href="{{ route('ai-game') }}" class="block w-full py-2 px-4 bg-purple-500 text-white text-center rounded-lg hover:bg-purple-600 transition-colors duration-300">
                        ابدأ اللعب
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection 