# Advanced AI Engineering Patterns

## 1. First Response

> "Advanced AI architecture is mostly about choosing where uncertainty is acceptable. I keep identity, policy, side effects, budgets, and data boundaries deterministic; use models for semantic judgment; and add retrieval, routing, evaluation, and human review according to risk."

## 2. Advanced RAG Patterns

| Pattern | Use | Risk |
|---|---|---|
| Parent-child retrieval | Search precise child chunks, return wider parent context | Parent may exceed budget |
| Multi-query retrieval | Generate paraphrases/subqueries to improve recall | Cost and semantic drift |
| HyDE | Embed a hypothetical answer/document | Hallucinated query can bias retrieval |
| Self-query retriever | Model extracts semantic query + metadata filters | Never let model invent authorization filters |
| Contextual compression | Extract relevant sentences from retrieved docs | May omit qualifications |
| Corrective RAG | Grade retrieval and retry/rewrite/use alternate source | More latency and loops |
| Adaptive RAG | Route simple questions directly; complex ones through retrieval/tools | Router errors |
| Graph RAG | Traverse entities/relationships plus text evidence | Graph construction/freshness complexity |
| Agentic RAG | Agent selects sources and iterates retrieval | Variable cost and nondeterminism |
| RAPTOR/hierarchical summaries | Retrieve across summary levels | Summary drift and update complexity |

### Retrieval fusion

- Reciprocal Rank Fusion combines rankings without comparing incomparable raw scores.
- Maximum Marginal Relevance balances relevance and diversity.
- Rerankers should see enough candidates to recover precision but remain cost-bounded.

### Corrective flow

```text
retrieve → grade evidence
├─ strong → answer
├─ incomplete → rewrite/decompose → retrieve again
└─ unavailable → abstain / alternate authorized source
```

Bound retries and retain every query rewrite in traces/evals.

## 3. Fine-Tuning Decision Framework

```text
Need current/private facts? → RAG/tool/DB
Need consistent output contract? → schema + examples + validators
Need stable domain behavior/style? → consider fine-tuning
Need new capability beyond base model? → data/model choice first
```

| Approach | Best for | Not ideal for |
|---|---|---|
| Prompting/few-shot | Rapid instruction changes | Large repeated examples cost tokens |
| RAG | Dynamic facts, citations, deletions | Changing fundamental behavior |
| Supervised fine-tuning | Stable task/style/format behavior | Frequently changing knowledge |
| LoRA/PEFT | Lower-cost adaptation | Eliminating serving/version complexity |
| Preference optimization | Response preferences/safety behavior | Verifiable factual updates |
| Continued pretraining | Deep domain language distribution | Small datasets/quick iteration |

### Fine-tuning lifecycle

Dataset provenance/consent → train/validation/test split → baseline → train → safety/task eval → shadow/canary → monitor drift → rollback. Prevent train/test contamination and memorize-sensitive-data leakage.

## 4. Multimodal Systems

Multimodal inputs include text, images, audio, video, PDFs, tables, and diagrams.

```text
object → media validation → modality-specific extraction/segmentation
→ OCR/transcription/vision embeddings → aligned metadata
→ retrieval/reasoning → grounded structured output
```

Challenges:

- OCR/layout/table ordering and page coordinates.
- Large media size and asynchronous processing.
- Cross-modal retrieval quality.
- Prompt injection hidden in images/documents.
- PII/biometric data and retention.
- Citation to page, bounding box, timestamp, or frame.
- Modality-specific golden datasets.

Use deterministic parsers/OCR where possible and invoke a multimodal model only for semantic interpretation that deterministic tools cannot provide.

## 5. Guardrail Layers

Guardrails are layered controls, not one classifier.

| Stage | Controls |
|---|---|
| Input | auth, size/type validation, injection/PII screening |
| Retrieval | mandatory tenant/ACL filters, source allowlists |
| Prompt | trusted/untrusted separation, minimal secrets |
| Tool | allowlist, schema, authz, sandbox, idempotency, approval |
| Output | schema, policy/safety, grounding/citation checks, encoding |
| Runtime | step/time/token/cost limits, rate limits, circuit breakers |
| Operations | audit, incident response, eval gates, rollback |

