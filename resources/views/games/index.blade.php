@extends('layouts.app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8">
    <div class="container mx-auto px-4">
        <!-- معلومات المستخدم -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-6">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-white">مرحباً، {{ Auth::user()->name }}</h2>
                @if(Auth::user()->is_guest)
                    <p class="text-white/70 mt-2">أنت مسجل دخول كضيف</p>
                @endif
            </div>
            
            <!-- إحصائيات اللاعب -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <h3 class="text-white/80 text-sm">المباريات</h3>
                    <p class="text-2xl font-bold text-white">{{ Auth::user()->total_games }}</p>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <h3 class="text-white/80 text-sm">الفوز</h3>
                    <p class="text-2xl font-bold text-white">{{ Auth::user()->wins }}</p>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <h3 class="text-white/80 text-sm">الخسارة</h3>
                    <p class="text-2xl font-bold text-white">{{ Auth::user()->losses }}</p>
                </div>
                <div class="bg-white/20 rounded-lg p-4 text-center">
                    <h3 class="text-white/80 text-sm">التعادل</h3>
                    <p class="text-2xl font-bold text-white">{{ Auth::user()->draws }}</p>
                </div>
            </div>

            <!-- أزرار اللعب -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="{{ url('/online-game') }}" 
                   class="bg-white/20 hover:bg-white/30 text-white text-center font-semibold py-3 px-6 rounded-lg transition duration-300">
                    اللعب اونلاين
                </a>
                <a href="{{ url('/offline-game') }}" 
                   class="bg-white/20 hover:bg-white/30 text-white text-center font-semibold py-3 px-6 rounded-lg transition duration-300">
                    اللعب ضد الكمبيوتر
                </a>
            </div>

            <!-- زر تسجيل الخروج -->
            <div class="mt-6 text-center">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" 
                            class="text-white/60 hover:text-white/90 text-sm transition duration-300">
                        تسجيل الخروج
                    </button>
                </form>
            </div>
        </div>

        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <!-- رأس الصفحة -->
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-3xl font-bold text-white">قائمة المباريات</h1>
                <button id="createMatchBtn" 
                        class="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                    إنشاء مباراة جديدة
                </button>
            </div>

            <!-- إضافة عدادات النقاط -->
            <div class="flex justify-center gap-4 mb-8">
                <div class="bg-blue-100 p-4 rounded-lg text-center">
                    <div class="text-blue-800 font-bold">X فوز</div>
                    <div id="x-wins" class="text-2xl font-bold text-blue-600">0</div>
                </div>
                <div class="bg-gray-100 p-4 rounded-lg text-center">
                    <div class="text-gray-800 font-bold">تعادل</div>
                    <div id="draws" class="text-2xl font-bold text-gray-600">0</div>
                </div>
                <div class="bg-green-100 p-4 rounded-lg text-center">
                    <div class="text-green-800 font-bold">O فوز</div>
                    <div id="o-wins" class="text-2xl font-bold text-green-600">0</div>
                </div>
            </div>

            <!-- قسم المباريات النشطة -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-white mb-4">المباريات النشطة</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="activeMatches">
                    <!-- سيتم تعبئة هذا القسم ديناميكياً -->
                </div>
            </div>

            <!-- قسم المباريات المنتظرة -->
            <div>
                <h2 class="text-xl font-semibold text-white mb-4">المباريات المتاحة</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="waitingMatches">
                    <!-- سيتم تعبئة هذا القسم ديناميكياً -->
                </div>
            </div>
        </div>
    </div>
</div>

<!-- قالب بطاقة المباراة -->
<template id="matchCardTemplate">
    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 shadow-lg transition duration-300 ease-in-out hover:transform hover:scale-105">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-white">مباراة #<span class="match-code"></span></h3>
                <p class="text-white/80 text-sm">اللاعب: <span class="player-name"></span></p>
            </div>
            <div class="px-3 py-1 rounded-full text-sm font-medium match-status"></div>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div class="text-white/80 text-sm">
                <span class="moves-count">0</span> حركة
            </div>
            <button class="join-match-btn bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition duration-300">
                انضم للمباراة
            </button>
        </div>
    </div>
</template>

@endsection

@push('styles')
<style>
    .match-status.waiting {
        @apply bg-yellow-500/20 text-yellow-300;
    }
    .match-status.playing {
        @apply bg-green-500/20 text-green-300;
    }
    .match-status.completed {
        @apply bg-gray-500/20 text-gray-300;
    }
</style>
@endpush

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    // تحديث قائمة المباريات كل 5 ثواني
    function updateMatchesList() {
        fetch('/api/game/matches')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const activeMatches = document.getElementById('activeMatches');
                    const waitingMatches = document.getElementById('waitingMatches');
                    
                    // تفريغ القوائم
                    activeMatches.innerHTML = '';
                    waitingMatches.innerHTML = '';
                    
                    // تصنيف المباريات
                    data.matches.forEach(match => {
                        const card = createMatchCard(match);
                        if (match.status === 'playing') {
                            activeMatches.appendChild(card);
                        } else if (match.status === 'waiting') {
                            waitingMatches.appendChild(card);
                        }
                    });
                }
            })
            .catch(error => console.error('Error fetching matches:', error));
    }

    // إنشاء بطاقة مباراة
    function createMatchCard(match) {
        const template = document.getElementById('matchCardTemplate');
        const card = template.content.cloneNode(true);
        
        // تعبئة البيانات
        card.querySelector('.match-code').textContent = match.match_code;
        card.querySelector('.player-name').textContent = match.player1_name;
        
        const statusElement = card.querySelector('.match-status');
        statusElement.textContent = getStatusText(match.status);
        statusElement.classList.add(match.status);
        
        card.querySelector('.moves-count').textContent = match.moves_count;
        
        // إضافة معالج حدث للانضمام للمباراة
        const joinButton = card.querySelector('.join-match-btn');
        if (match.status === 'waiting') {
            joinButton.addEventListener('click', () => joinMatch(match.id));
        } else {
            joinButton.style.display = 'none';
        }
        
        return card.firstElementChild;
    }

    // نص حالة المباراة
    function getStatusText(status) {
        switch (status) {
            case 'waiting': return 'في الانتظار';
            case 'playing': return 'جارية';
            case 'completed': return 'منتهية';
            default: return status;
        }
    }

    // الانضمام لمباراة
    async function joinMatch(matchId) {
        try {
            const response = await fetch(`/api/game/matches/${matchId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = `/game/${matchId}`;
            } else {
                alert(data.message || 'حدث خطأ أثناء الانضمام للمباراة');
            }
        } catch (error) {
            console.error('Error joining match:', error);
            alert('حدث خطأ أثناء الانضمام للمباراة');
        }
    }

    // إنشاء مباراة جديدة
    document.getElementById('createMatchBtn').addEventListener('click', async function() {
        try {
            const response = await fetch('/api/game/matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = `/game/${data.match.id}`;
            } else {
                alert(data.message || 'حدث خطأ أثناء إنشاء المباراة');
            }
        } catch (error) {
            console.error('Error creating match:', error);
            alert('حدث خطأ أثناء إنشاء المباراة');
        }
    });

    // تحديث القائمة مباشرة وكل 5 ثواني
    updateMatchesList();
    setInterval(updateMatchesList, 5000);
});
</script>
@endpush 