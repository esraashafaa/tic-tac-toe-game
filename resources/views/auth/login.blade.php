@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6">
            <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">تسجيل الدخول</h2>

            <!-- عرض رسائل النجاح -->
            @if (session('success'))
                <div class="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">
                    {{ session('success') }}
                </div>
            @endif

            <!-- نموذج تسجيل الدخول العادي -->
            <form method="POST" action="{{ route('login') }}" class="space-y-4" id="loginForm">
                @csrf
                
                <!-- إضافة معلمة next إذا وجدت في URL -->
                @if (request()->has('next'))
                <input type="hidden" name="next" value="{{ request()->get('next') }}">
                @endif

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                    <input type="email" 
                           name="email" 
                           id="email" 
                           required 
                           class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           placeholder="أدخل بريدك الإلكتروني">
                    @error('email')
                        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">كلمة المرور</label>
                    <input type="password" 
                           name="password" 
                           id="password" 
                           required 
                           class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           placeholder="أدخل كلمة المرور">
                    @error('password')
                        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" 
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    تسجيل الدخول
                </button>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">أو</span>
                </div>
            </div>

            <!-- نموذج تسجيل الدخول كضيف -->
            <form method="POST" action="{{ route('guest.login') }}" class="space-y-4" id="guestLoginForm">
                @csrf
                
                <!-- إضافة معلمة next إذا وجدت في URL -->
                @if (request()->has('next'))
                <input type="hidden" name="next" value="{{ request()->get('next') }}">
                @endif

                <!-- عرض رسائل الخطأ للضيوف -->
                @error('guest_error')
                    <div class="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {{ $message }}
                    </div>
                @enderror

                <div>
                    <label for="guest_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                    <input type="text" 
                           name="name" 
                           id="guest_name" 
                           required 
                           class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           placeholder="أدخل اسمك">
                    @error('name')
                        <p class="mt-1 text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" 
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    دخول كضيف
                </button>
            </form>

            <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                ليس لديك حساب؟
                <a href="{{ route('register') }}" class="font-medium text-indigo-600 hover:text-indigo-500">
                    إنشاء حساب جديد
                </a>
            </p>
        </div>
    </div>
</div>

<!-- إضافة JavaScript لاستخدام AJAX -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // تعديل نموذج تسجيل الدخول العادي
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على معلمة next من URL
            const urlParams = new URLSearchParams(window.location.search);
            const nextParam = urlParams.get('next');
            
            // إنشاء FormData من النموذج
            const formData = new FormData(loginForm);
            
            // إضافة معلمة next إذا وجدت
            if (nextParam) {
                formData.append('next', nextParam);
            }
            
            // إرسال الطلب بواسطة AJAX
            fetch('/login', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                console.log('استجابة تسجيل الدخول:', data);
                
                if (data.token) {
                    // حفظ بيانات المستخدم في localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // استخدام رابط إعادة التوجيه من الخادم
                    const redirectUrl = data.redirect || '/games/choose';
                    console.log('إعادة التوجيه إلى:', redirectUrl);
                    window.location.href = redirectUrl;
                } else {
                    alert(data.message || 'فشل تسجيل الدخول');
                }
            })
            .catch(error => {
                console.error('خطأ في تسجيل الدخول:', error);
                alert('حدث خطأ أثناء تسجيل الدخول');
            });
        });
    }
    
    // تعديل نموذج تسجيل الدخول كضيف
    const guestLoginForm = document.getElementById('guestLoginForm');
    if (guestLoginForm) {
        guestLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على معلمة next من URL
            const urlParams = new URLSearchParams(window.location.search);
            const nextParam = urlParams.get('next');
            
            // إنشاء FormData من النموذج
            const formData = new FormData(guestLoginForm);
            
            // إضافة معلمة next إذا وجدت
            if (nextParam) {
                formData.append('next', nextParam);
            }
            
            // إرسال الطلب بواسطة AJAX
            fetch('/guest-login', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                console.log('استجابة تسجيل الدخول كضيف:', data);
                
                if (data.token) {
                    // حفظ بيانات المستخدم في localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // استخدام رابط إعادة التوجيه من الخادم
                    const redirectUrl = data.redirect || '/games/choose';
                    console.log('إعادة التوجيه إلى:', redirectUrl);
                    window.location.href = redirectUrl;
                } else {
                    alert(data.message || 'فشل تسجيل الدخول كضيف');
                }
            })
            .catch(error => {
                console.error('خطأ في تسجيل الدخول كضيف:', error);
                alert('حدث خطأ أثناء تسجيل الدخول كضيف');
            });
        });
    }
});
</script>
@endsection
