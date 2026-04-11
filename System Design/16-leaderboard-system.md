# Design a Leaderboard System

## 1. Requirements
- Real-time ranking of players/users by score
- Get rank of a specific user, get top-N users
- Update scores efficiently
- Support millions of users

## 2. Architecture
```
Game Service → Score Update API → Leaderboard Service → Redis Sorted Set
                                                              ↓
                                                    Periodic backup → DB
```

## 3. Core Design: Redis Sorted Sets
```
ZADD leaderboard <score> <user_id>          # Add/update score
ZREVRANK leaderboard <user_id>              # Get rank (0-indexed, highest first)
ZREVRANGE leaderboard 0 9 WITHSCORES       # Top 10
ZSCORE leaderboard <user_id>                # Get user's score
ZINCRBY leaderboard <increment> <user_id>   # Increment score
```
- All operations are O(log N) — perfect for real-time leaderboard

## 4. Handling Scale
- **Single leaderboard** (<10M users): Single Redis instance handles it
- **Sharded**: Partition by game/region, aggregate for global leaderboard
- **Time-based**: Daily/weekly/monthly leaderboards → separate sorted sets with TTL
- **Relative ranking**: "You are top 5%" → `ZCOUNT` to count users above score

## 5. Data Models
```
Redis: sorted set "leaderboard:{game_id}" → (score, user_id)
DB (backup): user_id, game_id, score, rank, updated_at
```

## 6. Interview Talking Points
- Redis sorted set is THE answer for real-time leaderboards
- O(log N) for all operations with millions of entries
- For very large scale: segment leaderboards, approximate ranking
- Cheating prevention: server-side score validation
- Historical leaderboards: snapshot sorted set periodically
