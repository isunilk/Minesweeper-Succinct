// Created: Component for minting score verification NFTs

"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wallet, Check, AlertTriangle, ExternalLink, Award } from "lucide-react";
import { getNFTManager, NFTMintResult } from '@/lib/nft';
import { cn } from '@/lib/utils';

interface NFTMintingProps {
  gameId: string;
  score: number;
  time: number;
  difficulty: string;
  isComplete: boolean;
  percentComplete?: number;
  onMintComplete?: (result: NFTMintResult) => void;
}

export function NFTMinting({
  gameId,
  score,
  time,
  difficulty,
  isComplete,
  percentComplete,
  onMintComplete
}: NFTMintingProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mintResult, setMintResult] = useState<NFTMintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected on component mount
  useEffect(() => {
    const nftManager = getNFTManager();
    if (nftManager.isConnected()) {
      setIsConnected(true);
      setWalletAddress(nftManager.getAddress());
    }
  }, []);

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
      } else {
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Mint NFT
  const handleMint = async () => {
    setIsMinting(true);
    setError(null);
    
    try {
      const nftManager = getNFTManager();
      
      if (!nftManager.isConnected()) {
        await nftManager.connect();
      }
      
      const result = await nftManager.mintScoreNFT(
        gameId,
        score,
        time,
        difficulty,
        isComplete,
        percentComplete
      );
      
      setMintResult(result);
      
      if (onMintComplete) {
        onMintComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error minting NFT");
      
      setMintResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
      
      if (onMintComplete) {
        onMintComplete({
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        });
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get transaction explorer URL
  const getExplorerUrl = (txHash: string): string => {
    // Using Sepolia testnet explorer by default
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Get NFT explorer URL
  const getNFTExplorerUrl = (tokenId: string): string => {
    // Using Sepolia testnet explorer by default
    return `https://sepolia.etherscan.io/token/0xe92CA823d7536E0ce9A74eBAf321C7a61Fa1E0e4?a=${tokenId}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Mint Achievement NFT
        </CardTitle>
        <CardDescription>
          Mint an NFT to permanently record your game achievement on the blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {!isConnected ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <Wallet className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium text-blue-800">Connect Your Wallet</h3>
                <p className="text-sm text-blue-600 mt-1 mb-3">
                  Connect your Ethereum wallet to mint an NFT of your game achievement
                </p>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
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
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h3 className="font-medium text-amber-800 mb-2">Achievement Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-amber-700">Game ID:</div>
                <div className="font-mono text-amber-900 truncate">{gameId}</div>
                
                <div className="text-amber-700">Score:</div>
                <div className="font-medium text-amber-900">{score}</div>
                
                <div className="text-amber-700">Time:</div>
                <div className="text-amber-900">{time} seconds</div>
                
                <div className="text-amber-700">Difficulty:</div>
                <div className="text-amber-900 capitalize">{difficulty}</div>
                
                <div className="text-amber-700">Completion:</div>
                <div className="text-amber-900">
                  {isComplete ? "Complete" : `Partial (${Math.round(percentComplete || 0)}%)`}
                </div>
              </div>
            </div>
            
            {mintResult ? (
              <div className={cn(
                "border rounded-md p-4",
                mintResult.success 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start gap-3">
                  {mintResult.success ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div>
                    <h3 className={cn(
                      "font-medium mb-2",
                      mintResult.success ? "text-green-800" : "text-red-800"
                    )}>
                      {mintResult.success 
                        ? "NFT Minted Successfully!" 
                        : "Minting Failed"}
                    </h3>
                    
                    {mintResult.success && mintResult.tokenId && mintResult.transactionHash ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-700">
                          Your achievement has been permanently recorded as an NFT on the blockchain.
                        </p>
                        
                        <div className="flex flex-col gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs justify-start"
                            onClick={() => window.open(getNFTExplorerUrl(mintResult.tokenId!), '_blank')}
                          >
                            <Award className="mr-1 h-3 w-3" />
                            View NFT #{mintResult.tokenId}
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs justify-start"
                            onClick={() => window.open(getExplorerUrl(mintResult.transactionHash!), '_blank')}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Transaction
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-700">
                        {mintResult.error || "There was an error minting your NFT."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleMint} 
                disabled={isMinting}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isMinting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Minting NFT...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Mint Achievement NFT
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-start border-t pt-4 text-xs text-muted-foreground">
        <p>
          Minting requires a small gas fee to record your achievement on the Ethereum blockchain.
        </p>
      </CardFooter>
    </Card>
  );
}