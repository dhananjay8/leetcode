# AWS Compute & Serverless Architecture — Staff/Principal Interview Deep Dive

## 1. EC2 Internals: From Bare Metal to Your Instance

### What EC2 really is
Amazon EC2 carves virtual machines out of AWS racks. Since 2018 every new instance family is built on the **AWS Nitro System**, a purpose-built virtualization stack made of three parts:

| Component | Responsibility |
|---|---|
| **Nitro Cards** | Offload networking (ENA), storage (NVMe/EBS), and system control from the host CPU |
| **Nitro Security Chip** | Hardware root of trust; moderates local storage I/O, measured boot, TPM integration |
| **Nitro Hypervisor** | Minimal KVM-based hypervisor; schedules CPU/memory and isolates tenants |

### Nitro data path

```text
User VM (c6i.4xlarge)
   ├── vCPU / memory -------------- managed by Nitro Hypervisor
   ├── ENA driver ----------------> Nitro Networking Card ----> VPC
   ├── NVMe driver ---------------> Nitro Storage Card ------> EBS / local SSD
   └── metadata service ----------> Nitro Controller
```

Key staff points:
- Nitro offloads **networking** and **storage**, so CPU cycles are available to the customer.
- The hypervisor is minimized, quiescent when not actively serving the instance.
- **Bare-metal instances** (e.g., `*.metal`) use the same Nitro cards but bypass the hypervisor.
- Measured boot + TPM provide cryptographic evidence of firmware integrity.

### Instance lifecycle

```text
1. AMI (root volume template) + launch parameters
2. EC2 scheduler picks a host with matching capacity attributes
3. Nitro Controller provisions: EBS mapping, ENI attachment, security group rules
4. Instance enters pending -> running (or stopped/terminated)
5. IMDS provides metadata; instance profile delivers temporary IAM credentials
```

### Tenancy, placement, and purchase models

| Concept | Meaning |
|---|---|
| **Shared tenancy** | Default; multiple instances share a physical host |
| **Dedicated host** | Physical server reserved for you; useful for per-socket licensing |
| **Dedicated instance** | Hardware dedicated to your account, but host may change |
| **Placement group** | Cluster (same rack, low latency), Spread (separate hardware), Partition (isolated fault domains) |
| **On-Demand / Spot / Reserved / Savings Plans** | Purchase trade-offs: flexibility vs cost vs commitment |

### EC2 storage attached to instances

| Storage | Persistence | Scope | Use Case |
|---|---|---|---|
| **Instance store** | Ephemeral | Specific instance types | Temp files, cache, scratch |
| **EBS gp3** | Persistent | AZ-scoped | General boot volumes |
| **EBS io2 Block Express** | Persistent | AZ-scoped | Latency-sensitive databases |
| **EFS** | Persistent | Regional | Shared file system |

Hard gotchas:
- EBS volumes are **locked to one AZ**; disaster recovery requires snapshots or replication.
- gp3 decouples IOPS/throughput from size, but **provisioning more IOPS still costs**.
- EBS `io1/io2` multi-attach only within one AZ and requires cluster-aware filesystems.

---

## 2. AWS Lambda: Execution Model and Concurrency

### What Lambda abstracts

Lambda runs your code in **execution environments** (sandboxes) managed by AWS. Each environment:
- is a Firecracker MicroVM on bare-metal infrastructure,
- has an ephemeral `/tmp` disk (default 512 MB, up to 10 GB),
- is single-request-at-a-time by default,
- is kept warm for a short period after processing.

### Lifecycle of a Lambda invocation

```text
Request arrives
   │
   ├── No warm environment? ──> Cold start
   │      ├── Download / unpack code or container image
   │      ├── Run Init phase (code outside handler)
   │      └── Run Invoke phase (handler)
   │
   └── Warm environment exists?
          └── Run Invoke phase only (warm start)
```

Phases:

