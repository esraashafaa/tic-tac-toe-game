<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لعبة XO - وضع متصل</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="player-name" content="{{ Auth::user()->name }}">
    <meta name="user-id" content="{{ Auth::id() }}">
    @vite(['resources/css/app.css', 'resources/js/online-game.js'])
</head>
<body>
    <div class="text-lg text-center py-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 shadow mb-4">
        مرحباً، <span class="font-bold text-blue-600 dark:text-blue-400">{{ Auth::user()->name }}</span>
    </div>
    <div id="app"></div>
</body>
</html> 