#![no_main]
sp1_zkvm::entrypoint!(main);

use serde::{Deserialize, Serialize};
use sp1_zkvm::io;

#[derive(Serialize, Deserialize)]
struct GameState {
    board: Vec<Vec<u8>>,
    moves: Vec<Move>,
    time: u32,
    difficulty: String,
    is_complete: bool,
}

#[derive(Serialize, Deserialize)]
struct Move {
    action: MoveType,
    row: u8,
    col: u8,
}

#[derive(Serialize, Deserialize)]
enum MoveType {
    Reveal,
    Flag,
}

#[derive(Serialize, Deserialize)]
struct ProofOutput {
    score: u32,
    time: u32,
    cells_revealed: u32,
    total_safe_cells: u32,
    percent_complete: f32,
}

pub fn main() {
    // Read input game state
    let game_state: GameState = io::read();
    
    // Verify the game state
    let (cells_revealed, total_safe_cells) = count_revealed_cells(&game_state.board);
    let percent_complete = (cells_revealed as f32 / total_safe_cells as f32) * 100.0;
    
    // Calculate score based on time and difficulty
    let difficulty_multiplier = match game_state.difficulty.as_str() {
        "beginner" => 1.0,
        "intermediate" => 2.5,
        "expert" => 5.0,
        _ => 1.0,
    };
    
    let score = if game_state.is_complete {
        ((1000.0 * difficulty_multiplier) / game_state.time as f32) as u32
    } else {
        let progressive_bonus = f32::powf(percent_complete / 100.0, 1.5);
        let time_bonus = f32::max(1.0, 100.0 / (game_state.time as f32 + 10.0));
        (cells_revealed as f32 * difficulty_multiplier * progressive_bonus * time_bonus) as u32
    };
    
    // Create proof output
    let output = ProofOutput {
        score,
        time: game_state.time,
        cells_revealed,
        total_safe_cells,
        percent_complete,
    };
    
    // Write the output
    io::commit(&output);
}

fn count_revealed_cells(board: &Vec<Vec<u8>>) -> (u32, u32) {
    let mut revealed = 0;
    let mut total_safe = 0;
    
    for row in board {
        for &cell in row {
            // Cell format:
            // bit 0: isMine
            // bit 1: isRevealed
            // bit 2: isFlagged
            // bits 3-7: neighborMines
            if (cell & 1) == 0 { // Not a mine
                total_safe += 1;
                if (cell & 2) != 0 { // Is revealed
                    revealed += 1;
                }
            }
        }
    }
    
    (revealed, total_safe)
}