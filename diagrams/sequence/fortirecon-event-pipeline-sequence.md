# FortiRecon EASM/DRP - Discovery to Alert Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Analyst as Security Analyst
    participant API as Control Plane API
    participant AUTH as Tenant AuthZ
    participant SCH as Discovery Scheduler
    participant CRAWL as Discovery Workers
    participant FEED as Threat Feed Connectors
    participant K as Kafka Topics
    participant PROC as Stream Processors
    participant RATE as Rate Limit + Quota Service
    participant STORE as PostgreSQL/OpenSearch/Graph
    participant DET as Detection Rules Engine
    participant ALERT as Alert Service
    participant SIEM as SIEM/SOAR/Webhook

    Analyst->>API: Trigger discovery or update policy
    API->>AUTH: Validate tenant context and policy
    AUTH->>SCH: Create async discovery job
    SCH->>RATE: Allocate tenant + target quota
    SCH->>CRAWL: Schedule bounded tasks (DNS/CT/HTTP)
    FEED->>K: Publish threat-intel events

    CRAWL->>K: Publish asset/discovery events
    K->>PROC: Consume by partition key
    PROC->>PROC: Normalize + dedup + entity resolution
    PROC->>STORE: Upsert current state and indexes
    PROC->>DET: Emit correlated risk candidates

    DET->>ALERT: Create RiskDetected event
    ALERT->>ALERT: Idempotency check by composite key
    ALERT->>SIEM: Dispatch alert notification

    opt Ingest spike (100K events/sec)
        K-->>PROC: Consumer lag grows
        PROC->>RATE: Enforce backpressure and per-tenant fairness
    end

    alt Notification failure
        SIEM--xALERT: Timeout or 5xx
        ALERT->>ALERT: Retry with backoff
        ALERT->>ALERT: Move to DLQ after max attempts
    end
```

## Talking Points

- Control plane and data plane remain isolated under ingest spikes.
- Processing is asynchronous and replayable using Kafka retention.
- Detection-to-alert path is idempotent to avoid duplicate incidents.
- Notification fan-out failures are contained through retry, DLQ, and circuit breakers.
- Tenant-level quota enforcement prevents noisy-neighbor starvation.
