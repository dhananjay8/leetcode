# AI Engineering — Frequently Asked Interview Questions

## 1. Architecture

### Design a production RAG system.

**First response:** "I start with tenant/security boundaries and quality SLOs, then separate ingestion from query serving. I use hybrid retrieval, rerank into a token budget, require citations and structured output, and evaluate retrieval independently from generation."

Follow-ups: ingestion idempotency, chunk/version migrations, ACL filters, cache keys, queueing, failure isolation, eval gates, cost.

### How would you scale an AI service?

Use async queues for long work, partition consumers, global concurrency/rate limits, horizontal stateless workers, bounded fan-out, model routing, caching, batching, backpressure, and load tests driven by downstream quotas.

### Sync API or asynchronous job?

Sync for predictable sub-second/few-second interactive work. Async when bursty, multi-minute, fan-out-heavy, retryable, or caller can poll/receive events. Return a durable job/run ID.

## 2. RAG and Retrieval

### Why hybrid search?

Vectors catch semantic similarity; BM25 catches exact identifiers and rare terms. Merge broad candidates, then rerank.

### How do you choose chunk size?

Treat it as a hyperparameter. Preserve natural structure; benchmark Recall@K, answer faithfulness, latency, and tokens across representative documents.

### What if relevant context exceeds the window?

Decompose query, retrieve/rerank, dedupe, hierarchical summarize, select diverse evidence, and iterate—not truncate blindly.

### How do you migrate embedding models?

Version vectors, build a parallel index, dual-write, shadow dual-query, compare quality/latency/cost, canary, cut over, and retain rollback.

## 3. Agents and Orchestration

### Workflow vs agent?

Workflow when steps are known; agent when next action genuinely requires model judgment. Prefer deterministic control for regulated/high-impact flows.

### How do you prevent runaway agents?

Max steps, deadline, cost/token limits, repeated-action detection, bounded tool output, approval for side effects, and circuit breakers.

### LangChain vs LangGraph?

LangChain/LCEL for composable calls; LangGraph for explicit state, branches, loops, fan-out/fan-in, checkpoints, and human interrupts.

### What does MCP solve?

Standard capability discovery/invocation between AI hosts and tool/resource servers. It does not solve trust, auth, sandboxing, or policy.

## 4. Reliability and Scale

### How do you retry LLM calls?

Only transient failures; exponential backoff + jitter; respect retry headers and total deadline; cap attempts; avoid replay after partial streaming/side effects; account for retry load.

### How do you guarantee exactly once?

I usually do not. I design at-least-once processing with stable idempotency keys, dedup, transactional boundaries/outbox, and reconciliation.

### How do you manage provider rate limits?

Distributed token bucket/semaphore, per-tenant quotas, priority queues, admission control, model fallback only when eval-compatible, and 429/backpressure.

### How do you recover graph execution?

Durable checkpoints keyed by stable run ID; idempotent nodes/effects; state-schema versioning; caller/event redelivery reuses the run ID.

## 5. Evaluation

### What metrics do you use for RAG?

Recall@K/MRR/NDCG for retrieval; faithfulness, relevance, correctness, citation quality for generation; latency, errors, tokens, cost, fallback for system behavior.

### Why not use one LLM judge score?

It hides regressions and inherits judge bias. Use a metric matrix, deterministic checks, calibrated judge rubrics, human anchors, and slices.

### How do you create a golden dataset?

Expert-curated representative cases plus production failures, adversarial and edge cases; expected sources/answers/citations/tools; version and review it.

### How do you test agents?

Tool unit tests, policy/state-transition tests, trajectory evals, task success, side effects, step/cost limits, adversarial injection, and production trace replay.

## 6. Security

### How do you handle prompt injection?

Treat all external/retrieved text as data; enforce auth outside prompts; narrow allowlisted tools; validate args; sandbox; restrict egress; require approval for risky effects.

### How do you prevent cross-tenant leakage?

Tenant identity drives mandatory retrieval filters and tool authorization; namespace/isolation where needed; tenant-scoped cache keys; security tests and audit.

### What data should be logged?

IDs, versions, timings, tokens, status, tool metadata—not raw secrets/PII/prompts by default. Use redaction, access controls, and retention.

## 7. Cost and Performance

### How do you reduce cost without hurting quality?

Remove redundant calls, improve retrieval/context, cache safely, route small models, batch embeddings, cap output, and optimize against quality SLO per task.

### Why can adding replicas make things worse?

Per-pod concurrency multiplies aggregate calls to the same provider. Without a global limiter, HPA amplifies throttling and retries.

### What is continuous batching?

Inference servers dynamically combine token-generation steps from concurrent requests to improve accelerator utilization while requests enter/leave over time.

### What is KV caching?

Reuse transformer attention keys/values for prior tokens, reducing repeated computation during autoregressive generation; consumes significant memory.

## 8. Staff-Level Architecture Follow-Ups

