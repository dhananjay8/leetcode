# AWS Resilience, Disaster Recovery & Multi-Region — Staff/Principal Interview Deep Dive

## 1. Availability, Resilience, and Disaster Recovery

| Term | Definition |
|---|---|
| **Availability** | System uptime over time, usually expressed as percentage (e.g., 99.99%). |
| **Durability** | Probability data is not lost (e.g., S3 11 9s). |
| **Fault tolerance** | Continue operating during component failure. |
| **Disaster recovery (DR)** | Ability to recover from large-scale failures (Region, data corruption). |
| **RTO** | Recovery Time Objective: how quickly you must be back online. |
| **RPO** | Recovery Point Objective: how much data loss is acceptable. |
| **MTTR** | Mean Time To Recover. |
| **MTBF** | Mean Time Between Failures. |

A staff-level answer distinguishes **high availability within a Region** (multi-AZ, autoscaling, health checks) from **multi-Region disaster recovery** (replication, failover orchestration, data sovereignty).

---

## 2. High Availability Inside a Single Region

### Multi-AZ design

```text
Internet / Users
   │
   ▼
Route 53 / CloudFront / Global Accelerator
   │
   ▼
Load Balancer (cross-AZ)
   │
   ├──► AZ-a
   │       ├── EC2 / ECS / EKS
   │       └── Multi-AZ database primary or replica
   │
   └──► AZ-b
           ├── EC2 / ECS / EKS
           └── Multi-AZ database standby
```

Services that are natively Multi-AZ:
- ALB/NLB (cross-AZ by default)
- Aurora (6 copies across 3 AZs)
- DynamoDB (3 copies across 3 AZs)
- S3 (multi-AZ redundancy)
- EFS (multi-AZ)

### Health checks and failover

| Layer | Mechanism |
|---|---|
| DNS | Route 53 health checks |
| Load balancer | Target health checks |
| Database | RDS Multi-AZ failover, Aurora auto-failover |
| Compute | Auto Scaling replacement, ECS/EKS pod rescheduling |
| Storage | EBS snapshots, S3 versioning |

---

## 3. Disaster Recovery Strategies

AWS defines four DR strategies. They differ in cost, complexity, RTO, and RPO.

### Backup and restore

```text
Primary Region
   │
   ├── Daily backups (AWS Backup, RDS snapshots, EBS snapshots, S3 versioning)
   └── Cross-Region copy to DR Region

Disaster:
   1. Provision infrastructure in DR Region using IaC
   2. Restore data from backups
   3. Update DNS / routing
```

- **RPO**: hours (or minutes with continuous backup)
- **RTO**: hours to days
- **Cost**: lowest
- **Use case**: Non-critical workloads, data lake, batch systems.

### Pilot light

```text
Primary Region (active)
   │
   └── Replicate data to DR Region continuously

DR Region (passive)
   ├── Core data resources running (RDS/Aurora read replica, DynamoDB global table)
   └── Application infrastructure defined but scaled to zero

Disaster:
   1. Scale up application tier (Auto Scaling, ECS/EKS services, Lambda concurrency)
   2. Promote database replica to primary
   3. Redirect traffic
```

- **RPO**: minutes
- **RTO**: tens of minutes
- **Cost**: low-to-medium
- **Use case**: Business-critical systems that can tolerate short downtime.

### Warm standby

```text
Primary Region (active)
   │
   └── Replicate data to DR Region

DR Region (warm)
   ├── Reduced-capacity application stack running
   └── Database in sync with primary

Disaster:
   1. Scale DR environment to full capacity
   2. Promote database / switch traffic
   3. Resume operations
```

- **RPO**: seconds
- **RTO**: minutes
- **Cost**: medium
- **Use case**: Important services requiring near-immediate recovery.

### Hot standby / active-active

```text
Region A (active) ◄─────────────────► Region B (active)
   │                                      │
   ├── Users served from both            ├── Users served from both
   └── Read/write data synchronized       └── Read/write data synchronized
```

- **RPO**: near zero
- **RTO**: potentially zero
- **Cost**: highest
- **Use case**: Global applications, financial trading, real-time collaboration.

---

## 4. DR Strategy Comparison Table

