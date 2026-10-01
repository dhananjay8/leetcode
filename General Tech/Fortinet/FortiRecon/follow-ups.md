# FortiRecon Director Drill-Down Q&A

Use these responses for the 20-25 minute follow-up segment.

## 1) How do you prevent duplicate assets?
- Normalize first (`lowercase`, punycode normalization, canonical ports/protocols).
- Build deterministic `assetId = hash(normalizedAsset + assetType)`.
- Use idempotent upserts and event-id dedup windows.

## 2) How do you correlate an IP/domain to a tenant?
- Multi-signal confidence model: domain hierarchy, cert SANs, ASN affinity, ownership signals, historical links, brand similarity.
- Threshold-based association plus analyst-review path for ambiguous scores.

## 3) Why Kafka and not direct RPC?
- Decoupling, buffering, replayability, independent scaling, temporal isolation under bursts.
- Avoids synchronous cascading failures.

## 4) How do you partition Kafka topics?
- Choose by business ordering requirement.
- Asset-ordering: `hash(assetId)`.
- Tenant isolation: enforce quotas/scheduling independently.
- Avoid tenant-only hot partitions for large customers.

## 5) What if one tenant is 100x larger?
- Tenant classes (`standard`, `large`, `enterprise`).
- Weighted scheduler, per-tenant concurrency caps, quota buckets, query limits.
- Optional tenant-dedicated resources for enterprise tiers.

## 6) How do you avoid crawler resource exhaustion?
- Stateless workers with bounded concurrency.
- Connection pooling, strict timeouts, retry budgets, circuit breakers.
- Per-target and per-provider rate limits.

## 7) How do you rate-limit scanning at scale?
- Hybrid approach: local token buckets + distributed quota state in Redis.
- Reduce global Redis dependency by batching and local allowance caches.

## 8) What is source of truth?
- Transactional authoritative state in PostgreSQL.
- OpenSearch and graph are derived/projection layers.
- Raw immutable events retained in object storage for replay.

## 9) What if OpenSearch is down or loses data?
- Continue processing via Kafka and authoritative stores.
- Rebuild indexes from retained event logs.
- Serve degraded search experience while preserving detection pipeline.

## 10) How do you guarantee idempotency?
- Event-level `eventId` + domain idempotency keys.
- Consumer-side processed-key store with TTL/windowing.
- Upsert semantics and duplicate-safe alerting fan-out.

## 11) How do you handle out-of-order events?
- Prefer event-time fields and version checks.
- Per-entity monotonic versions where needed.
- Late-event handling policy: merge, ignore, or compensating event.

## 12) How do you handle schema evolution?
- Versioned event schemas and backward-compatible changes.
- Schema registry + producer/consumer compatibility checks.
- Dual-read/dual-write during migrations if required.

## 13) What if Kafka is unavailable?
- Ingest buffers and controlled retries.
- API returns accepted-with-delay semantics for async jobs where possible.
- Recovery plans for lag drain with bounded consumer ramp-up.

## 14) What if Redis fails?
- Fail-safe policy depends on operation:
  - Strict external rate limits -> fail closed.
  - Internal soft quotas -> fail open with conservative local limits.
- Reconstructible ephemeral state preferred.

## 15) How do you process a 50 GB credential dump?
- Store raw blob in object storage.
- Stream/chunk parse, publish partitions to Kafka.
- Use parallel workers, bounded memory, batch writes.
- Use Bloom filter as pre-filter, authoritative dedup in indexed store.

## 16) How do you prevent alert storms?
- Grouping, dedup windows, tenant-level alert budgets.
- Severity thresholds and suppression rules.
- Cooldown windows and escalation policy.

## 17) Why polyglot storage?
- Distinct workloads: transactions, search, relationship traversal, historical analytics.
- Start lean; introduce additional stores based on measured bottlenecks.

## 18) How do you deploy safely?
- Canary rollouts with automatic rollback gates.
- Observe error rate, lag, latency, throughput.
- Expand -> migrate -> contract for schema changes.

## 19) Where does Temporal fit?
- Long-running stateful workflows (scheduled discovery, takedown, onboarding orchestration).
- Kafka remains event backbone; Temporal manages workflow state/timers/retries.

## 20) What would you build first?
- Phase 1: API, PostgreSQL, Kafka, discovery workers, OpenSearch, basic detection/alerts.
- Phase 2: stronger enrichment, history tiers, quota controls.
- Phase 3: graph-assisted correlation, advanced scoring, workflow automation.
