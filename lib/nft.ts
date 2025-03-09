// Created: NFT integration for minting score verification tokens

import { Contract, BrowserProvider, Signer } from 'ethers';

// NFT contract ABI - this should match your deployed NFT contract
const NFT_CONTRACT_ABI = [
  "function mintTo(address to, string uri) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)"
];

// Contract addresses for different networks
const NFT_CONTRACT_ADDRESSES = {
  // Testnet addresses
  sepolia: "0xe92CA823d7536E0ce9A74eBAf321C7a61Fa1E0e4", // Updated with the provided contract address
  // Mainnet address (when deployed)
  mainnet: "0xe92CA823d7536E0ce9A74eBAf321C7a61Fa1E0e4" // Using the same address for now
};

// Interface for NFT minting result
export interface NFTMintResult {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

// Interface for NFT metadata
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

// Interface for NFT details
export interface NFTDetails {
  tokenId: string;
  metadata: NFTMetadata;
  owner: string;
}

// Class to handle NFT interactions
export class NFTManager {
  private provider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private contract: Contract | null = null;
  private connected: boolean = false;
  private chainId: string = '';
  private address: string = '';

  // Initialize the NFT contract connection
  async connect(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && window.ethereum) {
        // Create a provider
        this.provider = new BrowserProvider(window.ethereum);
        
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
            this.contract = new Contract(
              contractAddress,
              NFT_CONTRACT_ABI,
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
      console.error("Error connecting to NFT contract:", error);
      return false;
    }
  }

  // Get the appropriate contract address based on the current network
  private getContractAddress(): string | null {
    // Sepolia testnet
    if (this.chainId === '11155111') {
      return NFT_CONTRACT_ADDRESSES.sepolia;
    }
    // Ethereum mainnet
    else if (this.chainId === '1') {
      return NFT_CONTRACT_ADDRESSES.mainnet;
    }
    // For development or other networks, use Sepolia address
    return NFT_CONTRACT_ADDRESSES.sepolia;
  }

  // Check if connected to NFT contract
  isConnected(): boolean {
    return this.connected;
  }

  // Get the current wallet address
  getAddress(): string {
    return this.address;
  }

  // Create metadata for the NFT
  createMetadata(
    gameId: string,
    score: number,
    time: number,
    difficulty: string,
    isComplete: boolean,
    percentComplete?: number
  ): NFTMetadata {
    // Generate a name for the NFT
    const name = isComplete 
      ? `Minesweeper ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Victory`
      : `Minesweeper ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Cash Out (${Math.round(percentComplete || 0)}%)`;
    
    // Generate a description for the NFT
    const description = isComplete
      ? `Successfully completed a ${difficulty} Minesweeper game with a score of ${score} in ${time} seconds.`
      : `Cashed out of a ${difficulty} Minesweeper game with ${Math.round(percentComplete || 0)}% completion, earning a score of ${score}.`;
    
    // Generate attributes for the NFT
    const attributes = [
      {
        trait_type: "Game ID",
        value: gameId
      },
      {
        trait_type: "Score",
        value: score
      },
      {
        trait_type: "Time",
        value: time
      },
      {
        trait_type: "Difficulty",
        value: difficulty
      },
      {
        trait_type: "Completion",
        value: isComplete ? "Complete" : "Partial"
      }
    ];
    
    // Add percent complete for partial games
    if (!isComplete && percentComplete) {
      attributes.push({
        trait_type: "Percent Complete",
        value: Math.round(percentComplete)
      });
    }
    
    // Generate an image URL based on difficulty and completion
    // This would be replaced with actual image URLs in a production environment
    const difficultyColor = 
      difficulty === "beginner" ? "green" : 
      difficulty === "intermediate" ? "blue" : 
      "red";
    
    const completionStatus = isComplete ? "complete" : "partial";
    
    // Using a placeholder image URL - in production, you would generate or host actual images
    const image = `https://via.placeholder.com/500/${difficultyColor}/white?text=Minesweeper+${completionStatus}`;
    
    return {
      name,
      description,
      image,
      attributes
    };
  }

  // Upload metadata to IPFS
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    // In a real implementation, this would upload the metadata to IPFS
    // For now, we'll simulate it by returning a mock IPFS URI
    
    // Simulate a delay for the upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock IPFS URI
    return `ipfs://QmXyZ123456789/${Math.random().toString(36).substring(2, 15)}`;
  }

  // Mint an NFT for a verified game score
  async mintScoreNFT(
    gameId: string,
    score: number,
    time: number,
    difficulty: string,
    isComplete: boolean,
    percentComplete?: number
  ): Promise<NFTMintResult> {
    try {
      if (!this.connected || !this.contract) {
        throw new Error("Not connected to NFT contract");
      }
      
      // Create metadata for the NFT
      const metadata = this.createMetadata(
        gameId,
        score,
        time,
        difficulty,
        isComplete,
        percentComplete
      );
      
      // Upload metadata to IPFS
      const metadataURI = await this.uploadMetadata(metadata);
      
      // Mint the NFT
      const tx = await this.contract.mintTo(this.address, metadataURI);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      // In a real implementation, we would extract the token ID from the event logs
      // For now, we'll simulate it
      const tokenId = Math.floor(Math.random() * 1000000).toString();
      
      return {
        success: true,
        tokenId,
        transactionHash: receipt.hash
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Get all NFTs owned by the current user
  async getUserNFTs(): Promise<NFTDetails[]> {
    try {
      if (!this.connected || !this.contract) {
        throw new Error("Not connected to NFT contract");
      }
      
      // Get the number of NFTs owned by the user
      const balance = await this.contract.balanceOf(this.address);
      
      // Get the token IDs for each NFT
      const nfts: NFTDetails[] = [];
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await this.contract.tokenOfOwnerByIndex(this.address, i);
        const tokenURI = await this.contract.tokenURI(tokenId);
        
        // In a real implementation, we would fetch the metadata from IPFS
        // For now, we'll simulate it
        const metadata: NFTMetadata = {
          name: `Minesweeper Achievement #${tokenId}`,
          description: "A verified Minesweeper game achievement",
          image: "https://via.placeholder.com/500/blue/white?text=Minesweeper",
          attributes: [
            {
              trait_type: "Score",
              value: Math.floor(Math.random() * 1000)
            },
            {
              trait_type: "Time",
              value: Math.floor(Math.random() * 300)
            },
            {
              trait_type: "Difficulty",
              value: ["beginner", "intermediate", "expert"][Math.floor(Math.random() * 3)]
            }
          ]
        };
        
        nfts.push({
          tokenId: tokenId.toString(),
          metadata,
          owner: this.address
        });
      }
      
      return nfts;
    } catch (error) {
      console.error("Error getting user NFTs:", error);
      return [];
    }
  }
}

// Create a singleton instance
let nftManager: NFTManager | null = null;

// Get the NFT manager instance
export function getNFTManager(): NFTManager {
  if (!nftManager) {
    nftManager = new NFTManager();
  }
  
  return nftManager;
}

// Declare global ethereum property
declare global {
  interface Window {
    ethereum: any;
  }
}