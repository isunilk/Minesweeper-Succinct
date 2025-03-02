// Created: Main Minesweeper game component with game logic
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bomb, Clock, Flag, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { generateBoard, revealCell, flagCell, checkWin } from "@/lib/minesweeper";
import { GameCell } from "@/components/GameCell";
import { GameStatus } from "@/lib/types";

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

  // Initialize the game board
  useEffect(() => {
    const newBoard = generateBoard(rows, cols, mines);
    setBoard(newBoard);
    setGameStatus("waiting");
    setFlagsPlaced(0);
    resetTimer();
    setProofStatus("none");
  }, [rows, cols, mines, resetTimer]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;
    
    // Start the timer on first click
    if (gameStatus === "waiting") {
      setGameStatus("playing");
      startTimer();
    }

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
      setProofStatus("generating");
      
      // Simulate proof generation (would be replaced with actual SP1 proof generation)
      setTimeout(() => {
        setProofStatus("ready");
      }, 2000);
    }
  }, [board, gameStatus, mines, startTimer, stopTimer]);

  // Handle right-click (flag placement)
  const handleRightClick = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (gameStatus !== "playing" && gameStatus !== "waiting") return;
    
    if (gameStatus === "waiting") {
      setGameStatus("playing");
      startTimer();
    }

    const result = flagCell(board, row, col);
    setBoard(result.updatedBoard);
    setFlagsPlaced(result.flagCount);
  }, [board, gameStatus, startTimer]);

  // Generate a proof (simulated)
  const generateProof = useCallback(() => {
    // This would be replaced with actual SP1 proof generation
    console.log("Generating proof for game completion");
    alert("Proof generated and verified! Your score has been recorded.");
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Bomb className="h-4 w-4" />
              <span>{mines - flagsPlaced}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
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
              <span>Congratulations! You won in {time} seconds.</span>
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
  );
}