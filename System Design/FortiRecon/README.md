# FortiRecon E2E System Design (Director Round)

Design a multi-tenant External Attack Surface Management (EASM) and Digital Risk Protection (DRP) platform that continuously discovers internet-facing assets, ingests threat intelligence, correlates findings, detects risk, and generates real-time alerts.

## 1) Interview Framing (45 minutes)

| Time | Topic | Objective |
|---|---|---|
| 0-3 min | Requirements | Establish scope |
| 3-7 min | Scale assumptions | Define constraints |
| 7-12 min | High-level architecture | Establish layers |
| 12-20 min | Asset discovery | Deep dive crawling and scheduler |
| 20-27 min | Event processing | Kafka + stream pipeline |
| 27-33 min | Storage design | Search + graph + history |
| 33-37 min | Detection and alerting | Correlation and risk |
| 37-41 min | Reliability and security | Isolation and failure handling |
| 41-44 min | Trade-offs | Staff-level reasoning |
| 44-45 min | Summary | Clear architectural close |

## 2) Scope Statement

"I would design FortiRecon as a continuously running, event-driven security intelligence platform. The system ingests organization metadata and known assets, continuously discovers additional internet-facing assets, ingests threat intelligence, correlates those signals to tenants, evaluates risk, and generates actionable alerts."

In-scope:
- Onboarding, discovery, ingestion, correlation, detection, storage/search, alerting

Out-of-scope:
- Automated remediation/takedown workflows (downstream integration)

## 3) Requirements

### Functional
- Organization onboarding (`domains`, `ASNs`, `IP ranges`, `subsidiaries`, `brand keywords`)
- Continuous asset discovery (domains, subdomains, IPs, DNS, certificates, exposed services)
- Threat intelligence ingestion (IOCs, CVEs, phishing domains, leaked credentials, malware intel)
- Correlation to tenant ownership with confidence scoring
- Risk detection (new exposure, vulnerable service, credential leak, typosquatting)
- Alerting via dashboard, email, webhook, SIEM/SOAR connectors

### Non-functional
- Multi-tenant, highly available, horizontally scalable
- Near real-time detection with eventual consistency in data plane
- Strong tenant isolation and idempotent processing
- Auditability, encryption, and secure-by-default controls
- Rate limiting for external dependencies, backpressure, and fault tolerance

## 4) Scale Assumptions

| Metric | Assumption |
|---|---|
| Customers | 10,000 |
| Avg domains/customer | 100 |
| Initial known assets | ~1M |
| Total discovered assets | 100M+ |
| Discovery events/day | 500M |
| Avg throughput | ~6K events/sec |
| Peak throughput | 100K+ events/sec |
| Threat-intel events/day | 500M |
| Searchable records | Billions |
| API availability target | 99.99% |
| Detection latency target | Seconds to minutes |

Assumptions are interview constraints, not production claims.

## 5) Most Important Architectural Decision

Separate **control plane** from **data plane**.

- Control plane: tenant config, users, policies, schedules, API auth
- Data plane: discovery, ingestion, processing, correlation, detection, indexing

Reason: a 100x ingestion spike must not degrade login/configuration workflows.

## 6) High-Level Architecture

See diagrams in [`diagrams.md`](./diagrams.md).

Logical layers:
1. API and Control Plane
2. Discovery Plane
3. Threat Ingestion Connectors
4. Kafka Event Backbone
5. Stream Processing (normalize/dedup/correlate/score)
6. Polyglot Storage (PostgreSQL/OpenSearch/Graph/Object storage/Redis)
7. Detection and Alerting

## 7) Core API Pattern

Example async endpoint:
- `POST /organizations/{orgId}/discovery`

Flow:
1. Authenticate + authorize tenant context
2. Validate request and policy limits
3. Persist `discovery_job` metadata
4. Publish `DiscoveryRequested` event
5. Return `202 Accepted`

Discovery must be asynchronous; never block user requests on scans.

## 8) Data Plane Deep Dives

### 8.1 Discovery pipeline
- DNS enumeration -> CT logs -> subdomain discovery -> DNS resolution -> IP/ASN mapping -> service probing -> technology fingerprinting
- Every stage emits events and scales independently

### 8.2 Event backbone and processing
- Kafka topics (example):
  - `discovery.requested`
  - `asset.discovered`
  - `threat-intel.ingested`
  - `asset.correlated`
  - `risk.detected`
  - `alert.created`
- Partitioning strategy:
  - Prefer `hash(assetId)` for asset-ordering requirements
  - Add tenant quotas/scheduling to prevent noisy-neighbor effects

### 8.3 Dedup and idempotency
- Canonicalize discovered entities
- `assetId = hash(normalizedAsset + assetType)`
- Idempotency key for alert fan-out:
  - `tenantId + findingId + detectionRuleVersion`

### 8.4 Entity resolution
Use weighted confidence signals, e.g. domain ownership, cert SANs, ASN affinity, IP ownership, historical links, brand similarity.

### 8.5 Polyglot storage rationale
- PostgreSQL: transactional control-plane state and current authoritative records
- OpenSearch: analyst search, aggregations, faceting
- Graph DB: relationship-heavy traversals
- Object storage/data lake: immutable raw and historical events
- Redis: distributed quotas, caches, scheduler/rate-limit state

## 9) Detection and Alerting

- Versioned rules engine (not hardcoded-only rules)
- Risk score dimensions: severity, exposure, confidence, exploitability, asset criticality, recency
- Alert fan-out is asynchronous via queue/stream with retry, backoff, DLQ, circuit breaker

## 10) Reliability and Security

- Backpressure via Kafka lag + bounded consumers
- Never scale consumers blindly into a saturated datastore
- Connector isolation for flaky feeds
- TLS/mTLS, OIDC, RBAC, tenant-scoped access controls
- KMS-backed encryption at rest, tenant-aware keying for high-isolation tiers
- Audit trail: who, what, when, tenant, source, result

## 11) Evolution Plan

### Phase 1
- API + PostgreSQL + Kafka + discovery workers + OpenSearch + basic alerts

### Phase 2
- Better enrichment, stronger detection rules, historical storage tiers, tenant quota controls

### Phase 3
- Graph-assisted correlation, advanced risk scoring, workflow orchestration (e.g. Temporal) for long-running processes

## 12) Director Close

"The goal is not peak event throughput in isolation. The goal is predictable detection latency, tenant isolation, and controlled failure behavior under volatile external inputs and bursty traffic."

## Companion Files
- [`diagrams.md`](./diagrams.md)
- [`follow-ups.md`](./follow-ups.md)
