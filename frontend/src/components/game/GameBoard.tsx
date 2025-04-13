import React from 'react';

interface GameBoardProps {
  board: Array<string>;
  onCellClick: (index: number) => void;
  winningCells?: Array<number>;
  disabled?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  onCellClick, 
  winningCells = [], 
  disabled = false 
}) => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md mx-auto">
      {board.map((cell, index) => (
        <div
          key={index}
          onClick={() => !disabled && cell === '' && onCellClick(index)}
          className={`
            aspect-square flex items-center justify-center text-5xl font-bold rounded-lg transition-all duration-300
            ${cell === '' && !disabled ? 'cursor-pointer hover:bg-gray-700/80 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20' : 'cursor-default'}
            ${winningCells.includes(index) ? 'animate-pulse shadow-md shadow-gray-400/30' : ''}
            ${cell === '' ? 'bg-gray-800/50' : cell === 'X' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}
            ${winningCells.includes(index) && cell === 'X' ? 'bg-blue-500/40 shadow-blue-500/30' : ''}
            ${winningCells.includes(index) && cell === 'O' ? 'bg-purple-500/40 shadow-purple-500/30' : ''}
          `}
        >
          {cell === 'X' && (
            <span className="transform transition-transform duration-300 animate-in scale-in-center">X</span>
          )}
          {cell === 'O' && (
            <span className="transform transition-transform duration-300 animate-in scale-in-center">O</span>
          )}
          {cell === '' && !disabled && (
            <span className="opacity-0 group-hover:opacity-30 text-2xl transition-opacity">
              {index % 2 === 0 ? 'X' : 'O'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default GameBoard; 