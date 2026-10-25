# AI Case Studies & Resume Stories

## 1. Policy Evaluation Service — Primary Case Study

> This story is grounded only in the `etm-audit-policy-evaluation-service` repository. Use metrics only when supported by dashboards, tests, or project records.

### 30-second first response

> "I built a scalable, event-driven policy evaluation service that evaluates evidence documents against applicable rules using a two-phase LangGraph workflow. It first fans out document vectorization, joins only after every document finishes, then loads the evidence's rules and fans out one evaluation per rule. I combined Kafka partition parallelism, bounded evaluation concurrency, cross-pod work distribution, Redis result caching, retries, manual offset management, and graceful degradation so large evidence/rule workloads could run without overwhelming the model or losing partition ordering."

### Confident interview positioning

Use this version when you want to demonstrate ownership without inventing production facts:

> "I owned the scalability and reliability design of the policy-evaluation workflow. The key challenge was that load multiplies at three levels: concurrent evidence events, documents per evidence, and rules per evidence. I designed the service so those dimensions do not collapse into one unbounded task pool. Kafka partitions provide coarse-grained horizontal parallelism, one worker per partition preserves ordering, a process-level semaphore bounds active evaluations, and each graph uses explicit document and rule fan-out/fan-in barriers. I also designed per-partition backpressure, safe manual commits, rebalance handling, result caching, retries, and graceful shutdown. The result is an architecture that can scale by adding partitions and replicas while keeping correctness and downstream model pressure explicit."

#### Representative scale scenario

Use this as a **design/load-test scenario**, not as a production claim unless you have measurements:

```text
100 concurrent evidence evaluations
× 20 documents per evidence
× 75 rules per evidence
= 2,000 document branches + 7,500 rule branches
```

The service should not launch all 9,500 operations at once. It controls the multiplication in layers:

1. Kafka exposes only assigned partitions to each replica.
2. Each partition processes records sequentially, while different partitions progress concurrently.
3. `MAX_CONCURRENT_EVALUATIONS` caps active policy graphs per process.
4. Per-partition buffering pauses a hot partition before memory grows without bound.
5. Document and rule branches distribute over worker replicas.
6. Redis avoids repeating equivalent rule evaluations.
7. A distributed provider-level limiter is the next control when aggregate replica concurrency must obey a hard global model quota.

A staff-level capacity explanation:

> "I capacity-plan from the expensive boundary backward. If the model provider allows Q rule evaluations per second and one rule takes L seconds at P95, safe model concurrency is approximately Q × L, reduced by headroom. I allocate that budget across replicas and tenants, then choose Kafka partitions and worker counts so ingestion can remain durable without letting queue age violate the SLO. The graph's logical parallelism is therefore subordinate to admission control—it is not permission to create unlimited tasks."

#### Ownership language you can use

- **Implemented:** "I built/designed the two-phase graph, partition-aware Kafka processing, bounded evaluation concurrency, commit/rebalance safety, retry isolation, caching, and graceful shutdown."
- **Validated:** "I validated ordering, retry, fan-out/fan-in, checkpoint identity, and failure behavior through deterministic and integration tests." Use only if you ran or reviewed the corresponding tests.
- **Designed for:** "I designed the architecture to scale horizontally across partitions and replicas for large document/rule workloads."
- **Next step:** "For a hard provider-wide quota, I would add a Redis-backed distributed token bucket; the current semaphore is intentionally process-local."

Avoid saying "handled millions of evaluations" or quoting latency/cost reductions without evidence. A stronger staff answer explains *why the system remains bounded as events, documents, and rules multiply*.

### Two-minute architecture walkthrough

> "The service accepts a logical policy-evaluation run through Kafka or HTTP. I separated the business identity, `evidenceId`, from the orchestration identity, `threadId`, because replay and checkpoint semantics belong to one run, not permanently to the evidence entity. The graph first creates one vectorization branch per document. Those branches can be distributed through the Kubernetes service, and their results merge into a dictionary keyed by document ID. A deferred aggregate node acts as a true barrier, so rule processing cannot observe partial document state.
>
> "After that barrier, the service loads only the rules applicable to the evidence. It then creates one branch per rule, where each branch evaluates that rule against the complete deduplicated document set. The evaluator can use vector retrieval for focused context or full-document reasoning when retrieval is inappropriate. Every branch returns typed pass/fail output with a reason and source location. A second barrier waits for all rule branches; deterministic code then computes the overall result, failing the policy when any mandatory rule fails.
>
> "Around that graph, Kafka provides durable load leveling. I process each partition sequentially to preserve order, process different partitions concurrently, and cap active policy graphs with a semaphore. When a partition backlog reaches its bound, I pause only that partition so the consumer keeps polling and heartbeating. I manually commit only handled offsets, protect rebalances with ownership tokens, retry response publication separately from expensive evaluation, and leave cancelled work uncommitted for redelivery. That combines AI parallelism with distributed-systems correctness."

### Three invariants to state early

1. **Phase ordering:** no rule evaluates until every document-preparation branch has reached the first barrier.
2. **No skipped Kafka work:** never commit past an unfinished or no-longer-owned offset.
3. **Bounded expensive work:** queue intake, active policy graphs, and eventually provider-wide rule calls each have an explicit limit.

