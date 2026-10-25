# Production AI Systems

## 1. First Response

> "I design AI systems around measurable quality SLOs and deterministic guardrails. The model is one dependency behind bounded concurrency, retries, budgets, authorization, observability, evaluation gates, and graceful degradation."

## 2. Reference Architecture

```text
Client → API/Auth/Tenant resolution → admission control
→ workflow/orchestrator
   ├─ retrieval/indexes
   ├─ model gateway/providers
   ├─ tools/business services
   └─ durable state/checkpoints
→ schema + policy validation → response/event

Cross-cutting: tracing, evals, cost, security, rate limits, DLQ, audit
```

## 3. SLOs and Capacity

Define quality and operational targets together:

- Retrieval Recall@K / answer faithfulness / task success.
- P50/P95/P99 latency and time-to-first-token.
- Availability/error/fallback rate.
- Tokens and cost/request.
- Queue age and saturation.
- Per-tenant/model/provider quotas.

Little's Law: `concurrency ≈ arrival rate × service time`. Slow model calls mean even modest QPS needs high concurrency—or queues and async completion.

## 4. Concurrency, Rate Limiting, Backpressure

- Semaphores cap in-flight work.
- Token buckets cap rate/burst.
- Bounded queues absorb short spikes.
- Pause/reject/degrade before memory grows without bound.
- Global limits must be distributed; per-pod semaphores multiply with replicas.
- Separate pools/bulkheads for cheap I/O, CPU parsing, embedding, and expensive model calls.

Backpressure options: 429 + `Retry-After`, async job acceptance, queue partition pause, reduced model tier, smaller context, or load shedding.

## 5. Reliability

| Pattern | AI-specific application |
|---|---|
| Timeout | Separate connect/read/overall deadlines; propagate remaining budget |
| Retry | Transient failures only; exponential backoff + jitter; bounded attempts |
| Circuit breaker | Stop hammering unhealthy model/vector provider |
| Bulkhead | Isolate tenants/models/work types |
| Fallback | Secondary model, cached answer, retrieval-only response, human review |
| DLQ | Poison events/malformed documents with reason and source identity |
| Idempotency | Stable logical request/content/effect key |

Retries multiply load. Never retry permanent schema/authorization/oversize errors. Retrying after partial streaming or an external side effect needs special semantics.

## 6. Event-Driven AI

Use queues when work is long-running, bursty, expensive, or caller need not block.

```text
accept + validate → durable event → partitioned consumers
→ bounded workflow → result event/store → callback/poll
```

Partition by ordering domain (tenant/document/run). Commit only after result is durably handled. Expect at-least-once delivery; make processing idempotent. DLQ poison messages so one record cannot block a partition forever.

## 7. Model Gateway

Centralize:

- Provider abstraction/model routing.
- Auth and tenant quotas.
- Rate limits/budgets.
- Request/response policy and PII controls.
- Prompt/model versions.
- Retries, circuit breakers, fallback.
- Token/cost/latency telemetry.

Avoid a gateway that becomes a giant synchronous bottleneck; scale horizontally and keep provider-specific behavior visible.

## 8. Observability

Trace one logical request across every branch and external call.

Recommended attributes:

- Correlation/run/tenant IDs.
- Model/provider/version and prompt version.
- Embedding/index/chunker versions.
- Retrieval filters, candidate count, latency.
- Input/output tokens and estimated cost.
- Tool name/status/latency—not secrets or raw sensitive payloads.
- Retry, fallback, queue delay, cache hit.
- Evaluation/feedback outcome.

Metrics: RED (rate/errors/duration), queue age/depth, saturation, model throttles, token/cost rates, quality distribution, and drift.

## 9. Security and Governance

Threats:

- Prompt injection and indirect injection.
- Cross-tenant retrieval/data exfiltration.
- Tool privilege escalation.
- Sensitive prompt/log leakage.
- Model supply-chain/provider risk.
- Denial of wallet/resource exhaustion.
- Unsafe generated code/actions.

