import React from 'react';

interface GameResultModalProps {
  isOpen: boolean;
  winner: string | null;
  isDraw: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  winner,
  isDraw,
  onPlayAgain,
  onHome
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="mb-4">
            {winner ? (
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${winner === 'X' ? 'bg-blue-500/30 text-blue-300 animate-pulse shadow-lg shadow-blue-500/20' : 'bg-purple-500/30 text-purple-300 animate-pulse shadow-lg shadow-purple-500/20'}`}>
                {winner}
              </div>
            ) : (
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold mb-4 bg-gray-500/30 text-gray-300 shadow-lg shadow-gray-500/10 animate-pulse">
                =
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2 animate-in slide-in-from-top duration-500">
            {winner 
              ? `اللاعب ${winner} فاز!` 
              : 'تعادل!'}
          </h2>
          
          <p className="text-gray-400 mb-6 animate-in slide-in-from-bottom duration-500">
            {winner 
              ? 'تهانينا للفائز!' 
              : 'انتهت اللعبة بالتعادل. حاول مرة أخرى!'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300"
          >
            لعب مجدداً
          </button>
          
          <button 
            onClick={onHome}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal; 