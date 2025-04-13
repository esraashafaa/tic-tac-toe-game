'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gameService from '@/services/gameService';
import authService from '@/services/authService';

export default function OnlinePage() {
  const router = useRouter();
  const [activePath, setActivePath] = useState<'create' | 'join'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string>('');
  const [createdGameCode, setCreatedGameCode] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // التحقق من حالة تسجيل الدخول عند تحميل الصفحة
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // محاولة الحصول على المستخدم الحالي
        const user = await authService.getCurrentUser();
        if (user) {
          setIsLoggedIn(true);
          setPlayerName(user.name);
        } else {
          // تعيين اسم المستخدم مباشرة كـ "badr"
          console.log('تعيين الاسم مباشرة: badr');
          setPlayerName('badr');
          
          // تسجيل دخول كضيف تلقائياً
          try {
            await authService.guestLogin('badr');
            setIsLoggedIn(true);
            setError(null);
          } catch (err) {
            console.error('فشل تسجيل الدخول التلقائي:', err);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // في حالة حدوث خطأ، تعيين الاسم كـ "badr" أيضاً
        setPlayerName('badr');
      }
    };
    
    checkAuthStatus();
  }, []);

  // تسجيل الدخول كضيف
  const handleGuestLogin = async () => {
    if (!playerName.trim()) {
      setError('الرجاء إدخال اسم اللاعب');
      return;
    }
    
    try {
      setIsAuthLoading(true);
      await authService.guestLogin(playerName);
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      console.error('Error during guest login:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // إنشاء مباراة جديدة
  const handleCreateGame = async () => {
    try {
      // إذا كان اسم اللاعب فارغاً، نعيّن الاسم الافتراضي "badr"
      if (!playerName.trim()) {
        console.log('تعيين الاسم الافتراضي للإنشاء: badr');
        setPlayerName('badr');
      }
      
      // التحقق من حالة تسجيل الدخول
      if (!isLoggedIn) {
        try {
          setIsAuthLoading(true);
          // استخدام اسم اللاعب أو "badr" كاسم افتراضي
          const loginName = playerName.trim() || 'badr';
          await authService.guestLogin(loginName);
          setIsLoggedIn(true);
        } catch (err: any) {
          console.error('Error during guest login:', err);
          setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
          setIsAuthLoading(false);
          return;
        } finally {
          setIsAuthLoading(false);
        }
      }
      
      setIsLoading(true);
      setError(null);
      
      // استخدام اسم اللاعب أو "badr" كاسم افتراضي
      const gameName = playerName.trim() || 'badr';
      console.log('إنشاء لعبة باسم:', gameName);
      
      const response = await gameService.createMatch({ name: gameName });
      
      if (!response || !response.match_code) {
        throw new Error('فشل إنشاء المباراة - لم يتم استلام رمز صالح');
      }
      
      setCreatedGameCode(response.match_code);
      router.push(`/games/online/match?code=${response.match_code}`);
      
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'حدث خطأ أثناء إنشاء اللعبة - يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  // الانضمام إلى مباراة
  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      setError('الرجاء إدخال رمز اللعبة');
      return;
    }
    
    // إذا كان اسم اللاعب فارغاً، نعيّن الاسم الافتراضي "badr"
    if (!playerName.trim()) {
      console.log('تعيين الاسم الافتراضي للانضمام: badr');
      setPlayerName('badr');
    }
    
    // التحقق من حالة تسجيل الدخول
    if (!isLoggedIn) {
      try {
        setIsAuthLoading(true);
        // استخدام اسم اللاعب أو "badr" كاسم افتراضي
        const loginName = playerName.trim() || 'badr';
        await authService.guestLogin(loginName);
        setIsLoggedIn(true);
      } catch (err: any) {
        console.error('Error during guest login:', err);
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
        setIsAuthLoading(false);
        return;
      } finally {
        setIsAuthLoading(false);
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const match = await gameService.getMatchByCode(gameCode);
      
      // استخدام اسم اللاعب أو "badr" كاسم افتراضي
      const joinName = playerName.trim() || 'badr';
      console.log('الانضمام إلى لعبة باسم:', joinName);
      
      await gameService.joinMatch(gameCode, joinName);
      
      router.push(`/games/online/match?code=${gameCode}`);
      
    } catch (err: any) {
      console.error('Error joining game:', err);
      setError(err.message || 'المباراة غير موجودة أو غير متاحة');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games/choose" className="text-gray-400 hover:text-white flex items-center transition-colors hover:scale-105 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            رجوع
          </Link>
          
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">اللعب عبر الإنترنت</h1>
          
          <Link href="/" className="text-gray-400 hover:text-red-400 flex items-center transition-colors hover:scale-105 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 00-1 1v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            تسجيل خروج
          </Link>
        </div>

        {/* التبويبات */}
        <div className="flex mb-6">
          <button
            onClick={() => setActivePath('create')}
            className={`flex-1 py-3 font-medium transition-all duration-300 border-b-2 ${
              activePath === 'create'
                ? 'border-blue-500 text-blue-400 scale-105'
                : 'border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            إنشاء لعبة
          </button>
          <button
            onClick={() => setActivePath('join')}
            className={`flex-1 py-3 font-medium transition-all duration-300 border-b-2 ${
              activePath === 'join'
                ? 'border-purple-500 text-purple-400 scale-105'
                : 'border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            انضمام للعبة
          </button>
        </div>

        {/* قسم إنشاء لعبة */}
        {activePath === 'create' && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 text-center">إنشاء لعبة جديدة</h2>
            <p className="text-gray-400 mb-6 text-center">
              أنشئ لعبة جديدة وشارك الرمز مع صديقك للانضمام
            </p>
            
            <div className="mb-4">
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-400 mb-1">اسم اللاعب</label>
              <input
                id="playerName"
                type="text"
                placeholder="أدخل اسمك"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isLoggedIn}
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${isLoggedIn ? 'opacity-75' : ''}`}
              />
            </div>
            
            <button
              onClick={handleCreateGame}
              disabled={isLoading || isAuthLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isLoading || isAuthLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:shadow-blue-500/20'
              }`}
            >
              {isLoading || isAuthLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isAuthLoading ? 'جاري تسجيل الدخول...' : 'جاري الإنشاء...'}
                </div>
              ) : 'إنشاء لعبة'}
            </button>
            
            {createdGameCode && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg animate-in fade-in slide-in-from-bottom duration-500">
                <p className="text-sm text-gray-300 mb-2">رمز اللعبة:</p>
                <div className="bg-gray-900 py-2 px-4 rounded-lg font-mono text-xl text-center select-all animate-pulse">
                  {createdGameCode}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  شارك هذا الرمز مع صديقك ليستطيع الانضمام للعبة
                </p>
              </div>
            )}
            
            {error && activePath === 'create' && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                {error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* قسم الانضمام للعبة */}
        {activePath === 'join' && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 text-center">انضمام للعبة</h2>
            <p className="text-gray-400 mb-6 text-center">
              أدخل رمز اللعبة للانضمام إلى لعبة صديقك
            </p>
            
            <div className="mb-4">
              <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-400 mb-1">اسم اللاعب</label>
              <input
                id="joinPlayerName"
                type="text"
                placeholder="أدخل اسمك"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isLoggedIn}
                className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${isLoggedIn ? 'opacity-75' : ''}`}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="gameCode" className="block text-sm font-medium text-gray-400 mb-1">رمز اللعبة</label>
              <input
                id="gameCode"
                type="text"
                placeholder="أدخل رمز اللعبة"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
            </div>
            
            <button
              onClick={handleJoinGame}
              disabled={isLoading || isAuthLoading || !gameCode.trim()}
              className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isLoading || isAuthLoading || !gameCode.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md hover:shadow-purple-500/20'
              }`}
            >
              {isLoading || isAuthLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isAuthLoading ? 'جاري تسجيل الدخول...' : 'جاري الانضمام...'}
                </div>
              ) : 'انضمام للعبة'}
            </button>
            
            {error && activePath === 'join' && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm animate-in fade-in slide-in-from-bottom duration-500">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                {error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 