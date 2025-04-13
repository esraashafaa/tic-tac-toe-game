'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GameBoard from '@/components/game/GameBoard';
import GameStatus from '@/components/game/GameStatus';
import GameResultModal from '@/components/game/GameResultModal';
import { useGameLogic } from '@/hooks/useGameLogic';

export default function OfflineGame() {
  const router = useRouter();
  const { gameState, makeMove, resetGame } = useGameLogic();
  const [showModal, setShowModal] = useState(false);

  // Show modal when game ends
  useEffect(() => {
    if (gameState.winner || gameState.isDraw) {
      // Short delay to show the result modal
      const timeout = setTimeout(() => {
        setShowModal(true);
      }, 800);
      
      return () => clearTimeout(timeout);
    }
  }, [gameState.winner, gameState.isDraw]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/games/choose" 
            className="text-gray-400 hover:text-white flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
          
          <h1 className="text-xl font-bold text-center">Offline Game</h1>
          
          <button 
            onClick={resetGame}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Reset Game"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
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
          onCellClick={makeMove}
          winningCells={gameState.winningCells}
          disabled={!!gameState.winner || gameState.isDraw}
        />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Playing locally: {gameState.currentPlayer === 'X' ? 'Player X' : 'Player O'}'s turn</p>
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
        onHome={() => router.push('/games/choose')}
      />
    </div>
  );
} 