| Phase | Code That Runs | Time Limit |
|---|---|---|
| **Init** | Imports, client setup, anything outside handler | Up to 15 minutes (PC/SnapStart) or 10 sec otherwise |
| **Invoke** | Handler code | Configured function timeout (max 15 min) |
| **Shutdown** | Optional hook | Up to 2 seconds |

### Concurrency model

```text
Concurrency = (average requests per second) × (average duration in seconds)

Example: 1,000 RPS × 0.2 s = 200 concurrent environments
```

Lambda creates one new execution environment per concurrent request. **Each environment handles exactly one request at a time.**

### Concurrency controls

| Control | What It Does |
|---|---|
| **Account concurrency limit** | Default 1,000 per Region (can be raised) |
| **Burst concurrency** | Initial burst up to account-dependent quota, then scales at 500/min unless provisioned |
| **Reserved concurrency** | Guarantees a function a slice of the account pool; also caps it |
| **Provisioned concurrency** | Pre-initialized warm environments; removes cold start |
| **SnapStart (Java)** | Pre-initializes and snapshots a function; restores on invoke |

Important concurrency formula:
- If you need 2,000 RPS with a 0.5 s average duration, you need **1,000 concurrent executions**.

### Cold-start mitigation strategy

```text
Priority order:
1. Use Provisioned Concurrency for latency-sensitive paths.
2. Move initialization outside the handler (clients, connections, caches).
3. Use smaller packages / trimmed images.
4. Prefer native runtimes with fast startup (Node.js, Python, Go).
5. Use SnapStart for Java functions.
6. Avoid VPC unless necessary (VPC ENI creation adds seconds to cold start).
```

Hard gotchas:
- **VPC cold start**: when a Lambda function needs a VPC ENI, cold starts can add seconds. Use **VPC Lattice**, **PrivateLink**, or **Function URLs in non-VPC** where possible.
- **Provisioned concurrency** cannot be applied to `$LATEST`; use aliases/versions.
- **Synchronous vs asynchronous**: synchronous retries are the caller's job; asynchronous retries are automatic (up to 2 times) and support DLQs.
- **Memory scales CPU**: doubling memory approximately doubles CPU share.

### Event source mapping (SQS, Kinesis, DynamoDB Streams)

```text
Event source -> Lambda polls -> Batches messages -> Invokes function
   │
   └── If function succeeds: delete messages / advance checkpoint
   └── If function fails (without partial-batch response): retry whole batch
```

Best-practice settings:
- `BatchSize`: tune to message size and downstream throughput.
- `MaximumBatchingWindowInSeconds`: gather larger batches for cost.
- `ParallelizationFactor`: only for Kinesis/DynamoDB Streams; increases shard-level concurrency.
- **Always configure a DLQ** for asynchronous and event-source invocations.

---

## 3. ECS, EKS, and Fargate: Containers on AWS

### ECS: AWS-native container orchestration

ECS is a proprietary orchestrator. You define:
- **Task definition**: container image, CPU/memory, volumes, IAM role.
- **Task**: a running instance of a task definition.
- **Service**: maintains desired task count and integrates with ALB/NLB.

### EKS: managed Kubernetes control plane

EKS runs the Kubernetes control plane (API server, scheduler, controller manager, etcd) for you. You manage the **data plane** (worker nodes) or use **Fargate**.

### Fargate: serverless container compute

Fargate provisions isolated compute for each task/pod. You pay per task running time; no nodes to manage.

### Textual comparison

```text
ECS (EC2 launch type)
   ├── You manage EC2 Auto Scaling groups registered to the cluster
   ├── ECS agent runs on each host (Linux, Windows, Bottlerocket)
   └── You control instance type, kernel, daemonsets, GPU

ECS (Fargate launch type)
   └── Tasks run in Fargate-managed microVMs; no host management

EKS (EC2 node groups / Karpenter)
   ├── You manage worker nodes (AMI, kubelet, containerd)
   └── Use Managed Node Groups, Karpenter, or self-managed

EKS (Fargate)
   └── Pods run in Fargate microVMs; kubelet, kube-proxy, containerd are AWS-managed
```

