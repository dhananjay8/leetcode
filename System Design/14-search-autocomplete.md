# Design a Search Autocomplete System

## 1. Requirements
- Return top-k suggestions as user types (prefix matching)
- Rank by popularity/relevance
- <100ms latency, handle millions of QPS

## 2. Architecture
```
User Types → API Gateway → Autocomplete Service → Trie (in-memory) / Cache
                                                        ↓
                                              Analytics Pipeline (update popularity)
```

## 3. Core Data Structure: Trie
- Each node stores: character, children, top-k suggestions
- Pre-compute top-k at each node (avoids runtime traversal)
- Example: node for "fa" stores ["facebook", "fandango", "fashion"]

### Trie Update
- Aggregate search queries (Kafka → count per time window)
- Rebuild trie periodically (every 15 min) from aggregated data
- Swap old trie with new (blue-green deployment)

## 4. Optimization
- **Caching**: Redis cache for common prefixes
- **Client-side**: Debounce (300ms), cache previous results
- **Filtering**: Remove inappropriate/offensive suggestions
- **Personalization**: Blend global popular + user's recent searches

## 5. Data Flow
```
1. User types "fa" → client debounces → sends request
2. Check Redis cache for "fa" → hit: return top-k
3. Cache miss → query Trie service → return + cache result
4. Background: Log query → Kafka → Aggregation → Trie rebuild
```

## 6. Interview Talking Points
- Trie with pre-computed top-k at each node is the key insight
- Don't query on every keystroke (debounce + client caching)
- Separate read path (serve from trie/cache) from write path (analytics → trie rebuild)
- Sharding tries by prefix range for scale
- Privacy: aggregate queries, don't store per-user searches in autocomplete