A fourth quality invariant is useful: **overall policy status is deterministic business logic; the model evaluates individual evidence-rule relationships but does not decide aggregation policy.**

### Problem

A single policy decision can require:

- Multiple evidence documents.
- Up to a configured number of applicable rules.
- Document parsing/chunking and embedding.
- Retrieval or full-document reasoning.
- Multiple long-running model calls.
- An auditable per-rule result with reason and page/line attribution.

A sequential request path would make latency approximately the sum of all document and rule times. Unbounded parallelism would be faster briefly, but could overload worker pods, model quotas, memory, and Kafka polling.

### Core contract

One policy-evaluation request represents **one evidence ID**, one logical run ID, a list of documents, and the applicable control/context identifiers. It does not batch unrelated evidences in one graph run.

Scale across many evidence evaluations comes from:

- Kafka partitions processed in parallel.
- Multiple consumer/service replicas.
- A configurable bound on in-flight evaluations per process.
- Parallel document/rule branches inside each evaluation.

This distinction is important in interviews: **request-level fan-out handles documents and rules; system-level partitioning handles many evidence evaluations.**

## 2. What the Service Does

```text
Kafka request or HTTP request
  ↓
validate + initialize typed evaluation state
  ↓
PHASE 1 — document vectorization
  ├─ one branch per document
  ├─ vectorize/retrieve-ready representation
  └─ barrier waits for all document branches
  ↓
load applicable rules from indexed rule store
  ↓
PHASE 2 — rule evaluation
  ├─ one branch per rule
  ├─ evaluate rule against the run's document set
  └─ barrier waits for all rule branches
  ↓
mandatory-rule aggregation
  ↓
publish/return per-rule results + overall policy status
```

### Rule evaluation paths

- **Vectorized path:** retrieve the top relevant chunks for the rule from the selected documents, pass text/page/line metadata to a model, and require structured output.
- **Full-document path:** load the source documents and submit document content with the rule to a reasoning model.

The result is normalized to pass/fail, reason, page, and line. Overall policy status fails when a mandatory rule fails.

## 3. Key Design Decisions

### Two sequential fan-out/fan-in phases

Documents must be vectorized before rules query their chunks. I encoded that dependency directly in the graph:

```text
fan out documents → true barrier → load rules → fan out rules → true barrier
```

The fan-in processors are deferred until pending branches drain. Without a real barrier, an aggregator can run on the first arriving branch, produce partial output, or execute multiple times.

### Associative branch result merging

Parallel branches write keyed result dictionaries:

- Document ID → vectorization result.
- Rule ID → rule-evaluation result.

The graph merges maps rather than mutating one shared list. This gives deterministic branch identity, avoids arrival-order dependence, and makes partial failures attributable.

### Separate run identity from business identity

- `evidenceId` identifies the business evidence.
- `threadId` identifies one orchestration run/checkpoint lineage.
- Per-document child runs derive identity from run ID + document ID.

That prevents accidental coupling of business entities to workflow replay semantics and makes retries/checkpoints traceable.

### Cross-pod distribution

Document and rule branches can invoke worker endpoints through the Kubernetes service address. Each concurrent call can land on an available replica, turning a graph's logical parallelism into pod-level distribution. A retry can land on a healthy pod after a target failure.

The clients also support an internal execution mode for local development.

### Kafka as the load-leveling boundary

The service runs a Kafka consumer and producer in the FastAPI lifespan. Kafka decouples request arrival from expensive evaluation execution and enables horizontal scaling by partitions and consumer-group membership.

## 4. How Load Is Controlled

### Concurrency hierarchy

```text
cluster replicas
  × assigned Kafka partitions (parallel across partitions)
  × MAX_CONCURRENT_EVALUATIONS per process
  × per-evaluation document/rule fan-out
```

The outer semaphore bounds concurrently executing policy graphs per process. This avoids allowing every polled event to start expensive model/retrieval work immediately.

**Important limitation:** the repository has a process-local evaluation bound; a truly global model-QPS cap across all replicas still requires a distributed limiter. Present that as the next scale step—not as already implemented.

### Per-partition ordering with cross-partition parallelism

Each assigned partition gets one worker and queue:

- Sequential processing within a partition preserves ordering.
- Different partitions run concurrently.
- The global evaluation semaphore bounds aggregate work inside the process.

This avoids a common bug where unrestricted task creation finishes offsets out of order and accidentally skips unprocessed messages.

### Backpressure without stopping heartbeats

When one partition's queue reaches its configured limit, only that partition is paused. Other partitions continue flowing and the consumer continues polling/heartbeating. Once backlog drains, the partition resumes.

Why this matters:

- Blocking the entire poll loop risks consumer eviction after `max.poll.interval`.
- An unbounded queue risks memory growth.
- Pausing all partitions lets one hot partition become a noisy neighbor.

### Cached rule evaluations

Rule results use a Redis key derived from rule, document set, business entity, and customer scope, with a TTL. Repeated equivalent work can avoid another expensive evaluation call.