### ECS vs EKS decision matrix

| Dimension | ECS | EKS |
|---|---|---|
| Learning curve | Lower | Steeper (Kubernetes) |
| Portability | AWS-only | Kubernetes-standard |
| Ecosystem | AWS native tooling | Helm, operators, CNCF tools |
| IAM integration | Task roles via IAM (simpler) | IRSA / EKS Pod Identity |
| Networking modes | awsvpc (default), bridge, host, macvlan | CNI plugin (VPC IPs per pod) |
| Scaling model | Service Auto Scaling | HPA / VPA / Cluster Autoscaler / Karpenter |
| Windows containers | Supported on Fargate | Limited; not on Fargate |

### Fargate deep dive

When you schedule a Fargate task:

```text
Task/Pod spec (CPU, memory, storage, IAM)
   │
   ▼
Fargate scheduler picks a host
   │
   ▼
MicroVM created with Firecracker
   │
   ▼
Containerd + kubelet (for EKS) or ECS agent runs inside
   │
   ▼
Your containers start
```

Fargate **rounds up** CPU/memory to the nearest allowed combination. For EKS, AWS adds an overhead of **256 MB** per pod for Kubernetes components.

### Fargate vs EC2 cost logic

| Scenario | Better Choice |
|---|---|
| Long-running steady-state workloads | EC2 with Reserved/Savings Plans |
| Spiky, event-driven, batch | Fargate |
| Need GPU, bare metal, custom kernel | EC2 only |
| Need node-level observability/debugging | EC2 |
| Strict pod-level isolation per tenant | Fargate |

A common staff-level answer: **Run the long-running base fleet on EC2 with Karpenter, and burst to Fargate for untrusted or spiky workloads.**

### IAM for containers

| Approach | Where Used | How |
|---|---|---|
| **ECS task role** | ECS tasks | IAM role attached to task definition |
| **IRSA** | EKS EC2/Fargate | OIDC provider + service account annotation |
| **EKS Pod Identity** | EKS (modern) | IAM role mapped to Kubernetes service account/namespace |

Hard gotchas:
- **EKS Fargate does not support privileged containers** or `hostPath`.
- **DaemonSets cannot run on Fargate**; run them as sidecars in each pod.
- **EC2 node groups need IP capacity**; large clusters may exhaust VPC CIDR unless using prefix delegation.
- **Bottlerocket** is purpose-built for containers; no SSH, immutable root, A/B updates.

---

## 4. Compute Service Trade-Offs

| Workload Pattern | Recommended Service | Why |
|---|---|---|
| Short event-driven tasks (<15 min) | Lambda | Lowest operational overhead |
| Containerized microservices | ECS/EKS on EC2 or Fargate | Full container lifecycle control |
| Long-running compute, databases | EC2 | Full OS control, predictable cost |
| Batch/HPC | EC2 Spot + AWS Batch | Cost-efficient for fault-tolerant batch |
| Kubernetes-native apps | EKS | Standard APIs, portability |
| Windows / legacy lift-and-shift | ECS or EC2 | Better Windows support |

---

## 5. End-to-End Textual Sequence Diagrams

### EC2 boot + first request

```text
User
  │  RunInstances
  ▼
EC2 API
  │
  ├── Pick host with capacity (placement)
  ├── Create ENI, attach EBS volumes
  └── Configure Security Groups
  ▼
Nitro Controller
  │
  ├── Initialize measured boot
  ├── Load AMI / boot volume
  └── Start hypervisor (if virtualized)
  ▼
Guest OS boots
  │
  ├── Cloud-init runs
  ├── IMDS reachable
  └── Application starts
  ▼
ALB/NLB health check passes
  │
  └── Traffic begins to flow
```

### Lambda synchronous request

