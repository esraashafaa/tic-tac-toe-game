import { useState, useCallback, useEffect } from 'react';

interface GameState {
  board: string[];
  currentPlayer: string;
  winner: string | null;
  winningCells: number[];
  isDraw: boolean;
  moveCount: number;
  gameActive: boolean;
  scores: {
    X: number;
    O: number;
    draw: number;
  };
}

export const useGameLogic = () => {
  const initialState: GameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X', // X starts the game
    winner: null,
    winningCells: [],
    isDraw: false,
    moveCount: 0,
    gameActive: true,
    scores: {
      X: 0,
      O: 0,
      draw: 0
    }
  };

  const [gameState, setGameState] = useState<GameState>(initialState);

  // Check for a winner
  const checkWinner = useCallback((board: string[]) => {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]            // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winningCells: pattern };
      }
    }

    return { winner: null, winningCells: [] };
  }, []);

  // Make a move
  const makeMove = useCallback((index: number) => {
    if (!gameState.gameActive || gameState.board[index] !== '' || gameState.winner) {
      return;
    }

    setGameState(prevState => {
      // Create a new board with the move
      const newBoard = [...prevState.board];
      newBoard[index] = prevState.currentPlayer;
      
      // Check if we have a winner after this move
      const { winner, winningCells } = checkWinner(newBoard);
      
      // Calculate new move count
      const newMoveCount = prevState.moveCount + 1;
      
      // Check for draw (all cells filled and no winner)
      const isDraw = newMoveCount === 9 && !winner;
      
      // Update the scores if the game ended
      const newScores = { ...prevState.scores };
      if (winner) {
        newScores[winner as keyof typeof newScores] += 1;
      } else if (isDraw) {
        newScores.draw += 1;
      }

      // Return the new state
      return {
        ...prevState,
        board: newBoard,
        currentPlayer: prevState.currentPlayer === 'X' ? 'O' : 'X',
        winner,
        winningCells,
        isDraw,
        moveCount: newMoveCount,
        gameActive: !(winner || isDraw),
        scores: newScores
      };
    });
  }, [gameState, checkWinner]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(prevState => ({
      ...initialState,
      scores: prevState.scores // Keep the scores
    }));
  }, []);

  // Reset everything including scores
  const resetEverything = useCallback(() => {
    setGameState(initialState);
  }, []);

  return {
    gameState,
    makeMove,
    resetGame,
    resetEverything
  };
}; 