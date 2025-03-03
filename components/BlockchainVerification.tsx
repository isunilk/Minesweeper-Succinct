// Created: Component for blockchain verification of game proofs
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wallet, Check, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { getBlockchainVerifier, BlockchainVerificationResult } from '@/lib/blockchain';
import { cn } from '@/lib/utils';

interface BlockchainVerificationProps {
  gameId: string;
  proofData: string;
  score: number;
  time: number;
  difficulty: string;
  onVerificationComplete?: (result: BlockchainVerificationResult) => void;
}

export function BlockchainVerification({
  gameId,
  proofData,
  score,
  time,
  difficulty,
  onVerificationComplete
}: BlockchainVerificationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState<BlockchainVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected on component mount
  useEffect(() => {
    const verifier = getBlockchainVerifier();
    if (verifier.isConnected()) {
      setIsConnected(true);
      setWalletAddress(verifier.getAddress());
    }
  }, []);

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
      } else {
        setError("Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Verify the proof on the blockchain
  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const verifier = getBlockchainVerifier();
      
      if (!verifier.isConnected()) {
        await verifier.connect();
      }
      
      const result = await verifier.verifyProof(
        gameId,
        proofData,
        score,
        time,
        difficulty
      );
      
      setVerificationResult(result);
      
      if (onVerificationComplete) {
        onVerificationComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error verifying proof");
      
      setVerificationResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
      
      if (onVerificationComplete) {
        onVerificationComplete({
          success: false,
          error: err instanceof Error ? err.message : "Unknown error"
        });
      }
    } finally {
      setIsVerifying(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Verify your game score on the blockchain for permanent proof
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
                  Connect your Ethereum wallet to verify your game score on the blockchain
                </p>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <h3 className="font-medium text-amber-800 mb-2">Game Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-amber-700">Game ID:</div>
                <div className="font-mono text-amber-900 truncate">{gameId}</div>
                
                <div className="text-amber-700">Score:</div>
                <div className="font-medium text-amber-900">{score}</div>
                
                <div className="text-amber-700">Time:</div>
                <div className="text-amber-900">{time} seconds</div>
                
                <div className="text-amber-700">Difficulty:</div>
                <div className="text-amber-900 capitalize">{difficulty}</div>
              </div>
            </div>
            
            {verificationResult ? (
              <div className={cn(
                "border rounded-md p-4",
                verificationResult.success 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-start gap-3">
                  {verificationResult.success ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  
                  <div>
                    <h3 className={cn(
                      "font-medium mb-2",
                      verificationResult.success ? "text-green-800" : "text-red-800"
                    )}>
                      {verificationResult.success 
                        ? "Verification Successful!" 
                        : "Verification Failed"}
                    </h3>
                    
                    {verificationResult.success && verificationResult.transactionHash ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-700">
                          Your game score has been verified on the blockchain and is now permanently recorded.
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(getExplorerUrl(verificationResult.transactionHash!), '_blank')}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View on Etherscan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-700">
                        {verificationResult.error || "There was an error verifying your game on the blockchain."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleVerify} 
                disabled={isVerifying}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify on Blockchain
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-start border-t pt-4 text-xs text-muted-foreground">
        <p>
          Verification requires a small gas fee to record your score on the Ethereum blockchain.
        </p>
      </CardFooter>
    </Card>
  );
}