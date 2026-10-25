# AWS Consolidated Case Studies — Staff Engineer Interview Guide

This document consolidates all substantive material from both source case-study notes into one Google Docs-friendly guide. Embedded base64 image binaries and duplicated prose were removed; unique diagram details are preserved as text.

## How to Use This Guide

1. Clarify functional requirements, scale, latency, availability, consistency, compliance, and cost.
2. Estimate traffic, storage, bandwidth, concurrency, and failure budgets before selecting services.
3. Define Region, account, VPC, AZ, service, tenant, ownership, and blast-radius boundaries.
4. Present the simplest viable request/data flow and distinguish control plane from data plane.
5. State the source of truth and consistency/idempotency model.
6. Walk through dependency, AZ, Region, overload, security, and operator-error failures.
7. Define SLOs, observability, deployment, rollback, reconciliation, DR, and cost controls.
8. Name rejected alternatives and explain their trade-offs.

## Staff-Level Evaluation Checklist

- Service choices follow access patterns and failure semantics.
- At-least-once delivery is paired with idempotent/effectively-once processing where needed.
- Multi-Region design identifies write ownership, replication lag, failover authority, RPO, and RTO.
- Queues include backpressure, retry budgets, poison-message handling, DLQs, replay, and reconciliation.
- Security includes identity, network paths, encryption, classification, audit, and abuse controls.
- Operations include SLOs, error budgets, dashboards, alerts, runbooks, game days, and ownership.
- Cost is a design constraint with unit economics, not merely a cleanup exercise.

## Contents

- Part I — Real-world cost, EKS efficiency, Lambda runaway, and observability lessons
- Part II — 12 AWS architecture and operations case studies
- Part III — Correct ECS containerization and deployment workflow
- Part IV — 34-section media-processing deep dive
- Part V — Unique source-diagram details transcribed as text

## Part I — Real-World Cost and Operational Lessons

