// Created: Blockchain integration for verifying game proofs on-chain
import { ethers } from 'ethers';

// Mock ABI for the verification contract
const VERIFICATION_CONTRACT_ABI = [
  "function verifyProof(bytes32 gameId, bytes proof, uint256 score, uint256 time, string difficulty) public returns (bool)",
  "function getVerifiedGames(address player) public view returns (bytes32[])",
  "function getGameDetails(bytes32 gameId) public view returns (uint256 score, uint256 time, string difficulty, bool verified, address player)"
];

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  // Testnet addresses
  sepolia: "0x1234567890123456789012345678901234567890", // Replace with actual contract address
  // Mainnet address (when deployed)
  mainnet: "0x0987654321098765432109876543210987654321" // Replace with actual contract address
};

// Interface for blockchain verification result
export interface BlockchainVerificationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Interface for verified game details
export interface VerifiedGameDetails {
  gameId: string;
  score: number;
  time: number;
  difficulty: string;
  verified: boolean;
  player: string;
}

// Class to handle blockchain interactions
export class BlockchainVerifier {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private connected: boolean = false;
  private chainId: string = '';
  private address: string = '';

  // Initialize the blockchain connection
  async connect(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        // Create a provider
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        const accounts = await this.provider.send("eth_requestAccounts", []);
        
        if (accounts.length > 0) {
          // Get the signer
          this.signer = await this.provider.getSigner();
          this.address = await this.signer.getAddress();
          
          // Get the network
          const network = await this.provider.getNetwork();
          this.chainId = network.chainId.toString();
          
          // Determine which contract address to use based on the network
          const contractAddress = this.getContractAddress();
          
          if (contractAddress) {
            // Create the contract instance
            this.contract = new ethers.Contract(
              contractAddress,
              VERIFICATION_CONTRACT_ABI,
              this.signer
            );
            
            this.connected = true;
            return true;
          } else {
            console.error("Unsupported network");
            return false;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      return false;
    }
  }

  // Get the appropriate contract address based on the current network
  private getContractAddress(): string | null {
    // Sepolia testnet
    if (this.chainId === '11155111') {
      return CONTRACT_ADDRESSES.sepolia;
    }
    // Ethereum mainnet
    else if (this.chainId === '1') {
      return CONTRACT_ADDRESSES.mainnet;
    }
    
    // For development or testing, return Sepolia address
    return CONTRACT_ADDRESSES.sepolia;
  }

  // Check if connected to blockchain
  isConnected(): boolean {
    return this.connected;
  }

  // Get the current wallet address
  getAddress(): string {
    return this.address;
  }

  // Verify a game proof on the blockchain
  async verifyProof(
    gameId: string,
    proofData: string,
    score: number,
    time: number,
    difficulty: string
  ): Promise<BlockchainVerificationResult> {
    try {
      if (!this.connected || !this.contract) {
        throw new Error("Not connected to blockchain");
      }
      
      // Convert the gameId to bytes32
      const gameIdBytes32 = ethers.id(gameId);
      
      // Convert the proof data to bytes
      // Fix: Use proper encoding for the proof data
      const proofBytes = ethers.toUtf8Bytes(JSON.stringify(proofData));
      
      // Call the contract to verify the proof
      const tx = await this.contract.verifyProof(
        gameIdBytes32,
        proofBytes,
        score,
        time,
        difficulty
      );
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("Error verifying proof on blockchain:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get all verified games for the current user
  async getVerifiedGames(): Promise<string[]> {
    try {
      if (!this.connected || !this.contract) {
        throw new Error("Not connected to blockchain");
      }
      
      const games = await this.contract.getVerifiedGames(this.address);
      return games;
    } catch (error) {
      console.error("Error getting verified games:", error);
      return [];
    }
  }

  // Get details for a specific game
  async getGameDetails(gameId: string): Promise<VerifiedGameDetails | null> {
    try {
      if (!this.connected || !this.contract) {
        throw new Error("Not connected to blockchain");
      }
      
      const details = await this.contract.getGameDetails(gameId);
      
      return {
        gameId,
        score: Number(details[0]),
        time: Number(details[1]),
        difficulty: details[2],
        verified: details[3],
        player: details[4]
      };
    } catch (error) {
      console.error("Error getting game details:", error);
      return null;
    }
  }
}

// Create a singleton instance
let blockchainVerifier: BlockchainVerifier | null = null;

// Get the blockchain verifier instance
export function getBlockchainVerifier(): BlockchainVerifier {
  if (!blockchainVerifier) {
    blockchainVerifier = new BlockchainVerifier();
  }
  
  return blockchainVerifier;
}

// Declare global ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}