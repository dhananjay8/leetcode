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