Interview nuance: a production cache key should use canonical serialization and include every behavior-changing input—evaluation method, model/prompt/version, source content versions, and authorization scope. The current implementation is a useful optimization with room for stronger invalidation/versioning.

### Framework/evidence-list reuse

The service also contains a per-process TTL cache for paginated framework evidence lists. A cold framework load walks all pages; subsequent same-framework work on that pod reuses the list until expiry. This reduces repeated upstream calls during document fan-out.

## 5. Delivery Semantics and Reliability

### At-least-once processing

Auto-commit is disabled. A message's offset advances only after it has produced a result or been deliberately handled as poison input. This gives at-least-once delivery.

### Contiguous offset commits

The handler tracks arrival-ordered offsets and commits only the contiguous completed prefix. This prevents committing past an unfinished earlier message.

Even though each partition currently processes sequentially, the contiguous-prefix abstraction keeps the invariant explicit and safe if processing evolves.

### Retry placement

- Graph document/rule calls: bounded attempts with exponential backoff.
- Kafka response publish: retry only the publish—not the expensive graph—when failure is transient.
- Offset commit: bounded retry; retain bookkeeping after failure so later completion/shutdown can retry.
- Consumer loop: logs and resumes after delay.

Retrying only the failed side effect avoids paying for the full AI evaluation twice after a transient producer failure.

### Poison messages and DLQ

Malformed/permanently failed records can be copied to an optional dead-letter topic with source topic, partition, offset, and reason headers. This prevents one bad event from blocking all later work on its partition.

### Rebalance safety

On partition revocation, the service:

- Invalidates ownership of tracked offsets.
- Cancels that partition's worker.
- Leaves unfinished offsets uncommitted for the new owner.
- Refuses late completion from the old ownership token.

That addresses the race where an old consumer finishes and commits work after ownership has moved.

### Graceful shutdown

Shutdown stops intake, drops not-yet-started queued records so Kafka can redeliver them, briefly drains in-flight partition workers, cancels stragglers, retries ready commits, and closes Kafka clients.

## 6. AI Quality and Explainability

- Rules are loaded only after vectorization, immediately before use.
- Vector retrieval is constrained to the run's document IDs.
- Retrieved chunks carry page and line metadata.
- The model returns a typed structured result—not free-form JSON parsing.
- Mandatory rules determine overall pass/fail.
- No-chunk and no-rule states fail explicitly rather than returning false success.

Quality risks to discuss honestly:

- `top_k` is currently a fixed value and should be eval-tuned.
- Prompt/model/index versions should be included in traces and cache keys.
- Evidence-backed citation validation should verify that cited page/line supports the reason.
- AI quality requires a golden set and retrieval/generation metrics; infrastructure tests alone are insufficient.

## 7. Observability

Implemented/visible mechanisms include:

- Correlation ID accepted or generated at ingress and forwarded through fan-out calls.
- Run, customer, evidence, document/rule counts, status, partition, and offset in logs.
- Separate Prometheus management endpoint.
- Explicit logging for assignment, pause/resume, retries, commits, DLQ, and shutdown.

Next-level metrics:

- Queue depth/age per partition.
- Active/waiting evaluation slots.
- Documents and rules per run.
- Fan-out branch latency/error/retry.
- Retrieval latency and chunks returned.
- Model latency/tokens/throttles/cost.
- Cache hit ratio.
- End-to-end result and quality distributions.

## 8. Hard Challenges and How I Solved Them

### Challenge 1 — Correct parallel joins

**Problem:** Each policy has N documents and M rules. A naive graph edge can aggregate on partial branch results.

**Action:** I modeled two explicit phases with keyed reducers and deferred fan-in nodes, guaranteeing all document branches complete before rule loading and all rules complete before final policy aggregation.

**Why it matters:** Correctness became independent of branch arrival order and replica latency.

### Challenge 2 — Scale without uncontrolled fan-out

**Problem:** Kafka bursts plus graph fan-out could multiply into excessive model and worker calls.

**Action:** I introduced a bounded semaphore for concurrent policy evaluations, per-partition bounded queues, partition-level pause/resume, and cache reuse. Cross-pod calls spread branch work over replicas.

**Trade-off:** The current bound is local to each process. A distributed limiter is the correct follow-up for a hard provider-wide QPS ceiling.

### Challenge 3 — Preserve Kafka ordering while remaining parallel

**Problem:** Global sequential processing wastes partitions; unrestricted concurrent tasks make offset commits unsafe.

**Action:** One sequential worker per partition plus parallel workers across partitions. Manual commits advance only the contiguous completed prefix.

**Result:** Ordering and safe at-least-once semantics coexist with partition-level throughput.

### Challenge 4 — Rebalances and shutdown

**Problem:** A revoked worker can finish late and commit work it no longer owns; abrupt shutdown can lose or duplicate work.

**Action:** Ownership tokens invalidate old workers, revocation cancels partition tasks, cancellation leaves offsets uncommitted, and shutdown drains only started work before final commit attempts.

### Challenge 5 — Avoid re-running expensive AI work

**Problem:** A transient Kafka response failure after successful evaluation could trigger full replay.

**Action:** I separated evaluation from response delivery and retry only the producer send. Redis caching also avoids repeated equivalent rule evaluations.