[https\://www.techopsexamples.com/p/how-levels-fyi-cut-aws-costs-by-15-for-26m-users-without-performance-loss](https://www.techopsexamples.com/p/how-levels-fyi-cut-aws-costs-by-15-for-26m-users-without-performance-loss)

#### How Levels.fyi Cut AWS Costs by 15% for 26M Users Without Performance Loss

It is easy to recommend generic cost controls—delete idle resources, right-size, reserve capacity, use Spot, and add lifecycle policies—but even a small S3 lifecycle change can trigger downstream processes and cause unexpected impact.
So, it is not only about removing what is unused, it is about understanding the workload, traffic pattern and dependency chain.
Today we go a deep dive on a real world use case of how Levels.fyi applied targeted AWS cost optimization strategies. Before we jump in, it is worth starting with the end result. This is what they achieved.
Data Source: Levels.fyi

#### Break down the bill

It all started with a deep dive into AWS Cost Explorer. Levels.fyi wanted to understand the exact sources of their cloud spend before acting. The data showed CloudFront taking the largest share, followed by EC2, ECS, and RDS. Even smaller categories like NAT, WAF, and ElastiCache were flagged for review. This clear picture became the foundation for their cost optimization plan.
Data Source: Levels.fyi

#### S3 Listeners Creating SQS Events

Levels.fyi had terabytes of historical job data in S3. They planned to move it to Glacier Deep Archive using a lifecycle policy for cost savings.
The catch was that S3 listeners were sending events to SQS for every object change. Moving data would have flooded consumers with millions of messages.
They paused the listeners, migrated the data, and turned them back on.
Learning:

* Check all event triggers before bulk storage changes.
* Simulate changes in a test environment.
* Plan listener pauses or throttling during migration.
* Re enable services only after validating impact.

#### Mysterious ElastiCache

  An ElastiCache charge appeared with no reference from backend services. Levels.fyi validated usage by connecting and running DBSIZE and INFO to check metrics like connected_clients and total_commands_processed.
  The activity seen on CPU and bytes I/O came from a backup job, not live traffic. They took a final backup and removed the instance.
  Learning:
* Search IaC, service configs, and env vars for any cache reference.
* Verify with redis-cli using DBSIZE, INFO, and client list
* Correlate CloudWatch metrics with backup windows before deciding.
* Tag caches with owner and purpose to avoid orphans.
* Snapshot before removal and set a quick rollback plan.

#### EC2 Instances CleanUp and Optimization


  Checked a startup's AWS bill last week. 💸

  \$12,000/month for 500 users. 🤦‍♂️

  Competitor with 50K users: \$800/month. 📊

  This is why 60% of startups overspend on infrastructure. 🔥


  The real cost of lazy DevOps: 💰

  → No auto-scaling = paying for idle servers 24/7 ⏰ → No caching = hitting DB for same data repeatedly 🔄 → Oversized instances = paying for power you don't use 💪 → No monitoring = can't optimize what you don't measure 📉


  Here's how to cut costs by 70%: 🛠️
1. Right-size your instances 📏 Stop using t3.2xlarge for a blog. Start with t3.small. Scale when needed.
2. Implement caching ⚡ Redis for frequently accessed data. CDN for static assets. 30% of DB queries eliminated instantly.
3. Auto-scaling groups 📈 3 servers at peak hours. 1 server at 3 AM. Pay for what you actually use.
4. Reserved instances for predictable load 🔒 72% discount vs on-demand. Commit to 1 year for stable services.
5. Monthly cost review 📊 Every Monday: Check AWS Cost Explorer. Find the biggest spend. Optimize it.


  Real results from implementation: 📉

  Before:

  \$12K/month for 500 users

  No idea where money goes

  "It just costs a lot"

  After:

  \$3.5K/month for same load

  Clear cost per user metric

  Can predict monthly spend

  The difference? 70% cost reduction in 2 weeks. 💼

  Cloud costs don't have to be scary. 🎯

  Most startups overpay because:

  They don't monitor ❌

  They over-provision ❌

  They never optimize ❌

  Spend 2 hours/month on optimization.

  Save \$100K/year. 💰


  Ever noticed your EKS cluster feels "heavy" with too many nodes? I just dug into why node size choice is more strategic than I realized.


  I was setting up an EKS cluster and defaulted to small nodes (t3.medium),Then I hit Pod scheduling limits and started digging.


  I learned that Smaller AWS instances come with fewer ENIs (Elastic Network Interfaces) and it directly limits how many Pods you can pack onto a node. Without the modern CNI features, a t3.medium tops out at about 17 Pods, while an m5.8xlarge can handle 234!


  VPC CNI prefix delegation can substantially increase pod IP capacity when explicitly enabled and supported by the chosen instance types and subnets. It helps small nodes host more Pods - that same t3.medium can now do \~110 Pods. But here's the catch that changed my thinking:
- Every node runs kube-proxy, CNI, monitoring agents. 10 nodes = 10 copies of everything, eating resources
- Small nodes often sit half-empty, but you're paying for the full instance
- More nodes = more patching, more security groups, more things to manage
- Each node needs its own IP plus capacity for Pods, draining your subnet quickly

  🏆 Major efficiency win before the holidays 🏆

  We improved our EKS node efficiency by 70% and saved roughly \$55,000/year, all without touching application code.


  The issue was simple.

  CPU requests were set high years ago and never revisited.

  Apps spiked briefly, then ran at a tiny percent of their request.

  Multiply that across dozens of services, and you quietly lose capacity.


  AWS Cluster Autoscaler looks at CPU requests and scales nodes when they reach the requested threshold - not actual utilization.


  What we changed:
- Right-size the CPU request, not the limit.
- Let early spikes burst safely instead of shaping allocations around them.
- Rebalanced HPA so scaling followed reality, not guesswork.


  Reliability stayed the same.

  Costs dropped immediately.


  Most clusters burn money not because of scale, but because no one questions the defaults.

That Lambda function we deployed on Friday? It burned through \$4,200 over the weekend.
We were moving a batch job to Lambda. Code looked good, tests passed, everything checked out. Deployed it Friday evening and went home feeling pretty good about it.
Monday morning my phone lit up. AWS bill alert: \$4,200. For two days.
Here's what happened:
- We tested everything with 100MB files. Production files? 1.2GB.
- Lambda would run for 14 minutes and 58 seconds, then timeout. Every single time.
- Our retry logic (you know, "best practices") would kick in and try 3 more times. Same result.
- 5,000 files sat in the queue all weekend. Each one failing. Each retry running the full 15 minutes at 3GB memory. Maximum possible cost, every time.
- And CloudWatch? Logging every failure in excruciating detail. 30GB per hour of "file too large" errors.
We never calculated data transfer costs. That was another surprise.

What we should've done:
- Step Functions to control the whole thing
- SQS with proper visibility timeouts
- 5-minute Lambda timeout, not 15
- Dead letter queue for actual failures
- CloudWatch with retention limits
- Load test with real file sizes, not samples

I've built event-driven systems that handle millions of events. But this reminded me that the best architecture isn't the most clever one. It's the one that fails safely and predictably.
1. AWS Cost Optimizations Experience
1. Story in flex scan
1. Adaptive Concurrency for attaching disks to a machine
2. Select Machine Size as per number of disks attached Adaptive
3. Azure Remove Copy Snapshot Step
4. NAT Gateway has cost so I used VPC endpoints
2. General Approaches / Patterns
1. Cost explorer and Cost Optimization Hub Dashboard
2. Resource tagging
3. Setup budgets
4. Compute and right sizing - use aws graviton
5. S3 standard and intelligent tier
6. Cache via Cloud-front
7. Delete unnecessary resources
8. Transition data to cold store and backups
2. Distributed tracing in Cloud Native Env
1. Story
1. Generate Unique Trace id in Lifecycle
2. Async Log collection
3. Correlation with Logs and metrics
4. Central Collector or sink as ElasticSearch
5. Observability
         6.
2. Patterns
1. Async Msg Forwarding
2. Sidecar

	-		3.	Baggage Propagation- pass unique key values across micro services for better filtering
## Part II — Architecture and Operations Case Studies

This document contains scenario-based questions commonly asked at staff level. Each case is structured with requirements, architecture, trade-off analysis, failure modes, and staff-level follow-up answers.

---

## Case Study 1: Global E-Commerce Order Platform

### Scenario & Scale Requirements

You are the staff engineer designing the order platform for a global retailer:
- **Peak traffic**: 500,000 orders/minute (global), concentrated during sales events.
- **Availability target**: 99.99% (52 minutes/year).
- **Latency target**: P99 checkout < 200 ms.
- **Data requirements**: order state must be durable; inventory and payment must be consistent.
- **Compliance**: PCI-DSS for payment data; GDPR for EU customer data.
- **Regions**: active-active in `us-east-1`, `eu-west-1`, `ap-southeast-1`.

### Proposed Architecture

```text
  User
    │
    ▼
  CloudFront / WAF / Shield
    │
    ▼
  Route 53 (latency-based)
    │
    ▼
  API Gateway / ALB
    │
    ▼
  ECS/Fargate or EKS (order service)
    │
    ├──► DynamoDB (order state) - Global Tables active-active
    ├──► SQS (order events) -> SNS fan-out
    │         ├──► Payment SQS -> Lambda/ECS -> payment processor
    │         ├──► Inventory SQS -> Lambda -> inventory update
    │         ├──► Fulfillment SQS -> Step Functions orchestration
    │         └──► Analytics SQS -> Kinesis Firehose -> S3/Redshift
    │
    └──► ElastiCache Redis (session/cart, hot data)
  Payment flow (orchestrated saga):
     Step Functions
1. Reserve inventory  (DynamoDB conditional write)
2. Charge payment       (third-party PSP via SQS + circuit breaker)
3. Confirm order        (DynamoDB transaction)
4. Emit OrderConfirmed  (EventBridge)
5. On failure -> refund + release inventory (compensation)
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Checkout latency | ElastiCache + DynamoDB | Sub-10 ms reads; avoids relational joins |
| Order durability | DynamoDB with PITR + backups | Three AZ replication; 35-day PITR |
| Inventory correctness | Conditional writes + saga | Optimistic locking; compensations handle failures |
| Global consistency | DynamoDB Global Tables with partitioned ownership | Each order assigned to home Region; avoids cross-Region writes |
| Fan-out | SNS + SQS | Decouples payment, inventory, fulfillment, analytics |
| Payment PCI | Tokenization by PSP; no raw PAN in our logs | Minimizes PCI scope |

  CAP trade-offs:
- Partition by Region to favor **availability + partition tolerance** while keeping strong consistency within a Region.
- Cross-Region conflict resolution uses **last-writer-wins** only for non-critical metadata; order state is owned by a single Region.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| DynamoDB hot partition during flash sale | Throttling, checkout failures | Pre-sharded partition keys (e.g., `orderID#random-suffix`), adaptive capacity, on-demand scaling |
| Payment processor outage | Orders cannot complete | Circuit breaker + SQS retry + DLQ + manual reconciliation |
| Region failure | Loss of active Region | Route 53 ARC shifts traffic; Global Tables replicate order metadata; payment idempotency keys prevent double charge |
| Inventory over-sell | Conditional write fails | Reserve-then-confirm pattern; compensation releases reservation |
| Message duplication | Duplicate payment / shipment | Idempotency keys; SQS FIFO for order-critical flows |

### Staff-Level Follow-Ups

  **Q: How do you handle the 500k orders/min spike without losing data?** A: Use SQS as a shock absorber in front of every downstream service. DynamoDB on-demand scales with traffic; pre-shard keys to avoid hot partitions. Each service scales independently based on queue depth.

  **Q: Why DynamoDB and not Aurora for orders?** A: DynamoDB gives predictable single-digit-ms latency, automatic global replication, and horizontal scale. Aurora is great for complex relational queries but requires careful read-replica failover; order access patterns are key-based and well-suited to DynamoDB.

  **Q: How do you prevent double charging?** A: Use idempotency keys stored in DynamoDB with conditional writes. The payment provider also supports idempotency keys. We never retry without the same key.

  ---

## Case Study 2: Real-Time Ride-Hailing / Matching Service

### Scenario & Scale Requirements
- **Users**: 10 million daily active riders; 1 million drivers.
- **Request rate**: 100,000 ride requests/minute at peak.
- **Matching latency**: P99 < 100 ms from request to driver assignment.
- **Geo-distributed**: riders and drivers in 30+ cities.
- **Real-time updates**: driver location, ETA, pricing.

### Proposed Architecture

```text
  Rider app
    │
    ▼
  Global Accelerator (static IPs, low-latency routing)
    │
    ▼
  API Gateway -> ALB
    │
    ▼
  EKS (matching service) in multiple AZs
    │
    ├──► ElastiCache Redis (driver geospatial indexes, sessions)
    ├──► DynamoDB (rides, users, trips)
    │
    └──► Kinesis Data Streams (location pings, events)
              │
              ├──► Lambda -> update Redis geospatial index
              ├──► Kinesis Data Analytics -> surge pricing
              └──► S3/Redshift -> analytics
  Matching flow:
1. Rider requests ride -> matching service
2. Query Redis GEORADIUS for nearby available drivers
3. Score candidates (distance, rating, surge)
4. Assign driver via Redis lock / conditional write
5. Publish RideAssigned to SNS -> driver/rider push
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Ultra-low matching latency | ElastiCache Redis with geohash/GEORADIUS | In-memory spatial queries; avoids DB round trips |
| Driver location stream | Kinesis Data Streams | High ingestion, multiple consumers (matching, pricing, analytics) |
| Surge pricing | Kinesis Data Analytics / Flink | Real-time aggregation of demand vs supply |
| Ride state durability | DynamoDB | Trip records must survive Redis restart |
| Push notifications | SNS + mobile push | Reliable fan-out to both rider and driver |

  CAP trade-offs:
- **Eventual consistency** for driver location (tolerate stale position for 1–2 seconds).
- **Strong consistency** for ride assignment using Redis locks or conditional DynamoDB writes.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Redis cluster node failure | Matching queries slow/fail | Redis Multi-AZ/cluster recovery; degrade matching or use a purpose-built durable coarse location index—never scan a large table |
| Single AZ network partition | Drivers appear offline | Multi-AZ EKS; client retries; Route 53 ARC if multi-Region |
| Kinesis hot shard | Throttling on location stream | High-cardinality driver ID as partition key; scale shards |
| Driver assignment race condition | Double assignment | DynamoDB conditional ownership update; Redis lock only with explicitly accepted failure semantics |
| Mass retry after outage | Thundering herd | Exponential backoff + jitter; rate limiting at API Gateway |

### Staff-Level Follow-Ups

  **Q: How do you handle a driver crossing city boundaries?** A: Driver IDs are global; the geospatial index is not partitioned by city. The matching service queries a radius and can return drivers from overlapping geofences. Surge pricing is computed per geofence bucket.

  **Q: What if Redis goes down entirely?** A: Maintain a recent snapshot of driver locations in DynamoDB TTL-backed table updated asynchronously from Kinesis. Fall back to a coarser query by city/district with higher latency but continued service.

  **Q: Why Kinesis and not SQS for location pings?** A: Kinesis preserves ordering per driver shard, supports multiple consumers, and allows replay for analytics. SQS would require separate queues per consumer and does not replay.

  ---

## Case Study 3: Multi-Region Banking / Payment Ledger

### Scenario & Scale Requirements
- **Transactions**: 50,000 payments/second globally.
- **Consistency**: no lost or duplicated payments; account balance must be strongly consistent.
- **Compliance**: PCI-DSS, SOC2, data residency (EU data stays in EU).
- **DR target**: RPO < 1 second, RTO < 5 minutes.
- **Regions**: active-active with strict partitioning by account.

### Proposed Architecture

```text
  Customer
    │
    ▼
  Route 53 geolocation + Global Accelerator
    │
    ▼
  API Gateway -> NLB (TLS termination)
    │
    ▼
  EKS (payment service)
    │
    ├──► DynamoDB (account balances, transactions)
    │      - Strongly consistent reads for balance
    │      - Transactions table with conditional updates
    │
    ├──► SQS FIFO (payment commands per account)
    │      - Preserves per-group ordering and supports deduplication; consumers remain idempotent
    │
    ├──► Step Functions (orchestrated fraud/AML checks)
    │
    └──► S3 (transaction logs, audit) with Object Lock
  Cross-Region:
    DynamoDB Global Tables (async replication for read replicas)
    S3 CRR for audit logs
    Aurora Global Database for settlement/ledger reporting
    Route 53 ARC for failover
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Strong consistency | Per-account ownership + conditional writes | Each account mastered in one Region; no cross-Region concurrent writes |
| Exactly-once processing | SQS FIFO + idempotency table | Per-group ordering plus application-level effectively-once processing |
| Audit immutability | S3 Object Lock (WORM) | Compliance requirement for financial records |
| Fraud checks | Step Functions orchestration | Parallel rules, retries, audit trail |
| Regional data residency | Account home-Region ownership enforced by application/data controls | DNS routing alone does not guarantee residency |

  CAP trade-offs:
- **CP over AP** for balance updates: use conditional writes and account-level ownership.
- **AP for read replicas** of transaction history; stale reads are acceptable for statements.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Region failure | Need to redirect traffic | Route 53 ARC; account ownership moved during controlled failover; reconciliation run after restore |
| Duplicate payment command | Double debit/credit | Idempotency table in DynamoDB keyed by payment command ID |
| Fraud service timeout | Payment blocked | Circuit breaker; default allow/reject based on risk policy; async post-processing |
| DynamoDB throttling | Payment processing slows | On-demand capacity; account-level sharding; adaptive capacity |
| Insider data deletion | Audit log tampered | S3 Object Lock compliance mode; MFA delete; CloudTrail data events |

### Staff-Level Follow-Ups

  **Q: Why not active-active writes for the same account?** A: Active-active writes to the same balance record require conflict resolution. In banking, conflict resolution is business logic, not "last writer wins." We avoid it by assigning each account to a single Region and using read replicas elsewhere.

  **Q: How do you meet PCI-DSS?** A: Cardholder data is tokenized by a PCI-compliant PSP and never enters our logs. Sensitive flows run in isolated subnets; KMS encrypts data at rest; TLS/mTLS in transit; access is logged by CloudTrail and reviewed by Security Hub.

  **Q: What happens during a Region switch?** A: Route 53 ARC stops traffic to impaired Region. In-flight commands drain from SQS FIFO. We run a reconciliation job comparing replicated transaction logs to ensure no orphan states before resuming writes.

  ---

## Case Study 4: Media Processing at Scale

### Scenario & Scale Requirements
- **Upload volume**: 10,000 user-uploaded videos/hour, up to 1 GB each.
- **Processing**: generate thumbnails, transcode to multiple resolutions, extract metadata.
- **Latency**: processing can be asynchronous; final notification within minutes.
- **Cost target**: minimize idle compute while handling bursts.
- **Format**: images via Lambda; videos via long-running transcode.

### Proposed Architecture

```text
  User upload
    │
    ▼
  S3 (raw uploads bucket)
    │
    ├── S3 Event Notification -> SNS
    │         │
    │         ├── For images -> SQS -> Lambda (Sharp) -> resized to S3
    │         │
    │         ├── For videos -> SQS -> ECS Fargate task -> MediaConvert job
    │         │                              │
    │         │                              ▼
    │         │                         S3 (transcoded bucket)
    │         │
    │         └── For metadata -> SQS -> Lambda -> DynamoDB (job status)
    │
    └── DynamoDB / ElastiCache (job state, progress)
  Step Functions (long-running workflows):
1. Receive S3 event
2. Branch by file type
3. For video: submit MediaConvert; wait for completion
4. Update DynamoDB status
5. Notify user via SNS / Email
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Short image jobs | Lambda + Sharp | Fast, cheap, scales to zero |
| Long video jobs | MediaConvert + ECS Fargate | Avoids Lambda 15-min limit; Fargate handles orchestration |
| Decoupling | S3 -> SNS -> SQS | Producers don't wait; each consumer has its own buffer |
| Job tracking | DynamoDB | Durable state machine; supports replay and status queries |
| Cost | Spot for batch? Use Fargate Spot where possible | Significant savings for interruptible jobs |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Large video exceeds timeout | Lambda fails | Route to Fargate/MediaConvert from the start based on size/type |
| MediaConvert job fails | No output | Step Functions retry with exponential backoff; DLQ for permanent failures |
| S3 event lost | Job never starts | Enable S3 event notifications + EventBridge archive; idempotent job creation |
| Concurrent uploads spike | Queue backlog | Auto Scaling on SQS queue depth; Fargate scales task count |
| Malicious upload (virus, illegal content) | Reputational/legal risk | Upload to quarantine bucket; scan with Lambda + Rekognition / third-party scanner |

### Staff-Level Follow-Ups

  **Q: Why not run FFmpeg in Lambda?** A: Lambda has a 15-minute limit and ephemeral /tmp storage. A 1 GB / 1.5-hour video cannot transcode reliably. MediaConvert is purpose-built for video and scales elastically; Fargate is used only for orchestration or custom pre-processing.

  **Q: How do you reduce cost?** A: Use Fargate Spot for non-critical workflows, S3 Intelligent-Tiering for raw and output storage, MediaConvert on-demand queues, and lifecycle policies to move old assets to Glacier.

  **Q: What if the user re-uploads the same file?** A: Compute a content hash; check DynamoDB for an existing job. If found and successful, return existing outputs immediately (idempotent deduplication).


  ---

## Case Study 5: IoT Telemetry and Analytics Platform

### Scenario & Scale Requirements
- **Devices**: 50 million connected devices.
- **Ingestion**: 1 million messages/second at peak.
- **Message size**: 1 KB average.
- **Latency**: alerts within 5 seconds; analytics within minutes.
- **Storage**: 1 year hot, 7 years cold.

### Proposed Architecture

```text
  IoT Device
    │
    ▼
  AWS IoT Core (MQTT broker, device registry, rules engine)
    │
    ├── Rule: urgent alerts -> SNS -> Lambda -> push notification
    │
    ├── Rule: telemetry -> Kinesis Data Streams
    │         │
    │         ├── Consumer 1: Lambda -> DynamoDB (latest device state, TTL)
    │         ├── Consumer 2: Kinesis Data Analytics -> real-time dashboards
    │         └── Consumer 3: Kinesis Firehose -> S3 -> Glue/Athena/Redshift
    │
    └── Rule: logs -> S3 (raw archive)
  Command path (downlink):
    API / Service -> AWS IoT Core -> Device shadow / MQTT topic -> Device
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Massive ingestion | Kinesis Data Streams | Shard-based throughput; multiple consumers; replay |
| Real-time alerts | IoT Core Rules + SNS + Lambda | Sub-second routing for critical events |
| Hot state | DynamoDB with TTL | Latest state per device; old state auto-expires |
| Cold analytics | S3 + Glue + Athena | Cost-effective long-term storage and ad-hoc queries |
| Device command | IoT Core Device Shadow / MQTT | Bidirectional messaging with offline queue |

  CAP trade-offs:
- **AP for telemetry**: occasional duplicate or out-of-order messages accepted; idempotent updates.
- **Explicit command ownership for device control**: design for disconnects, retries, version conflicts, and stale shadow observations rather than claiming universal strong consistency.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Hot shard in Kinesis | Throttling | Use high-cardinality device ID as partition key; monitor shard metrics |
| DynamoDB hot partition | Device state writes throttled | Partition key = `deviceID#date` or write-shard suffix |
| Device authentication abuse | Unauthorized ingestion | IoT Core policies + X.509 certificates / JITP; rate limits per thing group |
| Rule engine dropped message | Data loss | Send critical telemetry to both Kinesis and an S3 archive; reconcile |
| Extended Region outage | Telemetry unavailable | Multi-Region ingestion with DNS steering; devices reconnect to nearest healthy Region |

### Staff-Level Follow-Ups

  **Q: Kinesis or MSK for IoT?** A: Kinesis is simpler and integrates directly with IoT Core rules. MSK is better if we already use Kafka Connect, ksqlDB, or need the Kafka wire protocol. At 1M msg/s, both can work; Kinesis reduces operational burden.

  **Q: How do you handle 1 KB x 1M/s = 1 GB/s throughput?** A: Kinesis shards ingest 1 MB/s each; we need \~1,000 shards, which can scale horizontally. Firehose batches before writing to S3 to avoid tiny files. DynamoDB on-demand handles the hot state with proper sharding.

  **Q: What about devices with intermittent connectivity?** A: Use Device Shadows for last-known-state and desired-state. Queues commands in IoT Core until the device reconnects and subscribes.

  ---

## Cross-Cutting Staff Topics

### Cost Optimization at Scale

| Tactic | Where |
| :---- | :---- |
| Rightsize compute | Use Graviton, latest instance families, gp3 volumes |
| Autoscaling | Scale to zero with Lambda/Fargate; target tracking for EC2/ECS/EKS |
| Storage tiers | S3 Intelligent-Tiering + lifecycle to Glacier; EFS IA |
| Spot / Spot fleets | Batch, CI/CD, non-critical stateless services |
| Reserved / Savings Plans | Predictable baseline workloads |
| Caching | ElastiCache, CloudFront, DAX to reduce database load |
| Optimize data transfer | Use VPC endpoints, CloudFront, same-AZ traffic |

### Zero-Downtime Migration Patterns

| Pattern | Use Case |
| :---- | :---- |
| **Blue/green deployment** | Risky releases; instant rollback |
| **Canary (weighted Route 53 / ALB)** | Gradual traffic shift with metrics gating |
| **Database dual-write + backfill** | Migrating to new DB schema or service |
| **Strangler fig** | Incrementally replacing a monolith |
| **Read replicas + promotion** | Migrating to new storage engine |

### Observability Checklist

| Signal | AWS Tool |
| :---- | :---- |
| Metrics | CloudWatch Metrics, Container Insights, Prometheus/Grafana |
| Logs | CloudWatch Logs, Fluent Bit, OpenSearch |
| Traces | AWS X-Ray, OpenTelemetry |
| Alarms | CloudWatch Alarms, PagerDuty integration |
| Dashboards | CloudWatch Dashboards, Grafana |
| SLO tracking | CloudWatch SLO dashboards, custom metrics |

  ---

## Staff-Level Interview Sound Bites
- "Start every design with SLOs, traffic estimates, and blast-radius boundaries."
- "Use the cheapest durable buffer that meets your ordering and replay needs: SQS for simple queues, Kinesis for streams, MSK if you need Kafka."
- "Active-active is a business decision, not a technical default; only use it when you can partition writes or resolve conflicts."
- "Failover is a data-plane problem; avoid control-plane dependencies during recovery (Route 53 ARC, Global Accelerator)."
- "Cost optimization at scale comes from autoscaling, right-sizing, storage tiering, and avoiding cross-AZ/Region data transfer."

  ---

## Quick Reference: Scenario-to-Service Mapping

| Scenario | Primary Services |
| :---- | :---- |
| Global e-commerce orders | DynamoDB, SQS, SNS, Step Functions, EventBridge, ElastiCache |
| Real-time ride matching | ElastiCache Redis, EKS, Kinesis, DynamoDB, SNS |
| Banking payments | DynamoDB, SQS FIFO, Step Functions, S3 Object Lock, KMS, Route 53 ARC |
| Media processing | S3, SNS, SQS, Lambda, Fargate, MediaConvert, DynamoDB |
| IoT telemetry | IoT Core, Kinesis, DynamoDB, S3, Glue, Athena |
| Multi-Region DR | Aurora Global Database, DynamoDB Global Tables, S3 CRR, Route 53 ARC, FIS |
| Highly available Node.js API | Route 53, CloudFront, WAF, ALB, ECS/EKS/EC2, Aurora, VPC endpoints |
| Production CI/CD pipeline | GitHub, CodePipeline/CodeBuild, ECR, CodeDeploy, CloudWatch |
| Gaming leaderboards | ElastiCache Redis, DynamoDB, Kinesis, API Gateway |
| S3 access log analytics | S3, Glue, Athena, Parquet, lifecycle policies |
| 10× traffic spike | CloudFront, WAF, ALB, Auto Scaling, ElastiCache, DynamoDB, SQS FIFO |

  ---

## Case Study 6: Highly Available Node.js API (BMW-Style Staff Question)

### Scenario & Scale Requirements

  Design traffic routing for a highly available Node.js API where backend services and PostgreSQL cannot be publicly accessible.
- **Traffic**: 100,000 requests/min, spiking to 1M/min during campaigns.
- **Availability target**: 99.99%.
- **Database**: PostgreSQL on AWS (Aurora or RDS).
- **Security**: backend must not be reachable from the internet.

### Proposed Architecture

```text
  Internet Users
     │
     ▼
  Route 53 (latency + health checks)
     │
     ▼
  CloudFront (edge caching / WAF)
     │
     ▼
  WAF (rate limiting, bot control, rule sets)
     │
     ▼
  ALB (public-facing, cross-AZ)
     │
     ├──► AZ-a Private Subnet: ECS/EKS/EC2 Node.js
     └──► AZ-b Private Subnet: ECS/EKS/EC2 Node.js
            │
            ▼
     Security Group: allow traffic only from ALB
            │
            ▼
     Aurora PostgreSQL (Multi-AZ, private DB subnets)
            │
            └── Security Group: allow 5432 only from app tier
  Outbound from private subnets:
- NAT Gateway per AZ for third-party APIs
- VPC Gateway Endpoint for S3/DynamoDB to avoid NAT
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Public exposure | Only ALB and CloudFront are public | Backend subnets are private by route table |
| Edge protection | CloudFront + WAF | DDoS mitigation, caching, geo-blocking |
| High availability | ALB across 2+ AZs, Aurora Multi-AZ | Survives single AZ failure |
| Database failover | Aurora Multi-AZ auto-failover | Writer failover in \~30 seconds |
| Cost | NAT Gateway per AZ | Avoids cross-AZ NAT traffic and single point of failure |
| Private AWS service access | Gateway VPC Endpoints for S3/DynamoDB | No internet/NAT needed |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| AZ-a outage | AZ-a targets unhealthy | ALB routes to AZ-b; Aurora fails over writer |
| ALB public subnet issue | External traffic blocked | Route 53 health checks fail over to secondary Region if multi-Region |
| Database primary failure | Writes blocked | Aurora Multi-AZ automatic failover; app retry with exponential backoff |
| DDoS attack | ALB/CloudFront overload | CloudFront + Shield + WAF rate rules absorb attack |
| NAT Gateway AZ failure | Outbound calls from AZ-a fail | One NAT per AZ; AZ-a app retries or AZ-b takes load |

### Staff-Level Follow-Ups

  **Q: Should the ALB be public or internal?** A: Public, because users reach it from the internet. Internal ALB is only for service-to-service inside the VPC. For an external API, the entry point must be internet-facing, protected by WAF and Security Groups.

  **Q: Why NAT Gateway per AZ?** A: If AZ-a app traffic routes to a NAT in AZ-b and AZ-b fails, AZ-a loses outbound internet. A NAT per AZ keeps egress local and avoids cross-AZ data-transfer charges.

  **Q: How do you call S3 from private subnets?** A: Use a VPC Gateway Endpoint for S3 (and DynamoDB). Traffic stays on AWS backbone, avoids NAT costs, and can be restricted by bucket/endpoint policy.

  ---

## Case Study 7: AWS CI/CD Pipeline for a Production Service

### Scenario & Scale Requirements

  Build a production-grade CI/CD pipeline for a microservice with automated testing, secure artifact storage, and zero-downtime deployments.
- **Team**: 50 developers, multiple services.
- **Deployment frequency**: multiple times per day.
- **Rollback target**: < 5 minutes.
- **Security**: no long-lived credentials; secrets never in source code.

### Proposed Architecture

```text
  Developer pushes to GitHub
     │
     ▼
  GitHub Actions / AWS CodePipeline (webhook trigger)
     │
     ▼
  AWS CodeBuild
     ├── Run unit tests, lint, security scans (Trivy, SonarQube)
     ├── Build Docker image
     └── Push to Amazon ECR
     │
     ▼
  Artifact stored in ECR + SBOM in S3
     │
     ▼
  AWS CodeDeploy / ECS blue-green / EKS Argo Rollouts
     │
     ├── Deploy to staging -> integration tests
     └── Deploy to production with canary (10% -> 50% -> 100%)
     │
     ▼
  CloudWatch Alarms / Synthetic Canaries
     │
     └── Auto-rollback on error budget breach or alarm
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Source control | GitHub | Developer familiarity; CodePipeline integration via webhook/OIDC |
| Build environment | CodeBuild / GitHub Actions | Ephemeral, scalable, no persistent build servers |
| Artifact security | ECR scan + SBOM | Vulnerability scanning, immutable image tags |
| Deployment safety | Canary / blue-green | Limits blast radius, metrics-gated promotion |
| Secrets | Secrets Manager + IAM roles | No hard-coded secrets; short-lived credentials via OIDC |
| Rollback | Automated canary rollback | Faster than manual; tied to CloudWatch alarms |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Flaky test blocks deployment | Delay | Mark flaky tests, quarantine, and fix; use test retries carefully |
| Vulnerability found in image | Deployment blocked | Patching pipeline; base image updates automated |
| Canary metrics degrade | Users impacted | Automatic rollback to previous stable version |
| Build artifact compromised | Supply-chain risk | ECR immutable tags, signed images (Notation/Sigstore), S3 object versioning |
| Pipeline credentials leaked | Account compromise | Use OIDC federation; no long-lived access keys |

### Staff-Level Follow-Ups

  **Q: Blue/green vs canary?** A: Blue/green instantaneously shifts traffic with fast rollback but doubles capacity during switch. Canary gradually shifts traffic based on metrics, cheaper but slower to detect issues. For high-frequency deploys, canary is usually preferred.

  **Q: How do you secure the pipeline?** A: OIDC-based roles, least-privilege IAM, ECR image scanning, SBOMs, signed artifacts, secrets in Secrets Manager, and pipeline audit logs in CloudTrail.

  **Q: What metrics gate canary promotion?** A: Error rate, p99 latency, business KPIs (checkout success rate), and custom CloudWatch alarms. If any breach, auto-rollback.

  ---

## Case Study 8: Gaming Leaderboards at 100M+ Players

### Scenario & Scale Requirements

  Build a global gaming leaderboard supporting 100 million players, real-time score updates, and top-N queries.
- **Updates**: 10,000 score updates/second at peak.
- **Reads**: 1,000,000 leaderboard queries/second.
- **Latency**: P99 read < 10 ms.
- **Features**: global top 100, friend leaderboards, regional leaderboards.

### Proposed Architecture

```text
  Game client
     │
     ▼
  API Gateway / ALB -> Lambda / ECS (score submission service)
     │
     ├── Write score -> ElastiCache Redis Sorted Set (ZADD/ZINCRBY)
     │
     ├── Persist durable record -> DynamoDB (playerId -> score history, TTL)
     │
     └── Emit event -> Kinesis -> real-time analytics / anti-cheat
  Reads:
     Game client -> CloudFront / API Gateway -> Redis
     ├── Global leaderboard: ZREVRANGE global 0 99
     ├── Friend leaderboard: ZREVRANGE friends:<playerId> 0 N
     └── Regional leaderboard: ZREVRANGE region:<code> 0 N
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Ultra-low latency reads | Redis Sorted Sets | In-memory, O(log N) rank/range operations |
| Durability | DynamoDB score history | Redis is hot cache; DynamoDB is source of truth |
| Sharding | Redis Cluster by player ID | Distributes load across nodes |
| Global board | Single "global" key + cache top 100 | Heavy read but small set; cache aggressively |
| Regional boards | Keys per region | Reduces contention and cross-Region latency |
| Tie-breaking | Store timestamp as score decimal | `score*1e9 + (max_timestamp - timestamp)` |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Redis node failure | Reads/updates to shard fail | Redis Cluster replicas promote; app retries other shards |
| Hot key on global leaderboard | Single shard overloaded | Cache top 100 externally (CloudFront/API); shard by sub-leaderboard |
| Score exploit/cheat | Invalid rankings | Kinesis stream feeds anti-cheat; replay detection |
| Regional latency | Players far from Redis | Deploy Redis per Region; eventual replication for global board |
| Data loss on Redis crash | Scores lost | Async write-behind to DynamoDB; replay from DynamoDB if needed |

### Staff-Level Follow-Ups

  **Q: How do you handle ties?** A: Encode the score and timestamp into a single double. For example, `final_score = score * 1,000,000,000 + (max_epoch - timestamp)`. Earlier submission wins when scores are equal.

  **Q: What if the global leaderboard key becomes too hot?** A: Maintain the top 100 in a separate key updated periodically, not on every score change. For full board queries, compute from per-shard keys or use approximations.

  **Q: Redis or DynamoDB for leaderboards?** A: Redis for hot real-time reads/writes; DynamoDB for durable history and anti-cheat audit. Choose Redis when sorted-set operations and very low hot-read latency dominate; DynamoDB can remain the durable authority, but benchmark both against the access pattern and SLO.

  ---

## Case Study 9: S3 Access Logs at Massive Scale

### Scenario & Scale Requirements

  A high-traffic application generates billions of S3 access log lines per day. Design a cost-effective pipeline to store, query, and monitor them.
- **Volume**: 100 GB/day of logs, growing to 10 TB/day.
- **Query needs**: ad-hoc security analysis, usage trends, billing attribution.
- **Retention**: 1 year hot, 7 years cold.
- **Cost target**: minimize storage and query cost.

### Proposed Architecture

```text
  S3 access logs
     │
     ▼
  Raw log bucket (S3)
     │
     ├── S3 Event -> Lambda (partitioning + compression)
     │
     └── OR S3 + S3 Inventory + Glue crawler
     │
     ▼
  Processed logs bucket
     ├── Partitioned by year/month/day/hour
     ├── Converted to Parquet via Glue ETL / Lambda
     └── Cataloged in AWS Glue Data Catalog
     │
     ▼
  Query layer: Amazon Athena
     │
     └── Partition pruning + columnar Parquet -> fast/cheap queries
     │
     ▼
  Lifecycle:
- 90 days in S3 Standard-IA
- 1 year in S3 Glacier Instant Retrieval
- 7 years in Glacier Deep Archive
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Query cost | Athena + Parquet partitions | Columnar format reduces data scanned |
| Storage cost | Lifecycle to Glacier tiers | Logs are mostly cold after a few days |
| Schema discovery | Glue Data Catalog / Crawler | Automatic table/partition management |
| Real-time needs | Optional: Kinesis Firehose -> S3 -> Athena | For near-real-time dashboards |
| Compression | Gzip/Snappy Parquet | Reduces storage and Athena scan cost |
| Partitioning | year/month/day/hour | Enables partition pruning in queries |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Partition skew (one hour huge) | Slow Athena queries | Partition by hour + bucket by source prefix |
| Glue crawler runaway cost | Expensive scans | Use partition projection instead of crawlers at scale |
| Athena query too slow | Timeout | Optimize Parquet, reduce columns, add partitioning |
| Log tampering | Security analysis unreliable | S3 Object Lock / versioning; write-once log bucket |
| Sensitive data in logs | Compliance risk | Scrub PII during processing; restrict Athena IAM |

### Staff-Level Follow-Ups

  **Q: Athena vs OpenSearch for logs?** A: Athena is cost-effective for occasional ad-hoc queries on large historical data. OpenSearch/CloudWatch Logs is better for real-time search and dashboards. Many designs use both: hot logs in OpenSearch, cold logs in S3 + Athena.

  **Q: How do you reduce Athena cost at 10 TB/day?" A: Convert to Parquet with Snappy, partition aggressively, drop unused columns, use partition projection, and add lifecycle to Glacier for old data. Also consider S3 Select for targeted retrieval.

  ---

## Case Study 10: Handling a 10× Traffic Spike

### Scenario & Scale Requirements

  An e-commerce site expects 10× normal traffic during a flash sale. Design a resilient architecture that stays available and controls cost.
- **Baseline**: 1,000 RPS.
- **Peak**: 10,000 RPS.
- **Inventory**: limited; overselling must be prevented.
- **Latency**: P99 checkout < 300 ms.

### Proposed Architecture

```text
  Users
     │
     ▼
  Route 53 -> CloudFront -> WAF
     │
     ▼
  ALB -> ECS/EKS (checkout service) Auto Scaling
     │
     ▼
  Application
     ├── Read inventory: ElastiCache Redis (hot stock cache)
     ├── Reserve stock: DynamoDB conditional write
     ├── Place order: SQS FIFO (OrderQueue)
     └── Payment: Step Functions saga
  Auto Scaling:
- ECS target tracking on ALB request count per target
- DynamoDB on-demand for inventory/order tables
- ElastiCache cluster mode enabled
```

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Absorb spike | SQS FIFO decouples order placement from processing | Prevents backend overload |
| Inventory correctness | Redis cache + DynamoDB conditional write | Cache is fast hint; DB is authority |
| Cost control | Spot for stateless workers, on-demand DB | Pay for burst capacity, not idle overprovision |
| Hot partition | Inventory sharded by SKU + random suffix | Avoids single SKU partition overload |
| Overload protection | WAF rate limits + queue depth scaling | Rejects excessive traffic before queue fills |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Inventory cache stale | Oversell | Conditional DynamoDB write on decrement; refresh cache from DB on miss |
| SQS FIFO throttling | Orders rejected | Use multiple `MessageGroupId` values per SKU; scale FIFO throughput |
| Payment provider slow | Queue backlog | Step Functions retries; scale payment workers on queue depth |
| Bot traffic | Legitimate users blocked | WAF rate limiting, CAPTCHA, challenge rules |
| Redis failure | Cache miss storm | Fallback to DynamoDB reads; circuit breaker on cache calls |

### Staff-Level Follow-Ups

  **Q: Why SQS FIFO and not standard SQS?** A: Orders for the same SKU must be processed sequentially to avoid overselling. FIFO with `MessageGroupId` per SKU preserves ordering and supports deduplication per group while allowing parallelism across SKUs; conditional inventory writes and idempotent consumers enforce correctness.

  **Q: How do you prevent cost explosion during the spike?** A: Use target-tracking auto-scaling with maximum capacity limits, Spot instances where possible, DynamoDB on-demand (which scales but costs more per request; reserved for spikes), and cache reads to reduce DB load.

  **Q: What if the queue fills faster than consumers can process?** A: Set queue-depth alarms and max message age thresholds. If exceeded, throttle ingress at WAF or return a "sale busy" page. Use Lambda event source mapping with batching and scaling based on `ApproximateNumberOfMessagesVisible`.

  ---

## Textual Mind Map: Staff-Level System Design Approach

```text
Interview Scenario
     │
     ├── Gather Requirements
     │      ├── Scale: RPS, data volume, users
     │      ├── Latency / throughput targets
     │      ├── Availability / RTO / RPO
     │      └── Compliance / security constraints
     │
     ├── Draw Architecture
     │      ├── Traffic layers (DNS -> Edge -> LB -> App -> Data)
     │      ├── Compute choice (EC2 / ECS / EKS / Lambda)
     │      ├── Data stores (SQL / NoSQL / Cache / Object / Archive)
     │      ├── Messaging (SQS / SNS / EventBridge / Kinesis / Step Functions)
     │      └── Security (IAM, VPC, WAF, encryption)
     │
     ├── Analyze Trade-offs
     │      ├── Latency vs cost
     │      ├── Consistency vs availability
     │      ├── Operational simplicity vs flexibility
     │      └── Single-Region vs multi-Region
     │
     ├── Identify Failure Modes
     │      ├── AZ failure, Region failure, dependency failure
     │      ├── Hot partitions, hot keys, retry storms
     │      ├── Data corruption, security breach, DDoS
     │      └── Cost runaway
     │
     └── Prepare Follow-up Answers
            ├── Why this service and not alternative?
            ├── How does it scale?
            ├── How do you monitor and alert?
            └── How do you deploy and rollback safely?
  ---
## Case Study 11: Exposing a Private SaaS Service to Tenants via AWS PrivateLink
### Scenario & Scale Requirements
  You run a B2B SaaS platform on AWS. Tenants need to call your internal services from their own VPCs without traversing the public internet and without coordinating CIDR ranges.
- **Tenants**: thousands of external customer VPCs.
- **Service**: REST API running in your AWS account behind an internal ALB.
- **Security**: traffic must stay on AWS backbone; tenants must not reach your VPC internals.
- **Scale**: millions of requests/day across all tenants.
### Proposed Architecture
```text
```text
  Tenant VPC                              Provider (Your) VPC
     │                                         │
     │  Interface Endpoint (tenant-owned)        │
     │      points to your Endpoint Service      │
     └────────────────────────────────────────►│
                                                 │
                                        PrivateLink Endpoint Service
                                                 │
                                                 ├── Network Load Balancer
                                                 │      └── Internal ALB / ECS / EKS
                                                 │
                                                 └── Acceptance required (manual/auto)
- Provider creates a **VPC Endpoint Service** backed by an NLB.
- Tenants create **Interface Endpoints** in their VPCs.
- Provider accepts endpoint connection requests (manually for trusted tenants or with IAM conditions).
- DNS resolution via custom private hosted zones shared to tenant VPCs or via Route 53 Resolver.
```
```
### In-Depth Trade-off Analysis
| Concern | Decision | Reason |
| :---- | :---- | :---- |
| Tenant isolation | Interface endpoint per tenant | No shared ENI; each tenant has its own endpoint |
| CIDR overlap | PrivateLink handles overlap | Traffic is proxied; no peering required |
| Security | Endpoint service accepts connections + IAM/SG controls | Provider controls who can connect |
| DNS | Private hosted zone per tenant or shared PHZ | Resolves friendly service hostname |
| Cost | Per-ENI hourly + data processing | Tenant pays for endpoint ENIs in their VPC; provider pays for NLB/Endpoint Service |
### Failure Modes & Mitigations
| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| Endpoint service AZ outage | Tenants in that AZ lose access | Deploy NLB endpoints in at least two AZs |
| Tenant misconfiguration | Traffic not reaching service | Provide Terraform/CloudFormation templates and connection validation |
| Service overload | Latency spikes across tenants | Add Application Load Balancer autoscaling and per-tenant throttling/API keys |
| DNS leakage | Internal hostname resolves publicly | Restrict hosted zone associations; use private DNS only |
### Staff-Level Follow-Ups
  **Q: Why PrivateLink and not VPC peering or TGW?** A: Peering requires non-overlapping CIDRs and creates transitive routing complexity. TGW is good for many internal VPCs but still exposes the whole network. PrivateLink exposes only the service endpoint, works with overlapping CIDRs, and keeps traffic on the AWS backbone.
  **Q: How do you bill tenants for PrivateLink usage?** A: Tenants pay for their own interface endpoints. The provider pays for the NLB and endpoint service. For usage-based billing, add API Gateway or ALB access logs and meter requests per tenant.
  **Q: How do you protect the provider side?** A: Use an internal ALB/NLB in private subnets, Security Groups restricting source to the endpoint service, IAM endpoint policies, AWS WAF if fronted by API Gateway, and CloudWatch metrics to detect abuse.
  ---
## Case Study 12: Resilient Multi-AZ Node.js API with an Unreliable External Service
### Scenario & Scale Requirements
  Design a highly available Node.js API that also calls a third-party service with variable latency and occasional failures.
- **Traffic**: 100,000 requests/min baseline, spiking to 1,000,000/min during campaigns.
- **Availability target**: 99.99%.
- **External dependency**: third-party REST API with sporadic 5xx errors and >5s tail latency.
- **Security**: backend services and PostgreSQL must not be publicly reachable.
### Proposed Architecture
```text
```text
  Internet Users
     │
     ▼
  Route 53 -> CloudFront + WAF
     │
     ▼
  API Gateway / ALB (public, cross-AZ)
     │
     ▼
  ECS/EKS Node.js service in private subnets across 2+ AZs
     │
     ├── Read/write -> Aurora PostgreSQL (Multi-AZ, private DB subnets)
     ├── Documents -> S3 via VPC Gateway Endpoint
     └── External calls -> SQS (Outbox) -> Worker pool -> External API
  Resilience controls:
- **SQS buffer** decouples the external API from front-end request handlers.
- **Circuit breaker** on the worker prevents repeated calls to a failing dependency.
- **Exponential backoff + jitter** for retries inside workers.
- **DLQ** for requests that permanently fail so they can be reconciled later.
- **Worker Auto Scaling** based on `ApproximateNumberOfMessagesVisible`.
- **Aurora Multi-AZ** for database failover; read replicas for scale.
```
```
### In-Depth Trade-off Analysis
| Concern | Decision | Reason |
| :---- | :---- | :---- |
| External API bursts | SQS between app and worker | Prevents downstream slowness from consuming front-end threads |
| Avoid retry storms | Circuit breaker + backoff | Stops hammering a failing endpoint; probes recovery in half-open state |
| 10× traffic spike | CloudFront cache + WAF rate limits + target tracking autoscaling | Absorbs and shapes load before it reaches the API |
| Private database | Aurora in private subnets; SG allows 5432 only from app tier | No public exposure |
| S3 access from private subnets | Gateway VPC endpoint | Avoids NAT and keeps traffic on AWS backbone |
| Asynchronous result | 202 Accepted + job ID | Caller polls or receives webhook when external call completes |
### Failure Modes & Mitigations
| Failure | Impact | Mitigation |
| :---- | :---- | :---- |
| External API down | External operations queue up | Circuit breaker opens; workers process other jobs; DLQ catches permanent failures |
| Worker pool slow | SQS backlog grows | Scale workers on queue depth; alarm on message age |
| Single AZ outage | Targets in one AZ fail | ALB routes to healthy AZ; Aurora fails over writer |
| Traffic spike exceeds capacity | Latency rises, errors increase | WAF rate limits, CloudFront cache, target tracking autoscaling, queue backpressure |
| Database primary failure | Writes blocked briefly | Aurora Multi-AZ automatic failover; app retries with exponential backoff |
| Malicious traffic | Resource exhaustion / DDoS | CloudFront + Shield + WAF rate rules absorb and block bad traffic |
### Staff-Level Follow-Ups
  **Q: Why place SQS between the application and the external API?** A: The external API's latency and failures would otherwise propagate to the synchronous front-end path. SQS lets us accept the request quickly, process external calls asynchronously, retry independently, and avoid cascading timeouts.
  **Q: How do you choose circuit-breaker thresholds?** A: Use a rolling window of recent calls (e.g., 30 seconds, minimum 20 requests). Open when error rate exceeds 50%; move to half-open after a cool-down and allow a trickle of requests to test recovery. Base thresholds on observed p99 behavior, not just averages.
  **Q: What if the external API is down for hours?** A: The queue grows and alarms fire. We serve a degraded response (cached result or "pending" status) while parking work in the queue. A reconciliation job drains the DLQ once the API recovers.
  **Q: How do you keep the database private?** A: Aurora runs in private DB subnets with no public IP. Route tables do not route 0.0.0.0/0 to an IGW. The app tier Security Group is allowed on port 5432 only from the app tier Security Group.
## Part III — ECS Containerization and Deployment Workflow
**First response:** "I build one immutable image, scan and sign it, publish it to ECR, register a task-definition revision, and let an ECS service deploy it across AZs behind an ALB. Promotion and rollback are gated by health, SLO, and business metrics."
### Step 1: Build a Production Container
Pin versions, install from the lockfile, run as non-root, and exclude secrets/build artifacts with `.dockerignore`.
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node . .
ENV NODE_ENV=production
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
CMD ["npm", "start"]
```
```bash
docker build --platform linux/amd64 -t my-app:${GIT_SHA} .
docker run --rm -p 8080:8080 my-app:${GIT_SHA}
curl --fail http://localhost:8080/health
```
Inject environment configuration through the task definition and retrieve secrets from Secrets Manager or Parameter Store; never bake them into the image.
### Step 2: Publish an Immutable Image to Amazon ECR
```bash
AWS_ACCOUNT_ID="123456789012"
AWS_REGION="us-east-1"
REPOSITORY="my-app"
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPOSITORY}"
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin \
      "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
docker build -t "${REPOSITORY}:${GIT_SHA}" .
docker tag "${REPOSITORY}:${GIT_SHA}" "${IMAGE_URI}:${GIT_SHA}"
docker push "${IMAGE_URI}:${GIT_SHA}"
```
Enable tag immutability, encryption, lifecycle policies, scanning, SBOM generation, signing/attestation, and least-privilege CI push/task pull permissions. Promote the same digest across environments instead of rebuilding it.
### Step 3: Understand the ECS Runtime Model
- **Task definition:** Versioned specification for images, CPU/memory, ports, health checks, logs, environment, secrets, roles, storage, and networking.
- **Task:** One running task-definition instantiation; standalone tasks fit batch or one-off work.
- **Service:** Maintains desired count, replaces unhealthy tasks, integrates with load balancing/service discovery, and deploys revisions.
- **Cluster:** Scheduling boundary backed by Fargate capacity or ECS container instances.
- **Execution role:** Lets the ECS agent pull images, retrieve configured secrets, and write logs.
- **Task role:** Least-privilege AWS permissions used by application code.
| Decision | AWS Fargate | ECS on EC2 |
|---|---|---|
| Infrastructure | AWS manages hosts | Team manages AMIs, patching, capacity, draining, and placement |
| Control | Task-level resources/networking | Host access, custom AMIs, GPUs, agents, and placement control |
| Economics | Variable demand and low operational overhead | Steady, highly utilized fleets or specialized capacity |
| Scaling | Service/task scaling | Service scaling plus capacity-provider/ASG scaling |
### Step 4: Provision the Service
Use Terraform, CloudFormation/CDK, or Copilot for ECR, IAM, VPC/security groups, ALB/targets, logs/alarms, task definition, service, autoscaling, and deployment policy.
```text
```text
Internet client
      │ HTTPS
      ▼
Route 53 → CloudFront/WAF (optional) → ALB across 2+ AZs
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
                 ECS task in AZ-a                    ECS task in AZ-b
                 private subnet                      private subnet
                         │                                   │
                         ├──────────► Aurora/RDS ◄───────────┤
                         ├──────────► ElastiCache ◄──────────┤
                         └──────────► AWS APIs through VPC endpoints
Third-party egress → NAT Gateway per AZ when required
Telemetry          → CloudWatch / OpenTelemetry / X-Ray
Secrets            → Secrets Manager / Parameter Store
```
```
### Step 5: Deploy Through CI/CD
Argo CD, Helm, Kubernetes Deployments, and ReplicaSets are EKS concepts—not a native ECS rollout.
```text
```text
Developer
   │ 1. Open PR
   ▼
Source repository
   │ 2. Test, lint, SAST, dependency and IaC checks
   ▼
Protected merge
   │ 3. Build once; scan; generate SBOM; sign
   ▼
Amazon ECR (immutable digest)
   │ 4. Register task-definition revision
   ▼
ECS deployment
   │ 5. Start replacement task set across AZs
   │ 6. Pass container and target-group health checks
   ▼
Canary / linear / blue-green traffic shift
   │ 7. Gate on errors, latency, saturation, and business KPIs
   ├── unhealthy ──► stop promotion → roll back task definition
   └── healthy ────► complete traffic shift → drain old tasks
```
```
- **Rolling:** Lowest temporary cost; preserve capacity with `minimumHealthyPercent` and `maximumPercent`.
- **Blue/green:** Fast traffic rollback; requires extra capacity and backward-compatible data changes.
- **Canary/linear:** Limits blast radius; requires representative traffic and reliable automated analysis.
### Step 6: Runtime Request and Failure Flow
```text
```text
Client → Route 53 → CloudFront/WAF → ALB → healthy ECS task
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         ▼                      ▼                      ▼
                    ElastiCache             Aurora/RDS          SQS/EventBridge
                         │                      │                      │
                         └────────────── response / async work ───────┘
                                                │
                                                ▼
                                      CloudWatch / OTel telemetry
```
```
Design for task, AZ, and dependency failure: readiness before traffic, graceful `SIGTERM`, connection draining, bounded timeouts, jittered retries, circuit breakers, idempotency, backpressure, and DLQs. Scale on the limiting signal—not CPU alone.
### Step 7: Staff-Level Production Checklist
- Multi-AZ tasks and targets; private subnets and least-privilege security-group paths.
- Separate task and execution roles; short-lived credentials only.
- Immutable digest, task revision, SBOM, signature, and deployment provenance.
- Health checks aligned with startup and graceful shutdown.
- Autoscaling bounds, quotas, deployment headroom, and capacity tests.
- Logs, metrics, traces, deployment annotations, SLOs, and unit-cost telemetry.
- Expand/migrate/contract database changes and tested rollback/roll-forward.
## Part IV — Deep Dive: Staff-Level Media Processing at Scale
The current architecture is directionally correct, but for a **Staff Engineer interview** I would change several things. The biggest issue is that **ECS Fargate + MediaConvert is redundant unless Fargate is doing custom processing**. MediaConvert should own the actual video transcoding workload. I would also make the ingestion path idempotent, introduce explicit workflow state, separate control-plane and data-plane concerns, and design for burst absorption.
## **1. Hard Truths in the Current Architecture**
| Current decision | Problem | Staff-level correction |
| ----- | ----- | ----- |
| S3 → SNS → SQS | Valid, but SNS adds little if there is only one consumer | Use **EventBridge/SNS fan-out only when multiple independent consumers need the event** |
| ECS Fargate → MediaConvert | Potentially unnecessary double orchestration | Use **Fargate only for custom FFmpeg/pre-processing**; MediaConvert handles transcoding |
| DynamoDB / ElastiCache for job state | ElastiCache should not be the source of truth | DynamoDB is authoritative; Redis is optional cache only |
| Step Functions receives S3 event | Workflow can become tightly coupled to S3 events | Create a durable **Job record first**, then start workflow |
| Content hash during upload | Computing a 1 GB hash synchronously can be expensive | Use S3 checksum/object metadata or asynchronous fingerprinting |
| SQS autoscaling → Fargate | Doesn't directly solve MediaConvert capacity | Scale custom workers based on queue depth; separately control MediaConvert job queues |
| S3 notification as sole trigger | Event delivery can be duplicated/out-of-order | Design for **at-least-once delivery + idempotency** |
| Fargate Spot for video transcoding | Not useful if MediaConvert performs transcoding | Use MediaConvert queue/pricing strategy; use Fargate Spot only for custom workers |
The most important interview statement is:
> **"I would separate the data plane from the control plane. S3 owns the media bytes, DynamoDB owns job state, SQS/EventBridge provides durable asynchronous signaling, Step Functions owns workflow orchestration, and MediaConvert owns the expensive video transformation."**
>
>
```

---

### 2. Recommended Staff-Level Architecture

### **Architecture**

```text
                        ┌──────────────────────┐
                        │        Client        │
                        └──────────┬───────────┘
                                   │
                          Presigned URL
                                   │
                                   ▼
                     ┌─────────────────────────┐
                     │      S3 Raw Bucket      │
                     │   /uploads/{assetId}    │
                     └────────────┬────────────┘
                                  │
                         S3 Object Created
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │      EventBridge        │
                     │  Event Routing / Fanout │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │   Ingestion SQS Queue   │
                     │      + DLQ              │
                     └────────────┬────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   Job Initializer Lambda │
                    │  Validate + Idempotency  │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             Image Processing          Video Processing
                    │                         │
                    ▼                         ▼
             Lambda + Sharp           Step Functions
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                                    ▼                   ▼
                              Metadata Extract     MediaConvert
                                    │                   │
                                    │                   ▼
                                    │            Output S3 Bucket
                                    │                   │
                                    └─────────┬─────────┘
                                              ▼
                                      Job Finalization
                                              │
                                              ▼
                                         DynamoDB
                                              │
                                              ▼
                                     Notification Queue
                                              │
                                ┌─────────────┴────────────┐
                                ▼                          ▼
                              SNS                       Email
```


---

### 3. Start With the Numbers

A Staff-level answer should quantify the system before choosing services.

Given:

* 10,000 videos/hour
* Maximum size = 1 GB
* Average arrival rate:

$10,000/3600\approx 2.78uploads/sec$

The **average request rate is not particularly high**.

The problem is the **data volume and processing duration**.

Worst-case ingress:

$10,000\times 1GB=10TB/hour$

That's roughly:

$2.78GB/sec$

of potential incoming data.

This immediately leads to an important architectural decision:

> **The application servers should never proxy the video bytes.**

The client should upload directly to S3 using a multipart presigned upload.

---

### 4. Upload Architecture

Instead of:

```text
Client → API → Application → S3
```

use:

```text
Client
   │
   │ 1. Request upload session
   ▼
Upload API
   │
   │ 2. Create assetId
   │
   │ 3. Generate presigned multipart URLs
   ▼
Client
   │
   │ 4. Multipart upload
   ▼
S3
```

### **Why?**

If your API handles the 1 GB payload:

* application bandwidth becomes the bottleneck
* ECS/EC2 networking costs increase
* application instances need massive scaling
* failure recovery becomes harder
* uploads consume application connections

S3 removes the entire data-transfer bottleneck from your application tier.

---

### 5. Upload Session

Create an asset record before the upload:

```json
{
  "assetId": "asset_123",
  "userId": "user_456",
  "status": "UPLOADING",
  "objectKey": "raw/user_456/asset_123/video.mp4",
  "createdAt": 1728240000,
  "version": 1
}
```

Then generate a multipart upload.

The client uploads directly:

```text
Client
  │
  ├── Part 1 ───────► S3
  ├── Part 2 ───────► S3
  ├── Part 3 ───────► S3
  ├── ...
  └── Part N ───────► S3
```

After completion:

```text
S3
 ↓
ObjectCreated
```

---

### 6. Event Ingestion

I would use:

```text
S3
 ↓
EventBridge
 ↓
SQS
 ↓
Job Initializer
```

rather than directly coupling S3 to individual processors.

The queue provides:

* burst absorption
* retry
* visibility timeout
* DLQ
* backpressure
* consumer scaling

The important Staff-level concept:

> **The upload rate and processing rate are intentionally decoupled.**

If 10,000 users upload simultaneously, S3 accepts the data while SQS absorbs the processing burst.

---

### 7. Idempotency Is Mandatory

S3 events are effectively **at-least-once** from the application's perspective.

You might receive:

ObjectCreated(asset123)
ObjectCreated(asset123)

twice.

Therefore:

```text
S3 Event
   ↓
Job Initializer
   ↓
DynamoDB conditional write
```

Use something like:

PK = ASSET#asset123
SK = JOB#v1

with:

ConditionExpression:
attribute_not_exists(PK)

If the record already exists:

Duplicate event → ignore

This prevents:

duplicate MediaConvert jobs
duplicate thumbnails
duplicate notifications
---

### 8. State Machine

I would explicitly model the lifecycle.

```text
UPLOADING
   ↓
UPLOADED
   ↓
VALIDATING
   ↓
PROCESSING
   ↓
TRANSCODING
   ↓
PACKAGING
   ↓
COMPLETED
```

Failure:

```text
PROCESSING
    ↓
FAILED
    ↓
RETRYING
    ↓
PROCESSING
```

Permanent failure:

```text
FAILED
   ↓
DEAD_LETTER / MANUAL_REVIEW
```

DynamoDB becomes the authoritative state store.

---

### 9. Step Functions

Use Step Functions as the **control plane**, not as the compute engine.

For a video:

```text
Start
  ↓
Validate Asset
  ↓
Extract Metadata
  ↓
Submit MediaConvert Job
  ↓
Wait
  ↓
Receive MediaConvert Completion
  ↓
Validate Outputs
  ↓
Update DynamoDB
  ↓
Notify User
```

The critical improvement is **not polling MediaConvert continuously**.

Instead:

```text
Step Functions
      │
      │ Submit Job
      ▼
MediaConvert
      │
      │ Job complete
      ▼
EventBridge
      │
      ▼
Step Functions callback
```

This avoids unnecessary polling and scales much better.

---

### 10. MediaConvert Architecture

MediaConvert should be the actual video-processing engine.

For example:

Input:
s3://raw/assets/asset123/video.mp4

```text
             │
             ▼
```

```text
        MediaConvert
             │
       ┌─────┼─────┐
       │     │     │
       ▼     ▼     ▼
      360p  720p 1080p
       │     │     │
       └─────┼─────┘
             ▼
       Output S3
```

Potential outputs:

```text
asset123/
├── 360p/
├── 720p/
├── 1080p/
├── thumbnails/
└── metadata.json
```

If adaptive streaming is required:

```text
HLS
 ├── master.m3u8
 ├── 360p/
 ├── 720p/
 └── 1080p/
```

For a real production media platform, I would strongly prefer **HLS/DASH adaptive bitrate output** rather than simply producing independent MP4 files.

---

### 11. Where ECS Fargate Actually Belongs

This is where I would correct the original architecture.

### **Don't do this**

```text
SQS
 ↓
Fargate
 ↓
MediaConvert
```

if Fargate does nothing meaningful.

That creates an unnecessary compute layer.

### **Use Fargate when you have custom processing**

For example:

```text
S3
 ↓
SQS
 ↓
Fargate
 ↓
FFprobe / custom FFmpeg
 ↓
S3
 ↓
MediaConvert
```

Examples:

* proprietary codec handling
* custom watermarking
* frame-level analysis
* custom ML preprocessing
* video normalization
* specialized FFmpeg filters
* legacy formats unsupported by MediaConvert

Otherwise:

```text
S3 → Step Functions → MediaConvert
```

is cleaner.

---

### 12. Image Processing Path

Images should have an independent path.

```text
S3
 ↓
EventBridge
 ↓
SQS
 ↓
Lambda
 ↓
Sharp
 ↓
S3 processed/
```

For example:

```text
original.jpg
      ↓
├── thumbnail/200x200
├── small/800x800
└── medium/1600x1600
```

Lambda is appropriate because the work is:

* short-lived
* stateless
* bursty
* horizontally scalable

---

### 13. Metadata Extraction

Don't unnecessarily create another independent SQS consumer if metadata extraction is part of the video workflow.

For example:

```text
Step Functions
      │
      ├── Extract metadata
      │
      └── Transcode
```

You could use:

MediaInfo / FFprobe

depending on requirements.

Metadata:

```json
{
  "duration": 540,
  "width": 3840,
  "height": 2160,
  "codec": "H264",
  "fps": 30,
  "bitrate": 12000000,
  "audioCodec": "AAC"
}
```

Store it in DynamoDB or a dedicated metadata store.

---

### 14. Parallel Processing

A strong Staff-level improvement is to exploit workflow parallelism.

After validation:

```text
               VALIDATE
                    │
              ┌─────┴─────┐
              │           │
              ▼           ▼
          Metadata     Transcoding
              │           │
              │      ┌────┼────┐
              │      ▼    ▼    ▼
              │    360p 720p 1080p
              │      │    │    │
              └──────┴────┴────┘
                       │
                       ▼
                    Complete
```

Step Functions can execute independent work concurrently.

This reduces end-to-end latency.

---

### 15. Job State Design

DynamoDB should contain both the aggregate job and optionally processing stages.

Example:

PK = ASSET#123
SK = JOB#1
```json
{
  "assetId": "123",
  "status": "PROCESSING",
  "progress": 67,
  "input": {
    "bucket": "raw",
    "key": "uploads/123/video.mp4"
  },
  "outputs": {
    "360p": "s3://processed/123/360p.mp4",
    "720p": "s3://processed/123/720p.mp4"
  },
  "createdAt": 1728240000,
  "updatedAt": 1728240600
}
```

For stage-level tracking:

PK = ASSET#123
SK = STAGE#TRANSCODE#720P

This allows precise recovery.

---

### 16. Handling 10,000 Uploads/Hour

Average:

2.78 uploads/sec

But suppose there's a 10× burst:

\~28 uploads/sec

S3 handles ingestion.

SQS absorbs the burst.

Workers/processors drain the queue according to available capacity.

This is the fundamental architecture:

> **Absorb → buffer → process → drain.**

Don't attempt to synchronously scale the entire pipeline with the upload rate.

---

### 17. Backpressure

Suppose MediaConvert can process only:

100 jobs concurrently

while uploads generate:

500 jobs

Don't reject uploads.

Instead:

```text
S3
 ↓
SQS
 ↓
500 jobs
 ↓
MediaConvert queue
 ↓
100 active jobs
```

The queue becomes the shock absorber.

Expose:

queueDepth
oldestMessageAge
processingRate
failureRate

as operational metrics.

---

### 18. Queue Prioritization

This is a useful Staff-level discussion.

Not every video has the same SLA.

Create queues such as:

HIGH_PRIORITY
NORMAL
BATCH

For example:

| Queue | Use case | Processing priority |
| ----- | ----- | ----- |
| High | Premium user | Highest |
| Normal | Standard user | Normal |
| Batch | Background reprocessing | Lowest |

Then route jobs accordingly.

You can also create separate MediaConvert queues.

This prevents large batch workloads from starving interactive workloads.

---

### 19. Retry Strategy

Don't blindly retry everything.

Classify failures.

| Failure | Retry? | Strategy |
| ----- | ----- | ----- |
| Temporary AWS failure | Yes | Exponential backoff |
| MediaConvert transient failure | Yes | 3–5 attempts |
| S3 temporary error | Yes | Retry |
| Corrupt video | No | Permanent failure |
| Unsupported codec | No | Manual/error path |
| Invalid metadata | No | Validation failure |
| Permission/IAM issue | Carefully | Alert immediately |
| Duplicate event | No | Idempotency check |

Example:

```text
Attempt 1 → 1 sec
Attempt 2 → 5 sec
Attempt 3 → 30 sec
Attempt 4 → 2 min
```

Then:

DLQ
---

### 20. Exactly-Once Processing

Don't claim exactly-once delivery.

Instead:

> **"I design the system for at-least-once delivery with effectively-once processing through idempotency."**

This is much stronger technically.

Use deterministic identifiers:

assetId
+
processingVersion
+
profile

For example:

asset123:v2:720p

Then duplicate requests resolve to the same processing record.

---

### 21. Reprocessing

Suppose you add a new 4K profile.

Don't overwrite the old job.

Use:

```text
asset123
 ├── processing:v1
 │    ├── 360p
 │    ├── 720p
 │    └── 1080p
 │
 └── processing:v2
      ├── 360p
      ├── 720p
      ├── 1080p
      └── 4K
```

This gives you:

* reproducibility
* rollback
* versioned processing
* auditability

---

### 22. Content Deduplication

Your original idea of hashing is good, but refine it.

Don't necessarily calculate a SHA-256 over 1 GB synchronously in the API.

Instead:

### **Option A — Client-provided checksum**

Client computes:

SHA-256(video)

and sends it with the upload.

Server validates it.

### **Option B — S3 checksum**

Use S3's checksum mechanisms during upload.

### **Option C — Asynchronous fingerprint**

For advanced deduplication:

```text
Upload
 ↓
S3
 ↓
Fingerprint worker
 ↓
DynamoDB
 ↓
Existing asset?
```

Then:

```text
same content + same processing version
        ↓
reuse existing output
```

---

### 23. Security Architecture

This is another area where a Staff-level answer should go deeper.

Use:

```text
Client
 ↓
Cognito / application authentication
 ↓
Upload API
 ↓
Presigned multipart URL
 ↓
S3 quarantine/raw bucket
```

S3:

* Block Public Access
* SSE-KMS
* bucket policies
* least-privilege IAM
* object ownership controls
* lifecycle policies

Processing services should have access only to the specific buckets/prefixes they need.

For example:

Image Lambda
  READ  raw/*
  WRITE processed/images/*

MediaConvert
  READ  raw/*
  WRITE processed/videos/*

Not:

s3:* on *
---

### 24. Malware / Content Validation

I would make this an explicit pre-processing stage.

```text
Upload
 ↓
Quarantine
 ↓
Virus/Malware scan
 ↓
Media validation
 ↓
Processing
```

For video:

Validate:
- container
- codec
- duration
- resolution
- file size
- MIME type
- malformed structures

Potentially use content moderation if the business requires it.

The important distinction:

> **Security validation should happen before expensive transcoding.**

Otherwise an attacker can deliberately submit expensive workloads and create a cost-amplification attack.

---

### 25. Cost Optimization

At 10,000 × 1 GB/hour, storage and processing costs become meaningful.

Use:

```text
Raw S3
 ↓
Lifecycle
 ↓
Intelligent-Tiering
 ↓
Glacier
 ↓
Expiration
```

depending on retention requirements.

But don't blindly use Intelligent-Tiering for everything. For predictable access patterns, lifecycle transitions can be cheaper.

### **Compute**

| Workload | Recommended |
| ----- | ----- |
| Image resize | Lambda |
| Metadata extraction | Lambda/Fargate depending duration |
| Video transcoding | MediaConvert |
| Custom FFmpeg | ECS/Fargate |
| Non-critical custom processing | Fargate Spot |
| Workflow | Step Functions |

---

### 26. Observability

At Staff level, don't just say "CloudWatch."

Define the actual metrics.

### **Ingestion**

upload_success_rate
upload_failure_rate
upload_bytes/sec
multipart_upload_failures

### **Queue**

ApproximateNumberOfMessagesVisible
ApproximateAgeOfOldestMessage
DLQ_messages

### **Processing**

jobs_started
jobs_completed
jobs_failed
processing_duration
transcoding_duration

### **Business**

P50 processing latency
P95 processing latency
P99 processing latency
time_to_first_thumbnail
time_to_final_asset

### **Cost**

cost_per_video
cost_per_GB
MediaConvert cost
S3 storage cost
Lambda invocation cost

The most important SLO could be:

> **99% of successfully uploaded videos become fully processed within 5 minutes.**

Then every component can be evaluated against that SLO.

---

### 27. Distributed Tracing

Create a correlation ID:

correlationId = assetId

Propagate:

```text
Upload
 ↓
S3 event
 ↓
SQS
 ↓
Step Functions
 ↓
MediaConvert
 ↓
Output event
 ↓
Notification
```

Then a single asset can be traced end-to-end.

Example:

assetId=asset_123

appears in:

* application logs
* DynamoDB
* SQS message
* Step Functions execution
* MediaConvert job
* CloudWatch logs
* notification events

This dramatically reduces debugging time.

---

### 28. Notification Architecture

Don't notify the user directly from the MediaConvert callback.

Instead:

```text
MediaConvert
 ↓
EventBridge
 ↓
Workflow
 ↓
DynamoDB = COMPLETED
 ↓
Notification Queue
 ↓
Notification Worker
 ↓
SNS / Email / WebSocket
```

This separates:

processing

from:

notification delivery

If email fails, the video doesn't become `FAILED`.

That is an important failure-domain separation.

---

### 29. API Design

Expose:

POST /v1/assets/upload

Response:

```json
{
  "assetId": "asset_123",
  "uploadId": "multipart_abc",
  "parts": \[...\]
}
```

Status:

GET /v1/assets/{assetId}

Response:

```json
{
  "assetId": "asset_123",
  "status": "PROCESSING",
  "progress": 72,
  "outputs": \[\]
}
```

Completed:

```json
{
  "assetId": "asset_123",
  "status": "COMPLETED",
  "outputs": {
    "thumbnail": "...",
    "360p": "...",
    "720p": "...",
    "1080p": "..."
  }
}
```

For user experience, you could also provide:

WebSocket / SSE

for progress updates instead of clients aggressively polling.

---

### 30. Failure Recovery

Consider the following scenario:

```text
MediaConvert completed
      ↓
DynamoDB update failed
```

Without careful design, the job appears stuck.

Solution:

MediaConvert completion event should contain:

assetId
jobId
processingVersion

A reconciliation process can periodically identify:

MediaConvert = COMPLETE
DynamoDB = PROCESSING

and repair the state.

This is a classic distributed-systems principle:

> **Don't assume a distributed workflow can never lose progress between two successful operations. Build reconciliation.**

---

### 31. Disaster Recovery

For production:

### **S3**

* versioning
* cross-region replication if RPO requires it

### **DynamoDB**

* PITR
* optional global tables

### **Step Functions**

Workflows are reconstructable from persistent state.

### **EventBridge/SQS**

Use durable queues and DLQs.

A regional disaster should ideally result in:

```text
Client
 ↓
Route 53 / Global Accelerator
 ↓
Healthy region
 ↓
S3 + DynamoDB + processing pipeline
```

The actual DR strategy depends heavily on RTO/RPO requirements.

---

### 32. Final Architecture

The answer I would give in the interview is:

```text
                          CLIENT
                              │
                              │
                       Upload API
                              │
                    Presigned Multipart
                              │
                              ▼
                     ┌─────────────────┐
                     │   S3 QUARANTINE │
                     │   / RAW BUCKET  │
                     └────────┬────────┘
                              │
                       ObjectCreated
                              │
                              ▼
                     ┌─────────────────┐
                     │  EventBridge    │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   SQS + DLQ     │
                     └────────┬────────┘
                              │
                              ▼
                    Job Initialization
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
                IMAGE                VIDEO
                    │                   │
                    ▼                   ▼
             Lambda + Sharp       Step Functions
                    │                   │
                    ▼          ┌────────┴─────────┐
              S3 Outputs        │                  │
                               ▼                  ▼
                          Metadata           MediaConvert
                          Extraction              │
                                                 ▼
                                          S3 Video Outputs
                                                 │
                               ┌─────────────────┘
                               ▼
                         Completion Event
                               │
                               ▼
                         Step Functions
                               │
                               ▼
                          DynamoDB
                               │
                               ▼
                       Notification Queue
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
                    SNS                Email
---
```

### 33. Staff-Level Trade-off Matrix

| Dimension | Basic Design | Enhanced Design | Why |
| ----- | ----- | ----- | ----- |
| Upload | API → S3 | Presigned multipart → S3 | Removes application bandwidth bottleneck |
| Eventing | S3 → SNS | S3 → EventBridge → SQS | Better routing + buffering |
| Video processing | Fargate + MediaConvert | MediaConvert directly | Removes unnecessary compute |
| Custom processing | Fargate | Fargate only when necessary | Cost optimization |
| Workflow | Step Functions | Step Functions + callback events | No polling |
| State | DynamoDB | DynamoDB authoritative | Durable state |
| Cache | Redis | Optional | Avoids unnecessary complexity |
| Idempotency | Hash check | Conditional DynamoDB writes + deterministic job IDs | Handles duplicate events |
| Retry | Generic retry | Error classification + exponential backoff | Prevents retry storms |
| Queue | Single queue | Priority queues | SLA isolation |
| Security | Scan uploads | Quarantine → scan → validate → process | Prevents expensive malicious jobs |
| Observability | CloudWatch | SLO + metrics + tracing + cost telemetry | Operational maturity |
| Reprocessing | Not defined | Versioned processing | Supports new codecs/profiles |
| DR | Not defined | S3/DynamoDB/region strategy | Production resilience |
| Notification | Direct | Dedicated notification pipeline | Failure isolation |

---

### 34. The 5 Staff-Level Points to Emphasize

If the interviewer pushes you for the **most important architectural decisions**, focus on these:

### **1. Direct-to-S3 upload**

> "At 1 GB per object, I don't want the application tier in the data path. I issue presigned multipart URLs and let clients upload directly to S3."

### **2. Asynchronous backpressure**

> "The upload rate and processing rate are independent. S3 and SQS absorb bursts, while downstream processing drains the backlog according to available capacity."

### **3. MediaConvert instead of unnecessary Fargate**

> "MediaConvert is the video-processing engine. I only introduce Fargate when I have custom FFmpeg or preprocessing requirements that MediaConvert cannot handle."

### **4. At-least-once + idempotency**

> "I don't depend on exactly-once event delivery. Every processing stage uses deterministic identifiers and conditional writes so duplicate events result in effectively-once processing."

### **5. Control plane vs data plane**

> "The media bytes stay in S3—the data plane. Step Functions, DynamoDB, EventBridge and SQS form the control plane. Keeping those concerns separate lets me scale processing independently without moving large payloads through the control plane."

That last point is particularly strong for a **Staff Engineer interview**, because it demonstrates that you're reasoning about **system boundaries, scaling characteristics, failure domains, and operational economics**, rather than simply selecting AWS services.
## Part V — Source Diagram Details Preserved as Text

The nine embedded source images are transcribed here. Values are source-case figures, not universal AWS benchmarks.

### Cost Baseline

| Service | Share |
|---|---:|
| CloudFront | 24.9% |
| EC2 | 10.4% |
| ECS | 10.4% |
| RDS | 8.3% |
| Cognito | 7.3% |
| WAF | 6.2% |
| NAT | 5.2% |
| SES | 5.2% |
| CloudWatch | 4.1% |
| ElastiCache | 4.1% |
| S3 | 4.1% |
| ELB | 3.1% |
| VPC | 3.1% |
| EBS | 1.6% |

A before/after chart showed the largest reductions in EC2, ECS, and S3, with smaller reductions across RDS, CloudWatch, ElastiCache, Lambda, EBS, and ECR. Treat these as case-specific outcomes.

### EC2 Access Cleanup Workflow

1. Tie access and ownership to employee/contractor lifecycle.
2. On exit, revoke identity and application access.
3. Quarantine and then stop unneeded EC2 instances.
4. Commit to reserved baseline capacity only after measuring stable demand.
5. The source cited approximately `$700/month` savings for this workflow.

### Node.js Diagram Controls

The source diagrams additionally show Cognito, SQS/DLQ, NAT per AZ, VPC endpoints, S3, ElastiCache, private Aurora/RDS with optional RDS Proxy, Secrets Manager, least-privilege IAM, correlated telemetry, timeouts, retry/backoff, circuit breaking, health checks, multi-AZ failover, and degraded behavior.

### Original Media-Pipeline Variants

```text
Source S3 → Lambda job submitter → MediaConvert
          → destination S3 → CloudFront
          → CloudWatch
          → EventBridge → completion Lambda → SNS notification
```

```text
Source video/S3 → Step Functions
  → ingest Lambda → process Lambda → MediaConvert encode
  → publish Lambda → destination S3 → CloudFront
  → DynamoDB state + SNS notifications
```

These are alternatives, but remove unnecessary compute hops. Use Lambda for meaningful validation, metadata, custom processing, or finalization; use MediaConvert for managed transcoding and durable state plus callbacks for reconciliation.

