# AWS Staff/Principal Scenario & Case Study Interview Guide

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
|---|---|---|
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
|---|---|---|
| DynamoDB hot partition during flash sale | Throttling, checkout failures | Pre-sharded partition keys (e.g., `orderID#random-suffix`), adaptive capacity, on-demand scaling |
| Payment processor outage | Orders cannot complete | Circuit breaker + SQS retry + DLQ + manual reconciliation |
| Region failure | Loss of active Region | Route 53 ARC shifts traffic; Global Tables replicate order metadata; payment idempotency keys prevent double charge |
| Inventory over-sell | Conditional write fails | Reserve-then-confirm pattern; compensation releases reservation |
| Message duplication | Duplicate payment / shipment | Idempotency keys; SQS FIFO for order-critical flows |

### Staff-Level Follow-Ups

**Q: How do you handle the 500k orders/min spike without losing data?**
A: Use SQS as a shock absorber in front of every downstream service. DynamoDB on-demand scales with traffic; pre-shard keys to avoid hot partitions. Each service scales independently based on queue depth.

**Q: Why DynamoDB and not Aurora for orders?**
A: DynamoDB gives predictable single-digit-ms latency, automatic global replication, and horizontal scale. Aurora is great for complex relational queries but requires careful read-replica failover; order access patterns are key-based and well-suited to DynamoDB.

**Q: How do you prevent double charging?**
A: Use idempotency keys stored in DynamoDB with conditional writes. The payment provider also supports idempotency keys. We never retry without the same key.

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
|---|---|---|
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
|---|---|---|
| Redis cluster node failure | Matching queries slow/fail | Redis Cluster with replicas; fall back to DynamoDB scan by city |
| Single AZ network partition | Drivers appear offline | Multi-AZ EKS; client retries; Route 53 ARC if multi-Region |
| Kinesis hot shard | Throttling on location stream | High-cardinality driver ID as partition key; scale shards |
| Driver assignment race condition | Double assignment | Redis RedLock / DynamoDB conditional update with version attribute |
| Mass retry after outage | Thundering herd | Exponential backoff + jitter; rate limiting at API Gateway |

### Staff-Level Follow-Ups

**Q: How do you handle a driver crossing city boundaries?**
A: Driver IDs are global; the geospatial index is not partitioned by city. The matching service queries a radius and can return drivers from overlapping geofences. Surge pricing is computed per geofence bucket.

**Q: What if Redis goes down entirely?**
A: Maintain a recent snapshot of driver locations in DynamoDB TTL-backed table updated asynchronously from Kinesis. Fall back to a coarser query by city/district with higher latency but continued service.

**Q: Why Kinesis and not SQS for location pings?**
A: Kinesis preserves ordering per driver shard, supports multiple consumers, and allows replay for analytics. SQS would require separate queues per consumer and does not replay.

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
  │      - Ensures ordering and exactly-once processing per account
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
|---|---|---|
| Strong consistency | Per-account ownership + conditional writes | Each account mastered in one Region; no cross-Region concurrent writes |
| Exactly-once processing | SQS FIFO + idempotency table | Ordered delivery + deduplication keys |
| Audit immutability | S3 Object Lock (WORM) | Compliance requirement for financial records |
| Fraud checks | Step Functions orchestration | Parallel rules, retries, audit trail |
| Regional data residency | Route 53 geolocation routes EU accounts to eu-west-1 | Accounts created in home Region stay there |

CAP trade-offs:
- **CP over AP** for balance updates: use conditional writes and account-level ownership.
- **AP for read replicas** of transaction history; stale reads are acceptable for statements.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Region failure | Need to redirect traffic | Route 53 ARC; account ownership moved during controlled failover; reconciliation run after restore |
| Duplicate payment command | Double debit/credit | Idempotency table in DynamoDB keyed by payment command ID |
| Fraud service timeout | Payment blocked | Circuit breaker; default allow/reject based on risk policy; async post-processing |
| DynamoDB throttling | Payment processing slows | On-demand capacity; account-level sharding; adaptive capacity |
| Insider data deletion | Audit log tampered | S3 Object Lock compliance mode; MFA delete; CloudTrail data events |

### Staff-Level Follow-Ups

