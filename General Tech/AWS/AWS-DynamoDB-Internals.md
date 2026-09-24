# AWS DynamoDB Internals — Staff/Principal Interview Deep Dive

## 1. What DynamoDB Actually Is

DynamoDB is a fully managed NoSQL database that partitions data across many storage nodes and exposes a simple key-value / document API. Its value proposition is **predictable single-digit millisecond latency at any scale**, but only when your access patterns align with its design.

Key abstractions:

| Concept | Meaning |
|---|---|
| **Table** | Collection of items; no fixed schema beyond primary key |
| **Item** | A row, up to 400 KB total |
| **Attribute** | Name-value pair; value types: string, number, binary, list, map, set, null, boolean |
| **Primary key** | Partition key alone, or partition key + sort key (composite) |
| **Partition** | A contiguous range of key hashes assigned to a storage node |
| **LSI / GSI** | Local vs Global secondary indexes |
| **Stream** | Ordered change-data-capture log per shard |
| **TTL** | Automatic item expiry based on an epoch attribute |

---

## 2. Write Lifecycle (PutItem / UpdateItem / DeleteItem)

```text
Client
  │ PutItem
  ▼
Request Router
  │
  ├── Authenticate / authorize
  ├── Calculate partition hash of partition key
  ├── Look up partition → storage node mapping in MemDS / metadata cache
  └── Route request to partition leader storage node
  ▼
Storage Node (Leader)
  │
  ├── Append write-ahead log (WAL) to local SSD
  ├── Replicate to two follower storage nodes in different AZs (quorum)
  ├── Apply to in-memory structures / LSM tree
  └── Acknowledge success to client
```

Replication:
- DynamoDB stores **three copies** of every item across **three AZs**.
- Writes succeed when a **quorum** (2 of 3) acknowledges.
- Reads can be **eventual consistency** or **strong consistency**.

### Consistency model

| Read Type | Behavior | Cost |
|---|---|---|
| **Eventually consistent** | May lag briefly; reads from any replica | 0.5 RCU |
| **Strongly consistent** | Reads from the leader after quorum | 1 RCU |
| **Transactional** | ACID across multiple items/tables | 2x RCU/WCU |

---

## 3. Read Lifecycle (GetItem / Query / Scan)

```text
Client
  │ Query / GetItem
  ▼
Request Router
  │
  ├── Calculate partition key hash
  ├── Look up partition leader
  ├── Route to leader (for strong) or any healthy replica (for eventual)
  └── Fetch item(s)
  ▼
Storage Node
  │
  ├── Check in-memory cache / bloom filters
  ├── Read from SSTable files on SSD
  └── Return result
```

Query vs Scan:
- **Query**: efficient; must provide partition key equality; can filter on sort key.
- **Scan**: reads every partition; use only for full table exports or tiny tables.

---

## 4. Partitioning and the Hash Function

DynamoDB uses an internal hash of the partition key to place items.

```text
Partition Key Value
       │
       ▼
  Hash Function
       │
       ▼
  Hash Value  ──────►  Partition range  ──────►  Storage Node
```

### Composite primary key

If you define a sort key, items with the same partition key are stored **together and sorted**.

```text
Partition key: UserID
Sort key:      OrderTimestamp

Item collection for UserID=U123
  ├── order#2024-01-01
  ├── order#2024-02-15
  └── order#2024-05-20
```

This enables efficient `Query` operations that return all orders for a user or a range.

---

## 5. Partition Splits and Adaptive Capacity

DynamoDB splits partitions for two reasons:

| Split Trigger | Mechanism |
|---|---|
| **Split for size** | Partition exceeds ~10 GB (composite key) or size thresholds |
| **Split for heat** | Partition exceeds throughput capacity; DynamoDB isolates hot items |

### Split for heat details

When a single item or small set of items receives sustained high traffic:

```text
Hot Partition P1
   │
   ├── DynamoDB detects imbalanced load
   └── Splits P1 -> P1a, P1b
        P1a: cold key range
        P1b: hot key range
```

Important nuance:
- **If you have a Local Secondary Index (LSI)**, split-for-heat can only split **between item collections** (same partition key).
- **Without LSI**, DynamoDB can split **within an item collection** by sort key, spreading the heat further.

