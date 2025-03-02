// Created: Core Minesweeper game logic
import { Cell, RevealResult, FlagResult } from "./types";

// Generate a new game board
export function generateBoard(rows: number, cols: number, mineCount: number): Cell[][] {
  // Create empty board
  const board: Cell[][] = Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0
    }))
  );
  
  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }
  
  // Calculate neighbor mines
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col].isMine) continue;
      
      let count = 0;
      // Check all 8 surrounding cells
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r === row && c === col) continue;
          if (board[r][c].isMine) count++;
        }
      }
      
      board[row][col].neighborMines = count;
    }
  }
  
  return board;
}

// Reveal a cell and handle cascading reveals for empty cells
export function revealCell(board: Cell[][], row: number, col: number): RevealResult {
  const updatedBoard = JSON.parse(JSON.stringify(board));
  
  // If cell is flagged or already revealed, do nothing
  if (updatedBoard[row][col].isFlagged || updatedBoard[row][col].isRevealed) {
    return { updatedBoard, hitMine: false };
  }
  
  // Reveal the cell
  updatedBoard[row][col].isRevealed = true;
  
  // Check if it's a mine
  if (updatedBoard[row][col].isMine) {
    // Reveal all mines when a mine is hit
    for (let r = 0; r < updatedBoard.length; r++) {
      for (let c = 0; c < updatedBoard[0].length; c++) {
        if (updatedBoard[r][c].isMine) {
          updatedBoard[r][c].isRevealed = true;
        }
      }
    }
    return { updatedBoard, hitMine: true };
  }
  
  // If it's an empty cell (no neighboring mines), reveal neighbors recursively
  if (updatedBoard[row][col].neighborMines === 0) {
    const rows = updatedBoard.length;
    const cols = updatedBoard[0].length;
    
    // Check all 8 surrounding cells
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        if (r === row && c === col) continue;
        if (!updatedBoard[r][c].isRevealed && !updatedBoard[r][c].isFlagged) {
          const result = revealCell(updatedBoard, r, c);
          if (result.hitMine) {
            return result;
          }
        }
      }
    }
  }
  
  return { updatedBoard, hitMine: false };
}

// Flag or unflag a cell
export function flagCell(board: Cell[][], row: number, col: number): FlagResult {
  const updatedBoard = JSON.parse(JSON.stringify(board));
  let flagCount = 0;
  
  // If cell is already revealed, do nothing
  if (updatedBoard[row][col].isRevealed) {
    // Count flags
    for (let r = 0; r < updatedBoard.length; r++) {
      for (let c = 0; c < updatedBoard[0].length; c++) {
        if (updatedBoard[r][c].isFlagged) flagCount++;
      }
    }
    return { updatedBoard, flagCount };
  }
  
  // Toggle flag
  updatedBoard[row][col].isFlagged = !updatedBoard[row][col].isFlagged;
  
  // Count flags
  for (let r = 0; r < updatedBoard.length; r++) {
    for (let c = 0; c < updatedBoard[0].length; c++) {
      if (updatedBoard[r][c].isFlagged) flagCount++;
    }
  }
  
  return { updatedBoard, flagCount };
}

// Check if the player has won
export function checkWin(board: Cell[][], mineCount: number): boolean {
  let revealedCount = 0;
  let totalCells = board.length * board[0].length;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].isRevealed) revealedCount++;
    }
  }
  
  // Player wins if all non-mine cells are revealed
  return revealedCount === totalCells - mineCount;
}

// This would be replaced with actual WASM/SP1 integration
export function generateProof(board: Cell[][], time: number, difficulty: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate proof generation
      const proofData = {
        board: JSON.stringify(board),
        time,
        difficulty,
        timestamp: Date.now()
      };
      
      resolve(btoa(JSON.stringify(proofData)));
    }, 1000);
  });
}

// This would be replaced with actual verification logic
export function verifyProof(proof: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const proofData = JSON.parse(atob(proof));
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    }, 500);
  });
}