### Challenge 6 — Keep event loop responsive

**Problem:** Long-running I/O/model calls and synchronous SDK/document work can block an async service.

**Action:** The orchestration and network clients are async; synchronous work is isolated from the event loop. I would further isolate CPU-heavy parsing into a dedicated bounded executor to avoid starving quick I/O.

## 9. Staff-Level Trade-Offs

| Decision | Benefit | Cost / risk |
|---|---|---|
| Fan-out per doc/rule | Lower wall-clock latency | Burst amplification; needs limits |
| Cross-pod HTTP | Uses replica capacity; retry may hit healthy pod | Extra network hop and timeout surface |
| Kafka + manual commit | Load leveling and replay | At-least-once duplicates; more state logic |
| Per-partition worker | Ordering and simple commit semantics | One slow item blocks its partition |
| Redis result cache | Saves model cost/latency | Invalidation/version/security key correctness |
| Vectorized evaluation | Efficient focused context | Retrieval recall can miss evidence |
| Full-document evaluation | Avoids retrieval miss | Larger context, higher cost/limits |
| LangGraph state | Explicit phases and recovery identity | Framework/runtime semantics must be understood |

## 10. Honest Limitations / Next Iteration

State these proactively if asked:

- Add a distributed token-bucket/semaphore for provider-wide concurrency across replicas.
- Canonicalize/version cache keys and prevent cache stampedes with single-flight locking.
- Add durable request-level idempotency/result store beyond thread-scoped checkpoints.
- Add transactional/outbox-style result publication if result loss between publish/commit becomes unacceptable.
- Tune partition count against replica count and ordering domain.
- Split liveness/readiness and verify Kafka, Redis, rule store, and model readiness.
- Add model/retrieval eval gates and drift monitoring.
- Separate CPU-heavy document conversion from the default executor.
- Validate page/line citations against retrieved evidence.

## 11. Resume Bullets — Use Only Defensible Numbers

- Designed an event-driven AI policy-evaluation service using Kafka, FastAPI, and LangGraph, orchestrating two-phase document and rule fan-out/fan-in with deterministic aggregation and per-rule evidence attribution.
- Scaled evidence evaluation through partition-parallel Kafka workers, bounded in-flight graph execution, per-partition backpressure, and Kubernetes-distributed rule/document work while preserving ordering and at-least-once delivery.
- Implemented manual contiguous offset commits, rebalance-safe worker ownership, retry isolation, optional DLQ handling, and graceful shutdown to prevent skipped work and contain poison messages.
- Reduced repeated model evaluation through tenant/business-scoped Redis caching and TTL reuse of framework evidence lists; add a measured cache-hit/cost reduction only when verified.
- Improved debuggability by propagating correlation/run identity across asynchronous and fan-out boundaries and exposing management metrics and structured operational logs.

Do not invent percentages. Prefer: "handled up to **[verified documents]** documents and **[verified rules]** rules per evaluation at **[verified P95]** under **[verified concurrency]**."

## 12. STAR Story — Scalability

**Situation:** Policy evaluation expanded from small document/rule sets to bursty workloads across many evidence evaluations. Sequential execution could not meet latency, while naive parallelism threatened model quotas and Kafka stability.

**Task:** Preserve policy correctness and per-rule traceability while scaling across documents, rules, and concurrent evidence events.

**Action:** I separated the workflow into two dependency-aware fan-out phases, used real barriers and keyed reducers, distributed branches over replicas, partitioned event processing, bounded concurrent evaluations, paused only hot partitions, and reused expensive results through caching.

**Result:** State verified retrieval quality, latency, adoption, and support impact; otherwise describe the validated security and lifecycle guarantees.

**Learning:** Parallelism is not scalability by itself. The staff-level work was defining invariants and backpressure at every multiplication point.

## 13. STAR Story — Reliability

**Situation:** A consumer rebalance or pod shutdown could leave work in ambiguous states, and retries risked re-running expensive AI graphs.

**Task:** Provide at-least-once processing without skipping earlier offsets or letting old owners commit after reassignment.

**Action:** I created per-partition workers, ownership tokens, contiguous-prefix commits, cancellation semantics that leave unfinished offsets uncommitted, bounded send/commit retries, DLQ handling, and graceful drain/close behavior.

**Result:** State verified time-to-context, responder acceptance, and unsafe-recommendation evidence; otherwise describe the staged safety outcome.

## 14. Deep Follow-Up Questions

**Why not evaluate all rules before vectorization completes?**
Rules query document chunks; starting early creates missing/partial retrieval state and nondeterministic policy outcomes.

**Why one worker per Kafka partition?**
It preserves ordering and makes commit correctness straightforward while partitions provide parallelism.

**Why is the semaphore not sufficient cluster-wide?**
Replica count multiplies local limits. A provider-level quota needs a distributed admission-control mechanism.

**What happens if processing succeeds but response publishing fails?**
The producer send retries without re-running the graph. If delivery ultimately fails, the record is dead-lettered when configured and then committed as handled; without a DLQ, logs retain source coordinates but there is a loss window that should be closed operationally.

