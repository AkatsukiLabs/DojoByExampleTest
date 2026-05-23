# Custom Hooks for Torii

Learn how to create custom React hooks for fetching and managing Cairo model data from Torii.

## 🎣 Basic Hook Structure

### Simple Hook Example

```typescript
// src/hooks/usePlayer.ts
import { useEffect, useState, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { addAddressPadding } from "starknet";
import { dojoConfig } from "../dojo/dojoConfig";

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

    setIsLoading(true);
    setError(null);

    try {
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

  const refetch = () => {
    fetchData();
  };

  return { player, isLoading, error, refetch };
};
```

## 🔄 Multiple Model Hook

### Hook for Multiple Models

```typescript
// src/hooks/usePlayerState.ts
import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";

const PLAYER_STATE_QUERY = `
  query GetPlayerState($playerOwner: ContractAddress!) {
    player: fullStarterReactPlayerModels(where: { owner: $playerOwner }) {
      edges {
        node {
          owner
          experience
          health
          coins
          creation_day
        }
      }
    }
    # Add other model queries here as needed
  }
`;

export const usePlayerState = () => {
  const [playerState, setPlayerState] = useState({ player: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useAccount();

  // Helper to convert hex values to numbers
  const hexToNumber = (hexValue: string | number) => {
    if (typeof hexValue === 'number') return hexValue;
    if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
      return parseInt(hexValue, 16);
    }
    if (typeof hexValue === 'string') {
      return parseInt(hexValue, 10);
    }
    return 0;
  };

  const fetchPlayerState = async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: PLAYER_STATE_QUERY,
          variables: { playerOwner: account.address }
        })
      });

      const result = await response.json();
      
      const rawPlayerData = result.data?.player?.edges[0]?.node;
      const playerData = rawPlayerData ? {
        owner: rawPlayerData.owner,
        experience: hexToNumber(rawPlayerData.experience),
        health: hexToNumber(rawPlayerData.health),
        coins: hexToNumber(rawPlayerData.coins),
        creation_day: hexToNumber(rawPlayerData.creation_day)
      } : null;

      setPlayerState({ player: playerData });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerState();
  }, [account?.address]);

  return { playerState, isLoading, error, refetch: fetchPlayerState };
};
```

## 🎯 Enhanced Hook with Data Conversion

### Hook with Hex Conversion

```typescript
// src/hooks/usePlayerEnhanced.ts
import { useEffect, useState, useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { addAddressPadding } from "starknet";
import { dojoConfig } from "../dojo/dojoConfig";

interface Player {
  owner: string;
  experience: number;
  health: number;
  coins: number;
  creation_day: number;
}

// Data conversion utilities
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

const formatAddress = (address: string) => {
  return address.toLowerCase();
};

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
    }
  }
`;

