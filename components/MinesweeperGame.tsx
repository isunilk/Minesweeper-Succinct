// Updated: Added partial game verification, cash out button, and fixed right-click flagging
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface MinesweeperGameProps {
  rows: number;
  cols: number;
  mines: number;
}

export function MinesweeperGame({ rows, cols, mines }: MinesweeperGameProps) {
  const [board, setBoard] = useState<any[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const { time, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer();
  const [proofStatus, setProofStatus] = useState<"none" | "generating" | "ready">("none");
  const [score, setScore] = useState<number | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofDetails, setProofDetails] = useState<any>(null);
  const movesRef = useRef<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [canCashOut, setCanCashOut] = useState(false);

  // Initialize the game board
  useEffect(() => {
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
  }, [rows, cols, mines, resetTimer]);

  // Update progress as cells are revealed
  useEffect(() => {
    if (gameStatus === "playing") {
      const currentProgress = calculateProgress(board, mines);
      setProgress(currentProgress);
      
      // Enable cash out when at least 30% of the board is revealed
      setCanCashOut(currentProgress >= 30);
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
      const difficulty = 
        mines === 10 ? "beginner" :
        mines === 40 ? "intermediate" : "expert";
      
      const calculatedScore = calculateScore(time, difficulty);
      setScore(calculatedScore);
      
      // Start proof generation
      setProofStatus("generating");
      
      // Generate proof (would be replaced with actual SP1 proof generation)
      setTimeout(() => {
        setProofStatus("ready");
      }, 800);
    }
  }, [board, gameStatus, mines, startTimer, stopTimer, time, calculateScore]);

  // Handle right-click (flag placement)
  const handleRightClick = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (gameStatus !== "playing" && gameStatus !== "waiting") return;
    
    if (gameStatus === "waiting") {
      setGameStatus("playing");
      startTimer();
    }

    // Record the move
    movesRef.current.push(`flag:${row},${col}`);

    const result = flagCell(board, row, col);
    setBoard(result.updatedBoard);
    setFlagsPlaced(result.flagCount);
  }, [board, gameStatus, startTimer]);

  // Cash out with partial progress
  const handleCashOut = useCallback(() => {
    if (gameStatus !== "playing" || !canCashOut) return;
    
    stopTimer();
    setGameStatus("won"); // Change status to won for UI consistency
    
    // Calculate partial score
    const difficulty = 
      mines === 10 ? "beginner" :
      mines === 40 ? "intermediate" : "expert";
    
    const partialScore = calculatePartialScore(board, time, difficulty);
    setScore(partialScore.score);
    
    // Start proof generation for partial game
    setProofStatus("generating");
    
    // Generate partial game proof
    setTimeout(() => {
      setProofStatus("ready");
    }, 800);
  }, [board, time, mines, gameStatus, canCashOut, stopTimer]);

  // Generate a proof using SP1
  const generateProof = useCallback(async (isPartial = false) => {
    // This would be replaced with actual SP1 proof generation
    setShowProofDialog(true);
    setProofDetails(null);
    
    const difficulty = 
      mines === 10 ? "beginner" :
      mines === 40 ? "intermediate" : "expert";
    
    try {
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
  }, [board, time, mines]);

  return (
    <>
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
            {board.map((row, rowIndex) => 
              row.map((cell, colIndex) => (
                <GameCell 
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onRightClick={(e) => handleRightClick(rowIndex, colIndex, e)}
                  gameStatus={gameStatus}
                />
              ))
            )}
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