```text
Client
  │  Invoke(FunctionName, Payload)
  ▼
Lambda Frontend
  │
  ├── AuthN / AuthZ
  ├── Worker Manager finds warm env or provisions new MicroVM
  │
  ├── Cold start path (if needed):
  │      Download code / container layers
  │      Run Init code
  │
  └── Warm path: run handler
  ▼
Execution environment
  │
  └── Returns response to caller
```

### EKS pod scheduling (Fargate)

```text
kubectl apply pod
   │
   ▼
EKS API server
   │
   ├── Admission controllers (Pod Identity, security policy)
   └── Schedules to Fargate profile
   ▼
Fargate control plane
   │
   ├── Selects host
   ├── Provisions MicroVM
   └── Starts kubelet/containerd/sandbox
   ▼
Pod containers start
   │
   └── kubelet reports Ready to API server
```

---

## 6. Hard AWS Gotchas

### EC2
- A **stopped instance** loses its public IP unless associated with an Elastic IP.
- **Instance store is ephemeral**: data lost on stop/terminate/fail.
- **Placement groups** cannot be changed after launch without stopping.
- **Spot instances** can be interrupted with 2 minutes notice; not for stateful primary workloads.

### Lambda
- **Function URL + Lambda IAM auth** is not the same as API Gateway; no WAF, throttling, or usage plans.
- **Lambda in a VPC** requires either a public NAT gateway or VPC endpoints for AWS service calls.
- **Environment variables** are limited to 4 KB each; use Parameter Store / Secrets Manager for secrets.
- **Concurrency limit** is shared across the Region; a misbehaving function can starve others.

### ECS/EKS/Fargate
- **Fargate task storage** is ephemeral; use EFS or S3 for durable data.
- **EKS control plane** runs across AZs but is **regional**; you still need multi-Region design for regional DR.
- **Security groups for pods** add latency and scale limits; prefer node-level SGs where acceptable.
- **Container images > 250 MB uncompressed** slow task startup; keep layers small.

---

## 7. Staff-Level Interview Sound Bites

- "EC2 is not just a VM; since Nitro, networking and storage are offloaded to dedicated cards, which is why we get near-bare-metal performance in a virtualized cloud."
- "Lambda concurrency is a function of rate and duration: at 1,000 RPS with 200 ms latency I need 200 concurrent environments."
- "Provisioned concurrency removes cold starts but only works on aliases or versions, not `$LATEST`."
- "Fargate trades operational overhead for cost; for steady-state workloads, EC2 with Karpenter is usually cheaper."
- "EKS is Kubernetes-as-a-service; the real decision is whether your organization needs the Kubernetes ecosystem or AWS-native orchestration."

---

## 8. Quick Reference Tables

### Lambda limits (selective)

| Limit | Value |
|---|---|
| Function timeout | 15 minutes |
| Memory | 128 MB – 10,240 MB |
| Deployment package (zip) | 50 MB direct, 250 MB unzipped |
| Container image | 10 GB |
| /tmp storage | 512 MB default, up to 10 GB |
| Concurrent executions per account (default) | 1,000 per Region |
| Payload size | 6 MB synchronous, 256 KB async |

### EC2 purchase model comparison

| Model | Best For | Trade-off |
|---|---|---|
| On-Demand | Unknown/variable workloads | Highest cost, most flexible |
| Reserved Instances | Steady-state 1–3 year workloads | Up to ~72% discount |
| Savings Plans | Flexible compute usage | Discount tied to $/hour commitment |
| Spot | Interruptible batch/queue work | Up to 90% discount, can be interrupted |

### Fargate vs EC2 for EKS

| Concern | Fargate | EC2 |
|---|---|---|
| Operational burden | Low | High |
| Cost at steady state | Higher | Lower |
| Pod isolation | Strong | Shared node |
| DaemonSets | Not supported | Supported |
| GPU / custom hardware | No | Yes |
| Node scaling latency | Instant | Minutes |

---

