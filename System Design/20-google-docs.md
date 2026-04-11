# How Google Docs / Real-time Collaboration Works

## 1. Requirements
- Multiple users editing same document simultaneously
- Real-time sync with conflict resolution
- Cursor/selection visibility of other users
- Version history, offline support

## 2. Core Challenge: Conflict Resolution

### Operational Transformation (OT)
- Each edit is an **operation**: insert(pos, char), delete(pos)
- When two users edit concurrently, **transform** operations against each other
- Server maintains authoritative document state and operation history
- Example: User A inserts at pos 5, User B deletes at pos 3 → transform A's position to 4

### CRDTs (Conflict-free Replicated Data Types)
- Each character has a unique, ordered ID
- Insertions/deletions are commutative — order doesn't matter
- No central server needed for conflict resolution
- Used by: Figma, Yjs, Automerge

## 3. Architecture
```
Client (local edits) → WebSocket → Collaboration Server (OT engine)
                                           ↓
                                    Document Store (Firestore/DB)
                                           ↓
                                    Version History Store
```

## 4. Real-time Sync Flow
1. User A types a character → create operation `insert(5, 'a')`
2. Apply locally immediately (optimistic)
3. Send operation to server via WebSocket
4. Server transforms against any concurrent operations
5. Broadcast transformed operation to all other clients
6. Other clients apply the transformed operation

## 5. Key Design Decisions
| Feature | Approach |
|---------|----------|
| Real-time | WebSocket connections per document |
| Conflict resolution | OT (Google Docs) or CRDT (Figma) |
| Persistence | Save checkpoints every N operations |
| Version history | Store operation log, reconstruct any version |
| Offline | Queue operations locally, replay on reconnect |
| Cursors | Broadcast cursor position via WebSocket |

## 6. Interview Talking Points
- OT vs CRDT trade-offs (OT simpler with central server, CRDT works peer-to-peer)
- Operational log compression for version history
- Document-level locking is NOT the answer (too coarse)
- Presence system (who's online, cursor positions) via ephemeral WebSocket events
