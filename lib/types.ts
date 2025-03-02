// Updated: Added types for partial game verification
export type GameStatus = "waiting" | "playing" | "won" | "lost";

export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export interface Board {
  cells: Cell[][];
  rows: number;
  cols: number;
  mines: number;
}

export interface GameState {
  board: Board;
  status: GameStatus;
  flagsPlaced: number;
  time: number;
}

export interface RevealResult {
  updatedBoard: Cell[][];
  hitMine: boolean;
}

export interface FlagResult {
  updatedBoard: Cell[][];
  flagCount: number;
}

export interface ProofData {
  board: string; // Encoded board state
  moves: string[]; // List of moves made
  time: number; // Time taken to complete
  difficulty: string; // Game difficulty
  success: boolean; // Whether the game was won
  revealedCells: number; // Number of cells revealed
  totalNonMineCells: number; // Total number of non-mine cells
}

export interface PartialGameScore {
  score: number;
  percentComplete: number;
  cellsRevealed: number;
  totalSafeCells: number;
}