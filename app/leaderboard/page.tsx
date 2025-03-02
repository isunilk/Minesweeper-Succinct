// Created: Leaderboard page for displaying verified scores
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Clock, Shield, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Mock data for the leaderboard
const mockLeaderboard = [
  { id: 1, player: "Alice", difficulty: "expert", time: 142, date: "2025-04-01", verified: true },
  { id: 2, player: "Bob", difficulty: "intermediate", time: 78, date: "2025-04-02", verified: true },
  { id: 3, player: "Charlie", difficulty: "beginner", time: 32, date: "2025-04-03", verified: true },
  { id: 4, player: "Diana", difficulty: "expert", time: 156, date: "2025-04-01", verified: true },
  { id: 5, player: "Ethan", difficulty: "intermediate", time: 85, date: "2025-04-02", verified: true },
  { id: 6, player: "Fiona", difficulty: "beginner", time: 29, date: "2025-04-03", verified: true },
  { id: 7, player: "George", difficulty: "expert", time: 138, date: "2025-04-01", verified: true },
  { id: 8, player: "Hannah", difficulty: "intermediate", time: 72, date: "2025-04-02", verified: true },
  { id: 9, player: "Ian", difficulty: "beginner", time: 35, date: "2025-04-03", verified: true },
  { id: 10, player: "Julia", difficulty: "expert", time: 149, date: "2025-04-01", verified: true },
];

export default function LeaderboardPage() {
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Filter leaderboard based on difficulty and search query
  const filteredLeaderboard = mockLeaderboard
    .filter(entry => difficulty === "all" || entry.difficulty === difficulty)
    .filter(entry => entry.player.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.time - b.time);
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Game
            </Button>
          </Link>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top verified scores from Minesweeper players
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Verified Scores</CardTitle>
            <CardDescription>
              All scores are cryptographically verified with zero-knowledge proofs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaderboard.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {index === 0 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>{entry.player}</TableCell>
                      <TableCell>
                        <span className={
                          entry.difficulty === "beginner" 
                            ? "text-green-500" 
                            : entry.difficulty === "intermediate" 
                              ? "text-blue-500" 
                              : "text-red-500"
                        }>
                          {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {entry.time}s
                      </TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="text-right">
                        {entry.verified ? (
                          <div className="flex items-center justify-end gap-1 text-green-500">
                            <Shield className="h-4 w-4" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <span className="text-yellow-500">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredLeaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}