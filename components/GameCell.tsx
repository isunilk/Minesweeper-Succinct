// Updated: Fixed right-click flagging and improved cell styling
"use client";

import { cn } from "@/lib/utils";
import { Bomb, Flag } from "lucide-react";
import { GameStatus } from "@/lib/types";

interface GameCellProps {
  cell: {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
  };
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  gameStatus: GameStatus;
}

export function GameCell({ cell, onClick, onRightClick, gameStatus }: GameCellProps) {
  const getCellContent = () => {
    if (cell.isFlagged) {
      return <Flag className="h-4 w-4 text-red-500" />;
    }
    
    if (!cell.isRevealed) {
      return null;
    }
    
    if (cell.isMine) {
      return <Bomb className="h-4 w-4" />;
    }
    
    if (cell.neighborMines === 0) {
      return null;
    }
    
    const colors = {
      1: "text-blue-600",
      2: "text-green-600",
      3: "text-red-600",
      4: "text-purple-600",
      5: "text-amber-800",
      6: "text-cyan-600",
      7: "text-black",
      8: "text-gray-600",
    };
    
    return (
      <span className={cn("font-bold", colors[cell.neighborMines as keyof typeof colors] || "")}>
        {cell.neighborMines}
      </span>
    );
  };

  return (
    <button
      type="button"
      className={cn(
        "aspect-square flex items-center justify-center text-sm font-medium transition-colors",
        "border border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        cell.isRevealed 
          ? "bg-muted" 
          : "bg-card hover:bg-accent",
        (gameStatus === "lost" && cell.isMine && cell.isRevealed) && "bg-red-100 dark:bg-red-900/50",
        cell.isFlagged && "bg-amber-50 dark:bg-amber-900/30"
      )}
      onClick={onClick}
      onContextMenu={onRightClick}
      disabled={gameStatus === "lost" || gameStatus === "won" || cell.isRevealed}
    >
      {getCellContent()}
    </button>
  );
}