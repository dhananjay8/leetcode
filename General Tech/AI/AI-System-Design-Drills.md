# AI System Design Drills

## 1. Universal Answer Template

```text
1. Clarify users, task, risk, freshness, latency, and quality SLO.
2. Estimate scale: QPS, documents, tokens, model latency, storage, cost.
3. Define trust/tenant/authorization boundaries.
4. Draw online and offline data flows separately.
5. Choose deterministic vs model decisions.
6. Bound concurrency, retries, queues, context, steps, and spend.
7. Define idempotency, failure handling, and degraded modes.
8. Add evaluation, observability, rollout, and rollback.
9. State trade-offs and next bottleneck.
```

## 2. Design Enterprise RAG

Requirements to clarify: source types, ACLs, freshness, citations, languages, update/deletion SLA, answer latency.

Core design:

```text
offline: connectors → change events → parse/chunk/version → embed → hybrid index
online: auth → rewrite → ACL-filtered hybrid search → rerank
→ context budget → model → citation/schema validation
```

Deep follow-ups: embedding migration, deleted source, cross-tenant tests, index lag, conflicting documents, eval dataset, prompt injection, 100M vectors.

## 3. Design a Policy/Compliance Evaluator

Requirements: documents/evidences/rules, mandatory rules, explainability, audit, human review, throughput.

```text
event → idempotent run → prepare documents in parallel → barrier
→ load versioned rules → bounded rule fan-out → structured result
→ deterministic mandatory-rule aggregation → audit/result event
```

Discuss retrieval vs full-document trade-off, citation validation, rule/prompt/model versions, Kafka partitioning, retries, cache safety, and manual-review threshold.

## 4. Design an AI Coding Agent

```text
request → repo map/search → bounded plan → approval
→ sandboxed edit/tool loop → tests/static/security → diff review
→ PR with evidence; no direct production deploy
```

Threats: repository prompt injection, secret leakage, arbitrary commands, dependency poisoning, generated-test confirmation bias, runaway tool loops.

## 5. Design an Incident Triage Agent

Parallel collectors retrieve alerts, logs, metrics, changes, topology, and runbooks. A deterministic timeline feeds diagnosis. Read-only tools default; write/remediation requires policy and approval.

SLOs: time-to-context, diagnosis usefulness, unsafe action rate, on-call acceptance, cost/incident. Evaluate historical incidents without future-information leakage.

## 6. Design a Document Extraction Platform

Asynchronous object event → validate/quarantine → page fan-out → OCR/parser/model → schema validation → confidence calibration → human review → versioned result.

Handle encrypted/oversized/corrupt files, duplicate uploads, OCR CPU pools, page ordering, table reconstruction, and reviewer feedback.

## 7. Design Natural-Language-to-SQL

```text
identity → semantic catalog/schema retrieval → SQL generation
→ AST parse → allowlist + row/column policy → EXPLAIN/cost gate
→ read-only sandbox + timeout/row limit → result + provenance
```

Never rely on prompt instructions to prevent DML or data leakage.

## 8. Design a Model Gateway

Clarify providers, streaming, tenancy, quotas, data residency, fallback compatibility.

Components: API/auth, policy/PII, distributed rate limiter, model router, provider adapters, circuit breakers, usage ledger, trace/eval integration.

Avoid retry storms, fallback quality regressions, hidden provider behavior, and a single bottleneck.

## 9. Design a Customer-Support Agent

Use deterministic intent/risk routing. RAG handles policy knowledge; tools retrieve account/order state; write actions require identity re-verification and confirmation.

Measure containment only with correctness/safety/customer outcome. Bad automated containment is not success.

## 10. Design a Recommendation/Personalization LLM Layer

Separate candidate generation from explanation/generation. Keep ranking metrics authoritative; use LLM for cold-start semantic features, intent, or explanations. Protect user privacy and prevent generated claims unsupported by catalog data.

## 11. Design Long-Term Agent Memory

```text
interaction → candidate memory extraction → consent/policy
→ dedupe/conflict resolution → structured fact/event store
+ semantic retrieval index → expiration/deletion
```

Do not automatically remember everything. Store provenance, confidence, timestamps, and user controls.

## 12. Design Evaluation Platform

Dataset registry, run orchestrator, system adapters, deterministic metrics, judge service, human-review UI, artifact/version store, comparison dashboards, CI gates.

Ensure reproducibility: pin datasets, prompts, models, retrievers/index snapshots, judges, parameters, and code.

## 13. Capacity Example

Given 10 requests/s, P95 model latency 4s:

```text
base in-flight ≈ 10 × 4 = 40
with 30% headroom ≈ 52 slots
```

If each request fans out to 20 model calls, naive demand is 800 concurrent calls before headroom. Introduce queueing, per-request fan-out limits, global provider budget, batching/caching, or redesign the task.

## 14. Failure Injection Checklist

- Provider 429/500/timeout/slow stream.
- Vector store partial outage/stale replica.
- Kafka rebalance and duplicate event.
- Pod death before/after side effect/checkpoint.
- Cache outage/stampede/stale version.
- Poison/oversized document.
- Cross-tenant filter regression.
- Malformed model structured output.
- Tool succeeds but response times out.
- Human approval arrives after action changed.

## 15. Staff-Level Closing Statement

> "I would launch this in stages: deterministic contract tests and offline quality baselines, shadow traffic, a tenant-scoped canary, explicit quality/latency/cost/security gates, and rollback by version. The next bottleneck is likely downstream model concurrency rather than API CPU, so admission control and queue age are first-class capacity signals."