Controls:

- Identity and ACL filters before retrieval/tool execution.
- Least privilege and narrow tools.
- Data classification/redaction/retention.
- Egress controls and sandboxing.
- Signed/approved model and prompt releases.
- Budget and step limits.
- Immutable audit trails and human approval.

## 10. Cost Engineering

Cost = input tokens + output tokens + embeddings + reranking + vector/store/compute + retries.

Optimize in this order:

1. Remove unnecessary calls/retries.
2. Improve retrieval/context compression.
3. Cache safe stable work.
4. Route to smaller models.
5. Batch embeddings/inference where latency permits.
6. Quantize/self-host only when economics and operational maturity justify it.

Track cost per successful task—not merely cost per request.

## 11. Deployment and Rollout

- Offline eval gate before deployment.
- Shadow new model/prompt/retriever.
- Canary by tenant/request percentage.
- Compare paired outputs and operational metrics.
- Keep instant rollback and version traceability.
- Reindex via blue/green indexes for embedding/chunker changes.
- Graceful shutdown: stop intake, drain bounded work, checkpoint/commit, close clients.

## 12. End-to-End Deadline Engineering

A timeout on each dependency can exceed the caller's total deadline. Carry one absolute deadline or remaining budget through every branch:

```text
request budget
= queue delay + retrieval + tools + model + validation + network margin
```

- Reject work that cannot start before its deadline.
- Allocate sub-budgets by critical-path need, not evenly.
- Cancel downstream work when the caller disconnects or the result is no longer useful.
- Bound fan-out by both concurrency and remaining time.
- Distinguish timeout from cancellation and provider rejection in metrics.

Hedged requests may reduce tails for idempotent reads, but they increase load and cost; trigger only after a percentile delay and cancel losers.

## 13. Overload and Capacity Model

Map all amplification factors:

```text
external QPS × workflow branches × tool/model calls
× retry factor × average service time = potential in-flight work
```

Use heavy-tailed input/output tokens and branch counts, not averages. Define overload order:

1. Stop optional enrichment and speculative branches.
2. Serve safe caches or smaller eval-approved models.
3. Queue asynchronous work within age limits.
4. Reject low-priority/new work with explicit retry guidance.
5. Preserve capacity for health, cancellation, and recovery traffic.

Autoscaling is slower than burst admission control. Scale from queue age, active slots, token load, and provider headroom—not CPU alone.

## 14. Idempotency and Side-Effect Semantics

Use a stable logical-operation key, distinct from an HTTP attempt ID. Store status and outcome before acknowledging durable work.

For side effects:

- Prefer idempotent target APIs with caller-supplied keys.
- Use transactional outbox when database state and event publication must agree.
- Handle crash windows: before effect, after effect/before checkpoint, after checkpoint/before response.
- Reconcile unknown outcomes rather than blindly retrying.
- Keep dedup retention at least as long as redelivery/retry windows.

Exactly-once is usually a business invariant assembled from at-least-once infrastructure plus idempotency and reconciliation.

## 15. Deployment Topology and Cells

Use cells to bound blast radius: a cell contains gateway/workers, queues, caches, retrieval resources, and quota allocation for a tenant or traffic cohort. Route requests deterministically to a cell.

Benefits: smaller failures, safer canaries, predictable capacity. Costs: lower pooling efficiency, duplicated operations, cross-cell migration. Keep the control plane from becoming a synchronous dependency for every request; distribute signed/versioned last-known-good configuration.

## 16. Data Lifecycle and Privacy

Track derived artifacts from source to output:

```text
source → parsed text → chunks → embeddings/index
→ prompts/traces/caches → eval samples → backups
```

Retention/deletion must propagate across every derivative. Encrypt in transit/at rest, minimize raw prompt logging, scope debug access, tokenize/redact sensitive fields, and define provider retention/training policy. Legal hold and deletion need explicit precedence and audit.

