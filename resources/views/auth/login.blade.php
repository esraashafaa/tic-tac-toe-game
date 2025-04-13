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
            <form method="POST" action="{{ route('login') }}" class="space-y-4">
                @csrf

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
            <form method="POST" action="{{ route('guest.login') }}" class="space-y-4">
                @csrf

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
@endsection