**Can this be exactly once?**
Not end-to-end across Kafka, caches, model calls, vector writes, and HTTP. Use at-least-once plus idempotency, deterministic keys, durable outcomes, and reconciliation.

**How does it handle several frameworks?**
Framework-driven classification/evidence lookup is cached per framework per process; policy evaluation itself receives one evidence ID per run. Many framework/evidence workloads scale as separate events across partitions and replicas.

**How would you load-test it?**
Generate distributions of document/rule counts and model latency, test burst and steady state, inject pod death/rebalance/provider throttles, and measure queue age, P95/P99, slots, retries, duplicates, commits, DLQ, cache hits, and quality.

---

## Reusable Case-Study Templates

These are **practice templates**, not claims of completed personal work. Present one as yours only after adapting it to a project you actually delivered and replacing assumptions with evidence.

## 15. Generic Case Study — Multi-Tenant Enterprise RAG

> **How to introduce it:** "I designed a governed enterprise RAG platform where the primary requirement was not simply semantic search—it was returning current, cited answers without ever crossing tenant or document-level authorization boundaries."

### Problem and success criteria

Employees need answers over policies, tickets, technical documents, and structured records that change frequently. Success means high retrieval recall, grounded answers with citations, strict ACL enforcement, deletion/freshness guarantees, predictable latency, and tenant-level cost controls.

### Architecture walkthrough

```text
source connectors / change events
→ idempotent ingestion keyed by source version + content hash
→ malware/type/size validation → parser + structure-aware chunker
→ embedding batcher → versioned vector index + lexical index
→ ingestion status/deletion ledger

query → identity + tenant + document ACL resolution
→ standalone-query rewrite → authorized metadata filter
→ BM25 + vector retrieval in parallel → RRF merge
→ cross-encoder rerank → dedupe/diversify → context budget
→ model → structured answer + citations
→ citation/grounding validation → response or abstention
```

### What I would emphasize in the interview

> "Authorization is compiled into the retrieval query. I never retrieve globally and ask the model to ignore unauthorized text. Cache keys include tenant, ACL scope, query, index version, prompt, and model because a semantically correct cache hit can still be a security incident if identity differs."

> "I separate the ingestion and serving planes. Ingestion can retry and absorb bursts asynchronously; query serving has a strict latency budget and reads only active, fully indexed source versions. A source version becomes visible atomically after both lexical and vector artifacts are ready, preventing mixed-version answers."

### Scale and reliability

- Partition ingestion by tenant/source while preventing one tenant from monopolizing workers.
- Batch embedding calls by token count, not document count.
- Shard/namespace indexes according to isolation and operational scale.
- Bound query fan-out, reranker candidates, and context tokens.
- Use blue/green indexes for embedding or chunker migrations.
- Maintain tombstones/deletion ledger until source, chunks, vectors, caches, and replicas confirm deletion.
- Degrade to lexical-only or explicit unavailable response; never bypass ACL filters.

### Hard challenges and answers

**How did you solve stale answers?**
I attached source version and effective timestamps to every chunk, filtered superseded versions at retrieval, monitored indexing lag, and invalidated answer/retrieval caches on source changes.

**How did you migrate embedding models?**
I built a parallel index, dual-wrote new content, backfilled historical chunks, shadow-queried both indexes against a fixed eval set and sampled traffic, then canaried before cutover. Query and document vectors never mixed across incompatible spaces.

**How did you control noisy neighbors?**
Per-tenant ingestion queues, query/token budgets, weighted scheduling, storage quotas, and cost attribution. Large tenants could receive dedicated namespaces or indexes if compliance or performance required it.

### Evaluation and SLOs

- Retrieval Recall@K, MRR/NDCG, zero unauthorized-result tolerance.
- Faithfulness, answer correctness, citation precision/coverage, abstention quality.
- P50/P95/P99 query latency, ingestion freshness lag, cache-hit rate, cost/successful answer.
- Slice by tenant, source type, language, document length, and query complexity.

### Trade-offs

- Shared index is cheaper; dedicated indexes improve isolation but increase operations.
- Larger chunks preserve context; smaller chunks improve precision.
- Higher candidate K improves recall but increases reranking cost.
- Strong consistency on every edit is expensive; expose a measurable freshness SLO instead.

### STAR version

**Situation:** Teams could search only by keywords and could not safely use a general LLM over private documents.  
**Task:** Deliver cited semantic answers while preserving existing document permissions and freshness.  
**Action:** I designed versioned hybrid ingestion, ACL-bound retrieval, reranking/context controls, citation validation, tenant quotas, and an evaluation/blue-green migration process.  
**Result:** State verified retrieval quality, latency, adoption, and support impact; otherwise describe the validated security and lifecycle guarantees.  
**Learning:** In enterprise RAG, authorization and lifecycle correctness matter as much as model quality.

### Likely follow-ups

- **Why not fine-tune?** Knowledge changes and needs citations/deletion; RAG is the appropriate knowledge plane.
- **What if sources conflict?** Preserve version/authority metadata, surface conflict, prefer configured authoritative sources, and abstain when policy requires.
- **How do you prevent injection?** Treat retrieved text as data, isolate instructions, constrain tools, validate output, and never expose secrets to context unnecessarily.

