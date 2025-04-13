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
    <div id="app"></div>
</body>
</html> 