## 9. Auto Scaling on AWS

Auto Scaling is not just "add more EC2 when CPU is high." It is the ability to match capacity to demand across compute layers.

### EC2 Auto Scaling Groups (ASG)

```text
CloudWatch Metric (CPU / ALB request count / custom)
   │
   ▼
ASG Scaling Policy
   │
   ├── Scale Out: Launch new instances
   └── Scale In: Terminate instances
   │
   ▼
Target Group / Load Balancer distributes traffic
```

### Scaling policy types

| Policy | Behavior | Use Case |
|---|---|---|
| **Target tracking** | Maintains a metric at a target (e.g., CPU = 50%) | Steady-state apps |
| **Step scaling** | Adds/removes capacity in steps based on alarm breach | Known thresholds |
| **Simple scaling** | Single adjustment on alarm breach | Legacy; avoid |
| **Scheduled scaling** | Predictable capacity changes | Business hours |
| **Predictive scaling** | ML-based forecast | Cyclical workloads |

### Staff-level scaling advice

Scale on the **real bottleneck**, not CPU by default:
- Async consumers → SQS queue depth / oldest message age.
- Web API → request count per target or latency.
- Streaming → Kafka consumer lag / Kinesis iterator age.

### ECS / EKS scaling

| Layer | Mechanism |
|---|---|
| **Service / Pod** | ECS Service Auto Scaling, K8s HPA |
| **Cluster / Node** | EC2 Auto Scaling, Karpenter, Cluster Autoscaler |
| **Fargate** | Task count scaling (no node management) |

---

## 10. Storage Services in AWS

Compute needs durable, shared, and archival storage. The primary AWS storage services differ by access pattern and consistency model.

### Object, block, and file storage

| Service | Type | Access | Multi-AZ | Best For |
|---|---|---|---|---|
| **S3** | Object | HTTPS REST | Yes (regional) | Data lake, backups, static content |
| **EBS gp3/io2** | Block | EC2 attach | No (AZ-local) | Boot volumes, databases |
| **EFS** | File | NFS v4.1 | Yes (regional) | Shared Linux file access |
| **FSx for Windows** | File | SMB | Yes | Windows workloads, AD-integrated shares |
| **FSx for Lustre** | File | Lustre | Yes | ML/HPC, parallel throughput |
| **FSx for ONTAP** | File | NFS/SMB/iSCSI | Yes | Enterprise NAS, snapshots, SAP |
| **Glacier / Deep Archive** | Object archive | S3 API / retrieval jobs | Yes | Long-term compliance archives |

### S3 storage classes (staff quick reference)

| Class | Use Case | Retrieval | Cost Pattern |
|---|---|---|---|
| **S3 Standard** | Hot, frequently accessed | ms | Higher storage, no retrieval fee |
| **S3 Intelligent-Tiering** | Unknown/variable access | ms | Small monitoring fee, auto-tiering |
| **S3 Standard-IA** | Infrequent access | ms | Lower storage, retrieval fee |
| **S3 One Zone-IA** | Recreatable infrequent data | ms | Single-AZ, cheaper |
| **S3 Glacier Instant Retrieval** | Archive, rare reads | ms | Very cheap storage, retrieval fee |
| **S3 Glacier Flexible Retrieval** | Backup/archive | minutes–hours | Cheaper |
| **S3 Glacier Deep Archive** | 7-year compliance | hours | Cheapest |

### Durability and availability

| Service | Durability | Availability | Notes |
|---|---|---|---|
| S3 Standard | 99.999999999% (11 9s) | 99.99% | Regional redundancy |
| EBS | 99.999% | 99.99% (AZ) | Snapshot for cross-AZ/Region DR |
| EFS | 11 9s | 99.99% | Regional, multi-AZ |
| Glacier | 11 9s | 99.99% | Retrieval jobs |

### Storage decision matrix