**Q: Why not active-active writes for the same account?**
A: Active-active writes to the same balance record require conflict resolution. In banking, conflict resolution is business logic, not "last writer wins." We avoid it by assigning each account to a single Region and using read replicas elsewhere.

**Q: How do you meet PCI-DSS?**
A: Cardholder data is tokenized by a PCI-compliant PSP and never enters our logs. Sensitive flows run in isolated subnets; KMS encrypts data at rest; TLS/mTLS in transit; access is logged by CloudTrail and reviewed by Security Hub.

**Q: What happens during a Region switch?**
A: Route 53 ARC stops traffic to impaired Region. In-flight commands drain from SQS FIFO. We run a reconciliation job comparing replicated transaction logs to ensure no orphan states before resuming writes.

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
|---|---|---|
| Short image jobs | Lambda + Sharp | Fast, cheap, scales to zero |
| Long video jobs | MediaConvert + ECS Fargate | Avoids Lambda 15-min limit; Fargate handles orchestration |
| Decoupling | S3 -> SNS -> SQS | Producers don't wait; each consumer has its own buffer |
| Job tracking | DynamoDB | Durable state machine; supports replay and status queries |
| Cost | Spot for batch? Use Fargate Spot where possible | Significant savings for interruptible jobs |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Large video exceeds timeout | Lambda fails | Route to Fargate/MediaConvert from the start based on size/type |
| MediaConvert job fails | No output | Step Functions retry with exponential backoff; DLQ for permanent failures |
| S3 event lost | Job never starts | Enable S3 event notifications + EventBridge archive; idempotent job creation |
| Concurrent uploads spike | Queue backlog | Auto Scaling on SQS queue depth; Fargate scales task count |
| Malicious upload (virus, illegal content) | Reputational/legal risk | Upload to quarantine bucket; scan with Lambda + Rekognition / third-party scanner |

### Staff-Level Follow-Ups

**Q: Why not run FFmpeg in Lambda?**
A: Lambda has a 15-minute limit and ephemeral /tmp storage. A 1 GB / 1.5-hour video cannot transcode reliably. MediaConvert is purpose-built for video and scales elastically; Fargate is used only for orchestration or custom pre-processing.

**Q: How do you reduce cost?**
A: Use Fargate Spot for non-critical workflows, S3 Intelligent-Tiering for raw and output storage, MediaConvert on-demand queues, and lifecycle policies to move old assets to Glacier.

**Q: What if the user re-uploads the same file?**
A: Compute a content hash; check DynamoDB for an existing job. If found and successful, return existing outputs immediately (idempotent deduplication).

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
|---|---|---|
| Massive ingestion | Kinesis Data Streams | Shard-based throughput; multiple consumers; replay |
| Real-time alerts | IoT Core Rules + SNS + Lambda | Sub-second routing for critical events |
| Hot state | DynamoDB with TTL | Latest state per device; old state auto-expires |
| Cold analytics | S3 + Glue + Athena | Cost-effective long-term storage and ad-hoc queries |
| Device command | IoT Core Device Shadow / MQTT | Bidirectional messaging with offline queue |

CAP trade-offs:
- **AP for telemetry**: occasional duplicate or out-of-order messages accepted; idempotent updates.
- **CP for device commands and shadows**: strong consistency for control-plane operations.

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Hot shard in Kinesis | Throttling | Use high-cardinality device ID as partition key; monitor shard metrics |
| DynamoDB hot partition | Device state writes throttled | Partition key = `deviceID#date` or write-shard suffix |
| Device authentication abuse | Unauthorized ingestion | IoT Core policies + X.509 certificates / JITP; rate limits per thing group |
| Rule engine dropped message | Data loss | Send critical telemetry to both Kinesis and an S3 archive; reconcile |
| Extended Region outage | Telemetry unavailable | Multi-Region ingestion with DNS steering; devices reconnect to nearest healthy Region |

### Staff-Level Follow-Ups

**Q: Kinesis or MSK for IoT?**
A: Kinesis is simpler and integrates directly with IoT Core rules. MSK is better if we already use Kafka Connect, ksqlDB, or need the Kafka wire protocol. At 1M msg/s, both can work; Kinesis reduces operational burden.

