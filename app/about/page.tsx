// Updated: Streamlined content while preserving key information

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Award, Code, Cpu, Zap, DollarSign, Percent } from "lucide-react";
import { Navbar } from "@/app/navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-start py-8 px-4">
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
          
          <Card className="card">
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
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">Cash Out Feature</h3>
                    <p className="text-amber-700 dark:text-amber-400 mb-3">
                      Don't want to risk hitting a mine after making good progress? Use our Cash Out feature!
                    </p>
                    <div className="bg-white dark:bg-amber-950/50 p-4 rounded-md border border-amber-100 dark:border-amber-900">
                      <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-200">How Cash Out Works:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                        <li>Reveal at least 30% of the safe cells to unlock the Cash Out option</li>
                        <li>Click "Cash Out" to end the game and secure your current progress</li>
                        <li>Receive a partial score based on your progress, time, and difficulty</li>
                        <li>The more cells you reveal before cashing out, the higher your score!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
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
                  When you win a game, our system generates a zero-knowledge proof using SP1 technology that cryptographically verifies:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You completed a valid Minesweeper game</li>
                  <li>The mines were placed randomly</li>
                  <li>You revealed all non-mine cells</li>
                  <li>Your completion time is accurate</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardHeader>
              <CardTitle>Technical Implementation</CardTitle>
              <CardDescription>
                Under the hood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                This project combines several technologies to create a secure and performant game:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Frontend:</strong> Next.js, React, TypeScript, and TailwindCSS</li>
                <li><strong>Game Logic:</strong> WebAssembly (WASM) compiled from Rust for performance and security</li>
                <li><strong>Zero-Knowledge Proofs:</strong> SP1 for generating verifiable proofs of game completion</li>
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800 space-y-6">
                <div className="flex items-start gap-3">
                  <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">WebAssembly (WASM)</h3>
                    <p className="text-blue-700 dark:text-blue-400">
                      WebAssembly allows high-performance code to run in web browsers at near-native speed. Our game logic is implemented in Rust and compiled to WASM for security and performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">SP1: Succinct Proofs</h3>
                    <p className="text-amber-700 dark:text-amber-400">
                      SP1 is a zero-knowledge proof system that allows for verifiable computation. It enables proving that a program executed correctly without revealing the inputs or intermediate states.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Security Benefits</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>Game logic is protected from browser-based tampering</li>
                  <li>Scores cannot be falsified or manipulated</li>
                  <li>Leaderboard entries are cryptographically verified</li>
                  <li>Player strategies remain private even when scores are verified</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardHeader>
              <CardTitle>Game Features</CardTitle>
              <CardDescription>
                Special features that enhance your Minesweeper experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-semibold">Cash Out System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Once you've revealed at least 30% of the safe cells, you can cash out to secure a partial score:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                    <li>Earn points without completing the entire board</li>
                    <li>Avoid risky situations where you might hit a mine</li>
                    <li>Accumulate scores across multiple games</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Score Verification</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our game verifies your score proofs directly in your browser:
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                    <li>Instant verification without waiting for server response</li>
                    <li>Works offline once the game is loaded</li>
                    <li>Privacy-preserving - no data leaves your browser</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}