| Scenario | Service |
|---|---|
| Backup photos, logs | S3 + lifecycle policies |
| Static website hosting | S3 + CloudFront |
| EC2 boot volume | EBS gp3 |
| Shared container storage / CI cache | EFS |
| Windows home shares | FSx for Windows |
| AI/ML training data | FSx for Lustre or S3 + Mountpoint |
| 7-year compliance archive | Glacier Deep Archive |

---

## 11. ElastiCache and Redis Patterns

ElastiCache provides managed Redis or Memcached for low-latency caching and real-time data structures.

### Common Redis use cases

| Use case | Redis data structure | Pattern |
|---|---|---|
| **User sessions** | String with TTL | `SET session:<id> <json> EX 3600` |
| **Leaderboards** | Sorted Set | `ZADD leaderboard <score> <playerId>` |
| **Rate limiting** | Sorted Set / String | Sliding window with `ZREMRANGEBYSCORE` |
| **Real-time counters** | HyperLogLog / String | `INCR page:views:<minute>` |
| **Geospatial queries** | Geo | `GEORADIUS drivers <lon> <lat> <km>` |
| **Distributed lock** | String with NX/EX | `SET lock:<resource> <token> NX EX 10` |

### Redis Sorted Set leaderboard example

```text
Client
   │ ZADD leaderboard 1200 playerA
   │ ZADD leaderboard 1800 playerB
   ▼
Redis
   │
   ├── ZREVRANGE leaderboard 0 9 WITHSCORES  -> top 10
   ├── ZREVRANK leaderboard playerA          -> global rank
   └── ZINCRBY leaderboard 100 playerA       -> update score
```

### Scaling Redis at 100M+ players

- **Redis Cluster**: shard by player ID hash.
- **Regional leaderboards**: one board per Region to reduce cross-Region latency.
- **Top-N caching**: cache the top 1,000 globally; compute full board on demand.
- **Seasonal boards**: rotate keys and TTL old seasons.
- **Database of record**: use DynamoDB/Aurora for durable state; Redis for hot view.

---

## 12. Lambda CI/CD, Deployment, and Lambda@Edge

### Lambda deployment lifecycle

```text
Developer pushes code
   │
   ▼
GitHub / CodeCommit
   │
   ▼
CodePipeline detects change
   │
   ▼
CodeBuild compiles, tests, zips artifact
   │
   ▼
Artifact stored in S3 / ECR (container image)
   │
   ▼
SAM / CloudFormation / Terraform deploys function
   │
   ▼
CloudWatch Logs + Alarms monitor post-deploy health
```

### Manual vs CI/CD deployment

| Aspect | Manual ZIP deploy | CI/CD pipeline |
|---|---|---|
| Repeatability | Error-prone | Version-controlled, repeatable |
| Rollback | Manual | Automated aliases/versions |
| Testing | Local only | Build + integration tests |
| Permissions | Manual `addPermission()` | Infrastructure-as-code |

### Lambda versioning and aliases

- **Version**: immutable snapshot of function code + config (`1`, `2`, ...).
- **Alias**: mutable pointer to a version (`prod`, `dev`).
- **Traffic shifting**: use alias routing to shift % between versions (canary).
- **Provisioned concurrency** must be attached to an alias or version, not `$LATEST`.

### Lambda@Edge

```text
User request
   │
   ▼
CloudFront edge location
   │
   ├── Viewer request / response triggers
   ├── Origin request / response triggers
   └── Lambda@Edge function modifies headers, redirects, A/B tests
```

Use Lambda@Edge for:
- Header manipulation at the edge.
- A/B testing or redirects based on viewer data.
- URL rewrites before origin fetch.

Limitations:
- Only Node.js/Python runtimes.
- Smaller package size limits than standard Lambda.
- No VPC access.

---

## 13. Textual Mind Map: AWS Compute Decision Tree