Adaptive capacity also provides:
- **Burst capacity**: temporary use of unused capacity.
- **Instantaneous adaptive capacity**: moves capacity to the partitions that need it (useful in on-demand mode).

### Staff lesson

A hot partition is usually a **key-design problem**, not a capacity problem. Design high-cardinality partition keys.

---

## 6. Capacity Units: RCU and WCU

DynamoDB throughput is expressed in **read capacity units (RCU)** and **write capacity units (WCU)**.

### Provisioned mode

| Operation | Size | Cost |
|---|---|---|
| Strongly consistent read | up to 4 KB | 1 RCU |
| Eventually consistent read | up to 4 KB | 0.5 RCU |
| Transactional read | up to 4 KB | 2 RCU |
| Standard write | up to 1 KB | 1 WCU |
| Transactional write | up to 1 KB | 2 WCU |

Example: a 3 KB eventually consistent read consumes **0.5 RCU**. A 6 KB strongly consistent read consumes **2 RCU**.

### On-demand mode

- Pay per request.
- DynamoDB scales automatically; previous peak traffic sets the scale-up baseline.
- **Throughput limit scales with your workload**; sudden jumps from zero can be throttled.
- Usually more expensive for steady-state, simpler for unknown/spiky workloads.

### Capacity mode comparison

| Mode | Best For | Trade-off |
|---|---|---|
| **Provisioned + Auto Scaling** | Predictable traffic, cost control | Must set target utilization |
| **On-demand** | Unknown/spiky, dev/test, new workloads | Higher per-request cost |
| **Provisioned with reserved capacity** | Long-term predictable capacity | Up-front discount |

---

## 7. Secondary Indexes

### Global Secondary Index (GSI)

- Different partition key and optional sort key from base table.
- Eventually consistent by default.
- **Stored separately** on its own partitions.
- Has its own RCU/WCU settings.
- Supports on-demand / provisioned capacity.

### Local Secondary Index (LSI)

- Same partition key as base table, different sort key.
- **Strongly consistent reads possible**.
- Must be created at table creation time.
- Shares RCU/WCU with base table.
- Limits split-for-heat flexibility as noted above.

### When to use what

| Use case | Index type |
|---|---|
| Query by a different primary dimension | GSI |
| Query by an alternate sort within the same partition | LSI |
| Need strong consistency on alternate sort | LSI |
| Need flexibility to add later | GSI |
| Need to control index capacity separately | GSI |

---

## 8. Transactions and Idempotency

### DynamoDB transactions

`TransactWriteItems` / `TransactGetItems` provide ACID across items in the same AWS Region.

```text
Client
  │ TransactWriteItems
  ▼
DynamoDB
  │
  ├── Acquire item locks
  ├── Verify conditions for all items
  ├── Commit or rollback atomically
  └── Release locks
```

- Up to 25 items per transaction.
- No cross-table transactions (same Region only).
- **2x WCU / 2x RCU** cost.
- Conflict with other transactions may cause `TransactionConflict` exceptions.

### Idempotency for retries

A common staff-level pattern:

```text
Client generates client-token/idempotency key
  │
  ▼
DynamoDB conditional write:
   PutItem with ConditionExpression:
      attribute_not_exists(idempotencyKey)
  │
  └── If key exists: return stored result
  └── If new: store result under idempotency key
```

Use TTL on idempotency records to clean them up.

---

## 9. DynamoDB Streams

Streams emit a time-ordered sequence of item-level modifications.

```text
DynamoDB Table
   │
   ├── INSERT/ MODIFY/ REMOVE events
   ▼
DynamoDB Stream (shards)
   │
   ├── Lambda polls stream records
   ├── Kinesis Client Library can read shards
   └── Consumers process change events
```

Stream view types:

| View Type | What Is Streamed |
|---|---|
| `KEYS_ONLY` | Only key attributes |
| `NEW_IMAGE` | Full item after change |
| `OLD_IMAGE` | Full item before change |
| `NEW_AND_OLD_IMAGES` | Both |

Integration patterns:
- **Lambda event source mapping** for real-time reactions.
- **Cross-Region replication** via custom consumers.
- **Audit / change-data-capture** pipelines.

---

## 10. Global Tables (Multi-Region)

DynamoDB Global Tables replicate data across chosen Regions with **active-active** writes.

```text
us-east-1 Table ◄──────────────────► eu-west-1 Table
      │                                   │
      ▼                                   ▼
  App writes                          App writes
```

