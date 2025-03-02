// Updated: Enhanced Minesweeper game logic with WASM integration placeholder
import { Cell, RevealResult, FlagResult } from "./types";
import { loadWasmModule, WasmInterface } from "./sp1";

// This variable would hold the WASM module once loaded
let wasmModule: WasmInterface | null = null;

// Initialize WASM module
export async function initWasm(): Promise<boolean> {
  try {
    wasmModule = await loadWasmModule();
    return wasmModule !== null;
  } catch (error) {
    console.error("Failed to load WASM module:", error);
    return false;
  }
}

// Generate a new game board
export function generateBoard(rows: number, cols: number, mineCount: number): Cell[][] {
  // If WASM module is available, use it for better performance and security
  if (wasmModule) {
    // This would call the WASM implementation
    const boardData = wasmModule.generateBoard(rows, cols, mineCount);
    return deserializeBoard(boardData, rows, cols);
  }
  
  // Fallback to JavaScript implementation
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
  // If WASM module is available, use it
  if (wasmModule) {
    const serializedBoard = serializeBoard(board);
    const result = wasmModule.revealCell(serializedBoard, row, col);
    return {
      updatedBoard: deserializeBoard(result.board, board.length, board[0].length),
      hitMine: result.hitMine
    };
  }
  
  // Fallback to JavaScript implementation
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
  // If WASM module is available, use it
  if (wasmModule) {
    const serializedBoard = serializeBoard(board);
    const result = wasmModule.flagCell(serializedBoard, row, col);
    return {
      updatedBoard: deserializeBoard(result.board, board.length, board[0].length),
      flagCount: result.flagCount
    };
  }
  
  // Fallback to JavaScript implementation
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
  // If WASM module is available, use it
  if (wasmModule) {
    const serializedBoard = serializeBoard(board);
    return wasmModule.checkWin(serializedBoard, mineCount);
  }
  
  // Fallback to JavaScript implementation
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

// Helper function to serialize board for WASM
function serializeBoard(board: Cell[][]): Uint8Array {
  // This is a simplified example - in a real implementation,
  // we would need to properly serialize the board data for WASM
  
  const rows = board.length;
  const cols = board[0].length;
  
  // 4 bytes per cell (isMine, isRevealed, isFlagged, neighborMines)
  const buffer = new Uint8Array(rows * cols * 4);
  
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = board[row][col];
      buffer[index++] = cell.isMine ? 1 : 0;
      buffer[index++] = cell.isRevealed ? 1 : 0;
      buffer[index++] = cell.isFlagged ? 1 : 0;
      buffer[index++] = cell.neighborMines;
    }
  }
  
  return buffer;
}

// Helper function to deserialize board from WASM
function deserializeBoard(buffer: Uint8Array, rows: number, cols: number): Cell[][] {
  // This is a simplified example - in a real implementation,
  // we would need to properly deserialize the board data from WASM
  
  const board: Cell[][] = [];
  
  let index = 0;
  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      board[row][col] = {
        isMine: buffer[index++] === 1,
        isRevealed: buffer[index++] === 1,
        isFlagged: buffer[index++] === 1,
        neighborMines: buffer[index++]
      };
    }
  }
  
  return board;
}

// Initialize WASM when the module is imported
initWasm().then(success => {
  if (success) {
    console.log("WASM module loaded successfully");
  } else {
    console.log("Using JavaScript fallback for game logic");
  }
});