Design fail-open vs fail-closed per risk. Security and authorization should fail closed; low-risk enrichment may degrade gracefully.

## 6. Agent Observability

Trace the trajectory, not only the final model call:

```text
run → step → model decision → tool request → authorization
→ tool result → state update → next decision → outcome
```

Capture run/step IDs, state version, model/prompt, tool args metadata, policy decision, retries, tokens/cost, latency, stop reason, approval, and final outcome. Redact sensitive payloads.

Useful metrics:

- Task success and human takeover.
- Steps/tool calls per success.
- Repeated/invalid/unauthorized tool calls.
- Loop/timeout/budget exhaustion.
- Cost and latency per successful task.
- Tool and model error/fallback rate.

## 7. OpenAI-Style Agent Stack — Vendor-Neutral Mental Model

| Concept | Vendor-neutral responsibility |
|---|---|
| Model | Reasoning/generation dependency |
| Agent | Instructions + model + tools + policy |
| Responses/run | One execution with input/output/usage |
| Tools | Typed external capabilities |
| Memory/session | Conversation and durable state |
| Guardrails | Input/output/tool policy checks |
| Handoff | Transfer to another specialized agent |
| Tracing | Steps, model calls, tools, outcomes |

Do not couple business state to one provider's run/thread object. Keep an internal run ID and state contract, then adapt provider APIs.

## 8. Semantic Caching

Semantic caches retrieve a prior response for a sufficiently similar query.

Safe only when:

- Tenant/identity/authorization scope matches.
- Prompt/model/retrieval/data versions match.
- The task is stable and non-personalized.
- Similarity threshold is calibrated using false-hit cost.
- TTL/invalidation reflect source freshness.

A false semantic-cache hit can be worse than a model error because stale output bypasses retrieval and generation controls.

## 9. AI Gateway vs Workflow Orchestrator

| AI gateway | Workflow orchestrator |
|---|---|
| Provider/model access | Business task execution |
| Auth, quotas, budgets | State, branches, loops, tools |
| Routing/fallback | Checkpoints/human approval |
| Common telemetry/policy | Domain-specific aggregation |

Keep gateway policy generic; do not turn it into every product's workflow engine.

## 10. Data Flywheel and Feedback

```text
production traces + explicit feedback + reviewed failures
→ privacy/filtering → labeling/adjudication → dataset versions
→ eval/fine-tune/retrieval improvement → gated rollout
```

Beware selection bias, popularity bias, malicious feedback, and feedback loops that reinforce model behavior. Preserve human-reviewed anchors.

## 11. Drift

- **Data drift:** input/domain distribution changes.
- **Concept drift:** expected answer/policy changes.
- **Model drift:** provider silently or explicitly changes behavior.
- **Retrieval drift:** corpus/index/chunker changes.
- **Judge drift:** evaluator model/prompt changes.

Track versioned distributions and periodically rerun fixed anchors plus current-traffic samples.

## 12. Frequently Asked Questions

**Graph RAG or vector RAG?**
Vector RAG for unstructured semantic evidence; graph traversal when multi-hop relationships and entity connectivity are central. Hybrid is common.

**When should RAG abstain?**
When required authoritative evidence is absent, contradictory, unauthorized, stale beyond policy, or confidence/coverage falls below a calibrated threshold.

**Can guardrails guarantee safety?**
No. Defense in depth reduces risk; deterministic authorization and constrained execution are stronger than model-based filters.

**When use an agentic retriever?**
When source selection/decomposition cannot be predetermined and the value exceeds added latency/cost. Keep source/tool choices bounded and evaluate trajectories.

**How do you evaluate fine-tuning?**
Paired task/safety evaluation against the base model and RAG/prompt baseline, plus memorization/privacy and slice regressions.

## 13. Interview Sound Bites

- "Fine-tuning changes behavior; RAG changes accessible knowledge."
- "Agent observability is a trajectory, not one span around the final LLM call."
- "A semantic-cache false positive can silently bypass fresh retrieval."
- "Guardrails are layered deterministic and probabilistic controls—not a magic moderation prompt."
- "Keep provider run objects at the adapter boundary; own your workflow identity."
