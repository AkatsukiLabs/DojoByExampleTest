# Data Conversion Utilities

Learn how to convert Cairo model data types (hex values, addresses, enums) to JavaScript-friendly formats.

## 🔧 Hex to Number Conversion

### Basic Hex Conversion

```typescript
// src/utils/dataConversion.ts

// Convert Cairo u32/u64 hex values to JavaScript numbers
export const hexToNumber = (hexValue: string | number) => {
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  return Number(hexValue);
};

// Usage examples
const examples = {
  u32: hexToNumber('0xa'), // 10
  u64: hexToNumber('0x64'), // 100
  string: hexToNumber('42'), // 42 (already a number)
  invalid: hexToNumber('invalid'), // NaN
};
```

### Safe Hex Conversion

```typescript
// Safe conversion with fallback
export const safeHexToNumber = (hexValue: string | number, fallback: number = 0) => {
  try {
    const result = hexToNumber(hexValue);
    return isNaN(result) ? fallback : result;
  } catch {
    return fallback;
  }
};

// Usage with player data
const player = {
  experience: safeHexToNumber(rawPlayer.experience, 0),
  health: safeHexToNumber(rawPlayer.health, 100),
  coins: safeHexToNumber(rawPlayer.coins, 0),
  creation_day: safeHexToNumber(rawPlayer.creation_day, 0)
};
```

## 🎯 Address Formatting

### ContractAddress Utilities

```typescript
// Format ContractAddress for consistent queries
export const formatAddress = (address: string) => {
  if (!address) return '';
  return address.toLowerCase().trim();
};

// Validate Starknet address format
export const validateContractAddress = (address: string): boolean => {
  if (!address) return false;
  const addressRegex = /^0x[a-fA-F0-9]{63}$/;
  return addressRegex.test(address);
};

// Sanitize address for queries
export const sanitizeAddress = (address: string): string => {
  const formatted = formatAddress(address);
  if (!validateContractAddress(formatted)) {
    throw new Error(`Invalid contract address: ${address}`);
  }
  return formatted;
};
```

## 🎲 Cairo Enum Handling

### Direction Enum Conversion

```typescript
// Handle Cairo enum types (e.g., Direction enum)
export const parseDirection = (directionValue: string | number) => {
  const value = hexToNumber(directionValue);
  switch (value) {
    case 0: return 'None';
    case 1: return 'Left';
    case 2: return 'Right';
    case 3: return 'Up';
    case 4: return 'Down';
    default: return 'Unknown';
  }
};

// Reverse mapping
export const directionToNumber = (direction: string): number => {
  switch (direction.toLowerCase()) {
    case 'none': return 0;
    case 'left': return 1;
    case 'right': return 2;
    case 'up': return 3;
    case 'down': return 4;
    default: return 0;
  }
};
```

### Generic Enum Parser

```typescript
// Generic enum parser
export const parseEnum = (enumValue: string | number, enumMap: Record<number, string>) => {
  const value = hexToNumber(enumValue);
  return enumMap[value] || 'Unknown';
};

// Usage
const gameStateEnum = {
  0: 'Idle',
  1: 'Playing',
  2: 'Paused',
  3: 'GameOver'
};

const state = parseEnum('0x1', gameStateEnum); // 'Playing'
```

## 🔄 Bulk Data Conversion

### Convert Multiple Hex Values

```typescript
// Convert multiple hex values in an object
export const convertHexValues = (obj: any) => {
  const converted = { ...obj };
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('0x')) {
      converted[key] = hexToNumber(value);
    }
  }
  return converted;
};

// Usage with player data
const rawPlayer = {
  owner: '0x1234567890abcdef',
  experience: '0x64',
  health: '0x32',
  coins: '0x1e',
  creation_day: '0x5'
};

const player = convertHexValues(rawPlayer);
// Result: { owner: '0x1234567890abcdef', experience: 100, health: 50, coins: 30, creation_day: 5 }
```

### Convert Array of Objects

```typescript
// Convert hex values in array of objects
export const convertArrayHexValues = (array: any[]) => {
  return array.map(item => convertHexValues(item));
};

// Usage with player data
const rawPlayers = [
  { owner: '0x123...', experience: '0x64', health: '0x32', coins: '0x1e', creation_day: '0x5' },
  { owner: '0x456...', experience: '0x32', health: '0x64', coins: '0x14', creation_day: '0x3' }
];

const players = convertArrayHexValues(rawPlayers);
// Result: [{ owner: '0x123...', experience: 100, health: 50, coins: 30, creation_day: 5 }, { owner: '0x456...', experience: 50, health: 100, coins: 20, creation_day: 3 }]
```

## 🎯 Type-Safe Conversion

### TypeScript Interfaces

