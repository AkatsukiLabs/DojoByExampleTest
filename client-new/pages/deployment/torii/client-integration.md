# Torii Client Integration Guide

Learn how to consume Torii data from your React application using GraphQL queries and custom hooks. This guide provides practical examples for fetching game state, player data, and other onchain information efficiently from Dojo's Entity Component System (ECS) architecture.

## 🎯 Quick Start

### Prerequisites
- Torii indexer running with your deployed Dojo world
- React application with `@starknet-react/core` installed
- Deployed Cairo models and systems (e.g., Player model with experience, health, coins, creation_day)

### Basic Setup

1. **Install dependencies**:
```bash
npm install @starknet-react/core
```

2. **Configure environment variables**:
```bash
# .env.local
VITE_TORII_URL=http://localhost:8080
VITE_WORLD_ADDRESS=0x1234567890abcdef...
```

3. **Update dojoConfig**:
```typescript
// src/dojo/dojoConfig.ts
export const dojoConfig = createDojoConfig({
    manifest,
    toriiUrl: VITE_PUBLIC_TORII || '',
    // ... other config
});
```

4. **Create a basic hook**:
```typescript
// src/hooks/usePlayer.ts
import { useEffect, useState, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { addAddressPadding } from "starknet";
import { dojoConfig } from "../dojoConfig";

interface Player {
  owner: string;
  experience: number;
  health: number;
  coins: number;
  creation_day: number;
}

const TORII_URL = dojoConfig.toriiUrl + "/graphql";
const PLAYER_QUERY = `
  query GetPlayer($playerOwner: ContractAddress!) {
    fullStarterReactPlayerModels(where: { owner: $playerOwner }) {
      edges {
        node {
          owner
          experience
          health
          coins
          creation_day
        }
      }
      totalCount
    }
  }
`;

// Helper to convert hex values to numbers
const hexToNumber = (hexValue: string | number): number => {
  if (typeof hexValue === 'number') return hexValue;
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  return 0;
};

export const usePlayer = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();

  const userAddress = useMemo(() =>
    account ? addAddressPadding(account.address).toLowerCase() : '',
    [account]
  );

  const fetchData = async () => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: PLAYER_QUERY,
          variables: { playerOwner: userAddress }
        })
      });

      const result = await response.json();
      
      if (!result.data?.fullStarterReactPlayerModels?.edges?.length) {
        setPlayer(null);
        return;
      }

      const rawPlayerData = result.data.fullStarterReactPlayerModels.edges[0].node;
      const playerData: Player = {
        owner: rawPlayerData.owner,
        experience: hexToNumber(rawPlayerData.experience),
        health: hexToNumber(rawPlayerData.health),
        coins: hexToNumber(rawPlayerData.coins),
        creation_day: hexToNumber(rawPlayerData.creation_day)
      };

      setPlayer(playerData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchData();
    }
  }, [userAddress]);

  return { player, isLoading, error, refetch: fetchData };
};
```

## 📚 Detailed Guides

For comprehensive implementation details, explore these focused guides:

### 🔧 **Setup & Configuration**
- **[Basic Setup](./guides/setup.md)** - Environment configuration and dependencies
- **[GraphQL Queries](./guides/graphql-queries.md)** - Query patterns and model structure

### 🎣 **Implementation Patterns**
- **[Custom Hooks](./guides/custom-hooks.md)** - Hook patterns and state management
- **[Data Conversion](./guides/data-conversion.md)** - Hex to number utilities and type handling
- **[Error Handling](./guides/error-handling.md)** - Error management and retry strategies

### ⚡ **Advanced Features**
- **[Performance Optimization](./guides/performance.md)** - Caching and optimization strategies
- **[Security Best Practices](./guides/security.md)** - Address validation and sanitization
- **[Testing Strategies](./guides/testing.md)** - Hook testing and validation

### 🚀 **Production Deployment**
- **[Production Patterns](./guides/production.md)** - Environment-specific configurations
- **[Common Patterns](./guides/common-patterns.md)** - Multiple model queries and leaderboards

## 🎮 Quick Examples

### Basic Component Usage
```typescript
import { usePlayer } from '../hooks/usePlayer';

export const PlayerInfo = () => {
  const { player, isLoading, error, refetch } = usePlayer();

  if (isLoading) return <div>Loading player data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Player Stats</h2>
      {player ? (
        <div>
          <p>Owner: {player.owner}</p>
          <p>Experience: {player.experience}</p>
          <p>Health: {player.health}</p>
          <p>Coins: {player.coins}</p>
          <p>Creation Day: {player.creation_day}</p>
        </div>
      ) : (
        <p>No player data found</p>
      )}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

### Data Conversion
```typescript
// Convert hex values from Cairo models
const hexToNumber = (hexValue: string | number): number => {
  if (typeof hexValue === 'number') return hexValue;
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  return 0;
};

// Usage with player data
const player = {
  ...rawPlayerData,
  experience: hexToNumber(rawPlayerData.experience),
  health: hexToNumber(rawPlayerData.health),
  coins: hexToNumber(rawPlayerData.coins),
  creation_day: hexToNumber(rawPlayerData.creation_day)
};
```

## 🔗 Additional Resources

- **[Dojo Game Starter](https://github.com/AkatsukiLabs/Dojo-Game-Starter)** - Complete working example
- **[Torii Documentation](https://github.com/dojoengine/torii)** - Official Torii docs
- **[React Integration Overview](../guides/react/overview.md)** - React-specific patterns
- **[Dojo Configuration](../guides/react/dojo-config.md)** - Setup details

## 🎯 Next Steps

1. **Start with [Basic Setup](./guides/setup.md)** for configuration
2. **Learn [GraphQL Queries](./guides/graphql-queries.md)** for data fetching
3. **Implement [Custom Hooks](./guides/custom-hooks.md)** for state management
4. **Add [Error Handling](./guides/error-handling.md)** for reliability
5. **Optimize with [Performance](./guides/performance.md)** for production

---

**Need help?** Check out the [Common Issues](./guides/common-patterns.md#common-issues) section or explore the detailed guides above.