## 17. Quality Incidents and Semantic Rollback

Operational dashboards can be green while answer quality regresses.

Response:

1. Freeze model/prompt/retriever/index rollouts.
2. Preserve versioned traces and affected cohorts.
3. Compare stable anchors and production slices.
4. Localize to ingestion, retrieval, context, model, tool, cache, or judge.
5. Roll back routing/configuration or disable unsafe capability.
6. Assess user/side-effect impact and reconcile actions.
7. Add regression cases and repair release gates.

Maintain kill switches by model, prompt, tool, tenant, and workflow—not only one global off switch.

## 18. Disaster Recovery and Multi-Region

Decide per component:

| Component | Key DR question |
|---|---|
| Queues/run state | RPO/RTO and replay identity |
| Vector/index | Rebuild from source or replicate? |
| Cache | Disposable or correctness-bearing? |
| Model/provider | Region compatibility and residency |
| Tool side effects | Reconciliation after failover |
| Configuration | Last-known-good version and expiry |

Active-active improves availability but complicates global quotas, ordering, idempotency, and data residency. Prefer regional ownership or deterministic home-region routing unless the business requires global writes.

## 19. Operational Readiness Review

Before production, require:

- Named SLOs, owners, dashboards, paging, and runbooks.
- Load tests including retries and dependency degradation.
- Model/prompt/index version traceability and rollback.
- Queue/DLQ replay procedure and idempotency evidence.
- Quotas, cost alerts, and denial-of-wallet controls.
- Security threat model and high-risk tool approvals.
- Quality baseline, canary gates, and incident kill switches.
- Graceful shutdown and data deletion verification.

## 20. Staff-Level Design Questions

**How do you choose sync versus async?**
Use sync when work fits a predictable interaction deadline and cancellation has value. Use async for bursty, fan-out-heavy, long, expensive, or resumable work. Acknowledge only after durable acceptance and return a stable run ID.

**What do you do when the quota store fails?**
Risk determines behavior: spend/security-sensitive calls fail closed or use small expiring emergency leases; low-risk traffic may use conservative local limits. Never silently become unlimited.

**How do you isolate a toxic tenant?**
Per-tenant queues, quotas, concurrency pools, budgets, circuit breakers, and optionally a dedicated cell. Preserve fair scheduling and expose throttling reason.

**How do you make fallback safe?**
Pre-evaluate task/model pairs, preserve data residency and tool/schema capabilities, track fallback as a separate quality cohort, and never treat a response from an incompatible model as transparent success.

**What is your rollback unit?**
A complete execution manifest: model/provider, prompt, schema, retriever/index/chunker, tools/policy, workflow/state version, and routing configuration.

## 21. Common Design Questions

**How do you scale an LLM-heavy service?**
Decouple with queues, partition work, bound global concurrency, horizontally scale stateless workers, cache, route models, batch where possible, and let downstream quotas—not CPU—drive admission control.

**How do you handle provider outage?**
Deadline, circuit breaker, alternate provider/model only if eval-compatible, queue/defer non-interactive work, and return an explicit degraded response.

**How do you prevent noisy neighbors?**
Per-tenant budgets/rate limits/queues, weighted scheduling, bulkheads, and usage attribution.

**Exactly once?**
Usually unnecessary and often impossible end-to-end. Use at-least-once delivery plus idempotency, deduplication, transactional outbox where needed, and reconciliation.

**How do you capacity-plan?**
Measure service-time distributions by model/work type, calculate concurrency from QPS × latency, include retry/burst factors, then load-test until a downstream quota or SLO saturates.

## 22. Interview Sound Bites

- "Autoscaling without global admission control just autoscaling your provider outage."
- "Retries are load amplifiers; budget them explicitly."
- "The important cost metric is cost per successful, policy-compliant task."
- "At-least-once plus idempotency beats pretending the entire AI pipeline is exactly once."
- "Quality, latency, and cost form one SLO—not three unrelated dashboards."
