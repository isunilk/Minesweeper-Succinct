// Updated: Fixed WASM module loading and initialization

import { Cell, RevealResult, FlagResult } from "./types";
import { initSP1 } from "./sp1";

// Initialize SP1 module
export async function initGame(): Promise<boolean> {
  try {
    const initialized = await initSP1();
    if (initialized) {
      console.log("SP1 module initialized successfully");
    } else {
      console.log("Using JavaScript fallback for game logic");
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize game:", error);
    return false;
  }
}

// Generate a new game board
export function generateBoard(rows: number, cols: number, mineCount: number): Cell[][] {
  console.time('generateBoard');
  
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
  
  console.timeEnd('generateBoard');
  return board;
}

// Reveal a cell and handle cascading reveals for empty cells
export function revealCell(board: Cell[][], row: number, col: number): RevealResult {
  console.time('revealCell');
  
  // Use a more efficient approach to avoid deep cloning the entire board
  const updatedBoard = board.map(row => [...row]);
  
  // If cell is flagged or already revealed, do nothing
  if (updatedBoard[row][col].isFlagged || updatedBoard[row][col].isRevealed) {
    console.timeEnd('revealCell');
    return { updatedBoard, hitMine: false };
  }
  
  // Reveal the cell
  updatedBoard[row][col] = { ...updatedBoard[row][col], isRevealed: true };
  
  // Check if it's a mine
  if (updatedBoard[row][col].isMine) {
    // Reveal all mines when a mine is hit
    for (let r = 0; r < updatedBoard.length; r++) {
      for (let c = 0; c < updatedBoard[0].length; c++) {
        if (updatedBoard[r][c].isMine) {
          updatedBoard[r][c] = { ...updatedBoard[r][c], isRevealed: true };
        }
      }
    }
    console.timeEnd('revealCell');
    return { updatedBoard, hitMine: true };
  }
  
  // If it's an empty cell (no neighboring mines), reveal neighbors recursively
  // Use an iterative approach instead of recursive to avoid stack overflow
  if (updatedBoard[row][col].neighborMines === 0) {
    const rows = updatedBoard.length;
    const cols = updatedBoard[0].length;
    
    // Use a queue for breadth-first search
    const queue: [number, number][] = [[row, col]];
    
    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      
      // Check all 8 surrounding cells
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          
          const nr = r + dr;
          const nc = c + dc;
          
          // Check if the cell is valid
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const cell = updatedBoard[nr][nc];
            
            // If the cell is not revealed and not flagged
            if (!cell.isRevealed && !cell.isFlagged) {
              // Reveal the cell
              updatedBoard[nr][nc] = { ...cell, isRevealed: true };
              
              // If it's an empty cell, add it to the queue
              if (cell.neighborMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }
  
  console.timeEnd('revealCell');
  return { updatedBoard, hitMine: false };
}

// Flag or unflag a cell
export function flagCell(board: Cell[][], row: number, col: number): FlagResult {
  // Use a more efficient approach to avoid deep cloning the entire board
  const updatedBoard = board.map(row => [...row]);
  
  // If cell is already revealed, do nothing
  if (updatedBoard[row][col].isRevealed) {
    // Count flags
    let flagCount = 0;
    for (let r = 0; r < updatedBoard.length; r++) {
      for (let c = 0; c < updatedBoard[0].length; c++) {
        if (updatedBoard[r][c].isFlagged) flagCount++;
      }
    }
    return { updatedBoard, flagCount };
  }
  
  // Toggle flag
  updatedBoard[row][col] = { 
    ...updatedBoard[row][col], 
    isFlagged: !updatedBoard[row][col].isFlagged 
  };
  
  // Count flags
  let flagCount = 0;
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

// Calculate progress percentage
export function calculateProgress(board: Cell[][], mineCount: number): number {
  let revealedCount = 0;
  let totalSafeCells = board.length * board[0].length - mineCount;
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col].isRevealed && !board[row][col].isMine) {
        revealedCount++;
      }
    }
  }
  
  return (revealedCount / totalSafeCells) * 100;
}

// Initialize game when the module is imported
initGame().catch(console.error);