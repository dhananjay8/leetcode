# Design a Distributed Cache System

## 1. Requirements

### Functional
- `GET(key)` → value, `SET(key, value, TTL)`
- `DELETE(key)`, support expiration
- High hit rate, consistent data

### Non-Functional
- Sub-millisecond latency
- High availability and fault tolerance
- Horizontally scalable

---

## 2. Architecture

```
Application Servers → Cache Client (consistent hashing)
                          ↓
              Cache Cluster (multiple nodes)
              [Node1] [Node2] [Node3] ...
                          ↓ (cache miss)
                      Database
```

---

## 3. Key Design Components

### A. Partitioning — Consistent Hashing
- Hash ring with virtual nodes
- Each key maps to the next node clockwise on the ring
- Adding/removing a node only remaps K/N keys (minimal disruption)
- Virtual nodes ensure even distribution

### B. Eviction Policies
| Policy | Description | Use Case |
|--------|-------------|----------|
| **LRU** | Least Recently Used | General purpose |
| **LFU** | Least Frequently Used | Frequency matters |
| **TTL** | Time-to-live expiration | Session data |
| **FIFO** | First In First Out | Simple |

### C. Cache Patterns

**Cache-Aside (Lazy Loading)**:
1. App checks cache → miss → query DB → write to cache → return
2. **Pros**: Only caches what's needed
3. **Cons**: Cache miss = slower, stale data possible

**Write-Through**:
1. App writes to cache AND DB simultaneously
2. **Pros**: Cache always consistent
3. **Cons**: Higher write latency

**Write-Behind (Write-Back)**:
1. Write to cache, async batch write to DB
2. **Pros**: Fast writes
3. **Cons**: Data loss risk if cache node dies

---

## 4. Replication & Fault Tolerance

- **Leader-Follower**: Write to leader, replicate to followers
- **Quorum reads/writes**: W + R > N for consistency
- **Failover**: Followers promote to leader on failure
- Redis Sentinel or Redis Cluster for automatic failover

---

## 5. Cache Invalidation Strategies

1. **TTL-based**: Auto-expire after set duration
2. **Event-driven**: Publish invalidation events on data change
3. **Version-based**: Append version to cache key

---

## 6. Common Problems & Solutions

| Problem | Solution |
|---------|----------|
| **Cache Stampede** | Locking (only 1 request rebuilds), stale-while-revalidate |
| **Hot Key** | Replicate hot key to multiple nodes, local cache |
| **Cold Start** | Pre-warm cache from DB |
| **Thundering Herd** | Jittered TTLs, request coalescing |

---

## 7. Technology Choices

- **Redis**: Feature-rich, pub/sub, Lua scripting, cluster mode
- **Memcached**: Simple, multi-threaded, good for simple key-value
- **Local Cache (L1)**: Caffeine/Guava as first layer, Redis as L2

---

## 8. Interview Talking Points
- Cache-aside is most common pattern
- Consistent hashing is essential for distributed caches
- Always discuss eviction, invalidation, and thundering herd
- Multi-layer caching: L1 (in-process) → L2 (Redis) → DB
