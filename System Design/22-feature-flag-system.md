# Design a Feature Flag System

## 1. Requirements
- Toggle features on/off without deployments
- Percentage rollouts, user/segment targeting
- A/B testing integration, real-time updates
- SDK for multiple platforms (Web, iOS, Android, Backend)

## 2. Architecture
```
Admin Dashboard → Flag Service API → Flag Store (DB + Cache)
                                          ↓
                              SDK Clients (poll or stream flags)
                                          ↓
                              Application Code (if/else on flag)
```

## 3. Flag Evaluation Logic
```
1. Check if flag exists → if not, return default
2. Check if user is in explicit target list → return override
3. Check if user segment matches rules (country, plan, etc.)
4. For percentage rollout: hash(userId + flagKey) % 100 < rolloutPercent
5. Return enabled/disabled
```

## 4. Data Model
```
flags: key, description, enabled, rollout_percent, rules[], default_value
rules: flag_key, attribute (country/plan/etc), operator (=, in, contains), value
overrides: flag_key, user_id, value (explicit per-user override)
```

## 5. Key Design Decisions
| Decision | Choice |
|----------|--------|
| Storage | PostgreSQL + Redis cache |
| Client sync | SDK polls every 30s + WebSocket for instant updates |
| Evaluation | Client-side (SDK caches rules, evaluates locally) |
| Consistency | Eventual (few seconds lag acceptable) |
| Audit | Log every flag change with timestamp and user |

## 6. Interview Talking Points
- **Consistent hashing** for percentage rollouts (deterministic per user)
- Client-side evaluation is faster and more resilient than server-side
- Fallback: if flag service is down, use last cached values
- A/B testing: track flag state with analytics events
- Kill switch: instantly disable a broken feature across all users