```text
Workload
   │
   ├── Short-lived event (< 15 min)
   │      └── Lambda (or Fargate if containerized + long)
   │
   ├── Long-running / full OS control
   │      └── EC2
   │           ├── Steady state -> Reserved / Savings Plans
   │           ├── Interruptible -> Spot
   │           └── Batch queue -> Spot + AWS Batch
   │
   ├── Containerized microservices
   │      └── ECS or EKS
   │           ├── Need K8s ecosystem -> EKS
   │           ├── AWS-native simpler -> ECS
   │           └── Compute mode -> EC2 (cost) or Fargate (ops)
   │
   ├── Cache / real-time data structures
   │      └── ElastiCache (Redis) or MemoryDB (Redis-compatible, durable)
   │
   └── Stateful storage
          ├── Object -> S3
          ├── Block -> EBS
          ├── Shared file -> EFS / FSx
          └── Archive -> Glacier
```

---

## 14. API Gateway vs ALB vs Lambda Function URLs

| Concern | API Gateway | ALB (Lambda target) | Lambda Function URL |
|---|---|---|---|
| Layer | L7 + API mgmt | L7 load balancer | Direct HTTPS endpoint |
| Auth | IAM, Cognito, JWT, Lambda authorizers | OIDC/Cognito at ALB | IAM auth or none |
| Throttling/usage plans | Yes (API keys, plans) | Basic target-level limits | No |
| WAF | Yes (native or via CloudFront) | Yes | No (use CF in front if needed) |
| Features | Stages, canaries, request validation, transformations, WebSocket, REST/HTTP APIs | Path/host routing, ALB auth, stickiness | Simplest config, lowest latency path |
| Best for | Public, governed APIs and external developers | Microservices behind a shared L7 tier | Simple internal tools and webhooks secured by IAM |

Staff note: Prefer API Gateway for governed, public APIs; ALB when standardizing on ALB for microservices; Function URLs for simple endpoints where IAM is sufficient.

---

## 15. AWS Batch: Managed Batch on EC2/Spot

AWS Batch schedules containerized batch jobs onto managed EC2 compute environments and integrates with Spot for cost savings.

```text
SubmitJob -> Job Queue -> Compute Environment
   │                      ├── Managed EC2 (On-Demand/Spot)
   └── Dependencies       └── Scales ASG capacity based on queue depth
```

When to choose Batch vs DIY on EKS:
- Managed queuing, dependencies, retries, array jobs; minimal control-plane work.
- Native Spot orchestration and retries; fair-share scheduling.
- Use EKS for k8s-native batch and custom schedulers; Batch is faster for classic batch pipelines.

---

## 16. VPC Lattice for Service-to-Service

VPC Lattice provides application-layer service networking across accounts/VPCs with built-in routing and IAM auth.

- Service directory with friendly names; path and header-based routing.
- AuthN/AuthZ via IAM; integrates with WAF and TLS; supports Lambda, ALB/NLB, IP, ECS/EKS backends.
- Simplifies cross-account microservice exposure without peering/SG sprawl.

Quick pick:
- Need mesh inside a cluster -> App Mesh.
- Need cross-account, cross-VPC HTTP routing with IAM -> VPC Lattice.
- Need only discovery -> Cloud Map.

---

## 17. Lambda Implementation Details and Common Interview Q&A

### Lambda Layers

Lambda Layers let you package libraries, custom runtimes, or other dependencies independently of your function code.

- Share a layer across multiple functions to reduce deployment package size and ensure consistent versions.
- A function can use up to **five layers**.
- Layer versions are immutable; update the function to point to a new layer version.
- Useful for large libraries (Pandas, NumPy, custom SSL/TLS configs) or for providing a custom runtime.

Staff note: Layers do **not** reduce cold-start duration by themselves; they still must be downloaded into the execution environment. Minimize layer size and keep only required artifacts.

### Environment variables and secrets

- Environment variables are key/value pairs available to the function at runtime.
- Each variable is limited to **4 KB**.
- For secrets (DB passwords, API keys), use **AWS Secrets Manager** or **Systems Manager Parameter Store** and retrieve them at init time, not on every invocation.
- Encrypt sensitive environment variables with a **KMS key**.