| Strategy | RPO | RTO | Cost | Complexity | Typical Workload |
|---|---|---|---|---|---|
| Backup and restore | Hours | Hours–days | $ | Low | Internal tools, analytics |
| Pilot light | Minutes | Tens of minutes | $$ | Medium | Critical transactional apps |
| Warm standby | Seconds | Minutes | $$$ | High | Customer-facing services |
| Active-active | Near zero | Near zero | $$$$ | Highest | Global real-time systems |

---

## 5. Data Replication Patterns

### Synchronous replication

- Writes acknowledged only after both primary and replica confirm.
- Guarantees zero data loss.
- Adds latency; limited by distance.
- Examples: Aurora global database write forwarding, DynamoDB synchronous global tables.

### Asynchronous replication

- Primary acknowledges after local write; replica catches up.
- Lower latency for writes.
- Risk of some data loss on failover.
- Examples: RDS cross-Region read replicas, S3 Cross-Region Replication, DynamoDB global tables default.

### Snapshot / point-in-time

- Periodic backups restored in DR Region.
- Simplest, oldest data.

---

## 6. Multi-Region Active-Active Considerations

### Partitioning user traffic

```text
User in Europe           User in North America
   │                            │
   ▼                            ▼
Route 53 geolocation / latency routing
   │                            │
   ▼                            ▼
eu-west-1                   us-east-1
```

### Conflict resolution

When the same record can be written in two Regions, choose:

| Strategy | How |
|---|---|
| **Partitioned ownership** | Each Region owns a subset of entities/users |
| **Last writer wins** | DynamoDB Global Tables default |
| **Operational conflict queue** | Manual review of divergent writes |
| **CRDT / merge functions** | Domain-specific resolution (rare) |

Staff point: **Active-active is not free.** It requires conflict handling, idempotency, and often data model changes.

---

## 7. Route 53 Application Recovery Controller (ARC)

Route 53 ARC provides two main capabilities for multi-Region resilience:

### Routing controls

```text
Route 53 health check
   │
   └── Routing Control (on/off) in Route 53 ARC
          │
          └── Failover DNS record
```

- **On/off switches** hosted redundantly across five AWS Regions.
- Integrated with Route 53 health checks.
- Shifts traffic in minutes.

### Region switch

- Orchestrates failover of an entire application stack.
- Supports active/active and active/passive setups.
- Automates pre-failover validation steps.

### Why ARC over manual DNS

| Aspect | Manual Route 53 Failover | Route 53 ARC |
|---|---|---|
| Control plane dependency | Regional Route 53 console/API | Global redundant data plane |
| Failover speed | Minutes+ | Minutes |
| Orchestration | Manual runbooks | Automated region switch |
| Blast radius | Human error risk | Predefined plans |

---

## 8. Chaos Engineering and AWS Fault Injection Simulator (FIS)

### What chaos engineering means

Deliberately inject faults to validate resilience before real failures happen.

### AWS Fault Injection Simulator

FIS is a managed service to run controlled experiments:

```text
Define experiment template
   │
   ├── Target: EC2, ECS, EKS, RDS, DynamoDB, Lambda, Network
   ├── Action: terminate instance, stress CPU, throttle API, failover AZ
   ├── Stop conditions: CloudWatch alarms
   └── Duration / schedule
   │
   ▼
Run experiment -> observe -> improve -> repeat
```

Common experiments:
- Terminate random EC2 instances in an Auto Scaling group.
- Failover an RDS Multi-AZ database.
- Inject latency between services.
- Throttle DynamoDB to test circuit breakers.
- Stop an Availability Zone.

Best practices:
- Run in non-production first.
- Define rollback/stop conditions (alarms).
- Measure SLOs, not just availability.
- Keep blast radius small and bounded.

---

## 9. Failure Modes and Mitigations

### Single AZ failure

| Failure | Mitigation |
|---|---|
| EC2/EBS loss | Multi-AZ ASG, EBS snapshots |
| RDS instance failure | Multi-AZ automatic failover |
| Network partition | Subnets in multiple AZs, redundant NAT gateways |

### Single Region failure

| Failure | Mitigation |
|---|---|
| Regional service degradation | Multi-Region deployment, Route 53 ARC failover |
| Database loss | Cross-Region read replica promotion, global database |
| Data corruption | Backups in multiple Regions, point-in-time recovery |
| Control plane issues | Use data-plane primitives (Route 53 ARC, Global Accelerator) |

### Cascading failures

| Symptom | Mitigation |
|---|---|
| Retry storms | Exponential backoff + jitter, circuit breakers, rate limits |
| Thundering herd | Cache warming, token bucket, request coalescing |
| Dependency overload | Bulkheads, load shedding, graceful degradation |
| Poison messages | DLQs, validation, idempotency |

