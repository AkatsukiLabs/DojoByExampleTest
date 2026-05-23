# Performance Optimization

Learn how to optimize Torii data fetching performance with caching strategies, request batching, and other optimization techniques.

## ⚡ Performance Overview

Performance optimization is crucial for smooth user experiences. This guide covers:

- Caching strategies with TTL
- Request batching and deduplication
- Memory management
- Query optimization
- Performance monitoring

## 🗄️ Caching Strategies

### Basic Cache Implementation

```typescript
// src/utils/cache.ts

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class ToriiCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 30000; // 30 seconds

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const toriiCache = new ToriiCache();
```

### Cached Fetch Function

```typescript
// Cached fetch function
export const cachedToriiFetch = async (
  query: string, 
  variables: any, 
  cacheKey: string,
  ttl: number = 30000
) => {
  // Check cache first
  const cached = toriiCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from Torii
  const data = await toriiFetch(query, variables);
  
  // Cache the result
  toriiCache.set(cacheKey, data, ttl);
  
  return data;
};
```

### Advanced Cache with LRU

```typescript
// src/utils/advancedCache.ts

class LRUCache<K, V> {
  private capacity: number;
  private cache = new Map<K, V>();

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Advanced cache with LRU and TTL
class AdvancedToriiCache {
  private cache = new LRUCache<string, CacheEntry>(100); // Max 100 entries
  private defaultTTL = 30000;

  set(key: string, data: any, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }
}

export const advancedToriiCache = new AdvancedToriiCache();
```

## 🎣 Optimized Hooks

### Hook with Caching

```typescript
// src/hooks/usePlayerOptimized.ts
import { useCallback } from 'react';
import { cachedToriiFetch } from '../utils/cache';

export const usePlayerOptimized = () => {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useAccount();

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

  const fetchData = useCallback(async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `player-${account.address}`;
      
      const data = await cachedToriiFetch(
        PLAYER_QUERY,
        { playerOwner: account.address },
        cacheKey,
        15000 // 15 second cache
      );

      if (data.fullStarterReactPlayerModels?.edges?.[0]?.node) {
        setPlayer(convertHexValues(data.fullStarterReactPlayerModels.edges[0].node));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { player, isLoading, error, refetch: fetchData };
};
```

## 🔄 Request Batching

### Batch Multiple Queries

```typescript
// src/utils/batchQueries.ts

interface BatchQuery {
  query: string;
  variables: any;
  cacheKey: string;
}

export const batchToriiQueries = async (queries: BatchQuery[]) => {
  // Group queries by cache key to avoid duplicates
  const uniqueQueries = queries.filter((query, index, self) => 
    index === self.findIndex(q => q.cacheKey === query.cacheKey)
  );

  // Check cache for all queries first
  const cachedResults = new Map<string, any>();
  const uncachedQueries: BatchQuery[] = [];

  for (const query of uniqueQueries) {
    const cached = toriiCache.get(query.cacheKey);
    if (cached) {
      cachedResults.set(query.cacheKey, cached);
    } else {
      uncachedQueries.push(query);
    }
  }

  // Fetch uncached queries in parallel
  if (uncachedQueries.length > 0) {
    const fetchPromises = uncachedQueries.map(async (query) => {
      const data = await toriiFetch(query.query, query.variables);
      toriiCache.set(query.cacheKey, data);
      return { cacheKey: query.cacheKey, data };
    });

    const results = await Promise.all(fetchPromises);
    results.forEach(({ cacheKey, data }) => {
      cachedResults.set(cacheKey, data);
    });
  }

  // Return results in original order
  return queries.map(query => cachedResults.get(query.cacheKey));
};
```

### Hook with Batching

```typescript
// src/hooks/usePlayerBatch.ts
import { batchToriiQueries } from '../utils/batchQueries';

export const usePlayerBatch = () => {
  const [playerData, setPlayerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { account } = useAccount();

  const fetchBatchData = async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queries = [
        {
          query: PLAYER_QUERY,
          variables: { playerOwner: account.address },
          cacheKey: `player-${account.address}`
        }
      ];

      const [playerData] = await batchToriiQueries(queries);
      
      setPlayerData({
        player: playerData?.fullStarterReactPlayerModels?.edges[0]?.node
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchData();
  }, [account?.address]);

  return { playerData, isLoading, error, refetch: fetchBatchData };
};
```

## 📊 Performance Monitoring

### Performance Metrics

