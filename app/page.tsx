// Updated: Added navbar to the main page
"use client";

import { useState } from "react";
import { MinesweeperGame } from "@/components/MinesweeperGame";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bomb, Clock, Flag, Trophy } from "lucide-react";
import { Navbar } from "./navbar";
import Link from "next/link";

export default function Home() {
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "expert">("beginner");
  const [gameKey, setGameKey] = useState(0);

  const difficultySettings = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 },
  };

  const handleNewGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Succinct Minesweeper</h1>
            <p className="text-muted-foreground">
              Clear the board without hitting any mines. Scores are verified with zero-knowledge proofs.
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Game Controls</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleNewGame}>New Game</Button>
                </div>
              </div>
              <CardDescription>
                Left-click to reveal a tile, right-click to flag a mine
              </CardDescription>
            </CardHeader>
          </Card>

          <MinesweeperGame 
            key={gameKey}
            rows={difficultySettings[difficulty].rows} 
            cols={difficultySettings[difficulty].cols} 
            mines={difficultySettings[difficulty].mines} 
          />
          
          <div className="flex justify-center gap-4">
            <Link href="/about">
              <Button variant="outline">Learn About ZK Proofs</Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}