**Q: How do you handle 1 KB x 1M/s = 1 GB/s throughput?**
A: Kinesis shards ingest 1 MB/s each; we need ~1,000 shards, which can scale horizontally. Firehose batches before writing to S3 to avoid tiny files. DynamoDB on-demand handles the hot state with proper sharding.

**Q: What about devices with intermittent connectivity?**
A: Use Device Shadows for last-known-state and desired-state. Queues commands in IoT Core until the device reconnects and subscribes.

---

## Cross-Cutting Staff Topics

### Cost Optimization at Scale

| Tactic | Where |
|---|---|
| Rightsize compute | Use Graviton, latest instance families, gp3 volumes |
| Autoscaling | Scale to zero with Lambda/Fargate; target tracking for EC2/ECS/EKS |
| Storage tiers | S3 Intelligent-Tiering + lifecycle to Glacier; EFS IA |
| Spot / Spot fleets | Batch, CI/CD, non-critical stateless services |
| Reserved / Savings Plans | Predictable baseline workloads |
| Caching | ElastiCache, CloudFront, DAX to reduce database load |
| Optimize data transfer | Use VPC endpoints, CloudFront, same-AZ traffic |

### Zero-Downtime Migration Patterns

| Pattern | Use Case |
|---|---|
| **Blue/green deployment** | Risky releases; instant rollback |
| **Canary (weighted Route 53 / ALB)** | Gradual traffic shift with metrics gating |
| **Database dual-write + backfill** | Migrating to new DB schema or service |
| **Strangler fig** | Incrementally replacing a monolith |
| **Read replicas + promotion** | Migrating to new storage engine |

### Observability Checklist

| Signal | AWS Tool |
|---|---|
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
|---|---|
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
|---|---|---|
| Public exposure | Only ALB and CloudFront are public | Backend subnets are private by route table |
| Edge protection | CloudFront + WAF | DDoS mitigation, caching, geo-blocking |
| High availability | ALB across 2+ AZs, Aurora Multi-AZ | Survives single AZ failure |
| Database failover | Aurora Multi-AZ auto-failover | Writer failover in ~30 seconds |
| Cost | NAT Gateway per AZ | Avoids cross-AZ NAT traffic and single point of failure |
| Private AWS service access | Gateway VPC Endpoints for S3/DynamoDB | No internet/NAT needed |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| AZ-a outage | AZ-a targets unhealthy | ALB routes to AZ-b; Aurora fails over writer |
| ALB public subnet issue | External traffic blocked | Route 53 health checks fail over to secondary Region if multi-Region |
| Database primary failure | Writes blocked | Aurora Multi-AZ automatic failover; app retry with exponential backoff |
| DDoS attack | ALB/CloudFront overload | CloudFront + Shield + WAF rate rules absorb attack |
| NAT Gateway AZ failure | Outbound calls from AZ-a fail | One NAT per AZ; AZ-a app retries or AZ-b takes load |

### Staff-Level Follow-Ups

**Q: Should the ALB be public or internal?**
A: Public, because users reach it from the internet. Internal ALB is only for service-to-service inside the VPC. For an external API, the entry point must be internet-facing, protected by WAF and Security Groups.

**Q: Why NAT Gateway per AZ?**
A: If AZ-a app traffic routes to a NAT in AZ-b and AZ-b fails, AZ-a loses outbound internet. A NAT per AZ keeps egress local and avoids cross-AZ data-transfer charges.

**Q: How do you call S3 from private subnets?**
A: Use a VPC Gateway Endpoint for S3 (and DynamoDB). Traffic stays on AWS backbone, avoids NAT costs, and can be restricted by bucket/endpoint policy.

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
|---|---|---|
| Source control | GitHub | Developer familiarity; CodePipeline integration via webhook/OIDC |
| Build environment | CodeBuild / GitHub Actions | Ephemeral, scalable, no persistent build servers |
| Artifact security | ECR scan + SBOM | Vulnerability scanning, immutable image tags |
| Deployment safety | Canary / blue-green | Limits blast radius, metrics-gated promotion |
| Secrets | Secrets Manager + IAM roles | No hard-coded secrets; short-lived credentials via OIDC |
| Rollback | Automated canary rollback | Faster than manual; tied to CloudWatch alarms |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Flaky test blocks deployment | Delay | Mark flaky tests, quarantine, and fix; use test retries carefully |
| Vulnerability found in image | Deployment blocked | Patching pipeline; base image updates automated |
| Canary metrics degrade | Users impacted | Automatic rollback to previous stable version |
| Build artifact compromised | Supply-chain risk | ECR immutable tags, signed images (Notation/Sigstore), S3 object versioning |
| Pipeline credentials leaked | Account compromise | Use OIDC federation; no long-lived access keys |

