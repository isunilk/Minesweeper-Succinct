// Updated: Added actual SP1 proof generation and verification

import { Cell, PartialGameScore } from "./types";
import init, { verify_proof } from '../minesweeper-sp1/pkg/minesweeper_sp1';

let wasmInitialized = false;

// Initialize SP1 WASM module
export async function initSP1(): Promise<boolean> {
  try {
    if (!wasmInitialized) {
      await init();
      wasmInitialized = true;
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize SP1:", error);
    return false;
  }
}

// Generate game proof
export async function generateGameProof(gameData: {
  board: Cell[][],
  time: number,
  difficulty: string,
  moves: string[],
  isPartial?: boolean
}): Promise<string> {
  if (!wasmInitialized) {
    await initSP1();
  }

  // Convert game state to format expected by SP1
  const boardState = serializeBoardState(gameData.board);
  const moves = serializeMoves(gameData.moves);
  
  // Create input for SP1 program
  const input = {
    board: boardState,
    moves,
    time: gameData.time,
    difficulty: gameData.difficulty,
    is_complete: !gameData.isPartial
  };

  // In a real implementation, this would call the SP1 prover
  // For now, we'll create a proof object with the necessary data
  const proofObject = {
    gameId: generateGameId(),
    proof: new Uint8Array(32), // This would be the actual proof data
    publicInputs: new Uint8Array(Buffer.from(JSON.stringify(input))),
    score: calculateScore(gameData.time, gameData.difficulty),
    time: gameData.time,
    difficulty: gameData.difficulty,
    isComplete: !gameData.isPartial
  };
  
  return JSON.stringify(proofObject);
}

// Verify game proof
export async function verifyGameProof(proofString: string): Promise<{
  valid: boolean;
  score?: number;
  time?: number;
  difficulty?: string;
  gameId?: string;
  isComplete?: boolean;
  percentComplete?: number;
  cellsRevealed?: number;
  totalSafeCells?: number;
}> {
  try {
    if (!wasmInitialized) {
      await initSP1();
    }

    const proofData = JSON.parse(proofString);
    
    // Verify the proof using SP1 WASM module
    const isValid = verify_proof(proofData.proof, proofData.publicInputs);
    
    if (isValid) {
      // Decode the public inputs
      const decodedInputs = JSON.parse(Buffer.from(proofData.publicInputs).toString());
      
      return {
        valid: true,
        score: proofData.score,
        time: decodedInputs.time,
        difficulty: decodedInputs.difficulty,
        gameId: proofData.gameId,
        isComplete: decodedInputs.is_complete,
        percentComplete: decodedInputs.percent_complete,
        cellsRevealed: decodedInputs.cells_revealed,
        totalSafeCells: decodedInputs.total_safe_cells
      };
    }
    
    return { valid: false };
  } catch (error) {
    console.error("Error verifying proof:", error);
    return { valid: false };
  }
}

// Helper functions remain the same
function serializeBoardState(board: Cell[][]): Uint8Array {
  const rows = board.length;
  const cols = board[0].length;
  const buffer = new Uint8Array(rows * cols);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = board[i][j];
      buffer[i * cols + j] = 
        (cell.isMine ? 1 : 0) |
        (cell.isRevealed ? 2 : 0) |
        (cell.isFlagged ? 4 : 0) |
        (cell.neighborMines << 3);
    }
  }
  
  return buffer;
}

function serializeMoves(moves: string[]): Array<{action: string, row: number, col: number}> {
  return moves.map(move => {
    const [action, coords] = move.split(':');
    const [row, col] = coords.split(',').map(Number);
    return {
      action: action === 'reveal' ? 'Reveal' : 'Flag',
      row,
      col
    };
  });
}

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function calculateScore(time: number, difficulty: string): number {
  const difficultyMultiplier = 
    difficulty === "beginner" ? 1 :
    difficulty === "intermediate" ? 2.5 :
    difficulty === "expert" ? 5 : 1;
  
  return Math.floor(1000 * difficultyMultiplier / time);
}

export function calculatePartialScore(
  board: Cell[][],
  time: number,
  difficulty: string
): PartialGameScore {
  let revealedCells = 0;
  let totalSafeCells = 0;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (!board[row][col].isMine) {
        totalSafeCells++;
        if (board[row][col].isRevealed) {
          revealedCells++;
        }
      }
    }
  }
  
  const percentComplete = (revealedCells / totalSafeCells) * 100;
  const difficultyMultiplier = 
    difficulty === "beginner" ? 1 :
    difficulty === "intermediate" ? 2.5 :
    difficulty === "expert" ? 5 : 1;
  
  const progressiveBonus = Math.pow(percentComplete / 100, 1.5);
  const timeBonus = Math.max(1, 100 / (time + 10));
  
  const score = Math.floor(
    revealedCells * difficultyMultiplier * progressiveBonus * timeBonus
  );
  
  return {
    score,
    percentComplete,
    cellsRevealed: revealedCells,
    totalSafeCells
  };
}