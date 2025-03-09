// Created: Achievements page to display user's minted NFTs

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Clock, Shield, Wallet, ExternalLink, RefreshCw, Award, AlertTriangle } from "lucide-react";
import { Navbar } from "@/app/navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { getNFTManager, NFTDetails } from "@/lib/nft";

export default function AchievementsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [achievements, setAchievements] = useState<NFTDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to wallet
  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const nftManager = getNFTManager();
      const connected = await nftManager.connect();
      
      if (connected) {
        setIsConnected(true);
        setWalletAddress(nftManager.getAddress());
        loadAchievements();
      } else {
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Load achievements from the blockchain
  const loadAchievements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const nftManager = getNFTManager();
      
      if (!nftManager.isConnected()) {
        await nftManager.connect();
      }
      
      const nfts = await nftManager.getUserNFTs();
      setAchievements(nfts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error loading achievements");
    } finally {
      setIsLoading(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get NFT explorer URL
  const getNFTExplorerUrl = (tokenId: string): string => {
    // Using Sepolia testnet explorer by default
    return `https://sepolia.etherscan.io/token/0xe92CA823d7536E0ce9A74eBAf321C7a61Fa1E0e4?a=${tokenId}`;
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const nftManager = getNFTManager();
        if (nftManager.isConnected()) {
          setIsConnected(true);
          setWalletAddress(nftManager.getAddress());
          loadAchievements();
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
            <h1 className="text-4xl font-bold tracking-tight">Your Achievements</h1>
            <p className="text-muted-foreground">
              View your Minesweeper achievements minted as NFTs
            </p>
          </div>
          
          <Card className="card">
            <CardHeader>
              <CardTitle>Minesweeper Achievement NFTs</CardTitle>
              <CardDescription>
                Your game achievements permanently recorded on the blockchain as NFTs
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
                        Connect your Ethereum wallet to view your Minesweeper achievement NFTs
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
                      onClick={loadAchievements}
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
                        <p className="text-muted-foreground">Loading achievements...</p>
                      </div>
                    </div>
                  ) : achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((nft) => (
                        <Card key={nft.tokenId} className="overflow-hidden">
                          <div className="aspect-square relative bg-gray-100">
                            <img 
                              src={nft.metadata.image} 
                              alt={nft.metadata.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{nft.metadata.name}</CardTitle>
                            <CardDescription>{nft.metadata.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {nft.metadata.attributes.map((attr, index) => (
                                <div key={index} className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">{attr.trait_type}</p>
                                  <p className="font-medium">{attr.value}</p>
                                </div>
                              ))}
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => window.open(getNFTExplorerUrl(nft.tokenId), '_blank')}
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View on Etherscan
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md bg-gray-50">
                      <div className="flex flex-col items-center gap-2">
                        <Award className="h-12 w-12 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-700">No Achievements Found</h3>
                        <p className="text-gray-500 max-w-md">
                          You haven't minted any Minesweeper achievement NFTs yet. Play a game and use the "Mint Achievement NFT" button to record your achievements.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  About Achievement NFTs
                </h3>
                <p className="text-sm text-amber-700 mb-3">
                  When you mint an achievement NFT:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-amber-700">
                  <li>Your game score and details are permanently recorded on the Ethereum blockchain</li>
                  <li>The NFT serves as a verifiable proof of your gaming achievement</li>
                  <li>You can showcase your achievements in any NFT-compatible wallet or marketplace</li>
                  <li>Each NFT contains metadata about your game: score, time, difficulty, and more</li>
                </ol>
                <p className="text-sm text-amber-700 mt-3">
                  These NFTs are unique digital collectibles that prove your Minesweeper skills and will exist as long as the Ethereum blockchain does.
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