# Design an API Rate Limiter

## 1. Requirements

### Functional
- Limit number of requests a client can make in a time window
- Support different rate limits per API, user, or IP
- Return 429 Too Many Requests when limit exceeded

### Non-Functional
- Low latency (should not add >5ms to request)
- Highly available, distributed across multiple servers
- Accurate counting even under high concurrency

---

## 2. Rate Limiting Algorithms

### A. Token Bucket (Most Popular)
- Bucket holds max N tokens, refills at rate R tokens/sec
- Each request consumes 1 token; rejected if empty
- **Pros**: Allows bursts, smooth rate limiting
- **Cons**: Memory per user

### B. Sliding Window Log
- Store timestamp of each request in a sorted set
- Count requests in the last window; reject if over limit
- **Pros**: Very accurate
- **Cons**: High memory (stores every timestamp)

### C. Sliding Window Counter
- Hybrid: split time into fixed windows, weighted average
- `count = prev_window * overlap% + curr_window`
- **Pros**: Memory efficient, reasonably accurate
- **Cons**: Approximate

### D. Fixed Window Counter
- Count requests per fixed time window (e.g., per minute)
- Reset counter at window boundary
- **Pros**: Simple
- **Cons**: Burst at window edges (2x limit)

### E. Leaky Bucket
- Requests enter a FIFO queue, processed at fixed rate
- Queue full → reject
- **Pros**: Smooth output rate
- **Cons**: Bursts get queued, increased latency

---

## 3. Architecture

```
Client → API Gateway / Load Balancer
              ↓
     Rate Limiter Middleware
              ↓ (check Redis)
     Redis Cluster (counters/tokens)
              ↓ (if allowed)
     Application Servers
```

### Redis Commands (Token Bucket)
```
-- Atomic Lua script for token bucket
local tokens = redis.call('GET', KEYS[1])
local last_refill = redis.call('GET', KEYS[2])
-- Calculate new tokens based on elapsed time
-- Deduct 1 token if available, else reject
```

---

## 4. Distributed Rate Limiting

### Challenge: Multiple servers need synchronized counts

**Options:**
1. **Centralized Redis**: All servers check single Redis cluster
2. **Sticky sessions**: Route user to same server (not ideal)
3. **Eventual consistency**: Each server tracks locally, sync periodically (allows slight overshoot)

**Best**: Centralized Redis with Lua scripts for atomic operations.

---

## 5. Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Algorithm | Token Bucket | Allows bursts, widely used |
| Storage | Redis | In-memory, atomic ops, fast |
| Granularity | Per user + per API | Flexible limits |
| Response | 429 + Retry-After header | Standard HTTP |
| Rules storage | Config DB / YAML | Easy to update |

---

## 6. Rate Limit Rules Example

```yaml
rules:
  - api: /api/messages
    limit: 5
    window: 1s
    key: user_id
  - api: /api/login
    limit: 5
    window: 5m
    key: ip_address
```

---

## 7. Interview Talking Points

- **Where to place**: API Gateway level (centralized) or middleware (per-service)
- **Handling rate limit headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Graceful degradation**: Queue instead of reject for internal services
- **Multi-region**: Per-region limits or global (trade-off: latency vs accuracy)
