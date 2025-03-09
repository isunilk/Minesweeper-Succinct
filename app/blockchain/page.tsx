// Created: Blockchain verification page for viewing on-chain verified games

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Clock, Shield, Wallet, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from "@/app/navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { getBlockchainVerifier, BlockchainVerificationResult } from "@/lib/blockchain";
import { BlockchainGameData } from "@/lib/types";

export default function BlockchainPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [verifiedGames, setVerifiedGames] = useState<BlockchainGameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to blockchain wallet
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const verifier = getBlockchainVerifier();
      const connected = await verifier.connect();
      
      if (connected) {
        setIsConnected(true);
        setWalletAddress(verifier.getAddress());
        loadVerifiedGames();
      } else {
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Load verified games from the blockchain
  const loadVerifiedGames = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const verifier = getBlockchainVerifier();
      
      if (!verifier.isConnected()) {
        await verifier.connect();
      }
      
      // Get all game IDs for the current user
      const gameIds = await verifier.getVerifiedGames();
      
      // Get details for each game
      const games: BlockchainGameData[] = [];
      
      for (const gameId of gameIds) {
        const details = await verifier.getGameDetails(gameId);
        
        if (details) {
          games.push({
            gameId,
            score: details.score,
            time: details.time,
            difficulty: details.difficulty,
            isComplete: true, // Assuming all on-chain games are complete
            timestamp: Date.now(), // This would come from the blockchain in a real implementation
            player: details.player,
            transactionHash: "0x..." // This would be the actual transaction hash in a real implementation
          });
        }
      }
      
      // Sort games by score (highest first)
      games.sort((a, b) => b.score - a.score);
      
      setVerifiedGames(games);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error loading verified games");
    } finally {
      setIsLoading(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Get transaction explorer URL
  const getExplorerUrl = (txHash: string): string => {
    // Using Sepolia testnet explorer by default
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const verifier = getBlockchainVerifier();
        if (verifier.isConnected()) {
          setIsConnected(true);
          setWalletAddress(verifier.getAddress());
          loadVerifiedGames();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };
    
    checkConnection();
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight">Blockchain Verification</h1>
            <p className="text-muted-foreground">
              View your game scores verified and stored on the Ethereum blockchain
            </p>
          </div>
          
          <Card className="card">
            <CardHeader>
              <CardTitle>Blockchain-Verified Scores</CardTitle>
              <CardDescription>
                These scores have been cryptographically verified and permanently recorded on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              {!isConnected ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-8">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <Wallet className="h-12 w-12 text-blue-500" />
                    <div>
                      <h3 className="text-xl font-medium text-blue-800 mb-2">Connect Your Wallet</h3>
                      <p className="text-blue-600 mb-6 max-w-md mx-auto">
                        Connect your Ethereum wallet to view your verified game scores stored on the blockchain
                      </p>
                      <Button 
                        onClick={handleConnect} 
                        disabled={isConnecting}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        {isConnecting ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Wallet className="mr-2 h-5 w-5" />
                            Connect Wallet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">Connected Wallet</span>
                    </div>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {formatAddress(walletAddress)}
                    </span>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadVerifiedGames}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading verified games...</p>
                      </div>
                    </div>
                  ) : verifiedGames.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Game ID</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {verifiedGames.map((game, index) => (
                            <TableRow key={game.gameId}>
                              <TableCell className="font-medium">
                                {index === 0 ? (
                                  <Trophy className="h-5 w-5 text-yellow-500" />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs truncate max-w-[100px]">
                                {game.gameId}
                              </TableCell>
                              <TableCell>
                                <span className={
                                  game.difficulty === "beginner" 
                                    ? "text-green-500" 
                                    : game.difficulty === "intermediate" 
                                      ? "text-blue-500" 
                                      : "text-red-500"
                                }>
                                  {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {game.time}s
                              </TableCell>
                              <TableCell className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                {game.score}
                              </TableCell>
                              <TableCell>{formatDate(game.timestamp)}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => window.open(getExplorerUrl(game.transactionHash), '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span className="sr-only">View on Etherscan</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md bg-gray-50">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-700">No Verified Games Found</h3>
                        <p className="text-gray-500 max-w-md">
                          You haven't verified any Minesweeper games on the blockchain yet. Play a game and use the "Verify On-Chain" button to record your score.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-amber-600" />
                  How Blockchain Verification Works
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  When you verify a game on the blockchain:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-amber-700">
                  <li>Your game's zero-knowledge proof is submitted to our smart contract</li>
                  <li>The contract verifies the proof's validity</li>
                  <li>Your score, time, and game details are permanently recorded on the Ethereum blockchain</li>
                  <li>Anyone can verify your achievement without trusting a central authority</li>
                </ol>
                <p className="text-sm text-amber-700 mt-3">
                  This creates a tamper-proof record of your gaming achievements that will exist as long as the Ethereum blockchain does.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}