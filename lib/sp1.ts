// Updated: Commented out WASM imports and added simulation mode

import { Cell, PartialGameScore } from "./types";

// Comment out WASM imports until SP1 integration is complete
// import init, { verify_proof } from '../minesweeper-sp1/pkg/minesweeper_sp1';

// Interface for the SP1 WASM verifier
interface SP1Verifier {
  verify_proof: (proof: Uint8Array, public_inputs: Uint8Array, vk_hash: string) => boolean;
  decode_public_inputs: (public_inputs: Uint8Array) => {
    score: number;
    time: number;
    cellsRevealed: number;
    totalSafeCells: number;
  };
}

// Global reference to the SP1 verifier once loaded
let sp1Verifier: SP1Verifier | null = null;

// Initialize the SP1 verifier
export async function initSP1(): Promise<boolean> {
  try {
    // Comment out WASM initialization until SP1 integration is complete
    /*
    if (!wasmInitialized) {
      await init();
      wasmInitialized = true;
    }
    */
    
    // For now, we'll use a simulated verifier
    if (!sp1Verifier) {
      sp1Verifier = {
        verify_proof: (proof: Uint8Array, public_inputs: Uint8Array, vk_hash: string) => {
          // Simulate verification
          return true;
        },
        decode_public_inputs: (public_inputs: Uint8Array) => {
          const view = new DataView(public_inputs.buffer);
          return {
            score: view.getUint32(0, true),
            time: view.getUint32(4, true),
            cellsRevealed: view.getUint32(8, true),
            totalSafeCells: view.getUint32(12, true)
          };
        }
      };
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize SP1 verifier:", error);
    return false;
  }
}

// Calculate partial game score
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

// Generate game proof
export async function generateGameProof(gameData: {
  board: Cell[][],
  time: number,
  difficulty: string,
  moves: string[],
  isPartial?: boolean
}): Promise<string> {
  // This would be replaced with actual SP1 proof generation
  // Currently using a simulation for demonstration
  setProofStatus("generating");
  
  try {
    const isComplete = !gameData.isPartial;
    let score: number;
    let percentComplete: number = 100;
    let cellsRevealed: number = 0;
    let totalSafeCells: number = 0;
    
    if (isComplete) {
      score = calculateScore(gameData.time, gameData.difficulty);
    } else {
      const partialScore = calculatePartialScore(
        gameData.board,
        gameData.time,
        gameData.difficulty
      );
      score = partialScore.score;
      percentComplete = partialScore.percentComplete;
      cellsRevealed = partialScore.cellsRevealed;
      totalSafeCells = partialScore.totalSafeCells;
    }
    
    // Create a proof object that matches what the real SP1 prover would generate
    const proofObject = {
      gameId: generateGameId(),
      proof: generateMockProof(),
      public_inputs: generatePublicInputs(score, gameData.time, cellsRevealed, totalSafeCells),
      vkey_hash: "0x1234567890abcdef", // This would be the real verification key hash
      score,
      time: gameData.time,
      difficulty: gameData.difficulty,
      isComplete,
      percentComplete,
      cellsRevealed,
      totalSafeCells
    };
    
    return JSON.stringify(proofObject);
  } catch (error) {
    console.error("Error generating proof:", error);
    throw error;
  }
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
    const proofData = JSON.parse(proofString);
    
    // Initialize SP1 if not already initialized
    if (!sp1Verifier) {
      const initialized = await initSP1();
      if (!initialized) {
        return { valid: false };
      }
    }
    
    // Convert hex strings to Uint8Arrays
    const proof = hexToBytes(proofData.proof);
    const publicInputs = hexToBytes(proofData.public_inputs);
    
    // Verify the proof
    const isValid = sp1Verifier!.verify_proof(
      proof,
      publicInputs,
      proofData.vkey_hash
    );
    
    if (isValid) {
      // Decode the public inputs
      const decodedInputs = sp1Verifier!.decode_public_inputs(publicInputs);
      
      return {
        valid: true,
        score: decodedInputs.score,
        time: decodedInputs.time,
        difficulty: proofData.difficulty,
        gameId: proofData.gameId,
        isComplete: proofData.isComplete,
        percentComplete: proofData.percentComplete,
        cellsRevealed: decodedInputs.cellsRevealed,
        totalSafeCells: decodedInputs.totalSafeCells
      };
    }
    
    return { valid: false };
  } catch (error) {
    console.error("Error verifying proof:", error);
    return { valid: false };
  }
}

// Helper functions

function calculateScore(time: number, difficulty: string): number {
  const difficultyMultiplier = 
    difficulty === "beginner" ? 1 :
    difficulty === "intermediate" ? 2.5 :
    difficulty === "expert" ? 5 : 1;
  
  return Math.floor(1000 * difficultyMultiplier / time);
}

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateMockProof(): string {
  // Generate a mock proof that looks like a real SP1 proof
  return Array(128).fill(0)
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('');
}

function generatePublicInputs(
  score: number,
  time: number,
  cellsRevealed: number,
  totalSafeCells: number
): string {
  const buffer = new ArrayBuffer(16); // 4 u32 values
  const view = new DataView(buffer);
  
  view.setUint32(0, score, true);
  view.setUint32(4, time, true);
  view.setUint32(8, cellsRevealed, true);
  view.setUint32(12, totalSafeCells, true);
  
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function setProofStatus(status: string) {
  // This would be replaced with actual status management
  console.log("Proof status:", status);
}