### Staff-Level Follow-Ups

**Q: Blue/green vs canary?**
A: Blue/green instantaneously shifts traffic with fast rollback but doubles capacity during switch. Canary gradually shifts traffic based on metrics, cheaper but slower to detect issues. For high-frequency deploys, canary is usually preferred.

**Q: How do you secure the pipeline?**
A: OIDC-based roles, least-privilege IAM, ECR image scanning, SBOMs, signed artifacts, secrets in Secrets Manager, and pipeline audit logs in CloudTrail.

**Q: What metrics gate canary promotion?**
A: Error rate, p99 latency, business KPIs (checkout success rate), and custom CloudWatch alarms. If any breach, auto-rollback.

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
|---|---|---|
| Ultra-low latency reads | Redis Sorted Sets | In-memory, O(log N) rank/range operations |
| Durability | DynamoDB score history | Redis is hot cache; DynamoDB is source of truth |
| Sharding | Redis Cluster by player ID | Distributes load across nodes |
| Global board | Single "global" key + cache top 100 | Heavy read but small set; cache aggressively |
| Regional boards | Keys per region | Reduces contention and cross-Region latency |
| Tie-breaking | Store timestamp as score decimal | `score*1e9 + (max_timestamp - timestamp)` |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Redis node failure | Reads/updates to shard fail | Redis Cluster replicas promote; app retries other shards |
| Hot key on global leaderboard | Single shard overloaded | Cache top 100 externally (CloudFront/API); shard by sub-leaderboard |
| Score exploit/cheat | Invalid rankings | Kinesis stream feeds anti-cheat; replay detection |
| Regional latency | Players far from Redis | Deploy Redis per Region; eventual replication for global board |
| Data loss on Redis crash | Scores lost | Async write-behind to DynamoDB; replay from DynamoDB if needed |

### Staff-Level Follow-Ups

**Q: How do you handle ties?**
A: Encode the score and timestamp into a single double. For example, `final_score = score * 1,000,000,000 + (max_epoch - timestamp)`. Earlier submission wins when scores are equal.

**Q: What if the global leaderboard key becomes too hot?**
A: Maintain the top 100 in a separate key updated periodically, not on every score change. For full board queries, compute from per-shard keys or use approximations.

**Q: Redis or DynamoDB for leaderboards?**
A: Redis for hot real-time reads/writes; DynamoDB for durable history and anti-cheat audit. Never use DynamoDB alone if P99 < 10 ms is required for millions of reads.

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
|---|---|---|
| Query cost | Athena + Parquet partitions | Columnar format reduces data scanned |
| Storage cost | Lifecycle to Glacier tiers | Logs are mostly cold after a few days |
| Schema discovery | Glue Data Catalog / Crawler | Automatic table/partition management |
| Real-time needs | Optional: Kinesis Firehose -> S3 -> Athena | For near-real-time dashboards |
| Compression | Gzip/Snappy Parquet | Reduces storage and Athena scan cost |
| Partitioning | year/month/day/hour | Enables partition pruning in queries |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Partition skew (one hour huge) | Slow Athena queries | Partition by hour + bucket by source prefix |
| Glue crawler runaway cost | Expensive scans | Use partition projection instead of crawlers at scale |
| Athena query too slow | Timeout | Optimize Parquet, reduce columns, add partitioning |
| Log tampering | Security analysis unreliable | S3 Object Lock / versioning; write-once log bucket |
| Sensitive data in logs | Compliance risk | Scrub PII during processing; restrict Athena IAM |

### Staff-Level Follow-Ups

**Q: Athena vs OpenSearch for logs?**
A: Athena is cost-effective for occasional ad-hoc queries on large historical data. OpenSearch/CloudWatch Logs is better for real-time search and dashboards. Many designs use both: hot logs in OpenSearch, cold logs in S3 + Athena.