- Default: **eventual consistency** between Regions.
- Newer: **Synchronous Global Tables** option for strong cross-Region consistency.
- Conflict resolution: **last writer wins** based on timestamp.

---

## 11. TTL (Time to Live)

```text
Table item with attribute: ttl = 1700000000 (Unix epoch)
   │
   └── DynamoDB background scanner deletes item after expiration
```

- TTL deletes are free (no WCU consumed).
- Deletion is best-effort, typically within 48 hours of expiration.
- Use it for session data, logs, temporary tokens.

---

## 12. DAX — DynamoDB Accelerator

DAX is a fully managed in-memory cache for DynamoDB.

```text
App
  │
  ├── Check DAX cluster
  │      Hit: return
  │      Miss:
  ▼
DynamoDB
  │
  └── Write-through to DAX on updates
```

- Microsecond latency for cached reads.
- Good for read-heavy, eventually consistent access patterns.
- Not a substitute for proper key design.

---

## 13. Hot Partition Remedies

| Symptom | Cause | Fix |
|---|---|---|
| Throttling despite high table capacity | Hot partition key | Use high-cardinality partition key |
| Single user spikes load | Per-user item collection too hot | Shard write suffix, then merge at read |
| Time-series table hot tail | Writes always to latest timestamp | Prefix with bucket/random value |
| Large item collection | One partition key with many items | Add sort-key sharding, or redesign model |

### Write-sharding example

Instead of `DeviceID` as partition key for all events from a device, use:

```
PartitionKey = DeviceID#0, DeviceID#1, ... DeviceID#N  (random suffix)
SortKey = timestamp
```

At read time, query all N shards and merge results.

---

## 14. Hard AWS Gotchas

### Capacity and throttling
- **1 WCU = 1 KB write**, rounded up. A 1.1 KB write consumes 2 WCU.
- **1 RCU = 4 KB read** eventually consistent, **2 KB for transactional**.
- A `Query` can return many items but is bounded by **1 MB of data** or `Limit`; paginate with `LastEvaluatedKey`.
- **Scan** reads all partitions; it consumes RCU from every partition it touches.

### Indexes
- **GSI backfill** can throttle base table writes during creation.
- **LSI** requires projecting attributes at table creation; cannot add later.
- GSI updates are **asynchronous**; briefly inconsistent after base-table writes.

### Transactions
- Transactions **cannot span Regions**.
- Transaction items must be within **25 items per TransactWriteItems**.
- Transaction write sets must be within **4 MB total**.

### Streams
- Stream records are retained for **24 hours**.
- Shard records are ordered per shard, but **order is not guaranteed across shards**.
- Lambda pollers share shards; parallelization factor controls concurrency.

### Global Tables
- No unique constraints; conflicts resolved by **last writer wins**.
- Deleting a replica does not delete the table; you must delete the base table.

---

## 15. Quick Reference Tables

### Primary key design

| Pattern | Primary Key | Best For |
|---|---|---|
| User profile | `UserID` | Direct lookup by ID |
| User orders | `UserID` (PK), `OrderTimestamp` (SK) | One-to-many, time series |
| Access log | `Service#Shard`, `Timestamp` | High write throughput |
| Shopping cart | `CartID` | Single entity with many items |
| Many-to-many | `EntityA#EntityB` composite | Relational mapping |

### Read/write cost

| Operation | Request Size | RCU/WCU |
|---|---|---|
| GetItem strong | 3 KB | 1 RCU |
| GetItem eventual | 3 KB | 0.5 RCU |
| Query strong (8 KB result) | 8 KB | 2 RCU |
| PutItem | 2 KB | 2 WCU |
| UpdateItem | 0.5 KB | 1 WCU |

---

## 16. Common Interview Scenarios and Anti-Patterns

### Scenario 1: "My DynamoDB table is throttling even though capacity is high"

Most likely causes:
1. **Hot partition key** — a single value receives most traffic.
2. **GSI backfill** — a new global index temporarily consumes base-table WCU.
3. **Sudden spike beyond on-demand baseline** — on-demand scales from peak history, not instant.
4. **Large items / large results** — a single 400 KB item or 1 MB Query result creates uneven load.