## 16. Generic Case Study — AI Incident Triage Assistant

> **How to introduce it:** "I designed an incident assistant to reduce time spent assembling evidence, not to replace the incident commander. The first version was deliberately read-only and produced a cited timeline, ranked hypotheses, and recommended runbook steps."

### Problem and success criteria

During incidents, responders manually correlate alerts, deploys, logs, metrics, ownership, prior incidents, and runbooks. The system must improve time-to-context and diagnosis quality without taking unsafe actions or inventing causal claims.

### Architecture walkthrough

```text
incident/alert event → create durable incident run
→ parallel deterministic collectors with per-source deadlines
   ├─ alerts and service topology
   ├─ recent deploy/config changes
   ├─ metric anomalies
   ├─ scoped logs/traces
   └─ runbooks and similar incidents
→ normalize timestamps/entities → evidence timeline
→ retrieve/rerank relevant runbook/history
→ model produces hypotheses with supporting and contradicting evidence
→ policy gate
   ├─ read-only follow-up tools within scope
   └─ remediation proposal → human approval → separate executor
→ audit + responder feedback + post-incident eval
```

### Safety boundary

> "The model never receives broad infrastructure credentials. A tool gateway enforces incident scope, resource allowlists, argument schemas, deadlines, and least privilege. Read tools and write tools are separate. Approval binds to the exact remediation payload and expires, so a modified action cannot execute under stale consent."

### Scale and reliability

- Deduplicate alert storms into one incident/run identity.
- Use bounded parallel collectors; partial source failure yields an explicitly incomplete timeline.
- Apply log/trace query budgets to avoid expensive broad scans.
- Cache stable topology/runbook data, not live incident conclusions.
- Prioritize active severe incidents over retrospective enrichment.
- Circuit-break failing telemetry sources and show data freshness.

### Hard challenges and answers

**How do you avoid false causality?**
The output schema separates observation, temporal correlation, hypothesis, confidence, supporting evidence, contradicting evidence, and next verification step. The model cannot label a root cause without cited evidence or responder confirmation.

**How do you defend against malicious logs/tickets?**
All collected text is untrusted context. Tool execution is controlled by code, model-visible secrets are minimized, and retrieved instructions cannot expand permissions.

**How do you evaluate it?**
Replay historical incidents using only information available at each timestamp. Measure evidence recall, hypothesis ranking, unsafe recommendations, time-to-useful-context, tool efficiency, and responder acceptance—not polished prose.

### Trade-offs

- Autonomous remediation may reduce time but creates unacceptable blast radius initially.
- More telemetry improves recall but increases noise, latency, and sensitive-data exposure.
- Similar-incident retrieval helps pattern recognition but can anchor responders to the wrong diagnosis.

### STAR version

**Situation:** Responders spent critical early minutes collecting context across disconnected systems.  
**Task:** Shorten evidence assembly while preserving human accountability.  
**Action:** I designed parallel bounded collectors, a normalized timeline, evidence-grounded hypothesis generation, scoped read tools, and approval-gated remediation.  
**Result:** State verified time-to-context, responder acceptance, and unsafe-recommendation evidence; otherwise describe the staged safety outcome.  
**Learning:** Incident AI should optimize decision support first; action autonomy must be earned through evidence and staged rollout.

### Likely follow-ups

- **If the model is unavailable?** Return the deterministic timeline, anomalies, changes, and runbook links.
- **How do you prevent loops?** Step/deadline/tool-call/token budgets and repeated-action detection.
- **How do you roll out?** Offline replay → shadow during incidents → read-only opt-in → recommendations → narrowly approved automation.

## 17. Generic Case Study — Document Processing Platform

> **How to introduce it:** "I designed an asynchronous document intelligence pipeline that converts bursty, heterogeneous files into validated structured records with page-level provenance and human review for uncertain cases."

### Problem and success criteria

Large PDFs, scans, tables, and forms arrive in bursts. The platform must handle corrupt/encrypted/duplicate files, expensive OCR, schema extraction, confidence, review, and reprocessing when parsers or models change.

### Architecture walkthrough

```text
object-created event → validate size/type/malware → content-hash idempotency
→ document manifest + versioned job
→ classify document/parser route
→ bounded page/section fan-out
   ├─ native text/layout parser
   ├─ OCR for scanned pages
   └─ table/image extraction when required
→ ordered page join → schema extraction
→ deterministic business validators + cross-field checks
├─ high-confidence valid → publish versioned result
└─ low-confidence/conflicting → human review queue
→ corrections → labeled regression/active-learning dataset
```

### Correctness invariants

1. Every output field carries source page/bounding box or extraction provenance.
2. A parser/model version change creates a new result version; it never silently overwrites history.
3. Job retries do not duplicate downstream records.
4. The final join verifies every expected page is complete, failed, or explicitly skipped.

### Scale and reliability

- Separate I/O fetch workers from CPU/GPU OCR pools using bulkheads.
- Queue by page count/estimated cost, not only document count.
- Cap page fan-out per document to stop giant PDFs monopolizing capacity.
- Store intermediate page results so one failed page does not restart the document.
- DLQ unsupported/corrupt/encrypted files with actionable reason.
- Apply tenant quotas and priority queues.
- Autoscale OCR workers on queue age and estimated page work.

