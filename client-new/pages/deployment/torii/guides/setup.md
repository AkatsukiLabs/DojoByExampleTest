# Torii Setup & Configuration

Learn how to set up your React application to work with Torii's GraphQL interface for querying Dojo's on-chain game state.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Torii indexer running** with your deployed Dojo world
- **React application** with `@starknet-react/core` installed
- **Deployed Cairo models and systems** (e.g., Player model with experience, health, coins, creation_day)
- **Environment variables** configured for your network
- **Dojo world address** and contract manifest

## 📦 Required Dependencies

Install the necessary packages:

```bash
npm install @starknet-react/core
# or
pnpm add @starknet-react/core
```

## ⚙️ Environment Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
# Local Development
VITE_TORII_URL=http://localhost:8080
VITE_WORLD_ADDRESS=0x1234567890abcdef...

# Testnet (Sepolia)
VITE_TORII_URL=https://api.cartridge.gg/x/your-game/torii/graphql
VITE_WORLD_ADDRESS=0xabcdef1234567890...

# Production (Mainnet)
VITE_TORII_URL=https://api.cartridge.gg/x/your-game/torii/graphql
VITE_WORLD_ADDRESS=0x1234567890abcdef...
```

### Network-Specific Configuration

#### Local Development
```bash
VITE_PUBLIC_NODE_URL=http://localhost:5050
VITE_PUBLIC_TORII=http://localhost:8080
VITE_PUBLIC_MASTER_ADDRESS=0x123...abc
VITE_PUBLIC_MASTER_PRIVATE_KEY=0x456...def
```

#### Testnet (Sepolia)
```bash
VITE_PUBLIC_NODE_URL=https://api.cartridge.gg/x/starknet/sepolia
VITE_PUBLIC_TORII=https://api.cartridge.gg/x/your-game/torii/graphql
VITE_PUBLIC_MASTER_ADDRESS=0x123...abc
VITE_PUBLIC_MASTER_PRIVATE_KEY=0x456...def
```

#### Production (Mainnet)
```bash
VITE_PUBLIC_NODE_URL=https://api.cartridge.gg/x/starknet/mainnet
VITE_PUBLIC_TORII=https://api.cartridge.gg/x/your-game/torii/graphql
VITE_PUBLIC_MASTER_ADDRESS=
VITE_PUBLIC_MASTER_PRIVATE_KEY=
```

## 🔧 Dojo Configuration

### Basic Configuration

Update your `dojoConfig.js` to include Torii URL:

```typescript
// src/dojo/dojoConfig.ts
import { createDojoConfig } from "@dojoengine/core";
import { manifest } from "../config/manifest";

const {
    VITE_PUBLIC_NODE_URL,
    VITE_PUBLIC_TORII,
    VITE_PUBLIC_MASTER_ADDRESS,
    VITE_PUBLIC_MASTER_PRIVATE_KEY,
} = import.meta.env;

export const dojoConfig = createDojoConfig({
    manifest,
    masterAddress: VITE_PUBLIC_MASTER_ADDRESS || '',
    masterPrivateKey: VITE_PUBLIC_MASTER_PRIVATE_KEY || '',
    rpcUrl: VITE_PUBLIC_NODE_URL || '',
    toriiUrl: VITE_PUBLIC_TORII || '',
});
```

### Production-Safe Configuration

For production deployments, ensure master credentials are not included:

```typescript
// ✅ Production-safe configuration
export const dojoConfig = createDojoConfig({
    manifest,
    masterAddress: '', // Never include in production
    masterPrivateKey: '', // Never include in production
    rpcUrl: VITE_PUBLIC_NODE_URL || 'https://api.cartridge.gg/x/starknet/mainnet',
    toriiUrl: VITE_PUBLIC_TORII || 'https://api.cartridge.gg/x/your-game/torii/graphql',
});
```

## 🎯 Common Setup Issues

### Issue: "Can't connect to Torii"

**Solution**: Check your Torii URL and ensure the indexer is running.

```typescript
// Test Torii connection
const testConnection = async () => {
  try {
    const response = await fetch(`${dojoConfig.toriiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: "{ __schema { types { name } } }" 
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

### Issue: "GraphQL queries return empty results"

**Solution**: Verify your Cairo models are deployed and indexed.

```typescript
// Debug query to check if models exist
const DEBUG_QUERY = `
  query DebugModels {
    fullStarterReactPlayerModels(first: 1) {
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
```

### Issue: "Environment variables not loading"

**Solution**: Ensure your environment file is in the correct location and format.

```bash
# Check if variables are loaded
console.log('Torii URL:', import.meta.env.VITE_PUBLIC_TORII);
console.log('World Address:', import.meta.env.VITE_WORLD_ADDRESS);
```

## 🔒 Security Considerations

### Environment Variable Security

- **Never commit** `.env.local` files to version control
- **Use different values** for development, staging, and production
- **Validate URLs** before making requests
- **Sanitize addresses** before using in queries

### Address Validation

```typescript
// Basic Starknet address validation
const validateContractAddress = (address: string): boolean => {
  const addressRegex = /^0x[a-fA-F0-9]{63}$/;
  return addressRegex.test(address);
};

// Usage
if (!validateContractAddress(account.address)) {
  throw new Error('Invalid contract address');
}
```

## 📚 Next Steps

Once your setup is complete:

1. **Learn GraphQL queries** in the [GraphQL Queries](./graphql-queries.md) guide
2. **Create custom hooks** using the [Custom Hooks](./custom-hooks.md) guide
3. **Handle data conversion** with the [Data Conversion](./data-conversion.md) guide

---

**Back to**: [Torii Client Integration](../client-integration.md) | **Next**: [GraphQL Queries](./graphql-queries.md)