Fixes:
- Add random suffix (write-sharding) to hot partition keys.
- Use adaptive capacity + on-demand as stop-gap.
- Break large items into smaller items or use S3 for blobs.
- Cache read-heavy hot keys in DAX or ElastiCache.

### Scenario 2: "How do I implement a transactional outbox?"

When you must update DynamoDB and publish an event atomically:

```text
Application
   │
   ├── 1. Write business record to DynamoDB
   │      ConditionExpression: ensure idempotency / version
   │
   └── 2. Write outbox item to same table (or separate table)
          pk=Outbox#<id>, sk=timestamp, event=<serialized event>
                  │
                  ▼
          DynamoDB Stream
                  │
                  ▼
          Lambda / consumer reads outbox item
                  │
                  ├── Publishes event to SNS/EventBridge/SQS
                  └── Deletes outbox item on success
```

Key points:
- DynamoDB write + outbox write are in the **same transaction**.
- Stream consumer retries until publish succeeds (idempotent publisher).
- Handles cases where the message broker is temporarily down.

### Scenario 3: "Should I store images in DynamoDB?"

No. DynamoDB item limit is **400 KB**. Store metadata in DynamoDB and the actual object in S3 with a pointer (`s3://bucket/key`). This avoids hot partitions, high WCU, and poor performance.

### Scenario 4: "How do I model a many-to-many relationship?"

Use an **adjacency list / item collection** pattern:

```text
pk          sk              data
user#123    order#456       {...}
order#456   user#123        {...}
order#456   product#789     {...}
product#789 order#456       {...}
```

A query on `pk = user#123` returns all orders for that user. A query on `pk = order#456` returns all relationships for that order.

### Anti-pattern list

| Anti-pattern | Why it's wrong | Better approach |
|---|---|---|
| Using timestamp as partition key | Hot tail partition | Prefix with bucket or random shard |
| Storing large BLOBs | Exceeds 400 KB, wastes RCU/WCU | S3 + metadata pointer |
| Frequent full table Scans | Expensive, slow, scans every partition | Design access patterns around Query |
| Using transactions for all writes | 2x cost, 4 MB limit, not cross-Region | Use conditional writes where possible |
| Treating DynamoDB like a relational DB | Joins and ad-hoc queries are not supported | Pre-aggregate, denormalize, use adjacency lists |

---

## 17. Back-of-Envelope Capacity Sizing

Given:
- 1,000 writes/sec, average item 2 KB
- WCU = ceil(item_size / 1 KB) = 2 per item
- Required WCU = 1,000 × 2 = **2,000 WCU**

Given:
- 10,000 strongly consistent reads/sec, average item 3 KB
- RCU = ceil(item_size / 4 KB) = 1 per item
- Required RCU = 10,000 × 1 = **10,000 RCU**

Staff tip: Always add headroom (20–30%) for partition skew and burst events.

---

## 18. Textual Mind Map: DynamoDB Modeling Process

```text
Identify Access Patterns
   │
   ├── Read patterns
   │      ├── Single item lookup -> Partition key only
   │      └── One-to-many range -> Composite key (pk + sk)
   │
   ├── Write patterns
   │      ├── Isolated updates -> Conditional Put/Update
   │      └── Multi-item atomic -> TransactWriteItems / Outbox
   │
   ├── Hot spots
   │      ├── Low-cardinality pk -> Add shard suffix
   │      └── Time-series tail -> Use time buckets
   │
   ├── Relational shapes
   │      ├── 1:1 -> Same item
   │      ├── 1:N -> Composite key
   │      └── M:N -> Adjacency list (store both directions)
   │
   └── Secondary access
          ├── Alternate pk dimension -> GSI
          └── Alternate sort on same pk -> LSI
```

---

## 19. Staff-Level Interview Sound Bites

- "DynamoDB is not a database you query arbitrarily; it is a database you model for your exact access patterns."
- "The partition key determines distribution; the sort key determines ordering within a partition."
- "A hot partition is a key-design problem. Use high-cardinality keys and write sharding where necessary."
- "A GSI has its own partitions and capacity; an LSI shares the base table's partitions and capacity."
- "DynamoDB transactions give ACID in one Region; Global Tables give multi-Region active-active with last-writer-wins conflict resolution."
- "Never store BLOBs in DynamoDB; use S3 with a pointer and keep metadata in the table."
- "If you need both durable state and reliable messaging, use the transactional outbox pattern with DynamoDB Streams."
