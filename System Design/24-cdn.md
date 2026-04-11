# Design a CDN (Content Delivery Network)

## 1. Requirements
- Serve static content (images, videos, JS/CSS) with low latency globally
- Cache content at edge locations close to users
- Handle cache invalidation, origin failover

## 2. Architecture
```
User → DNS (GeoDNS) → Nearest Edge Server (PoP)
                             ↓ (cache miss)
                        Regional Shield → Origin Server (S3, your backend)
```

## 3. How It Works

### Request Flow
1. User requests `cdn.example.com/image.jpg`
2. **GeoDNS** resolves to nearest Point of Presence (PoP)
3. Edge server checks cache → **HIT**: return immediately (fastest)
4. **MISS**: request from **origin shield** (intermediate cache)
5. Shield MISS → fetch from **origin**, cache at shield + edge, return

### Caching Strategy
- **Cache-Control headers**: `max-age`, `s-maxage`, `no-cache`, `no-store`
- **Cache key**: URL + query params + Vary headers (Accept-Encoding)
- **TTL**: Static assets (long TTL, versioned filenames), API responses (short TTL)

### Cache Invalidation
- **Purge**: Delete specific URL from all edge caches
- **Versioned URLs**: `app.v2.3.js` — never need to invalidate
- **Soft purge**: Serve stale while revalidating from origin

## 4. Key Design Decisions
| Component | Design |
|-----------|--------|
| Routing | GeoDNS + Anycast IP |
| Cache | LRU eviction, tiered (L1 edge, L2 shield) |
| TLS | Terminate at edge, keep-alive to origin |
| Compression | Gzip/Brotli at edge |
| DDoS protection | Rate limiting + WAF at edge |

## 5. Interview Talking Points
- **Push vs Pull CDN**: Push = pre-upload; Pull = fetch on first request (pull is standard)
- **Origin shield** reduces load on origin by aggregating cache misses
- **Anycast**: Multiple servers share one IP, routing goes to nearest
- **Cache stampede**: When many requests hit edge simultaneously after cache expiry → lock + single origin fetch
