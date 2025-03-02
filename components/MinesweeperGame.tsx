// Updated: Added score calculation and SP1 proof generation
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bomb, Clock, Flag, Trophy, AlertTriangle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { generateBoard, revealCell, flagCell, checkWin } from "@/lib/minesweeper";
import { GameCell } from "@/components/GameCell";
import { GameStatus } from "@/lib/types";
import { generateGameProof, verifyGameProof } from "@/lib/sp1";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

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

  // Initialize the game board
  useEffect(() => {
    const newBoard = generateBoard(rows, cols, mines);
    setBoard(newBoard);
    setGameStatus("waiting");
    setFlagsPlaced(0);
    resetTimer();
    setProofStatus("none");
    setScore(null);
    movesRef.current = [];
  }, [rows, cols, mines, resetTimer]);

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
      }, 2000);
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

  // Generate a proof using SP1
  const generateProof = useCallback(async () => {
    // This would be replaced with actual SP1 proof generation
    setShowProofDialog(true);
    
    const difficulty = 
      mines === 10 ? "beginner" :
      mines === 40 ? "intermediate" : "expert";
    
    try {
      const proofString = await generateGameProof({
        board,
        time,
        difficulty,
        moves: movesRef.current
      });
      
      // Verify the proof
      const verificationResult = await verifyGameProof(proofString);
      
      if (verificationResult.valid) {
        setProofDetails({
          gameId: verificationResult.gameId,
          score: verificationResult.score,
          time: verificationResult.time,
          difficulty: verificationResult.difficulty
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
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Bomb className="h-4 w-4" />
                <span>{mines - flagsPlaced}</span>
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
          {gameStatus === "won" && proofStatus === "ready" && (
            <Button onClick={generateProof} className="bg-green-600 hover:bg-green-700">
              Verify Score with ZK Proof
            </Button>
          )}
          {gameStatus === "won" && proofStatus === "generating" && (
            <Button disabled className="bg-amber-600">
              Generating Proof...
            </Button>
          )}
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
                  </div>
                  
                  <div className="rounded-md bg-green-50 p-4 border border-green-200">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-700">
                        Proof verified successfully! Your score has been recorded.
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    This proof cryptographically verifies that you completed a valid Minesweeper game
                    without revealing the board layout or your specific moves.
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