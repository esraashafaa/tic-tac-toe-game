import React from 'react';

interface GameStatusProps {
  currentPlayer: string;
  winner: string | null;
  isDraw: boolean;
  moveCount: number;
  scores: {
    X: number;
    O: number;
    draw: number;
  };
}

const GameStatus: React.FC<GameStatusProps> = ({
  currentPlayer,
  winner,
  isDraw,
  moveCount,
  scores
}) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Game Status Indicator */}
      <div className="flex justify-center mb-4">
        {winner ? (
          <div className={`px-4 py-2 rounded-full ${winner === 'X' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'} font-bold text-sm`}>
            {winner === 'X' ? 'Player X Wins!' : 'Player O Wins!'}
          </div>
        ) : isDraw ? (
          <div className="px-4 py-2 rounded-full bg-gray-500/30 text-gray-300 font-bold text-sm">
            Game Ended in a Draw
          </div>
        ) : (
          <div className={`px-4 py-2 rounded-full ${currentPlayer === 'X' ? 'bg-blue-500/30 text-blue-300' : 'bg-purple-500/30 text-purple-300'} font-bold text-sm`}>
            {currentPlayer === 'X' ? 'Player X\'s Turn' : 'Player O\'s Turn'}
          </div>
        )}
      </div>

      {/* Game Statistics */}
      <div className="flex justify-between items-center">
        <div className="bg-gray-800/50 px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">X</span>
            <span className="text-xl font-bold text-blue-400">{scores.X}</span>
          </div>
          <div className="w-px h-10 bg-gray-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">O</span>
            <span className="text-xl font-bold text-purple-400">{scores.O}</span>
          </div>
          <div className="w-px h-10 bg-gray-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Draw</span>
            <span className="text-xl font-bold text-gray-400">{scores.draw}</span>
          </div>
        </div>

        <div className="bg-gray-800/50 px-4 py-3 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400">Moves</span>
            <span className="text-xl font-bold">{moveCount}/9</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatus; 