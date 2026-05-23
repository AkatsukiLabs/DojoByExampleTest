---
title: "Torii Indexer Overview"
description: "Learn what Torii is, why you need it, and how it works in the Dojo ecosystem"
---

# Torii Indexer Overview

Torii is Dojo's built-in tool for making your game data fast and easy to access. Think of it as a "search engine" for your on-chain game world—it keeps everything up-to-date in a local database so your apps can query it instantly.

## What is Torii?

- **Official Indexing Engine**: Torii is the standard way to index data in Dojo worlds
- **Automatic Syncing**: It watches your blockchain (Starknet) and copies game state changes to a database
- **Efficient Queries**: Provides APIs for quick data access, avoiding slow direct blockchain calls
- **Built in Rust**: Designed for speed and reliability
- **Pre-Installed**: Comes bundled with the Dojo toolchain—no extra setup needed

## Why Use Torii?

Directly querying the blockchain is like searching a massive library book-by-book: slow and costly. Torii acts like a catalog system:

- **Speed**: Instant access to game data
- **Real-Time Updates**: Supports subscriptions for live changes (e.g., player moves)
- **Cost Savings**: Reduces on-chain queries
- **Multiple Options**: Query via GraphQL, gRPC, or even SQL

## How It Works (Simplified)

1. **Monitor**: Torii tracks your deployed World contract on Starknet
2. **Capture**: It records every state change (e.g., new player spawns or moves)
3. **Store**: Saves data in a local database for easy access
4. **Serve**: Exposes APIs for your client apps to read the data

No manual intervention—Torii runs in the background when you deploy or migrate your Dojo project.

## API Interfaces

- **GraphQL**: Flexible for custom queries and real-time subscriptions
  - Local Development: `http://localhost:8080/graphql`
  - Production (Cartridge): `https://api.cartridge.gg/x/YOUR_INSTANCE_NAME/torii/graphql`
- **gRPC**: Fast binary protocol for high-performance apps
  - Local Development: `http://localhost:8080`
  - Production (Cartridge): `https://api.cartridge.gg/x/YOUR_INSTANCE_NAME/torii`

### URL Configuration

For production deployments, you'll typically configure your Torii URL in your client:

```javascript
// Example configuration
const TORII_URL = dojoConfig.toriiUrl + "/graphql";
// Results in: https://api.cartridge.gg/x/YOUR_INSTANCE_NAME/torii/graphql
```

## When to Use Torii

- Fetching player stats (e.g., position, score)
- Building leaderboards or dashboards
- Real-time updates in games (e.g., multiplayer sync)
- Analyzing historical data without blockchain delays

## Installation Note

Torii is included by default with Dojo. Install Dojo via the official guide, and Torii is ready to go. Run `torii --world <WORLD_ADDRESS>` to start it manually if needed.

## Next Steps

- See the [Local Development](../local.md) guide for setup
- Check [Client Integration](./client-integration.md) for using Torii in apps
- For advanced config, visit the [official Dojo docs](https://book.dojoengine.org/toolchain/torii)

This overview keeps things simple—dive deeper as you build!
