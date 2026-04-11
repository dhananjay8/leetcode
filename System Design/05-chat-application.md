# Design a Scalable Chat Application (WhatsApp/Slack)

## 1. Requirements

### Functional
- 1:1 messaging and group chats
- Online/offline status, read receipts, typing indicators
- Message history, media sharing
- Push notifications for offline users

### Non-Functional
- Real-time delivery (<200ms for online users)
- Message ordering guaranteed per conversation
- At-least-once delivery, persistent storage
- Support 500M+ users

---

## 2. High-Level Architecture

```
Mobile/Web Client ←→ WebSocket Gateway (persistent connections)
                            ↓
                     Chat Service (message routing)
                            ↓
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        Message Queue   User Service   Presence Service
              ↓
        Message Store (Cassandra)
```

---

## 3. Core Components

### A. WebSocket Gateway
- Maintains persistent connections with clients
- Handles connection management, heartbeats
- Horizontally scaled; each server handles ~100K connections
- **Connection mapping**: Redis stores `user_id → gateway_server_id`

### B. Chat Service
- Routes messages between users
- **1:1**: Look up recipient's gateway server → forward message
- **Group**: Fan-out to all group members

### C. Message Flow (1:1)
1. User A sends message via WebSocket
2. Gateway forwards to Chat Service
3. Chat Service stores message in DB
4. Looks up User B's connection in Redis
5. If **online**: Forward to B's gateway → deliver via WebSocket
6. If **offline**: Queue + push notification

### D. Group Message Flow
1. Sender sends to Chat Service
2. Store message once (with group_id)
3. Fan-out: For each member, check online status
4. Online: deliver via WebSocket
5. Offline: push notification + store for later sync

---

## 4. Data Storage

### Messages (Cassandra/HBase)
```
partition_key: conversation_id
clustering_key: message_id (time-based UUID for ordering)
columns: sender_id, content, type, timestamp, status
```

### User/Group Data (MySQL/Postgres)
```
users: id, name, avatar, last_seen
groups: id, name, created_by, members[]
conversations: id, type, participant_ids
```

### Online Status (Redis)
```
user:{id}:status → "online" | "offline"
user:{id}:gateway → "gateway-server-3"
```

---

## 5. Key Design Decisions

| Feature | Approach |
|---------|----------|
| **Real-time** | WebSockets (long-polling as fallback) |
| **Message ordering** | Time-based UUIDs, sequence numbers per conversation |
| **Read receipts** | Client sends "read" event → update message status |
| **Typing indicator** | Ephemeral WebSocket event (no persistence) |
| **Media** | Upload to S3/CDN → send URL in message |
| **End-to-end encryption** | Signal Protocol (client-side keys) |
| **Message sync** | Client sends last_message_id → server returns newer messages |

---

## 6. Scaling

- **WebSocket servers**: Stateless with Redis-backed session mapping
- **Message store**: Cassandra (write-heavy, partitioned by conversation)
- **Fan-out**: Small groups = write-time fan-out; large channels = read-time fan-out
- **Push notifications**: Separate service with FCM/APNs

---

## 7. Interview Talking Points

- WebSocket vs long-polling vs SSE trade-offs
- How to handle user going offline mid-delivery
- Message ordering guarantees (sequence numbers)
- End-to-end encryption implications on server
- Group chat fan-out strategies for large groups
