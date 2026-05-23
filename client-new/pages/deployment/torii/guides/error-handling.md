# Error Handling Strategies

Learn how to implement robust error handling for Torii GraphQL queries and Cairo model data fetching.

## 🛡️ Error Handling Overview

Proper error handling is crucial for production applications. This guide covers:

- GraphQL error handling
- Network error management
- Retry strategies with exponential backoff
- User-friendly error messages
- Error logging and monitoring

## 🔧 Custom Error Classes

### ToriiError Class

```typescript
// src/utils/errorHandling.ts

export class ToriiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ToriiError';
  }
}

// Specific error types
export class GraphQLError extends ToriiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'GRAPHQL_ERROR', details);
    this.name = 'GraphQLError';
  }
}

export class NetworkError extends ToriiError {
  constructor(message: string) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ToriiError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}
```

### Error Handler Utility

```typescript
// Comprehensive error handler
export const handleToriiError = (error: any): ToriiError => {
  if (error.response) {
    // GraphQL error response
    const { errors } = error.response.data;
    if (errors && errors.length > 0) {
      return new GraphQLError(
        errors[0].message,
        errors[0].extensions || {}
      );
    }
  }
  
  if (error.request) {
    // Network error
    return new NetworkError(
      'Network error: Unable to connect to Torii'
    );
  }
  
  // Generic error
  return new ToriiError(
    error.message || 'Unknown error occurred',
    500,
    'UNKNOWN_ERROR'
  );
};
```

## 🔄 Enhanced Fetch Function

### Torii Fetch with Error Handling

```typescript
// Enhanced fetch function with comprehensive error handling
export const toriiFetch = async (query: string, variables: any) => {
  try {
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new ToriiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new GraphQLError(
        result.errors[0].message,
        result.errors[0].extensions || {}
      );
    }

    return result.data;
  } catch (error) {
    throw handleToriiError(error);
  }
};
```

## 🔁 Retry Strategies

### Basic Retry Function

```typescript
// Basic retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};
```

### Advanced Retry with Conditions

```typescript
// Advanced retry with specific error conditions
export const retryWithConditions = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    retryableErrors?: string[];
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    retryableErrors = ['NETWORK_ERROR', 'TIMEOUT'],
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = retryableErrors.some(code => 
        error.code === code || error.message.includes(code)
      );

      if (attempt === maxAttempts || !isRetryable) {
        throw error;
      }

      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.1 * delay; // 10% jitter
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError!;
};
```

## 🎣 Hook with Error Handling

### Enhanced Hook with Retry

```typescript
// src/hooks/usePlayerWithErrorHandling.ts
import { useEffect, useState } from "react";
import { useAccount } from "@starknet-react/core";
import { toriiFetch, retryWithBackoff, ToriiError } from "../utils/errorHandling";

export const usePlayerWithErrorHandling = () => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { account } = useAccount();

  const fetchData = async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await retryWithBackoff(
        () => toriiFetch(PLAYER_QUERY, { playerOwner: account.address }),
        3, // max attempts
        1000 // base delay
      );

      const playerData = data?.fullStarterReactPlayerModels?.edges[0]?.node;
      setPlayer(playerData);
      setRetryCount(0);
    } catch (err) {
      setError(err);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [account?.address]);

  const refetch = () => {
    setRetryCount(0);
    fetchData();
  };

  return { 
    player, 
    isLoading, 
    error, 
    retryCount,
    refetch 
  };
};
```

## 🎮 Component Error Handling

### Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Component with Error States

```typescript
// src/components/PlayerInfoWithErrors.tsx
import React from 'react';
import { usePlayerWithErrorHandling } from '../hooks/usePlayerWithErrorHandling';
import { ToriiError } from '../utils/errorHandling';

export const PlayerInfoWithErrors: React.FC = () => {
  const { player, isLoading, error, retryCount, refetch } = usePlayerWithErrorHandling();

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading player data...</div>
        {retryCount > 0 && (
          <div>Retry attempt {retryCount}/3</div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Player Data</h3>
        
        {error instanceof ToriiError ? (
          <div>
            <p><strong>Error:</strong> {error.message}</p>
            {error.code && <p><strong>Code:</strong> {error.code}</p>}
            {error.status && <p><strong>Status:</strong> {error.status}</p>}
          </div>
        ) : (
          <p>An unexpected error occurred</p>
        )}

        <div className="error-actions">
          <button onClick={refetch}>Retry</button>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Player Information</h2>
      {player && (
        <div>
          <h3>Player Stats</h3>
          <p>Owner: {player.owner}</p>
          <p>Experience: {player.experience}</p>
          <p>Health: {player.health}</p>
          <p>Coins: {player.coins}</p>
          <p>Creation Day: {player.creation_day}</p>
        </div>
      )}
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
```