---

## 10. SLO, SLI, and Error Budgets

| Term | Meaning |
|---|---|
| **SLI** | Service Level Indicator: measurable metric (e.g., p99 latency). |
| **SLO** | Service Level Objective: target for an SLI (e.g., p99 < 100 ms). |
| **SLA** | Service Level Agreement: contractual commitment to customers. |
| **Error budget** | Allowed failure rate before halting releases. |

Example SLOs:
- **Availability**: 99.99% uptime (52 minutes downtime/year).
- **Latency**: p99 < 200 ms for API responses.
- **Freshness**: data lag < 30 seconds.

---

## 11. Textual Sequence Diagram: Multi-Region Failover with ARC

```text
Normal state
   │
   Users ──► Route 53 (latency routing)
              │
              ├──► us-east-1 (primary, active)
              └──► eu-west-1 (secondary, warm standby)

Failure detected in us-east-1
   │
   CloudWatch alarms + custom health checks
   │
   ▼
Route 53 ARC routing control flips
   │
   ▼
Route 53 health check fails over DNS
   │
   ▼
Traffic shifted to eu-west-1
   │
   ▼
DR Region scaled up
   Database promoted / Global Tables redirect
   Application tier autoscaled
   CDN origins updated if needed
   │
   ▼
Service resumes in eu-west-1
```

---

## 12. Hard AWS Gotchas

### DR
- **Failover is not zero-RPO unless synchronous replication is used.**
- **Cross-Region replication costs money and adds latency.**
- **DNS failover is not instant** due to caching; use Global Accelerator for faster traffic shift.
- **Backups without tested restore are not DR.** Regularly validate restore procedures.
- **Pilot light cannot serve traffic until scaled up**; warm standby is functional at reduced capacity.

### Chaos engineering
- **Do not run chaos experiments in production without mature observability and rollback.**
- **Stop conditions must be tied to real business metrics**, not just infrastructure CPU.
- **FIS actions are real**: terminating an instance can impact customers if blast radius is unbounded.

### Multi-Region active-active
- **Conflict resolution must be designed into the data model.** Last-writer-wins may be wrong for financial records.
- **Idempotency keys must be globally unique and consistent.**
- **Observability across Regions** requires centralized logging and tracing.

---

## 13. Staff-Level Interview Sound Bites

- "High availability is about surviving component failures; disaster recovery is about surviving Region-scale failures."
- "Choose your DR strategy from RTO and RPO backward, not from buzzwords forward."
- "Active-active is the most expensive option and only makes sense when you can partition ownership or resolve conflicts."
- "Route 53 ARC moves failover logic onto a global data plane so a Regional control-plane outage doesn't block recovery."
- "Chaos engineering proves your runbooks work before a real incident; FIS lets you do that safely with stop conditions."

---

## 14. Quick Reference Tables

### DR strategy selection

| Requirement | Strategy |
|---|---|
| RTO > 24 hours, RPO hours | Backup and restore |
| RTO tens of minutes, RPO minutes | Pilot light |
| RTO minutes, RPO seconds | Warm standby |
| RTO near zero, RPO near zero | Active-active |

### AWS services for DR

| Layer | Service |
|---|---|
| DNS failover | Route 53, Route 53 ARC |
| Data replication | RDS cross-Region read replicas, Aurora Global Database, DynamoDB Global Tables, S3 CRR |
| Backup | AWS Backup, EBS snapshots, RDS snapshots |
| Traffic steering | Global Accelerator, CloudFront origin failover, Route 53 ARC routing controls |
| Orchestration | Route 53 ARC Region Switch, Step Functions, Systems Manager Automation |
| Testing | AWS Fault Injection Simulator (FIS) |

### RTO/RPO reference

| Uptime % | Max Downtime/Year |
|---|---|
| 99.9% | 8.76 hours |
| 99.99% | 52.56 minutes |
| 99.999% | 5.26 minutes |
| 99.9999% | 31.5 seconds |

---

## 15. AWS Global Infrastructure: The Foundation of Resilience

Understanding resilience starts with AWS physical architecture.

