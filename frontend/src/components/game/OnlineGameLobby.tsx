import React, { useState } from 'react';

interface OnlineGameLobbyProps {
  onCreateGame: () => void;
  onJoinGame: (code: string) => void;
  isLoading: boolean;
  error: string | null;
  gameCode: string | null;
}

const OnlineGameLobby: React.FC<OnlineGameLobbyProps> = ({
  onCreateGame,
  onJoinGame,
  isLoading,
  error,
  gameCode
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Create a Game</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Create a new game and invite a friend to join with your game code
        </p>
        
        <button
          onClick={onCreateGame}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${isLoading ? 'bg-blue-700/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Creating Game...' : 'Create New Game'}
        </button>
        
        {gameCode && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Game Code:</p>
            <div className="flex items-center">
              <div className="bg-gray-900 py-2 px-4 rounded-lg flex-1 font-mono text-xl text-center">
                {gameCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="ml-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                aria-label="Copy code"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Share this code with a friend to let them join your game
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Join a Game</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter a game code to join a friend's game
        </p>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter game code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => onJoinGame(joinCode)}
          disabled={isLoading || !joinCode.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${isLoading || !joinCode.trim() ? 'bg-purple-700/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isLoading ? 'Joining Game...' : 'Join Game'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineGameLobby; 