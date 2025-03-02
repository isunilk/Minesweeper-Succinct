// Updated: Fixed Cash Out button persistence across difficulty changes and improved score handling
"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bomb, Clock, Flag, Trophy, AlertTriangle, Award, Shield, DollarSign, Percent } from "lucide-react";
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
  const [proofStatus, setProofStatus] = useState<"none" | "generating" | "ready">("none");
  const [score, setScore] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0); // Track cumulative score across games
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofDetails, setProofDetails] = useState<any>(null);
  const movesRef = useRef<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [canCashOut, setCanCashOut] = useState(false);
  const { error, setError, clearError } = useErrorBoundary();
  const previousDifficultyRef = useRef<string>("");

  // Get current difficulty based on mines count
  const getCurrentDifficulty = useCallback(() => {
    return mines === 10 ? "beginner" : mines === 40 ? "intermediate" : "expert";
  }, [mines]);

  // Initialize the game board
  useEffect(() => {
    try {
      console.time('initializeBoard');
      const newBoard = generateBoard(rows, cols, mines);
      setBoard(newBoard);
      setGameStatus("waiting");
      setFlagsPlaced(0);
      resetTimer();
      setProofStatus("none");
      setScore(null);
      setProgress(0);
      setCanCashOut(false);
      movesRef.current = [];
      
      // Store current difficulty for comparison
      previousDifficultyRef.current = getCurrentDifficulty();
      
      console.timeEnd('initializeBoard');
    } catch (err) {
      console.error("Error initializing board:", err);
      setError("Failed to initialize game board. Please try refreshing the page.");
    }
  }, [rows, cols, mines, resetTimer, setError, getCurrentDifficulty]);

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
    
    try {
      const difficulty = getCurrentDifficulty();
      
      const proofString = await generateGameProof({
        board,
        time,
        difficulty,
        moves: movesRef.current,
        isPartial
      });
      
      // Verify the proof
      const verificationResult = await verifyGameProof(proofString);
      
      if (verificationResult.valid) {
        setProofDetails({
          gameId: verificationResult.gameId,
          score: verificationResult.score,
          time: verificationResult.time,
          difficulty: verificationResult.difficulty,
          isComplete: verificationResult.isComplete,
          percentComplete: verificationResult.percentComplete,
          cellsRevealed: verificationResult.cellsRevealed,
          totalSafeCells: verificationResult.totalSafeCells
        });
      } else {
        setProofDetails({ error: "Proof verification failed" });
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      setProofDetails({ error: "Failed to generate proof" });
    }
  }, [board, time, getCurrentDifficulty]);

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
              {score !== null && (
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span>Score: {score}</span>
                </Badge>
              )}
              {totalScore > 0 && score === null && (
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
                <span>Congratulations! You won in {time} seconds with a score of {score}.</span>
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
            {gameStatus === "won" && proofStatus === "ready" && (
              <Button onClick={() => generateProof(false)} className="bg-green-600 hover:bg-green-700">
                Verify Score with ZK Proof
              </Button>
            )}
            {gameStatus === "lost" && (
              <Button onClick={() => generateProof(true)} className="bg-blue-600 hover:bg-blue-700">
                Verify Partial Progress
              </Button>
            )}
            {(gameStatus === "won" || gameStatus === "lost") && proofStatus === "generating" && (
              <Button disabled className="bg-amber-600">
                Generating Proof...
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent>
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
                  
                  <div className="rounded-md bg-green-50 p-4 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-700 dark:text-green-300">
                        Proof verified successfully! Your score has been recorded.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">How SP1 Proofs Work</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      In a real implementation, SP1 would generate a zero-knowledge proof on your device that verifies your game without revealing sensitive information. This proof would then be verified on a blockchain or server.
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
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Verifying proof...</span>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowProofDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}