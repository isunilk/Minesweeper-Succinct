# Blockchain Integration Guide for Minesweeper Succinct

This guide explains how to integrate blockchain verification for your Minesweeper Succinct game. The blockchain integration allows players to permanently record their verified game scores on the Ethereum blockchain.

## Overview

The blockchain integration consists of:

1. A smart contract that verifies SP1 proofs and stores game results
2. A JavaScript library for interacting with the contract
3. UI components for connecting wallets and submitting proofs

## Smart Contract

The `MinesweeperVerifier.sol` contract handles:

- Verifying game proofs (using SP1 verification)
- Storing verified game results
- Tracking top scores by difficulty
- Allowing players to query their verified games

### Contract Deployment

The contract is deployed on:

- **Sepolia Testnet**: `0x1234567890123456789012345678901234567890` (example address)
- **Ethereum Mainnet**: Not yet deployed

## Integration Steps

### 1. Connect to a Wallet

Players need to connect their Ethereum wallet (like MetaMask) to verify scores on-chain:

```javascript
// Connect to wallet
const verifier = getBlockchainVerifier();
const connected = await verifier.connect();

if (connected) {
  console.log("Connected to wallet:", verifier.getAddress());
} else {
  console.error("Failed to connect to wallet");
}
```

### 2. Verify a Game Proof

After generating and locally verifying an SP1 proof, you can submit it to the blockchain:

```javascript
// Verify proof on blockchain
const result = await verifier.verifyProof(
  gameId,
  proofData,
  score,
  time,
  difficulty
);

if (result.success) {
  console.log("Proof verified on blockchain:", result.transactionHash);
} else {
  console.error("Verification failed:", result.error);
}
```

### 3. Query Verified Games

Players can view their verified games:

```javascript
// Get all verified games for the current user
const games = await verifier.getVerifiedGames();

// Get details for a specific game
const details = await verifier.getGameDetails(gameId);
```

## Gas Costs

Verifying a game on the blockchain requires gas (ETH). Approximate costs:

- Proof verification: ~100,000 gas
- At 50 gwei gas price: ~0.005 ETH per verification

## User Experience Considerations

1. **Wallet Connection**: Always provide clear instructions for connecting wallets
2. **Gas Fees**: Inform users about gas costs before verification
3. **Transaction Status**: Show pending/success/failure states during verification
4. **Error Handling**: Provide clear error messages if verification fails

## Next Steps for Development

1. **Implement SP1 Verifier**: Add actual SP1 proof verification in the smart contract
2. **Optimize Gas Usage**: Reduce verification costs where possible
3. **Add Leaderboard Contract**: Create a separate contract for managing global leaderboards
4. **Add Rewards**: Consider adding token rewards for top scores

## Resources

- [SP1 Documentation](https://docs.succinct.xyz/sp1)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [MetaMask Developer Documentation](https://docs.metamask.io/)