## 📊 Error Monitoring

### Error Logger

```typescript
// src/utils/errorLogger.ts

interface ErrorLog {
  timestamp: string;
  error: string;
  code?: string;
  status?: number;
  details?: any;
  userAgent: string;
  url: string;
}

export const logError = (error: ToriiError, context?: any) => {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    code: error.code,
    status: error.status,
    details: { ...error.details, ...context },
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Torii Error:', errorLog);
  }

  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Sentry, LogRocket, etc.
    // errorTrackingService.captureException(error, errorLog);
  }
};
```

### Error Tracking Hook

```typescript
// src/hooks/useErrorTracking.ts
import { useEffect } from 'react';
import { logError } from '../utils/errorLogger';

export const useErrorTracking = (error: ToriiError | null, context?: any) => {
  useEffect(() => {
    if (error) {
      logError(error, context);
    }
  }, [error, context]);
};
```

## 🎯 Error Recovery Strategies

### Graceful Degradation

```typescript
// Hook with graceful degradation
export const usePlayerWithFallback = () => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const { account } = useAccount();

  const fetchData = async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await toriiFetch(PLAYER_QUERY, { playerOwner: account.address });
      const playerData = data?.fullStarterReactPlayerModels?.edges[0]?.node;
      setPlayer(playerData);
      setUseFallback(false);
    } catch (err) {
      setError(err);
      
      // Use fallback data if available
      if (localStorage.getItem('playerData')) {
        const fallbackData = JSON.parse(localStorage.getItem('playerData')!);
        setPlayer(fallbackData);
        setUseFallback(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save successful data for fallback
  useEffect(() => {
    if (player && !useFallback) {
      localStorage.setItem('playerData', JSON.stringify(player));
    }
  }, [player, useFallback]);

  return { player, isLoading, error, useFallback, refetch: fetchData };
};
```

## 📋 Error Handling Best Practices

### 1. Use Specific Error Types

```typescript
// ✅ Good: Use specific error types
try {
  const data = await toriiFetch(query, variables);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network issues
  } else if (error instanceof GraphQLError) {
    // Handle GraphQL errors
  } else {
    // Handle unknown errors
  }
}

// ❌ Avoid: Generic error handling
try {
  const data = await toriiFetch(query, variables);
} catch (error) {
  // Generic handling - not helpful
  console.error('Error:', error);
}
```

### 2. Implement Retry Logic

```typescript
// ✅ Good: Implement retry with backoff
const data = await retryWithBackoff(
  () => toriiFetch(query, variables),
  3, // max attempts
  1000 // base delay
);

// ❌ Avoid: Simple retry without backoff
for (let i = 0; i < 3; i++) {
  try {
    return await toriiFetch(query, variables);
  } catch (error) {
    if (i === 2) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### 3. Provide User-Friendly Messages

```typescript
// ✅ Good: User-friendly error messages
const getErrorMessage = (error: ToriiError) => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection.';
    case 'GRAPHQL_ERROR':
      return 'There was an issue with your request. Please try again.';
    case 'VALIDATION_ERROR':
      return 'Invalid data provided. Please check your input.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// ❌ Avoid: Technical error messages
const getErrorMessage = (error: ToriiError) => {
  return error.message; // Too technical for users
};
```

## 📚 Next Steps

1. **Optimize performance** with the [Performance](./performance.md) guide
2. **Add security measures** with the [Security](./security.md) guide
3. **Implement testing** using the [Testing](./testing.md) guide

---

**Back to**: [Torii Client Integration](../client-integration.md) | **Next**: [Performance](./performance.md)
