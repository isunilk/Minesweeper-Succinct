// Updated: Added achievements link

"use client";

import { useState } from "react";
import { MinesweeperGame } from "@/components/MinesweeperGame";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bomb, Clock, Flag, Trophy, Shield, Award } from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "@/components/Footer";
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

          <Card className="card">
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
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-md text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Verifiable Scores with SP1</p>
                    <p>When you win, your score is calculated based on time and difficulty. SP1 generates a zero-knowledge proof that verifies:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>You completed a valid Minesweeper game</li>
                      <li>The mines were placed randomly</li>
                      <li>You revealed all non-mine cells</li>
                      <li>Your completion time is accurate</li>
                    </ul>
                    <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">New! You can now "Cash Out" for partial scores after revealing at least 30% of the board.</p>
                    <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">New! Verify your scores on the Ethereum blockchain for permanent proof of your achievements.</p>
                    <p className="mt-2 text-purple-600 dark:text-purple-400 font-medium">New! Mint your achievements as NFTs to showcase your Minesweeper skills.</p>
                  </div>
                </div>
              </div>
            </CardContent>
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
            <Link href="/blockchain">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Blockchain Verification
              </Button>
            </Link>
            <Link href="/achievements">
              <Button variant="outline" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                View Achievements
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}