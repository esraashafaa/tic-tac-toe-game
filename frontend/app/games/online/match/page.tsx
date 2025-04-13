'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameResultModal from '@/components/game/GameResultModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import gameService from '@/services/gameService';

export default function OnlineMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameCode = searchParams.get('code');
  const { gameState, makeMove, resetGame } = useGameLogic();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<string>('X'); // افتراضي
  
  // جلب بيانات المباراة عند تحميل الصفحة
  useEffect(() => {
    if (!gameCode) {
      setError('لم يتم توفير رمز اللعبة');
      setIsLoading(false);
      return;
    }
    
    async function loadMatch() {
      try {
        // جلب بيانات المباراة بواسطة الرمز
        const match = await gameService.getMatchByCode(gameCode);
        setMatchData(match);
        
        // تحديد رمز اللاعب (X or O)
        // في حالة حقيقية، قد تحتاج إلى مقارنة معرف المستخدم الحالي مع اللاعبين
        // هنا نفترض أننا اللاعب الأول (X) إذا كنا قمنا بإنشاء اللعبة
        setPlayerSymbol(match.player1_symbol); // مثال بسيط
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error loading match:', err);
        setError(err.message || 'حدث خطأ أثناء تحميل المباراة');
        setIsLoading(false);
      }
    }
    
    loadMatch();
  }, [gameCode]);
  
  // إجراء حركة في اللعبة
  const handleMove = async (index: number) => {
    if (!matchData || !gameState.gameActive) return;
    
    // تحديث الحالة المحلية
    makeMove(index);
    
    try {
      // إرسال الحركة إلى الخادم
      await gameService.makeMove(matchData.id, {
        position: index,
        symbol: playerSymbol,
        board_state: [...gameState.board]
      });
    } catch (err: any) {
      console.error('Error making move:', err);
      setError(err.message || 'حدث خطأ أثناء إرسال الحركة');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-red-300">حدث خطأ</h2>
          <p className="text-white mb-6">{error}</p>
          <Link href="/games/online" className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg inline-block">
            العودة إلى صفحة اللعب عبر الإنترنت
          </Link>
        </div>
      </div>
    );
  }
  
  if (!matchData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">المباراة غير متوفرة</h2>
          <p className="text-gray-400 mb-6">لم يتم العثور على المباراة المطلوبة أو انتهت صلاحيتها.</p>
          <Link href="/games/online" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg inline-block">
            العودة إلى صفحة اللعب عبر الإنترنت
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/games/online" 
            className="text-gray-400 hover:text-white flex items-center transition-colors hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            رجوع
          </Link>
          
          <div className="px-3 py-1 bg-gray-700 rounded-full text-sm animate-pulse">
            رمز اللعبة: <span className="font-mono font-bold">{gameCode}</span>
          </div>

          <Link
            href="/" 
            className="text-gray-400 hover:text-red-400 flex items-center transition-colors hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 00-1 1v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 12.586V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            خروج
          </Link>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-lg mb-4 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 transition-all duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-3 text-blue-300 font-bold shadow-inner">
                {matchData.player1_name?.[0]?.toUpperCase() || 'X'}
              </div>
              <div>
                <div className="font-medium">{matchData.player1_name || 'اللاعب 1'}</div>
                <div className="text-xs text-gray-400">
                  {playerSymbol === 'X' ? 'أنت (X)' : 'الخصم (X)'}
                </div>
              </div>
            </div>
            
            <div className="text-sm">
              <span className="px-3 py-1 rounded-full bg-gray-700/80 animate-pulse shadow-md">VS</span>
            </div>
            
            <div className="flex items-center">
              <div>
                <div className="font-medium text-left">{matchData.player2_name || 'في انتظار اللاعب...'}</div>
                <div className="text-xs text-gray-400 text-left">
                  {playerSymbol === 'O' ? 'أنت (O)' : 'الخصم (O)'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center ml-3 text-purple-300 font-bold shadow-inner">
                {matchData.player2_name?.[0]?.toUpperCase() || 'O'}
              </div>
            </div>
          </div>
        </div>

        <GameStatus
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
          isDraw={gameState.isDraw}
          moveCount={gameState.moveCount}
          scores={gameState.scores}
        />
        
        <GameBoard
          board={gameState.board}
          onCellClick={handleMove}
          winningCells={gameState.winningCells}
          disabled={gameState.currentPlayer !== playerSymbol || !!gameState.winner || gameState.isDraw}
        />
        
        <div className="mt-8 text-center text-sm">
          {gameState.gameActive ? (
            gameState.currentPlayer === playerSymbol ? 
            <p className="bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg shadow-md animate-pulse">دورك للعب</p> : 
            <p className="bg-yellow-500/20 border border-yellow-500/30 px-3 py-2 rounded-lg shadow-md animate-pulse">انتظر دور الخصم</p>
          ) : (
            <p className="bg-gray-500/20 border border-gray-500/30 px-3 py-2 rounded-lg shadow-md">انتهت المباراة</p>
          )}
        </div>
      </div>
      
      <GameResultModal
        isOpen={showModal}
        winner={gameState.winner}
        isDraw={gameState.isDraw}
        onPlayAgain={() => {
          resetGame();
          setShowModal(false);
        }}
        onHome={() => router.push('/games/online')}
      />
    </div>
  );
} 