### Hard challenges and answers

**How do you reconstruct ordering?**
Branches are keyed by page/section identity; the join validates the manifest and sorts deterministically. Missing pages make the result incomplete, not silently successful.

**How do you measure confidence?**
Confidence is calibrated per field and document type against reviewed labels. Deterministic validations—date ranges, totals, identifiers, cross-field consistency—often matter more than raw model confidence.

**How do you reprocess safely?**
Use immutable source hash plus pipeline version as the job key, write a new result version, compare old/new outputs, canary by document class, and promote only after quality gates.

### Evaluation and SLOs

- Field precision/recall/F1 and exact match by field/document type.
- Table cell accuracy, page-order/provenance correctness.
- Straight-through-processing and human-review rates.
- Queue age, pages/minute, P95 document completion, cost/page.
- Duplicate/lost job rate and reprocessing success.

### Trade-offs

- Whole-document multimodal models are simpler but expensive and context-limited.
- Page fan-out improves throughput but requires deterministic reassembly.
- Aggressive automation lowers review cost but increases expensive false acceptance.

### STAR version

**Situation:** A synchronous extraction path was slow, fragile on large files, and difficult to audit.  
**Task:** Scale heterogeneous document processing while keeping field-level provenance and correction workflows.  
**Action:** I introduced versioned asynchronous jobs, bounded page fan-out, isolated OCR capacity, manifest-based joins, deterministic validation, and confidence-routed human review.  
**Result:** State verified throughput, completion latency, straight-through rate, and field accuracy; otherwise describe the validated processing guarantees.  
**Learning:** The best production accuracy came from combining models with deterministic validation and reviewer feedback—not from model confidence alone.

### Likely follow-ups

- **One bad page?** Preserve successful intermediates, retry the page, then mark document partial/review if exhausted.
- **Cache strategy?** Cache immutable parse/OCR outputs by content hash + parser version.
- **Sensitive data?** Encrypt, minimize retention, redact logs, enforce tenant access, and propagate deletion.

## 18. Generic Case Study — Natural-Language Policy-to-SQL Analytics

> **How to introduce it:** "I designed a governed analytics assistant where the model proposes SQL, but deterministic services own identity, semantic definitions, authorization, validation, resource limits, and execution."

### Problem and success criteria

Business users need self-service analytics without learning schemas. The risks are unauthorized rows/columns, ambiguous business metrics, invalid or expensive SQL, and confident summaries of incorrect results.

### Architecture walkthrough

```text
question + identity → resolve tenant/role/purpose
→ retrieve governed semantic catalog, approved metrics, and relevant schema
→ model generates typed query plan + SQL
→ SQL AST parse and deterministic policy rewrite/validation
   ├─ SELECT-only / function allowlist
   ├─ row/column security injection
   ├─ table/column/metric validation
   └─ deny comments, multi-statements, DDL/DML
→ EXPLAIN/cost/cardinality gate
→ read-only warehouse role + timeout/row/byte limit
→ execute → validate result shape
→ grounded summary + SQL/metric provenance
→ audit and feedback
```

### Key design position

> "The model is not the security boundary and does not choose its own authorization predicates. Even if generated SQL omits tenant filtering, the policy layer or database row-level security enforces it. I prefer a semantic metric layer so questions such as revenue or active customer resolve to approved definitions rather than ad-hoc SQL."

### Scale and reliability

- Separate interactive and heavy analytical queues/warehouses.
- Cache only authorization-scoped, freshness-compatible query results.
- Limit by estimated and actual tokens, not only request count.
- Route common questions to curated templates/metrics before free-form generation.
- Retry generation/repair for syntax errors only within a small budget; never blindly rerun expensive queries.
- Kill queries on client cancellation or deadline expiry.

### Model routing

Route using deterministic task policy first: data residency, approved models, context size, modality, latency tier, and budget. Optional complexity classifiers may choose a quality tier but need evals and an escalation path.

> "I optimize cost per successful task, not cost per token. A cheaper model that doubles retries or human correction can be more expensive."

### Hard challenges and answers

**How do you handle ambiguity?**
Ask a clarifying question when metric, date range, grain, timezone, or entity is ambiguous. Display resolved assumptions before execution for expensive/high-impact queries.

**How do you evaluate correctness?**
Use a versioned suite of natural-language questions with approved SQL and expected result properties. Compare execution results where exact SQL can differ; slice by joins, time logic, aggregation, ambiguity, and security.

**What about schema drift?**
Version the semantic catalog, validate generated references at runtime, regenerate embeddings/metadata on change, and trace catalog version with every query.

### Trade-offs

- Raw schema gives flexibility but weak business consistency; semantic layers constrain but improve trust.
- Automatic query repair increases success but can mutate intent.
- Showing SQL improves transparency for experts but may overwhelm casual users; expose expandable provenance.

### STAR version