```text
AWS Global Infrastructure
   │
   ├── Region (geographical area, e.g., us-east-1)
   │      └── Multiple Availability Zones
   │
   ├── Availability Zone (AZ)
   │      └── One or more isolated data centers with redundant power/network
   │
   ├── Data Center
   │      └── Racks, servers, storage
   │
   └── Edge Locations (CloudFront, Global Accelerator)
```

Key staff point: **An AZ is not a single building.** It is multiple data centers connected by low-latency private fiber. A power, cooling, or network failure is isolated to one AZ.

---

## 16. Types of Replication

| Replication Type | What It Copies | AWS Examples |
|---|---|---|
| **Storage replication** | Blocks/files | EBS snapshots, EFS, S3 |
| **Database replication** | Records/transactions | RDS read replicas, Aurora Global, DynamoDB Global Tables |
| **Application replication** | Running compute across zones/regions | EC2 ASG, ECS/EKS multi-AZ, Lambda regional |
| **Network replication** | DNS/routing state | Route 53, Global Accelerator, TGW peering |

---

## 17. Service-by-Service Replication and Multi-AZ Behavior

| Service | Single AZ | Multi-AZ | Cross-Region |
|---|---|---|---|
| **EC2** | User-managed | Auto Scaling across AZs | AMI/backup replication |
| **EBS** | Internal replication within one AZ | No native cross-AZ | Snapshots copied to another Region |
| **S3** | Regional by default (multi-AZ) | Built-in | Cross-Region Replication (CRR) |
| **RDS** | Optional | Multi-AZ synchronous standby | Read replicas or snapshots |
| **Aurora** | Six storage copies across three AZs | Native | Aurora Global Database |
| **DynamoDB** | Replicated across three AZs | Native | Global Tables |
| **EFS** | Regional, replicated across AZs | Native | AWS Backup / DataSync |
| **ElastiCache** | Optional | Multi-AZ with replicas | Global Datastore (Redis) |
| **ALB/NLB** | Deployed in enabled AZs | Native | Pair with Route 53 / Global Accelerator |

---

## 18. Backup Strategies by Service

| Service | Backup Mechanism | Notes |
|---|---|---|
| **EBS** | Snapshots (incremental, stored in S3) | Cross-Region copy for DR |
| **RDS** | Automated backups + snapshots | PITR within retention window |
| **Aurora** | Automated backups + snapshots | Fast cross-Region restore from backups |
| **DynamoDB** | On-demand/PITR backups | 35-day point-in-time recovery |
| **S3** | Versioning + replication | Delete markers are not replicated by default with CRR |
| **EFS** | AWS Backup | Incremental backups to another Region |
| **EC2** | AMIs + EBS snapshots | Rebuild in another AZ/Region |
| **Multi-service** | AWS Backup | Centralized backup policies across accounts/Regions |

---

## 19. Aurora: Distributed SQL Database Internals

Aurora separates compute from storage. Its storage layer replicates across **six copies in three AZs** automatically.

```text
Compute (Primary + up to 15 Read Replicas)
   │
   ├── Write requests go to storage layer
   │
   └── Storage layer (6 copies, 3 AZs)
          ├── 4/6 write quorum
          └── 3/6 read quorum
```

- **Aurora Global Database**: one primary Region, up to five secondary Regions. Replication is **asynchronous**, typically < 1 second.
- Failover to secondary Region requires promoting it (RPO seconds, RTO minutes).
- **Aurora Serverless v2**: on-demand scaling of compute; storage layer remains distributed.

### Aurora vs RDS vs DynamoDB

| Concern | Aurora | RDS | DynamoDB |
|---|---|---|---|
| Engine | MySQL/PostgreSQL compatible | MySQL/PostgreSQL/Oracle/SQL Server/MariaDB | Proprietary NoSQL |
| Storage replication | 6 copies across 3 AZs | Depends on engine; Multi-AZ for standby | 3 copies across 3 AZs |
| Scaling | Read replicas, Serverless v2 | Vertical + read replicas | Horizontal, pay-per-request |
| Cross-Region | Global Database (async) | Read replicas / snapshots | Global Tables |
| Best for | Relational workloads needing high throughput | Traditional managed relational | Key-value / document at scale |

---

## 20. Data Sovereignty and Compliance

- Some data must remain within a specific country/Region.
- Use **geolocation routing** or **geofencing SCPs** to restrict where resources can be created.
- Store backups in the same jurisdiction; avoid accidental cross-Region replication.
- Audit with CloudTrail and AWS Config to detect resources created outside approved Regions.

---

