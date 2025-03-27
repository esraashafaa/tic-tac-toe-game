<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل دخول كضيف - لعبة XO</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/app.css'])
</head>
<body class="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 class="text-3xl font-bold text-center text-white mb-8">تسجيل دخول كضيف</h1>
        
        <form method="POST" action="{{ route('guest.login') }}" class="space-y-6">
            @csrf
            
            <div>
                <label for="name" class="block text-sm font-medium text-white">اسم المستخدم</label>
                <input type="text" 
                       name="name" 
                       id="name" 
                       required 
                       class="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                       placeholder="أدخل اسمك">
                @error('name')
                    <p class="mt-2 text-sm text-red-300">{{ $message }}</p>
                @enderror
            </div>

            <button type="submit" 
                    class="w-full bg-white/20 text-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition duration-200">
                دخول كضيف
            </button>
        </form>

        <div class="mt-6 text-center">
            <a href="{{ route('login') }}" class="text-white/70 hover:text-white text-sm">
                لديك حساب؟ تسجيل الدخول
            </a>
        </div>
    </div>
</body>
</html> 