**Situation:** Analysts were a bottleneck for recurring questions, while direct natural-language SQL posed security and cost risks.  
**Task:** Enable governed self-service without letting a probabilistic model control access or warehouse resources.  
**Action:** I designed semantic-catalog retrieval, AST validation, database-enforced policy, cost gates, a read-only sandbox, provenance, and execution-based evals.  
**Result:** State verified task success, analyst effort, query latency, and policy violations; otherwise describe the governance outcome.  
**Learning:** Natural-language SQL is trustworthy only when model generation sits inside a deterministic query governance plane.

### Likely follow-ups

- **Prompt injection through schema text?** Treat catalog descriptions as data; deterministic validation remains authoritative.
- **Can users access raw SQL?** Based on role; execution still uses constrained service identity and policy.
- **Incorrect summary?** Tie every statement to returned cells/aggregates and allow result download/provenance review.

## 19. Generic Case Study — Model Gateway and Cost Control

> **How to introduce it:** "I designed a multi-tenant model gateway to centralize provider access, policy, quotas, routing, resilience, observability, and chargeback while keeping product-specific workflows outside the gateway."

### Problem and success criteria

Independent provider integrations create duplicated retry logic, inconsistent data handling, poor cost attribution, leaked credentials, and no controlled way to change models. The gateway must provide a stable contract without hiding critical provider differences.

### Architecture walkthrough

```text
application → gateway auth + tenant/app identity
→ request/schema/size validation → data policy and optional redaction
→ distributed quota: requests, tokens, concurrency, spend
→ routing policy by task, quality tier, residency, availability
→ provider adapter
   ├─ deadline + retry budget
   ├─ circuit breaker / bulkhead
   ├─ streaming + cancellation
   └─ normalized errors and usage
→ response policy → usage ledger + trace + eval sampling
```

### Boundary to state explicitly

> "The gateway owns cross-cutting model-access concerns, not domain orchestration. It should not know how a policy workflow joins rules or how a support agent chooses tools. Keeping workflows outside avoids turning the gateway into a central release bottleneck and single giant failure domain."

### Scale and reliability

- Stateless gateway replicas; shared distributed rate/quota state with careful degraded behavior.
- Limit by estimated and actual tokens, not only request count.
- Separate concurrency pools by provider/model/tenant/tier to prevent noisy neighbors.
- Propagate deadlines and cancellation through streaming calls.
- Retry only transient pre-response failures within the caller's budget.
- Circuit-break unhealthy routes; fallback only to models proven compatible by task evals.
- Async usage ledger so billing telemetry does not block responses, with durable delivery/reconciliation.

### Model routing

Route using deterministic task policy first: data residency, approved models, context size, modality, latency tier, and budget. Optional complexity classifiers may choose a quality tier but need evals and an escalation path.

> "I optimize cost per successful task, not cost per token. A cheaper model that doubles retries or human correction can be more expensive."

### Hard challenges and answers

**How do you enforce a global limit?**
Use a distributed token bucket/concurrency lease keyed by provider, model, tenant, and application. Per-pod semaphores remain local bulkheads but cannot enforce provider-wide quotas.

**How do you normalize providers without lowest-common-denominator design?**
Define a stable core request/response/error/usage contract plus capability discovery and provider-specific extensions. Reject unsupported combinations explicitly.

**How do you handle streaming retries?**
Before output begins, a retry may be safe. After bytes/tokens reach the caller, automatic replay can duplicate content; terminate with an explicit partial-stream error unless the application protocol supports resumable sequence IDs.

### Security and governance

- Central secret management and short-lived provider credentials.
- Application/model allowlists and region/data-classification policy.
- PII detection/redaction where required; raw payload logging disabled by default.
- Prompt/model version and usage audit.
- Spend anomaly and denial-of-wallet protection.

### Evaluation and SLOs

- Gateway overhead, TTFT, end-to-end P95/P99, stream interruption.
- Provider errors/throttles, circuit state, retries/fallbacks.
- Tokens and spend by tenant/app/task; quota denials.
- Quality/task success by route and fallback pair.
- Availability excluding correctly rejected policy/quota requests.

### Trade-offs

- Centralization improves governance but creates a high-blast-radius dependency.
- Aggressive fallback improves availability but may violate quality, residency, context, or tool semantics.
- Exact token reservation avoids overspend but can underutilize quota; reconcile estimates with actual usage.

### STAR version

**Situation:** Product teams integrated providers independently, producing inconsistent security, resilience, and spend controls.  
**Task:** Create a governed access layer without blocking product autonomy.  
**Action:** I defined a stable core contract, distributed quotas, routing/circuit-break policies, streaming cancellation, provider adapters, usage accounting, and eval-gated fallback.  
**Result:** State verified integration-time, cost, availability, and compliance evidence; otherwise describe the platform controls delivered.  
**Learning:** The gateway should centralize policy and economics while leaving domain workflows with product teams.

### Likely follow-ups

- **Gateway outage?** Multi-zone replicas, minimal synchronous dependencies, fail policy based on risk, and application-visible degraded errors.
- **Redis/quota-store outage?** Security/spend-sensitive limits fail closed or use tightly bounded emergency local leases; never silently allow unlimited calls.
- **How do you canary a model?** Deterministic request sampling, shadow where privacy permits, paired task evals, tenant opt-in, quality/cost/latency gates, instant route rollback.

## 20. How to Make Any Case Study Credible
