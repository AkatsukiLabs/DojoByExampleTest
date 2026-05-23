---
title: "Torii Client Integration"
description: "Learn how to integrate Torii with your client applications using GraphQL and gRPC"
---

# Torii Client Integration

This guide shows you how to connect your client applications to Torii for efficient data querying and real-time updates.

## Configuration

### Environment Setup

First, configure your Torii URL based on your deployment environment:

```javascript
// config.js
const config = {
  development: {
    toriiUrl: "http://localhost:8080"
  },
  production: {
    toriiUrl: "https://api.cartridge.gg/x/YOUR_INSTANCE_NAME/torii"
  }
};

export const dojoConfig = config[process.env.NODE_ENV || 'development'];
```

### GraphQL Endpoint

```javascript
const TORII_GRAPHQL_URL = dojoConfig.toriiUrl + "/graphql";
```

## GraphQL Integration

### Basic Setup

```javascript
import { createClient } from '@urql/core';

const client = createClient({
  url: TORII_GRAPHQL_URL,
});

// Example query
const GET_PLAYERS = `
  query GetPlayers {
    players {
      id
      position {
        x
        y
      }
      score
    }
  }
`;

// Execute query
const result = await client.query(GET_PLAYERS).toPromise();
console.log(result.data.players);
```

### Real-time Subscriptions

```javascript
// Subscribe to player position updates
const PLAYER_POSITION_SUBSCRIPTION = `
  subscription PlayerPositionUpdates {
    playerPositionUpdated {
      id
      position {
        x
        y
      }
    }
  }
`;

const subscription = client.subscription(PLAYER_POSITION_SUBSCRIPTION)
  .subscribe({
    next: (result) => {
      console.log('Player moved:', result.data.playerPositionUpdated);
    },
    error: (error) => {
      console.error('Subscription error:', error);
    }
  });
```

## gRPC Integration

For high-performance applications, you can use gRPC:

```javascript
// Example with gRPC-Web
import { grpc } from '@improbable-eng/grpc-web';

const client = new grpc.Client(TORII_GRPC_URL);

// Define your service methods
const playerService = {
  getPlayers: (request) => {
    return client.unary(PlayerService.GetPlayers, request);
  }
};
```

## React Integration

### Custom Hook Example

```javascript
import { useEffect, useState } from 'react';
import { createClient } from '@urql/core';

const useToriiQuery = (query, variables = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = createClient({
      url: TORII_GRAPHQL_URL,
    });

    client.query(query, variables)
      .toPromise()
      .then(result => {
        setData(result.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [query, variables]);

  return { data, loading, error };
};

// Usage in component
const PlayerList = () => {
  const { data, loading, error } = useToriiQuery(GET_PLAYERS);

  if (loading) return <div>Loading players...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.players.map(player => (
        <div key={player.id}>
          Player {player.id}: ({player.position.x}, {player.position.y})
        </div>
      ))}
    </div>
  );
};
```

## Error Handling

```javascript
const handleToriiError = (error) => {
  if (error.networkError) {
    console.error('Network error:', error.networkError);
    // Handle connection issues
  } else if (error.graphQLErrors) {
    console.error('GraphQL errors:', error.graphQLErrors);
    // Handle query errors
  }
};
```

## Best Practices

1. **Connection Pooling**: Reuse client instances when possible
2. **Error Boundaries**: Implement proper error handling for network issues
3. **Caching**: Use appropriate caching strategies for frequently accessed data
4. **Subscriptions**: Clean up subscriptions when components unmount
5. **Environment Variables**: Use environment variables for different deployment URLs

## Next Steps

- Check the [Torii Overview](./overview.md) for more context
- See [Local Development](../local.md) for setup instructions
- Visit the [official Dojo docs](https://book.dojoengine.org/toolchain/torii) for advanced configuration
