// Created: About page explaining the game and ZK proof concept
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Award } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">About Succinct Minesweeper</h1>
          <p className="text-muted-foreground">
            A classic game with a cryptographic twist
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
            <CardDescription>
              Minesweeper is a classic puzzle game where you need to clear a board without detonating any mines.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The game board consists of a grid of cells, some of which contain hidden mines. Your goal is to reveal all cells that don't contain mines.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Left-click on a cell to reveal it</li>
              <li>Right-click on a cell to flag it as a potential mine</li>
              <li>Numbers indicate how many mines are adjacent to that cell</li>
              <li>Use logic to determine which cells are safe to reveal</li>
              <li>Win by revealing all non-mine cells</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Verifiable Scores with Zero-Knowledge Proofs</CardTitle>
            <CardDescription>
              What makes this implementation special
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4 space-y-2">
                <Shield className="h-12 w-12 text-chart-1" />
                <h3 className="text-lg font-semibold">Tamper-Proof</h3>
                <p className="text-sm text-muted-foreground">
                  Game scores cannot be modified or falsified, ensuring fair competition.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 space-y-2">
                <Lock className="h-12 w-12 text-chart-2" />
                <h3 className="text-lg font-semibold">Privacy-Preserving</h3>
                <p className="text-sm text-muted-foreground">
                  Zero-knowledge proofs verify your score without revealing your game strategy.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 space-y-2">
                <Award className="h-12 w-12 text-chart-3" />
                <h3 className="text-lg font-semibold">Verifiable</h3>
                <p className="text-sm text-muted-foreground">
                  Anyone can verify that your score is legitimate without trusting a central authority.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How It Works</h3>
              <p className="mb-4">
                When you win a game, our system generates a zero-knowledge proof using SP1 technology. This proof cryptographically verifies:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You completed a valid Minesweeper game</li>
                <li>The mines were placed randomly</li>
                <li>You revealed all non-mine cells</li>
                <li>Your completion time is accurate</li>
              </ul>
              <p className="mt-4">
                The proof can be verified by anyone without revealing the actual board layout or your specific moves, preserving your strategy while proving your achievement.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Under the hood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This project combines several technologies to create a secure and performant game:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Frontend:</strong> Next.js, React, TypeScript, and TailwindCSS</li>
              <li><strong>Game Logic:</strong> WebAssembly (WASM) compiled from Rust for performance and security</li>
              <li><strong>Zero-Knowledge Proofs:</strong> SP1 for generating verifiable proofs of game completion</li>
            </ul>
            <p className="mt-4">
              The WebAssembly module handles the core game logic, ensuring that the game rules are enforced consistently and cannot be tampered with in the browser. When a game is completed, SP1 generates a cryptographic proof that can be verified by anyone.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}