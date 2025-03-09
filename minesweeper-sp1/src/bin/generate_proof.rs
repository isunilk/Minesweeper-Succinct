use minesweeper_sp1::GameState;
use sp1_zkvm::SP1ProofWithPublicValues;
use std::path::PathBuf;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <input_json> <output_proof>", args[0]);
        std::process::exit(1);
    }
    
    let input_path = PathBuf::from(&args[1]);
    let output_path = PathBuf::from(&args[2]);
    
    // Read input JSON
    let input_json = std::fs::read_to_string(input_path)
        .expect("Failed to read input file");
    
    let game_state: GameState = serde_json::from_str(&input_json)
        .expect("Failed to parse game state");
    
    // Generate proof
    let client = sp1_zkvm::ProverClient::from_env();
    let (pk, vk) = client.setup(include_bytes!("../../program.elf"));
    
    let mut stdin = sp1_zkvm::SP1Stdin::new();
    stdin.write(&game_state);
    
    let proof = client.prove(&pk, &stdin)
        .groth16()
        .run()
        .expect("Failed to generate proof");
    
    // Save proof
    proof.save(&output_path).expect("Failed to save proof");
}