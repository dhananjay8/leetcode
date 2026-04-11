# Design Instagram

## 1. Requirements

### Functional
- Upload photos/videos with captions
- Follow users, view feed
- Like, comment on posts
- Stories (24hr ephemeral content), Explore/Discover

### Non-Functional
- Highly available, eventual consistency acceptable
- Low latency image loading (CDN)
- Support 2B+ users, 100M+ photos uploaded/day

---

## 2. High-Level Architecture

```
Client → CDN (images/videos) → Load Balancer → API Gateway
                                                     ↓
              ┌──────────────────────────────────────┼──────────────┐
              ↓                ↓              ↓              ↓
         Post Service    Feed Service   User Service   Media Service
              ↓                ↓              ↓              ↓
          Post DB         Feed Cache      User DB       S3 + CDN
        (Cassandra)       (Redis)        (MySQL)
```

---

## 3. Core Components

### Media Upload Flow
1. Client requests pre-signed S3 URL from Media Service
2. Client uploads image/video directly to S3
3. Client sends metadata (caption, tags) to Post Service
4. Post Service stores metadata in DB
5. Async: Generate thumbnails (different sizes), push to CDN
6. Fan-out to followers' feeds

### Feed Generation (Same as Twitter hybrid)
- Fan-out on write for regular users
- Fan-out on read for celebrities
- Redis sorted sets for pre-computed feeds

---

## 4. Data Models

```
users:    id, username, bio, avatar_url, followers_count, following_count
posts:    id, user_id, media_url, thumbnail_url, caption, created_at
likes:    post_id, user_id, created_at
comments: id, post_id, user_id, text, created_at
follows:  follower_id, followee_id
stories:  id, user_id, media_url, created_at, expires_at (24h TTL)
```

---

## 5. Key Design Decisions

| Feature | Design |
|---------|--------|
| Image storage | S3 for originals, CDN for delivery, multiple resolutions |
| Feed | Redis sorted sets, hybrid fan-out |
| Stories | Cassandra with TTL (auto-delete after 24h) |
| Search | Elasticsearch (hashtags, users, locations) |
| Explore | ML-based recommendation engine |
| Notifications | Async via message queue + push service |

---

## 6. Scaling

- **Sharding**: Posts by user_id, Feeds by user_id
- **CDN**: Edge caching for images globally
- **Caching layers**: L1 (app server), L2 (Redis), L3 (CDN)
- **Async processing**: Image processing, feed generation via Kafka

---

## 7. Interview Talking Points

- Pre-signed URL pattern for direct-to-S3 uploads
- Image processing pipeline (resize, filter, optimize)
- Sharding strategy for posts vs. social graph
- How Explore/Discover uses collaborative filtering
- Handling viral posts (hot partition problem)