export const usePlayerEnhanced = () => {
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

    setIsLoading(true);
    setError(null);

    try {
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
      
      // Convert hex values to numbers and format data
      const playerData: Player = {
        owner: formatAddress(rawPlayerData.owner),
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

  const refetch = () => {
    fetchData();
  };

  return { player, isLoading, error, refetch };
};
```

## 📊 List Hook Pattern

### Hook for Lists and Leaderboards

```typescript
// src/hooks/useLeaderboard.ts
import { useEffect, useState } from "react";

const LEADERBOARD_QUERY = `
  query GetTopPlayers($limit: Int!) {
    fullStarterReactMovesModels(
      first: $limit,
      orderBy: "remaining",
      orderDirection: "desc"
    ) {
      edges {
        node {
          player
          remaining
        }
      }
    }
  }
`;

export const useLeaderboard = (limit: number = 10) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: LEADERBOARD_QUERY,
          variables: { limit }
        })
      });

      const result = await response.json();
      const playersData = result.data?.fullStarterReactMovesModels?.edges || [];
      
      // Convert hex values
      const convertedPlayers = playersData.map(({ node }: any) => ({
        ...node,
        remaining: hexToNumber(node.remaining),
        player: formatAddress(node.player)
      }));

      setPlayers(convertedPlayers);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  return { players, isLoading, error, refetch: fetchLeaderboard };
};
```

## 🔄 Auto-Refetch Hook

### Hook with Auto-Refetch on Changes

```typescript
// src/hooks/usePlayerAutoRefetch.ts
import { useEffect, useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";

export const usePlayerAutoRefetch = (refetchInterval: number = 5000) => {
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useAccount();

  const fetchData = useCallback(async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: POSITION_QUERY,
          variables: { playerOwner: account.address }
        })
      });

      const result = await response.json();
      const newPosition = result.data?.fullStarterReactPositionModels?.edges[0]?.node;
      
      // Only update if data has changed
      if (JSON.stringify(newPosition) !== JSON.stringify(position)) {
        setPosition(newPosition);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, position]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch on interval
  useEffect(() => {
    if (!account?.address) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, account?.address]);

  return { position, isLoading, error, refetch: fetchData };
};
```

## 🎮 Component Usage Examples

### Basic Component

```typescript
// src/components/PlayerInfo.tsx
import React from 'react';
import { usePlayer } from '../hooks/usePlayer';

export const PlayerInfo: React.FC = () => {
  const { position, isLoading, error, refetch } = usePlayer();

  if (isLoading) {
    return <div>Loading player data...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Player Information</h2>
      {position && (
        <div>
          <h3>Position</h3>
          <p>X: {position.x}</p>
          <p>Y: {position.y}</p>
        </div>
      )}
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
```

### Enhanced Component

```typescript
// src/components/PlayerInfoEnhanced.tsx
import React from 'react';
import { usePlayerEnhanced } from '../hooks/usePlayerEnhanced';

export const PlayerInfoEnhanced: React.FC = () => {
  const { position, moves, isLoading, error, refetch } = usePlayerEnhanced();

  if (isLoading) {
    return <div>Loading player data...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Player Information</h2>
      {position && (
        <div>
          <h3>Position</h3>
          <p>X: {position.x} (converted from hex)</p>
          <p>Y: {position.y} (converted from hex)</p>
        </div>
      )}
      {moves && (
        <div>
          <h3>Moves</h3>
          <p>Remaining: {moves.remaining} (converted from hex)</p>
        </div>
      )}
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
```

## 📋 Hook Best Practices

### 1. Use useCallback for Fetch Functions

```typescript
const fetchData = useCallback(async () => {
  // ... fetch logic
}, [account?.address]); // Include dependencies
```

### 2. Handle Loading States Properly

```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

// Always set loading to false in finally block
try {
  // ... fetch logic
} catch (err) {
  setError(err.message);
} finally {
  setIsLoading(false);
}
```

### 3. Provide Refetch Function

```typescript
const refetch = () => {
  fetchData();
};

return { data, isLoading, error, refetch };
```

### 4. Use Proper Dependencies

```typescript
useEffect(() => {
  fetchData();
}, [account?.address]); // Only depend on what you actually use
```

## 🎯 Hook Patterns Summary

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Basic Hook** | Simple data fetching | `usePlayer()` |
| **Multiple Model** | Complex state | `usePlayerState()` |
| **Enhanced Hook** | With data conversion | `usePlayerEnhanced()` |
| **List Hook** | Collections and lists | `useLeaderboard()` |
| **Auto-Refetch** | Real-time updates | `usePlayerAutoRefetch()` |

## 📚 Next Steps

1. **Learn data conversion** in the [Data Conversion](./data-conversion.md) guide
2. **Implement error handling** using the [Error Handling](./error-handling.md) guide
3. **Optimize performance** with the [Performance](./performance.md) guide

---

**Back to**: [Torii Client Integration](../client-integration.md) | **Next**: [Data Conversion](./data-conversion.md)
