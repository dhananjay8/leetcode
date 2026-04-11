# Design Twitter / News Feed System

## 1. Requirements

### Functional
- Post tweets, follow/unfollow users
- Home timeline (news feed) showing tweets from followed users
- Like, retweet, reply, search

### Non-Functional
- Feed generation < 500ms
- Support 300M+ DAU
- High read:write ratio (~100:1)
- Eventually consistent is acceptable for feed

---

## 2. Core Architecture

```
Client → Load Balancer → API Gateway
                              ↓
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
   Tweet Service       Feed Service          User Service
         ↓                    ↓                    ↓
   Tweet Store         Feed Cache (Redis)    Graph Store
   (MySQL/Cassandra)                        (following relationships)
```

---

## 3. Feed Generation: Fan-out Strategies

### Fan-out on Write (Push Model)
- When User A posts a tweet, push it to all followers' feed caches
- **Pros**: Feed reads are instant (pre-computed)
- **Cons**: Expensive for celebrities (millions of followers)

### Fan-out on Read (Pull Model)
- When User B opens feed, fetch latest tweets from all followed users, merge & rank
- **Pros**: No wasted work for inactive users
- **Cons**: Slow feed generation at read time

### Hybrid (Twitter's approach)
- **Regular users**: Fan-out on write (push to followers' feeds)
- **Celebrities (>100K followers)**: Fan-out on read (merge at read time)
- This avoids the celebrity problem while keeping feeds fast

---

## 4. Data Models

### Tweet Store
```
tweets: id, user_id, content, media_urls, created_at, like_count, retweet_count
```

### Social Graph (who follows whom)
```
follows: follower_id, followee_id, created_at
```

### Feed Cache (Redis)
```
feed:{user_id} → sorted set of tweet_ids (scored by timestamp)
- Keep last 800 tweets per user
- TTL: 24 hours, refresh on access
```

---

## 5. Tweet Posting Flow

1. User posts tweet → Tweet Service stores in DB
2. Fan-out Service fetches user's followers
3. For each follower (non-celebrity): push tweet_id to `feed:{follower_id}` in Redis
4. For celebrity tweets: skip fan-out, merge at read time

---

## 6. Feed Reading Flow

1. User opens app → Feed Service
2. Fetch pre-computed feed from Redis (`feed:{user_id}`)
3. Merge with tweets from followed celebrities (pulled in real-time)
4. Rank/sort by time + engagement signals
5. Hydrate tweet_ids with full tweet data (batch fetch from cache/DB)

---

## 7. Scaling

| Component | Strategy |
|-----------|----------|
| Tweet storage | Sharded MySQL or Cassandra by user_id |
| Feed cache | Redis Cluster, partitioned by user_id |
| Media | S3 + CDN (CloudFront) |
| Search | Elasticsearch for full-text search |
| Analytics | Kafka → Spark/Flink → Data Warehouse |

---

## 8. Interview Talking Points

- Fan-out on write vs read (hybrid is the answer)
- Celebrity problem and how to handle it
- Feed ranking: chronological vs algorithmic
- Consistency: eventual consistency is OK for feeds
- Trending topics: count hashtags in sliding window
- Rate limiting for tweet creation
