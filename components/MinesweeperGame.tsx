// Updated: Added NFT minting integration

"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bomb, Clock, Flag, Trophy, AlertTriangle, Award, Shield, DollarSign, Percent, Check, X, RefreshCw, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { generateBoard, revealCell, flagCell, checkWin, calculateProgress } from "@/lib/minesweeper";
import { GameCell } from "@/components/GameCell";
import { GameStatus } from "@/lib/types";
import { generateGameProof, verifyGameProof, calculatePartialScore } from "@/lib/sp1";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useErrorBoundary } from "@/hooks/useErrorBoundary";
import { BlockchainVerification } from "@/components/BlockchainVerification";
import { BlockchainVerificationResult } from "@/lib/blockchain";
import { NFTMinting } from "@/components/NFTMinting";
import { NFTMintResult } from "@/lib/nft";

interface MinesweeperGameProps {
  rows: number;
  cols: number;
  mines: number;
}

// Memoize the GameCell component to prevent unnecessary re-renders
const MemoizedGameCell = memo(GameCell);

export function MinesweeperGame({ rows, cols, mines }: MinesweeperGameProps) {
  const [board, setBoard] = useState<any[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const { time, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();
  const [proofStatus, setProofStatus] = useState<"none" | "generating" | "verifying" | "ready" | "verified">("none");
  const [score, setScore] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0); // Track cumulative score across games
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofDetails, setProofDetails] = useState<any>(null);
  const movesRef = useRef<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [canCashOut, setCanCashOut] = useState(false);
  const { error, setError, clearError } = useErrorBoundary();
  const previousDifficultyRef = useRef<string>("");
  const [localVerification, setLocalVerification] = useState<boolean | null>(null);
  const [verifiedScore, setVerifiedScore] = useState<number | null>(null);
  const [blockchainVerification, setBlockchainVerification] = useState<BlockchainVerificationResult | null>(null);
  const [showBlockchainVerification, setShowBlockchainVerification] = useState(false);
  const [showNFTMinting, setShowNFTMinting] = useState(false);
  const [nftMintResult, setNFTMintResult] = useState<NFTMintResult | null>(null);

  // Get current difficulty based on mines count
  const getCurrentDifficulty = useCallback(() => {
    return mines === 10 ? "beginner" : mines === 40 ? "intermediate" : "expert";
  }, [mines]);

  // Initialize the game board
  const initializeBoard = useCallback(() => {
    try {
      console.time('initializeBoard');
      const newBoard = generateBoard(rows, cols, mines);
      setBoard(newBoard);
      setGameStatus("waiting");
      setFlagsPlaced(0);
      resetTimer();
      setProofStatus("none");
      setScore(null);
      setVerifiedScore(null);
      setProgress(0);
      setCanCashOut(false);
      setLocalVerification(null);
      setBlockchainVerification(null);
      setNFTMintResult(null);
      movesRef.current = [];
      
      // Store current difficulty for comparison
      previousDifficultyRef.current = getCurrentDifficulty();
      
      console.timeEnd('initializeBoard');
    } catch (err) {
      console.error("Error initializing board:", err);
      setError("Failed to initialize game board. Please try refreshing the page.");
    }
  }, [rows, cols, mines, resetTimer, setError, getCurrentDifficulty]);

  // Initialize the game board on component mount
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Update progress as cells are revealed
  useEffect(() => {
    if (gameStatus === "playing") {
      try {
        const currentProgress = calculateProgress(board, mines);
        setProgress(currentProgress);
        
        // Enable cash out when at least 30% of the board is revealed
        setCanCashOut(currentProgress >= 30);
      } catch (err) {
        console.error("Error calculating progress:", err);
      }
    }
  }, [board, mines, gameStatus]);

  // Calculate score based on time and difficulty
  const calculateScore = useCallback((time: number, difficulty: string) => {
    const difficultyMultiplier = 
      difficulty === "beginner" ? 1 :
      difficulty === "intermediate" ? 2.5 :
      difficulty === "expert" ? 5 : 1;
    
    // Base score calculation: faster times = higher scores
    return Math.floor(1000 * difficultyMultiplier / time);
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;
    
    try {
      // Start the timer on first click
      if (gameStatus === "waiting") {
        setGameStatus("playing");
        startTimer();
      }

      // Record the move
      movesRef.current.push(`reveal:${row},${col}`);

      const result = revealCell(board, row, col);
      
      if (result.hitMine) {
        setGameStatus("lost");
        stopTimer();
        // Show all mines when game is lost
        setBoard(result.updatedBoard);
        return;
      }

      setBoard(result.updatedBoard);
      
      // Check if player has won
      if (checkWin(result.updatedBoard, mines)) {
        setGameStatus("won");
        stopTimer();
        
        // Calculate score
        const difficulty = getCurrentDifficulty();
        
        const calculatedScore = calculateScore(time, difficulty);
        setScore(calculatedScore);
        
        // Update total score
        setTotalScore(prev => prev + calculatedScore);
        
        // Start proof generation
        setProofStatus("generating");
        
        // Generate proof (would be replaced with actual SP1 proof generation)
        setTimeout(() => {
          setProofStatus("ready");
        }, 800);
      }
    } catch (err) {
      console.error("Error handling cell click:", err);
      setError("An error occurred while revealing a cell. Please try again.");
    }
  }, [board, gameStatus, mines, startTimer, stopTimer, time, calculateScore, setError, getCurrentDifficulty]);

  // Handle right-click (flag placement)
  const handleRightClick = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (gameStatus !== "playing" && gameStatus !== "waiting") return;
    
    try {
      if (gameStatus === "waiting") {
        setGameStatus("playing");
        startTimer();
      }

      // Record the move
      movesRef.current.push(`flag:${row},${col}`);

      const result = flagCell(board, row, col);
      setBoard(result.updatedBoard);
      setFlagsPlaced(result.flagCount);
    } catch (err) {
      console.error("Error handling right click:", err);
      setError("An error occurred while flagging a cell. Please try again.");
    }
  }, [board, gameStatus, startTimer, setError]);

  // Cash out with partial progress
  const handleCashOut = useCallback(() => {
    if (gameStatus !== "playing" || !canCashOut) return;
    
    try {
      stopTimer();
      setGameStatus("won"); // Change status to won for UI consistency
      
      // Calculate partial score
      const difficulty = getCurrentDifficulty();
      
      const partialScore = calculatePartialScore(board, time, difficulty);
      setScore(partialScore.score);
      
      // Update total score
      setTotalScore(prev => prev + partialScore.score);
      
      // Start proof generation for partial game
      setProofStatus("generating");
      
      // Generate partial game proof
      setTimeout(() => {
        setProofStatus("ready");
      }, 800);
    } catch (err) {
      console.error("Error handling cash out:", err);
      setError("An error occurred while cashing out. Please try again.");
    }
  }, [board, time, gameStatus, canCashOut, stopTimer, setError, getCurrentDifficulty]);

  // Generate a proof using SP1
  const generateProof = useCallback(async (isPartial = false) => {
    // This would be replaced with actual SP1 proof generation
    setShowProofDialog(true);
    setProofDetails(null);
    setLocalVerification(null);
    setProofStatus("generating");
    
    try {
      const difficulty = getCurrentDifficulty();
      
      const proofString = await generateGameProof({
        board,
        time,
        difficulty,
        moves: movesRef.current,
        isPartial
      });
      
      // Update status to verifying
      setProofStatus("verifying");
      
      // Verify the proof locally
      const verificationResult = await verifyGameProof(proofString);
      
      // Set verification result
      setLocalVerification(verificationResult.valid);
      
      if (verificationResult.valid) {
        // Store the verified score to ensure consistency
        setVerifiedScore(verificationResult.score);
        
        setProofDetails({
          gameId: verificationResult.gameId,
          score: verificationResult.score,
          time: verificationResult.time,
          difficulty: verificationResult.difficulty,
          isComplete: verificationResult.isComplete,
          percentComplete: verificationResult.percentComplete,
          cellsRevealed: verificationResult.cellsRevealed,
          totalSafeCells: verificationResult.totalSafeCells,
          proofData: proofString // Store the proof data for blockchain verification
        });
        setProofStatus("verified");
      } else {
        setProofDetails({ error: "Proof verification failed" });
        setProofStatus("none");
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      setProofDetails({ error: "Failed to generate proof" });
      setProofStatus("none");
      setLocalVerification(false);
    }
  }, [board, time, getCurrentDifficulty]);

  // Handle blockchain verification result
  const handleBlockchainVerificationComplete = useCallback((result: BlockchainVerificationResult) => {
    setBlockchainVerification(result);
  }, []);

  // Handle NFT minting result
  const handleNFTMintComplete = useCallback((result: NFTMintResult) => {
    setNFTMintResult(result);
  }, []);

  // Handle restart game
  const handleRestartGame = useCallback(() => {
    initializeBoard();
    setShowProofDialog(false);
    setShowBlockchainVerification(false);
    setShowNFTMinting(false);
  }, [initializeBoard]);

  // Render the game board in chunks to improve performance
  const renderBoard = useCallback(() => {
    const chunks = [];
    const chunkSize = Math.min(5, Math.ceil(rows / 2)); // Adjust chunk size based on board size
    
    for (let rowChunk = 0; rowChunk < rows; rowChunk += chunkSize) {
      const rowElements = [];
      
      for (let row = rowChunk; row < Math.min(rowChunk + chunkSize, rows); row++) {
        for (let col = 0; col < cols; col++) {
          if (board[row] && board[row][col]) {
            rowElements.push(
              <MemoizedGameCell 
                key={`${row}-${col}`}
                cell={board[row][col]}
                onClick={() => handleCellClick(row, col)}
                onRightClick={(e) => handleRightClick(row, col, e)}
                gameStatus={gameStatus}
              />
            );
          }
        }
      }
      
      chunks.push(
        <div key={`chunk-${rowChunk}`} className="contents">
          {rowElements}
        </div>
      );
    }
    
    return chunks;
  }, [board, rows, cols, gameStatus, handleCellClick, handleRightClick]);

  // Get the score to display - use verified score if available
  const displayScore = verifiedScore !== null ? verifiedScore : score;

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 font-bold">×</button>
        </div>
      )}
      
      <Card className="card w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Bomb className="h-4 w-4" />
                <span>{mines - flagsPlaced}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Flag className="h-4 w-4" />
                <span>{flagsPlaced}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {displayScore !== null && (
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>Score: {displayScore}</span>
                </Badge>
              )}
              {totalScore > 0 && displayScore === null && (
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span>Total: {totalScore}</span>
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Clock className="h-4 w-4" />
                <span>{time}s</span>
              </Badge>
            </div>
          </div>
          {gameStatus === "playing" && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div 
            className={cn(
              "grid gap-1 mx-auto",
              cols <= 9 ? "max-w-xs" : cols <= 16 ? "max-w-md" : "max-w-2xl"
            )}
            style={{ 
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {renderBoard()}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {gameStatus === "lost" && (
              <div className="flex items-center text-destructive gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Game Over! You hit a mine.</span>
              </div>
            )}
            {gameStatus === "won" && (
              <div className="flex items-center text-green-600 gap-2">
                <Trophy className="h-5 w-5" />
                <span>Congratulations! You won in {time} seconds with a score of {displayScore}.</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {gameStatus === "playing" && canCashOut && (
              <Button 
                onClick={handleCashOut} 
                className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Cash Out ({Math.round(progress)}%)
              </Button>
            )}
            {(gameStatus === "won" || gameStatus === "lost") && (
              <Button 
                onClick={handleRestartGame} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Game
              </Button>
            )}
            {gameStatus === "won" && proofStatus === "ready" && (
              <Button onClick={() => generateProof(false)} className="bg-green-600 hover:bg-green-700">
                Verify Score with ZK Proof
              </Button>
            )}
            {gameStatus === "won" && proofStatus === "verified" && (
              <Button 
                onClick={() => setShowProofDialog(true)} 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                View Verified Score
              </Button>
            )}
            {gameStatus === "lost" && (
              <Button onClick={() => generateProof(true)} className="bg-blue-600 hover:bg-blue-700">
                Verify Partial Progress
              </Button>
            )}
            {proofStatus === "generating" && (
              <Button disabled className="bg-amber-600">
                Generating Proof...
              </Button>
            )}
            {proofStatus === "verifying" && (
              <Button disabled className="bg-blue-600">
                Verifying Proof...
              </Button>
            )}
            {proofStatus === "verified" && !blockchainVerification && (
              <Button 
                onClick={() => setShowBlockchainVerification(true)}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Verify On-Chain
              </Button>
            )}
            {proofStatus === "verified" && !nftMintResult && (
              <Button 
                onClick={() => setShowNFTMinting(true)}
                className="bg-pink-600 hover:bg-pink-700 flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                Mint Achievement NFT
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Proof Verification Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Zero-Knowledge Proof Verification</DialogTitle>
            <DialogDescription>
              Your game score has been cryptographically verified without revealing the board state.
            </DialogDescription>
          </DialogHeader>
          
          {proofDetails ? (
            <div className="space-y-4">
              {proofDetails.error ? (
                <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
                  {proofDetails.error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Game ID</p>
                      <p className="font-mono text-sm">{proofDetails.gameId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                      <p className="capitalize">{proofDetails.difficulty}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Time</p>
                      <p>{proofDetails.time} seconds</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Score</p>
                      <p className="font-bold">{proofDetails.score}</p>
                    </div>
                    
                    {proofDetails.isComplete === false && (
                      <>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Completion</p>
                          <div className="flex items-center gap-1">
                            <Percent className="h-4 w-4 text-blue-500" />
                            <span>{Math.round(proofDetails.percentComplete)}%</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Cells Cleared</p>
                          <p>{proofDetails.cellsRevealed} of {proofDetails.totalSafeCells}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <div className={cn(
                      "flex-1 p-4 rounded-md border",
                      localVerification === true 
                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                        : "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800"
                    )}>
                      <div className="flex items-center">
                        {localVerification === true ? (
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Shield className="h-5 w-5 text-gray-500 mr-2" />
                        )}
                        <div>
                          <h4 className={cn(
                            "font-medium",
                            localVerification === true ? "text-green-700 dark:text-green-300" : "text-gray-700 dark:text-gray-300"
                          )}>
                            Local Verification
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {localVerification === true 
                              ? "Proof verified successfully in your browser" 
                              : "Verification in progress..."}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 rounded-md border bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">
                            Blockchain Verification
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {blockchainVerification 
                              ? blockchainVerification.success 
                                ? "Verified on blockchain" 
                                : "Verification failed" 
                              : "Not yet verified on-chain"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!blockchainVerification && (
                      <Button 
                        onClick={() => {
                          setShowProofDialog(false);
                          setShowBlockchainVerification(true);
                        }}
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        <Wallet className="h-4 w-4" />
                        Verify On-Chain
                      </Button>
                    )}
                    
                    {!nftMintResult && (
                      <Button 
                        onClick={() => {
                          setShowProofDialog(false);
                          setShowNFTMinting(true);
                        }}
                        className="flex items-center gap-2"
                        variant="outline"
                      >
                        <Award className="h-4 w-4" />
                        Mint Achievement NFT
                      </Button>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How SP1 Proofs Work</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      SP1 generates a zero-knowledge proof on your device that verifies your game without revealing sensitive information. Currently, verification happens locally in your browser, with blockchain verification coming in a future update.
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {proofDetails.isComplete 
                      ? "This proof cryptographically verifies that you completed a valid Minesweeper game without revealing the board layout or your specific moves."
                      : "This proof cryptographically verifies your partial progress in this Minesweeper game, confirming you revealed the claimed number of cells without hitting any mines."}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-center">
                {proofStatus === "generating" ? "Generating zero-knowledge proof..." : "Verifying proof..."}
              </span>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                {proofStatus === "generating" 
                  ? "Creating a cryptographic proof that verifies your game without revealing the board layout." 
                  : "Verifying the proof locally in your browser."}
              </p>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              onClick={handleRestartGame} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Game
            </Button>
            <Button onClick={() => setShowProofDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blockchain Verification Dialog */}
      <Dialog open={showBlockchainVerification} onOpenChange={setShowBlockchainVerification}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blockchain Verification</DialogTitle>
            <DialogDescription>
              Verify your game score on the blockchain for permanent proof
            </DialogDescription>
          </DialogHeader>
          
          {proofDetails && (
            <BlockchainVerification
              gameId={proofDetails.gameId}
              proofData={proofDetails.proofData}
              score={proofDetails.score}
              time={proofDetails.time}
              difficulty={proofDetails.difficulty}
              onVerificationComplete={handleBlockchainVerificationComplete}
            />
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowBlockchainVerification(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NFT Minting Dialog */}
      <Dialog open={showNFTMinting} onOpenChange={setShowNFTMinting}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mint Achievement NFT</DialogTitle>
            <DialogDescription>
              Mint an NFT to permanently record your game achievement
            </DialogDescription>
          </DialogHeader>
          
          {proofDetails && (
            <NFTMinting
              gameId={proofDetails.gameId}
              score={proofDetails.score}
              time={proofDetails.time}
              difficulty={proofDetails.difficulty}
              isComplete={proofDetails.isComplete}
              percentComplete={proofDetails.percentComplete}
              onMintComplete={handleNFTMintComplete}
            />
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowNFTMinting(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}