```typescript
// src/utils/performance.ts

interface PerformanceMetrics {
  queryTime: number;
  cacheHit: boolean;
  dataSize: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  getAverageQueryTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.queryTime, 0);
    return total / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cacheHit).length;
    return hits / this.metrics.length;
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### Instrumented Fetch Function

```typescript
// Instrumented fetch with performance monitoring
export const instrumentedToriiFetch = async (
  query: string, 
  variables: any, 
  cacheKey: string
) => {
  const startTime = performance.now();
  let cacheHit = false;

  try {
    // Check cache first
    const cached = toriiCache.get(cacheKey);
    if (cached) {
      cacheHit = true;
      const queryTime = performance.now() - startTime;
      
      performanceMonitor.recordMetric({
        queryTime,
        cacheHit: true,
        dataSize: JSON.stringify(cached).length,
        timestamp: Date.now()
      });

      return cached;
    }

    // Fetch from Torii
    const data = await toriiFetch(query, variables);
    
    // Cache the result
    toriiCache.set(cacheKey, data);
    
    const queryTime = performance.now() - startTime;
    
    performanceMonitor.recordMetric({
      queryTime,
      cacheHit: false,
      dataSize: JSON.stringify(data).length,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    const queryTime = performance.now() - startTime;
    
    performanceMonitor.recordMetric({
      queryTime,
      cacheHit: false,
      dataSize: 0,
      timestamp: Date.now()
    });

    throw error;
  }
};
```

## 🎯 Query Optimization

### Optimized GraphQL Queries

```typescript
// Optimize queries by selecting only needed fields
const OPTIMIZED_POSITION_QUERY = `
  query GetPlayerPosition($playerOwner: ContractAddress!) {
    fullStarterReactPositionModels(where: { player: $playerOwner }) {
      edges {
        node {
          player
          x
          y
          # Only select fields you actually use
        }
      }
    }
  }
`;

// Use pagination for large datasets
const PAGINATED_PLAYERS_QUERY = `
  query GetPlayers($first: Int!, $after: String) {
    fullStarterReactPlayerModels(
      first: $first,
      after: $after,
      orderBy: "experience",
      orderDirection: "desc"
    ) {
      edges {
        node {
          owner
          experience
          health
          coins
          creation_day
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
```

### Query Deduplication

```typescript
// Prevent duplicate queries
class QueryDeduplicator {
  private pendingQueries = new Map<string, Promise<any>>();

  async execute<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    if (this.pendingQueries.has(key)) {
      return this.pendingQueries.get(key)!;
    }

    const promise = queryFn().finally(() => {
      this.pendingQueries.delete(key);
    });

    this.pendingQueries.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pendingQueries.clear();
  }
}

export const queryDeduplicator = new QueryDeduplicator();

// Usage
const fetchPlayerData = async (playerAddress: string) => {
  return queryDeduplicator.execute(
    `player-${playerAddress}`,
    () => toriiFetch(POSITION_QUERY, { playerOwner: playerAddress })
  );
};
```

## 🚀 Memory Management

### Memory-Efficient Cache

```typescript
// Memory-efficient cache with size limits
class MemoryEfficientCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private maxMemoryUsage: number;

  constructor(maxSize: number = 100, maxMemoryUsage: number = 10 * 1024 * 1024) { // 10MB
    this.maxSize = maxSize;
    this.maxMemoryUsage = maxMemoryUsage;
  }

  set(key: string, data: any, ttl: number = 30000) {
    // Check memory usage
    const currentMemory = this.getMemoryUsage();
    const newEntrySize = JSON.stringify(data).length;

    if (currentMemory + newEntrySize > this.maxMemoryUsage) {
      this.evictOldest();
    }

    // Check size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private evictOldest() {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private getMemoryUsage(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += JSON.stringify(entry.data).length;
    }
    return total;
  }

  // ... other methods same as basic cache
}

export const memoryEfficientCache = new MemoryEfficientCache();
```

## 📋 Performance Best Practices

### 1. Use Appropriate Cache TTL

```typescript
// ✅ Good: Use different TTLs for different data types
const CACHE_TTL = {
  POSITION: 5000,    // 5 seconds - frequently updated
  MOVES: 15000,      // 15 seconds - moderately updated
  LEADERBOARD: 60000 // 1 minute - rarely updated
};

// ❌ Avoid: Same TTL for all data
const CACHE_TTL = 30000; // Same for everything
```

### 2. Implement Request Batching

```typescript
// ✅ Good: Batch multiple queries
const [player] = await batchToriiQueries([
  { query: PLAYER_QUERY, variables: { playerOwner }, cacheKey: `player-${playerOwner}` }
]);

// ❌ Avoid: Separate requests
const player = await toriiFetch(PLAYER_QUERY, { playerOwner });
```

### 3. Monitor Performance

```typescript
// ✅ Good: Monitor and optimize based on metrics
const avgQueryTime = performanceMonitor.getAverageQueryTime();
const cacheHitRate = performanceMonitor.getCacheHitRate();

if (avgQueryTime > 1000) {
  console.warn('Slow queries detected');
}

if (cacheHitRate < 0.5) {
  console.warn('Low cache hit rate');
}

// ❌ Avoid: No performance monitoring
// No visibility into performance issues
```

## 📚 Next Steps

1. **Add security measures** with the [Security](./security.md) guide
2. **Implement testing** using the [Testing](./testing.md) guide
3. **Deploy to production** with the [Production](./production.md) guide

---

**Back to**: [Torii Client Integration](../client-integration.md) | **Next**: [Security](./security.md)