**Q: How do you reduce Athena cost at 10 TB/day?"
A: Convert to Parquet with Snappy, partition aggressively, drop unused columns, use partition projection, and add lifecycle to Glacier for old data. Also consider S3 Select for targeted retrieval.

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
|---|---|---|
| Absorb spike | SQS FIFO decouples order placement from processing | Prevents backend overload |
| Inventory correctness | Redis cache + DynamoDB conditional write | Cache is fast hint; DB is authority |
| Cost control | Spot for stateless workers, on-demand DB | Pay for burst capacity, not idle overprovision |
| Hot partition | Inventory sharded by SKU + random suffix | Avoids single SKU partition overload |
| Overload protection | WAF rate limits + queue depth scaling | Rejects excessive traffic before queue fills |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Inventory cache stale | Oversell | Conditional DynamoDB write on decrement; refresh cache from DB on miss |
| SQS FIFO throttling | Orders rejected | Use multiple `MessageGroupId` values per SKU; scale FIFO throughput |
| Payment provider slow | Queue backlog | Step Functions retries; scale payment workers on queue depth |
| Bot traffic | Legitimate users blocked | WAF rate limiting, CAPTCHA, challenge rules |
| Redis failure | Cache miss storm | Fallback to DynamoDB reads; circuit breaker on cache calls |

### Staff-Level Follow-Ups

**Q: Why SQS FIFO and not standard SQS?**
A: Orders for the same SKU must be processed sequentially to avoid overselling. FIFO with `MessageGroupId` per SKU ensures ordering and exactly-once processing per group while allowing parallel processing across SKUs.

**Q: How do you prevent cost explosion during the spike?**
A: Use target-tracking auto-scaling with maximum capacity limits, Spot instances where possible, DynamoDB on-demand (which scales but costs more per request; reserved for spikes), and cache reads to reduce DB load.

**Q: What if the queue fills faster than consumers can process?**
A: Set queue-depth alarms and max message age thresholds. If exceeded, throttle ingress at WAF or return a "sale busy" page. Use Lambda event source mapping with batching and scaling based on `ApproximateNumberOfMessagesVisible`.

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
```

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
```

- Provider creates a **VPC Endpoint Service** backed by an NLB.
- Tenants create **Interface Endpoints** in their VPCs.
- Provider accepts endpoint connection requests (manually for trusted tenants or with IAM conditions).
- DNS resolution via custom private hosted zones shared to tenant VPCs or via Route 53 Resolver.

### In-Depth Trade-off Analysis

| Concern | Decision | Reason |
|---|---|---|
| Tenant isolation | Interface endpoint per tenant | No shared ENI; each tenant has its own endpoint |
| CIDR overlap | PrivateLink handles overlap | Traffic is proxied; no peering required |
| Security | Endpoint service accepts connections + IAM/SG controls | Provider controls who can connect |
| DNS | Private hosted zone per tenant or shared PHZ | Resolves friendly service hostname |
| Cost | Per-ENI hourly + data processing | Tenant pays for endpoint ENIs in their VPC; provider pays for NLB/Endpoint Service |

### Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| Endpoint service AZ outage | Tenants in that AZ lose access | Deploy NLB endpoints in at least two AZs |
| Tenant misconfiguration | Traffic not reaching service | Provide Terraform/CloudFormation templates and connection validation |
| Service overload | Latency spikes across tenants | Add Application Load Balancer autoscaling and per-tenant throttling/API keys |
| DNS leakage | Internal hostname resolves publicly | Restrict hosted zone associations; use private DNS only |

### Staff-Level Follow-Ups

**Q: Why PrivateLink and not VPC peering or TGW?**
A: Peering requires non-overlapping CIDRs and creates transitive routing complexity. TGW is good for many internal VPCs but still exposes the whole network. PrivateLink exposes only the service endpoint, works with overlapping CIDRs, and keeps traffic on the AWS backbone.

**Q: How do you bill tenants for PrivateLink usage?**
A: Tenants pay for their own interface endpoints. The provider pays for the NLB and endpoint service. For usage-based billing, add API Gateway or ALB access logs and meter requests per tenant.

**Q: How do you protect the provider side?**
A: Use an internal ALB/NLB in private subnets, Security Groups restricting source to the endpoint service, IAM endpoint policies, AWS WAF if fronted by API Gateway, and CloudWatch metrics to detect abuse.