## 21. Textual Mind Map: Choosing a DR Strategy

```text
Define RTO/RPO
   │
   ├── RTO > 24h, RPO hours -> Backup and restore
   │
   ├── RTO minutes, RPO minutes -> Pilot light
   │      └── Core DB running, app infra scaled to zero
   │
   ├── RTO minutes, RPO seconds -> Warm standby
   │      └── Reduced-capacity app running in DR
   │
   └── RTO/RPO near zero -> Active-active
          ├── Partitioned ownership by Region
          ├── Conflict resolution strategy
          └── Global replication/sync
```

---

## 22. Additional Staff-Level Sound Bites

- "AWS resilience starts with multi-AZ. Multi-Region is the next level and should be justified by RTO/RPO or latency requirements."
- "Synchronous replication gives zero RPO but adds latency; asynchronous replication favors performance with some data-loss risk."
- "Aurora's storage layer is a distributed, self-healing quorum system across three AZs."
- "Backups are not DR until you have tested restore procedures and documented runbooks."
- "Compliance often dictates where data lives; enforce it with SCPs, IAM conditions, and audit logging."

---

## 23. Cell-Based Architecture

Cell-based design partitions the system into independent failure-isolated units.

- Each cell serves a subset of users/shards (e.g., `customer_id % 100`).
- Blast radius is limited to one cell; failures do not cascade globally.
- Works well with multi-Region active-active: assign cells to home Regions and replicate read-only views.
- Adds operational complexity (cell assignment, routing, canary by cell) but is essential for hyperscale resilience.

---

## 24. Region Evacuation Runbook

```text
1. Confirm impairment via multiple signals (health checks, metrics, status page, manual).
2. Stop ingress to impaired Region (Route 53 ARC / Global Accelerator / DNS).
3. Drain in-flight requests and queues (scale-in producers, wait for consumers).
4. Verify data replication lag is acceptable (RPO check); promote DB replica if needed.
5. Scale standby Region to full capacity (ASG, ECS/EKS, Lambda concurrency).
6. Re-run smoke tests and synthetic canaries.
7. Gradually re-admit traffic; monitor error budgets and SLOs.
8. Post-incident: root cause, fix, and rehearse runbook in FIS/GameDay.
```

---

## 25. Why Multiple AZs Matter: A Concrete Failure Example

A common anti-pattern is placing every component in one AZ.

**Bad design:**

```text
AZ-a: EC2 + RDS + EBS
   │
   └── AZ-a fails -> entire application disappears
```

**Better design:**

```text
AZ-a: EC2 targets, ALB
AZ-b: EC2 targets, ALB
AZ-c: RDS Multi-AZ standby

Single AZ failure -> ALB routes around it, DB fails over
```

Staff point: **Multi-AZ protects against AZ-scale failure, not Region-scale failure.** Region-scale failures require multi-Region DR.

---

## 26. Resilience Design Principles

1. **Use multiple AZs by default** for production workloads.
2. **Use multiple Regions only when justified** by RTO/RPO, latency, or compliance.
3. **Separate high availability from disaster recovery:**
   - HA = survive component/AZ failure with minimal disruption.
   - DR = recover from Region-scale or systemic failure.
4. **Choose the right replication model:**
   - Synchronous when zero data loss is required.
   - Asynchronous when latency and throughput matter more.
5. **Understand each service's replication semantics** — S3, Aurora, RDS, DynamoDB, and EBS all differ.
6. **Backups are not DR** until restores are tested and runbooks exist.
7. **Failover should rely on data-plane primitives** (Route 53 ARC, Global Accelerator), not Regional control planes.

---

## 27. Reference Resilience Architectures

### Small production application

```text
Route 53
   │
   ▼
ALB (cross-AZ)
   │
   ├──► EC2 in AZ-a
   └──► EC2 in AZ-b
           │
           ▼
      RDS Multi-AZ
           │
           ▼
         S3 (multi-AZ by default)
```

Tolerates instance failure or the loss of an entire AZ with minimal disruption.

### High-scale global application

```text
Route 53 / Global Accelerator
   │
   ├──► Mumbai Region
   │       ALB -> ECS/EKS -> Aurora Global DB (primary)
   │                       S3
   │
   └──► Singapore Region
           ALB -> ECS/EKS -> Aurora reader
                           S3 replica (CRR)
```

Provides low latency for geographically distributed users and supports DR if a Region becomes unavailable.