### How do you decide where determinism ends and AI begins?

Keep identity, authorization, money, irreversible side effects, schema validation, aggregation policy, and resource limits deterministic. Use models where semantic interpretation or open-ended synthesis creates value. Require evidence and human review as uncertainty or impact rises.

### How do you capacity-plan an LLM workflow?

Model every multiplication point: arrival rate × documents × retrieved candidates × model calls × retries. Use Little's Law (`in-flight ≈ throughput × service time`), size from P95 service time, reserve provider/headroom, and limit queued tokens rather than requests alone. Validate with heavy-tailed prompts and output lengths.

### What is your first bottleneck at scale?

Usually a downstream quota, KV-cache/GPU memory, vector-store filtering, queue age, or external tool—not API CPU. Instrument saturation before selecting autoscaling signals. More replicas without global admission control can worsen overload.

### How do you choose consistency for an AI system?

Use strong consistency for identity, authorization, budget, and action state. Versioned/eventual consistency is often acceptable for indexes and caches if freshness is measurable, superseded versions are filtered, and the UI can expose staleness. Define the consequence of stale data before choosing.

### How do you deploy a new model safely?

Pin the full execution version, run offline paired evals, shadow representative traffic, canary by deterministic cohort, monitor quality/latency/cost/safety slices, and retain instant routing rollback. Do not assume a provider's newer model is behaviorally backward-compatible.

### How do you migrate prompts, schemas, or graph state?

Version them independently but record them together per run. Prefer backward-compatible schema expansion, adapters for old checkpoints, dual-read/write where necessary, explicit terminal handling for non-migratable runs, and replay tests before cutover.

### How do you handle a regional/provider outage?

Classify work by latency and residency. Queue deferrable jobs, return explicit degraded results for interactive work, circuit-break unhealthy routes, and fail over only to an eval-approved model/region that satisfies data policy. A fallback with incompatible quality or residency is not resilience.

## 9. Platform and Organizational Questions

### What belongs in a central AI platform versus product teams?

The platform owns identity, provider access, secrets, quotas, telemetry, model/prompt/eval registries, common retrieval primitives, and release controls. Product teams own domain workflows, tools, business prompts, datasets, and outcome SLOs. Centralizing domain logic creates a bottleneck.

### How do you drive adoption across teams?

Start with paved-road APIs and reference implementations, not mandates. Measure integration lead time, reliability, quality, and cost; onboard lighthouse teams; publish migration playbooks; support exceptions with expiry; and use incidents/evals to evolve standards.

### How do you justify build versus buy?

Compare time-to-market, quality/control, data residency, provider limits, portability, operational staffing, utilization, and exit cost. Decide per layer—gateway, serving, vector search, evaluation—not with one platform-wide ideology.

### How do you prevent a platform from becoming a bottleneck?

Stable self-service contracts, delegated domain configuration, asynchronous governance where possible, SLOs for platform APIs, versioned deprecation, clear escalation paths, and product-team ownership of business outcomes.

## 10. Incident and Failure Questions

### Quality dropped but latency and errors look normal. What do you do?

Freeze rollouts; compare model, prompt, retriever, index, corpus, cache, and judge versions; inspect slices and production traces; rerun stable anchors; disable suspect caches/routes; and roll back. Operational health does not imply semantic health.

### Costs doubled overnight. How do you investigate?

Decompose cost by tenant/task/model/prompt version, input/output tokens, retries, cache misses, tool loops, and traffic. Check context growth and fallback routes. Apply emergency budgets/rate limits while preserving audit evidence.

### An agent executed an incorrect action. What changes?

Contain/revoke credentials, reconcile side effects, preserve trajectory/audit, identify whether failure was authorization, tool schema, model choice, stale approval, or missing idempotency, then add deterministic controls and regression trajectories. Prompt changes alone are insufficient.

### How do you run an AI postmortem?

Separate triggering event, model behavior, control-plane failure, detection gap, blast radius, and recovery. Track corrective actions across data/evals, deterministic safeguards, observability, rollout, and ownership—not merely "improve the prompt."

## 11. How to Answer at Staff Level

Use this structure:

```text
business objective and risk
→ SLOs and scale assumptions
→ authoritative data/trust boundaries
→ deterministic vs probabilistic decisions
→ architecture and critical path
→ failure modes and bounded resources
→ evaluation, rollout, and rollback
→ organizational ownership and next bottleneck
```

State assumptions, name an invariant, quantify one capacity relationship, reject at least one alternative, and explain how you would know the design is failing.

## 12. Behavioral/Staff Follow-Ups

Be ready to explain:

- The measurable business/quality goal.
- Why the prior design failed at scale.
- Invariants you established.
- Trade-offs and alternatives rejected.
- Incident/failure handling.
- Rollout and backward compatibility.
- How you influenced teams and made the pattern reusable.
- Concrete metrics—only if you can substantiate them.
