# FortiRecon HLD Diagrams (Mermaid)

## 1) End-to-End Layered Architecture

```mermaid
flowchart TB
    U[Analyst / API Client] --> G[API Gateway]
    G --> A[AuthN/AuthZ]
    A --> CP[Control Plane Services<br/>Tenant, Users, Policies, Schedules]
    CP --> PG[(PostgreSQL<br/>Control-plane metadata)]

    CP --> K1[(Kafka<br/>Event Backbone)]

    subgraph DP[Data Plane]
      S[Discovery Scheduler<br/>Quotas, Priority, Backoff]
      D1[DNS/CT/Subdomain Workers]
      D2[Port/HTTP/Tech Fingerprint Workers]
      TI[Threat Intel Connectors]
      N[Normalization + Validation]
      DE[Dedup + Entity Resolution]
      C[Correlation + Risk Scoring]
      R[Detection Rules Engine]
      AL[Alert Service]
    end

    K1 --> S
    S --> D1
    S --> D2
    TI --> K1
    D1 --> K1
    D2 --> K1
    K1 --> N --> DE --> C --> R --> K1
    K1 --> AL

    C --> PS[(PostgreSQL<br/>Current authoritative state)]
    C --> OS[(OpenSearch<br/>Security search/index)]
    C --> GR[(Graph DB<br/>Relationship traversal)]
    C --> OB[(Object Storage<br/>Raw + historical immutable events)]
    S --> RD[(Redis<br/>Rate limits, quotas, short-lived state)]

    AL --> EM[Email]
    AL --> WH[Webhooks]
    AL --> SI[SIEM/SOAR]
```

**Talking points**
- Control plane (tenant/users/policies, backed by PostgreSQL) is physically separate from the data plane (discovery, ingestion, processing) — a 100x ingestion spike cannot degrade login or config APIs.
- Kafka is the single event backbone connecting discovery, threat-intel ingestion, and the correlation pipeline — every stage is independently scalable and replayable.
- Storage is deliberately polyglot: PostgreSQL for authoritative transactional state, OpenSearch for analyst search, Graph DB for relationship traversal, object storage for immutable raw history — each chosen for the workload, not a single one-size-fits-all store.

## 2) Control Plane vs Data Plane Isolation

```mermaid
flowchart LR
    subgraph ControlPlane
      CAPI[Config APIs]
      TEN[Tenant/Policy Service]
      JOB[Job Metadata Service]
    end

    subgraph DataPlane
      DISC[Discovery Workers]
      INTEL[Intel Ingestion Workers]
      PROC[Stream Processing]
      DET[Detection + Alerting]
    end

    CAPI --> TEN --> JOB
    JOB --> K[(Kafka discovery.requested)]

    K --> DISC
    K --> INTEL
    K --> PROC --> DET

    NOTE1[Ingress spike in Data Plane does not block config/auth APIs]
    NOTE1 -.-> CAPI
```

**Talking points**
- This is the single most important architectural decision in the whole design — isolate blast radius so a noisy/bursty data plane never starves tenant-facing control operations.
- The two planes only communicate through Kafka (`discovery.requested`), never through synchronous RPC — this keeps the coupling async and backpressure-safe.
- In a real review, this is the diagram to draw first, even before discovery internals — it signals you understand failure isolation before optimization.

## 3) Discovery and Processing Pipeline

```mermaid
flowchart LR
    RQ[DiscoveryRequested] --> SCH[Scheduler]
    SCH --> T1[DNS Enum Task]
    SCH --> T2[CT Log Lookup Task]
    SCH --> T3[HTTP Probe Task]

    T1 --> E1[DomainDiscovered]
    T2 --> E2[SubdomainDiscovered]
    T3 --> E3[ServiceDetected]

    E1 --> K[(Kafka)]
    E2 --> K
    E3 --> K

    K --> N[Normalize]
    N --> D["Deduplicate<br/>assetId = hash(normalizedAsset + type)"]
    D --> ER[Entity Resolution<br/>confidence scoring]
    ER --> RC[Risk Correlation]
    RC --> RD[RiskDetected]
```

**Talking points**
- Every discovery task type (DNS enum, CT log lookup, HTTP probe) emits its own event onto Kafka — they scale and fail independently rather than as one monolithic "scan" job.
- Deduplication happens via a deterministic `assetId = hash(normalizedAsset + type)` *before* entity resolution, so the expensive confidence-scoring step never runs twice on the same logical asset.
- Entity resolution (confidence scoring) is a distinct stage from correlation — resolving "which tenant owns this asset" is a different problem from "is this asset risky," and keeping them separate makes each independently testable.

## 4) Alerting and Idempotent Delivery

```mermaid
flowchart LR
    RD[RiskDetected] --> AS[Alert Service]
    AS --> ID["Idempotency Check<br/>key = tenantId + findingId + ruleVersion"]
    ID -->|new| Q[Notification Queue]
    ID -->|duplicate| SKIP[Drop duplicate]

    Q --> E[Email Provider]
    Q --> W[Webhook Dispatcher]
    Q --> S[SIEM/SOAR Connector]

    E --> RET[Retry + Backoff + Circuit Breaker]
    W --> RET
    S --> RET
    RET --> DLQ[DLQ]
```

**Talking points**
- The idempotency key (`tenantId + findingId + detectionRuleVersion`) is checked *before* fan-out, not after — duplicates are dropped at the earliest point, so email/webhook/SIEM integrations never need their own dedup logic.
- Each downstream channel (email, webhook, SIEM) gets independent retry/backoff/circuit-breaker handling — one flaky webhook endpoint can't back up alerts to the other two channels.
- A DLQ is the deliberate failure boundary: after max retries, the alert is parked for replay/inspection rather than silently dropped or blocking the queue.

## 5) Storage by Workload (Polyglot)

```mermaid
flowchart TB
    IN[Normalized Events + Findings] --> TX[(PostgreSQL<br/>transactional state)]
    IN --> SR[(OpenSearch<br/>search/aggregations)]
    IN --> GP[(Graph DB<br/>relationship queries)]
    IN --> HS[(Object Storage/Data Lake<br/>historical immutable events)]

    Q1[Query: Exposed nginx assets by tenant] --> SR
    Q2[Query: Indirect infra relationships for org] --> GP
    Q3[Query: Attack surface changes over 90 days] --> HS
```

**Talking points**
- Each store maps to a distinct access pattern: PostgreSQL answers "what is true right now," OpenSearch answers "find/aggregate across many records," Graph DB answers "how are these entities connected," object storage answers "what happened historically."
- OpenSearch and the Graph DB are **derived/projection** stores, not sources of truth — if either is lost, it can be rebuilt by replaying from PostgreSQL/object storage/Kafka retention, which is the honest answer to "what if OpenSearch goes down."
- Start lean (Phase 1 only needs PostgreSQL + OpenSearch) and introduce Graph DB/extra tiers only once a measured query pattern justifies the operational cost — a staff-level answer resists over-engineering storage upfront.
