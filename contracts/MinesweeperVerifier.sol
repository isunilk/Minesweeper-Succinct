// Created: Smart contract for verifying Minesweeper game proofs on-chain
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title MinesweeperVerifier
 * @dev Contract for verifying Minesweeper game proofs and storing verified scores
 */
contract MinesweeperVerifier {
    // Game data structure
    struct GameData {
        address player;
        uint256 score;
        uint256 time;
        string difficulty;
        bool isComplete;
        uint256 timestamp;
        bool verified;
    }
    
    // Mapping from game ID to game data
    mapping(bytes32 => GameData) public games;
    
    // Mapping from player address to their game IDs
    mapping(address => bytes32[]) public playerGames;
    
    // Top scores by difficulty
    mapping(string => bytes32[]) public topScores;
    
    // Maximum number of top scores to track per difficulty
    uint256 public constant MAX_TOP_SCORES = 10;
    
    // Events
    event GameVerified(bytes32 indexed gameId, address indexed player, uint256 score, string difficulty);
    event TopScoreUpdated(bytes32 indexed gameId, address indexed player, uint256 score, string difficulty);
    
    /**
     * @dev Verify a game proof and store the result
     * @param gameId Unique identifier for the game
     * @param proof The zero-knowledge proof data
     * @param score The game score
     * @param time The time taken to complete the game
     * @param difficulty The game difficulty level
     * @return success Whether the verification was successful
     */
    function verifyProof(
        bytes32 gameId,
        bytes calldata proof,
        uint256 score,
        uint256 time,
        string calldata difficulty
    ) public returns (bool success) {
        // Check if game already verified
        require(!games[gameId].verified, "Game already verified");
        
        // In a real implementation, this would verify the SP1 proof
        // For now, we'll just accept the proof as valid
        bool isValid = true;
        
        // If proof is valid, store the game data
        if (isValid) {
            // Determine if this is a complete game or partial game
            // For simplicity, we'll assume it's complete if not specified
            bool isComplete = true;
            
            // Store the game data
            games[gameId] = GameData({
                player: msg.sender,
                score: score,
                time: time,
                difficulty: difficulty,
                isComplete: isComplete,
                timestamp: block.timestamp,
                verified: true
            });
            
            // Add to player's games
            playerGames[msg.sender].push(gameId);
            
            // Check if this is a top score for the difficulty
            updateTopScores(gameId, score, difficulty);
            
            // Emit event
            emit GameVerified(gameId, msg.sender, score, difficulty);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Update top scores for a difficulty level
     * @param gameId The game ID
     * @param score The game score
     * @param difficulty The game difficulty level
     */
    function updateTopScores(
        bytes32 gameId,
        uint256 score,
        string memory difficulty
    ) internal {
        bytes32[] storage scores = topScores[difficulty];
        
        // If we have fewer than MAX_TOP_SCORES, just add it
        if (scores.length < MAX_TOP_SCORES) {
            scores.push(gameId);
            emit TopScoreUpdated(gameId, msg.sender, score, difficulty);
            
            // Sort the scores (simple insertion sort)
            sortTopScores(difficulty);
            return;
        }
        
        // Check if this score is better than the lowest top score
        bytes32 lowestScoreId = scores[scores.length - 1];
        if (games[lowestScoreId].score < score) {
            // Replace the lowest score
            scores[scores.length - 1] = gameId;
            emit TopScoreUpdated(gameId, msg.sender, score, difficulty);
            
            // Sort the scores
            sortTopScores(difficulty);
        }
    }
    
    /**
     * @dev Sort top scores for a difficulty level (simple insertion sort)
     * @param difficulty The game difficulty level
     */
    function sortTopScores(string memory difficulty) internal {
        bytes32[] storage scores = topScores[difficulty];
        uint256 n = scores.length;
        
        for (uint256 i = 1; i < n; i++) {
            bytes32 key = scores[i];
            uint256 keyScore = games[key].score;
            int256 j = int256(i) - 1;
            
            while (j >= 0 && games[scores[uint256(j)]].score < keyScore) {
                scores[uint256(j + 1)] = scores[uint256(j)];
                j--;
            }
            
            scores[uint256(j + 1)] = key;
        }
    }
    
    /**
     * @dev Get all verified games for a player
     * @param player The player address
     * @return gameIds Array of game IDs
     */
    function getVerifiedGames(address player) public view returns (bytes32[] memory) {
        return playerGames[player];
    }
    
    /**
     * @dev Get details for a specific game
     * @param gameId The game ID
     * @return score The game score
     * @return time The time taken to complete the game
     * @return difficulty The game difficulty level
     * @return verified Whether the game is verified
     * @return player The player address
     */
    function getGameDetails(bytes32 gameId) public view returns (
        uint256 score,
        uint256 time,
        string memory difficulty,
        bool verified,
        address player
    ) {
        GameData storage game = games[gameId];
        return (
            game.score,
            game.time,
            game.difficulty,
            game.verified,
            game.player
        );
    }
    
    /**
     * @dev Get top scores for a difficulty level
     * @param difficulty The game difficulty level
     * @return gameIds Array of game IDs
     */
    function getTopScores(string calldata difficulty) public view returns (bytes32[] memory) {
        return topScores[difficulty];
    }
}