```typescript
// Define types for Cairo model data
interface RawPlayer {
  owner: string;
  experience: string;
  health: string;
  coins: string;
  creation_day: string;
}

interface ConvertedPlayer {
  owner: string;
  experience: number;
  health: number;
  coins: number;
  creation_day: number;
}

// Type-safe conversion function
export const convertPlayer = (raw: RawPlayer): ConvertedPlayer => {
  return {
    owner: formatAddress(raw.owner),
    experience: hexToNumber(raw.experience),
    health: hexToNumber(raw.health),
    coins: hexToNumber(raw.coins),
    creation_day: hexToNumber(raw.creation_day)
  };
};

// Usage
const rawPlayer: RawPlayer = {
  owner: '0x1234567890abcdef',
  experience: '0x64',
  health: '0x32',
  coins: '0x1e',
  creation_day: '0x5'
};

const player: ConvertedPlayer = convertPlayer(rawPlayer);
```

### Generic Type Converter

```typescript
// Generic type converter
export const createConverter = <T extends Record<string, any>, U extends Record<string, any>>(
  conversionMap: Record<keyof T, (value: any) => any>
) => {
  return (data: T): U => {
    const converted = {} as U;
    for (const [key, converter] of Object.entries(conversionMap)) {
      converted[key as keyof U] = converter(data[key as keyof T]);
    }
    return converted;
  };
};

// Usage
const playerConverter = createConverter<RawPlayer, ConvertedPlayer>({
  owner: formatAddress,
  experience: hexToNumber,
  health: hexToNumber,
  coins: hexToNumber,
  creation_day: hexToNumber
});

const player = playerConverter(rawPlayer);
```

## 🛡️ Error Handling

### Safe Conversion with Error Handling

```typescript
// Safe conversion with detailed error handling
export const safeConvert = <T>(converter: (value: any) => T, value: any, fieldName: string): T => {
  try {
    return converter(value);
  } catch (error) {
    console.error(`Error converting ${fieldName}:`, error);
    throw new Error(`Failed to convert ${fieldName}: ${error.message}`);
  }
};

// Usage
const position = {
  x: safeConvert(hexToNumber, rawPosition.x, 'x'),
  y: safeConvert(hexToNumber, rawPosition.y, 'y'),
  player: safeConvert(formatAddress, rawPosition.player, 'player')
};
```

### Validation Utilities

```typescript
// Validate converted data
export const validatePosition = (position: any): boolean => {
  return (
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    validateContractAddress(position.player)
  );
};

// Usage
const convertedPosition = convertPosition(rawPosition);
if (!validatePosition(convertedPosition)) {
  throw new Error('Invalid position data');
}
```

## 🎮 Hook Integration

### Hook with Data Conversion

```typescript
// src/hooks/usePlayerWithConversion.ts
import { convertPosition, validatePosition } from '../utils/dataConversion';

export const usePlayerWithConversion = () => {
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useAccount();

  const fetchData = async () => {
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
          query: POSITION_QUERY,
          variables: { playerOwner: account.address }
        })
      });

      const result = await response.json();
      const rawPosition = result.data?.fullStarterReactPositionModels?.edges[0]?.node;
      
      if (rawPosition) {
        const convertedPosition = convertPosition(rawPosition);
        if (validatePosition(convertedPosition)) {
          setPosition(convertedPosition);
        } else {
          throw new Error('Invalid position data received');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [account?.address]);

  return { position, isLoading, error, refetch: fetchData };
};
```

## 📋 Best Practices

### 1. Always Convert Hex Values

```typescript
// ✅ Good: Convert hex values
const position = {
  x: hexToNumber(rawPosition.x),
  y: hexToNumber(rawPosition.y)
};

// ❌ Avoid: Using raw hex values
const position = {
  x: rawPosition.x, // Still hex string
  y: rawPosition.y  // Still hex string
};
```

### 2. Validate Addresses

```typescript
// ✅ Good: Validate addresses
const player = sanitizeAddress(rawPosition.player);

// ❌ Avoid: Using raw addresses
const player = rawPosition.player; // May be invalid
```

### 3. Handle Conversion Errors

```typescript
// ✅ Good: Handle conversion errors
try {
  const position = convertPosition(rawPosition);
} catch (error) {
  console.error('Conversion failed:', error);
  // Handle gracefully
}

// ❌ Avoid: Ignoring conversion errors
const position = convertPosition(rawPosition); // May throw
```

## 📚 Next Steps

1. **Implement error handling** using the [Error Handling](./error-handling.md) guide
2. **Optimize performance** with the [Performance](./performance.md) guide
3. **Add security measures** with the [Security](./security.md) guide

---

**Back to**: [Torii Client Integration](../client-integration.md) | **Next**: [Error Handling](./error-handling.md)
