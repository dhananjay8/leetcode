# Design a URL Shortener (Bitly/TinyURL)

## 1. Requirements

### Functional
- Given a long URL, generate a short unique URL
- Redirect short URL to the original long URL
- Optional: custom short links, expiration, analytics

### Non-Functional
- Low latency redirects (<100ms)
- High availability (99.99%)
- Short URLs should not be guessable

### Scale Estimates
- 100M URLs created/day, 10:1 read:write ratio → 1B redirects/day
- ~12K writes/sec, ~120K reads/sec
- Storage: 100M × 500 bytes ≈ 50GB/day

---

## 2. API Design

```
POST /api/shorten
  Body: { "long_url": "https://...", "custom_alias": "optional", "expiry": "optional" }
  Response: { "short_url": "https://short.ly/abc123" }

GET /{short_code}
  Response: 301/302 Redirect to long_url
```

---

## 3. Database Schema

```
urls_table:
  - id (PK, bigint auto-increment)
  - short_code (unique, indexed, varchar(7))
  - long_url (text)
  - created_at (timestamp)
  - expires_at (timestamp, nullable)
  - user_id (FK, nullable)
```

---

## 4. Short Code Generation

### Option A: Base62 Encoding
- Take auto-increment ID → convert to Base62 (a-z, A-Z, 0-9)
- 7 chars → 62^7 ≈ 3.5 trillion unique URLs
- **Pros**: Simple, guaranteed unique
- **Cons**: Predictable/sequential

### Option B: MD5/SHA256 Hash + Truncate
- Hash the long URL → take first 7 chars of Base62-encoded hash
- **Pros**: Same URL always gets same short code
- **Cons**: Collision handling needed

### Option C: Pre-generated Key Service (KGS)
- Separate service generates random 7-char keys in advance
- Stores in DB: `used_keys` and `unused_keys` tables
- **Pros**: No collision at runtime, fast
- **Cons**: Added complexity

**Recommended**: KGS for production, Base62 for simplicity.

---

## 5. High-Level Architecture

```
Client → Load Balancer → API Servers → Cache (Redis) → Database (MySQL/Postgres)
                                    ↘ Key Generation Service (KGS)
```

### Read Flow (Redirect)
1. User hits `GET /abc123`
2. Check **Redis cache** for short_code → long_url mapping
3. Cache hit → 301 redirect
4. Cache miss → query DB → populate cache → redirect

### Write Flow (Shorten)
1. User sends `POST /api/shorten`
2. Get unused key from KGS
3. Store mapping in DB
4. Return short URL

---

## 6. Scaling Strategies

- **Cache**: Redis cluster with LRU eviction (cache top 20% hot URLs)
- **Database**: Master-slave replication (writes to master, reads from replicas)
- **Partitioning**: Range-based on first char of short_code, or consistent hashing
- **Rate Limiting**: Per-user rate limits to prevent abuse
- **CDN**: Edge caching for popular redirects

---

## 7. Key Interview Talking Points

- **301 vs 302 redirect**: 301 = permanent (browser caches), 302 = temporary (analytics-friendly)
- **Analytics**: Log each redirect async (Kafka → analytics pipeline)
- **Expiration**: Background job to purge expired URLs, return keys to KGS
- **Custom aliases**: Check uniqueness against DB before accepting
- **Availability**: Multi-region deployment, DNS-based routing