```text
Initialization code
   │
   ├── Load config from env vars
   ├── Retrieve secrets (cached in /tmp or global variable)
   └── Reuse clients/connections across warm invocations
```

### Tracing with AWS X-Ray

- Enable **active tracing** on a function to emit X-Ray segments automatically.
- Use the X-Ray SDK to add subsegments for downstream calls (DynamoDB, S3, HTTP).
- Key interview talking points:
  - Trace map shows end-to-end latency and dependency call durations.
  - Helps identify whether latency is cold start, downstream, or handler logic.
  - Annotations and metadata help filter traces.

### Manual deployment using ZIP + S3

For simple functions or one-off testing:

```text
1. Write handler code.
2. ZIP the package (include dependencies if not using layers).
3. Upload ZIP to S3.
4. Create or update the Lambda function with Code: { S3Bucket, S3Key }.
5. Add invoke permissions for triggers (e.g., s3:PutObject).
6. Invoke/test and monitor CloudWatch Logs.
```

Limitations:
- Direct upload limit: **50 MB compressed ZIP**.
- S3-based upload limit: **250 MB uncompressed**.
- No version control or rollback safety for production; prefer CI/CD.

### CI/CD deployment using CodePipeline + SAM

```text
GitHub Repo
   │
   ├── Push code + template.yaml
   ▼
AWS CodePipeline
   │
   ├── Source stage detects change
   ▼
AWS CodeBuild
   │
   ├── Build, zip, run unit tests
   ├── Upload artifact to S3
   ▼
AWS SAM / CloudFormation
   │
   ├── Deploy stack
   ├── Create/update Lambda versions and aliases
   ▼
CloudWatch Alarms monitor post-deploy health
```

Benefits:
- Repeatable, version-controlled deployments.
- IAM roles and permissions defined in infrastructure-as-code.
- Easy promotion across dev/staging/prod using aliases.

### Lambda deployment best practices

| Practice | Why |
|---|---|
| Use versions + aliases | Rollbacks and canary traffic shifting |
| Attach provisioned concurrency to aliases | Stable latency for production endpoints |
| Parameterize templates per environment | Avoid hard-coded environment differences |
| Add CloudWatch alarms on errors/throttles/duration | Detect bad deployments quickly |
| Run integration tests before production promotion | Catch permission or runtime issues |

### Lambda integration matrix

| Service | Triggers Lambda? | Called by Lambda? |
|---|---|---|
| S3 | ✅ Object events | ✅ Store results |
| DynamoDB | ✅ Streams | ✅ Read/write |
| API Gateway | ✅ HTTP requests | ❌ |
| EventBridge | ✅ Schedules/rules | ❌ |
| SQS / Kinesis | ✅ Message batches | ✅ Send messages |
| SNS | ✅ Push | ✅ Publish |

### Scenario-based troubleshooting

**Q: A Lambda function runs out of memory. How do you fix it?**
- Increase memory allocation in 64 MB increments. Memory also proportionally increases CPU/network.
- Optimize code to stream data instead of loading entire objects into memory.
- Split large workloads into smaller chunks processed by SQS or Step Functions.

**Q: A Lambda function is timing out intermittently. How do you investigate?**
- Enable X-Ray and CloudWatch Logs to find the slow component (DB query, external API, cold start).
- Increase memory to get more CPU.
- If processing time consistently exceeds 15 minutes, split the work using Step Functions or SQS workers.

**Q: Design a Lambda-based real-time streaming pipeline.**
- Ingest data into **Kinesis Data Streams** or **DynamoDB Streams**.
- Configure a Lambda event source mapping with appropriate batch size and parallelization factor.
- Process records idempotently, handle partial batch failures, and route failures to a DLQ.
- Store results in DynamoDB/S3 and use CloudWatch metrics to monitor lag.
