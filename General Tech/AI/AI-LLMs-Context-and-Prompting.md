# LLMs, Context & Prompt Engineering

## 1. First Response

> "An LLM predicts tokens from context; it does not own truth, authorization, or durable state. Production quality comes from context selection, constrained interfaces, validation, evaluation, and deterministic controls around the model."

## 2. What an LLM Is—and Is Not

- Transformer-based next-token predictor trained over large corpora.
- Good at synthesis, extraction, classification, transformation, and language interfaces.
- Weak at guaranteed factuality, arithmetic, current/private knowledge, deterministic execution, and authorization.
- Temperature changes sampling diversity—not knowledge or truthfulness.

## 3. Context Window

The window includes system/developer instructions, conversation, retrieved evidence, tool results, user input, and output budget.

```text
context budget = model limit - reserved output - protocol overhead
```

Long context has costs: higher latency, more tokens, lost-in-the-middle effects, distractors, and conflicting instructions.

### Context engineering priority

1. System and safety constraints.
2. Current user intent.
3. Authoritative relevant evidence.
4. Tool results.
5. Recent conversation.
6. Summarized older history.

## 4. Prompt Design

A robust prompt specifies:

- Role and objective.
- Input boundaries and trust level.
- Required output schema.
- Allowed sources/tools.
- Abstention behavior.
- Few-shot examples for ambiguous policy.
- Explicit success/failure criteria.

Prompts are versioned artifacts: `prompt_id`, version, model, parameters, schema, and evaluation score.

## 5. Structured Output

Treat model output as untrusted input.

```text
LLM → provider schema/tool call → parse → validate
→ business invariant checks → accept / repair / retry / human review
```

Use enums, ranges, required fields, and discriminated unions. Keep validation retries bounded; a repeated schema failure may indicate prompt/model incompatibility, not transient failure.

## 6. Tool Calling

The model proposes; trusted code authorizes and executes.

```text
model request → tool gateway → schema validation → authorization
→ policy checks → timeout/idempotency → execution → sanitized result
```

Design tools to be narrow, typed, least-privilege, auditable, and idempotent where possible. Separate read and write tools. Require human approval for high-impact actions.

## 7. Memory

| Type | Purpose | Best store |
|---|---|---|
| Working memory | Current run state | Workflow state/context |
| Conversation | Recent dialogue | Session store |
| Summary | Compressed history | DB/document store |
| Semantic | Retrieved facts | Vector index + source of truth |
| Episodic | Prior events/outcomes | Event/relational store |
| Durable business state | Authoritative facts | Transactional database |

Do not put every fact into vectors. Structured data belongs in structured stores.

## 8. Hallucination and Grounding

Hallucination is fluent unsupported output. Reduce risk with:

- Authoritative retrieval and citations.
- Explicit abstention when evidence is insufficient.
- Structured output and deterministic validators.
- Tool use for live/computational facts.
- Lower temperature where consistency matters.
- Human review for irreversible/high-risk decisions.
- Faithfulness and citation evals.

No prompt guarantees zero hallucinations.

## 9. Prompt Injection

Treat user text, documents, web pages, and tool results as untrusted data.

Defenses:

- Strong separation of instructions and data.
- Tool allowlists and argument validation.
- Authorization outside the model.
- Output filtering and data-loss prevention.
- Minimize secrets/model-visible data.
- Sandbox code/browser tools.
- Require approval for side effects.

## 10. Model Routing

Use the cheapest model that meets the quality SLO.

```text
request → deterministic rules / complexity classifier
├─ small model: extraction/classification
├─ standard model: common generation
└─ reasoning model: complex/high-value cases
```

Measure routing errors, escalation rate, quality, P95 latency, tokens, and cost/request.

## 11. Caching

| Cache | Key must include |
|---|---|
| Embedding | content hash + embedding model/version |
| Retrieval | normalized query + tenant/ACL + index version |
| Prompt/LLM | model + prompt version + parameters + complete relevant context |
| Semantic | similarity threshold + tenant + policy/version constraints |

Avoid caching personalized, time-sensitive, non-deterministic, or privileged outputs without rigorous scoping and expiry.

## 12. Context Provenance and Trust Zones

Every context item should carry provenance:

```text
source identity + tenant/ACL + fetched_at + source version
+ trust level + transformation history + token count
```

Separate:

- **Trusted instructions:** platform/application policy.
- **Authorized evidence:** source data the caller may access.
- **Untrusted content:** user/retrieved/tool text that may contain instructions.
- **Ephemeral reasoning inputs:** current task/tool observations.

Do not flatten these into one undifferentiated string. Preserve delimiters and source metadata through summarization so citations and incident analysis remain possible.

## 13. Context Budget Allocation

Budget before retrieval/tool execution:

```text
model window
- reserved output
- system/tool/schema overhead
- safety margin
= allocatable evidence + history + tool results
```

Assign per-source caps and truncation policy. Prefer dropping low-value redundant context over truncating authoritative evidence mid-clause. Detect lost-in-the-middle with position-aware evals; do not assume a larger advertised window gives equal effective recall.

Context compression is a transformation that needs provenance and evaluation. A summary can remove exceptions, negate facts, or become stale.

## 14. Prompt Contracts and Migration

Treat a prompt as a versioned contract with:

- Inputs and trust assumptions.
- Model/chat-template compatibility.
- Tool and schema versions.
- Required behavior and abstention.
- Evaluation dataset and approved thresholds.
- Owner, rollout, and rollback.

Use offline paired evals, shadowing, deterministic cohort canaries, and trace version per request. If output schema changes, deploy tolerant readers or dual-write/dual-parse before switching consumers.

Avoid hidden prompt coupling: tool descriptions, retrieval formatting, chat template, and examples can change behavior as much as the system text.

## 15. Structured Output Recovery

Failure classes need different handling:

| Failure | Response |
|---|---|
| Invalid syntax/schema | One bounded repair or schema-constrained retry |
| Valid schema, invalid business invariant | Reject/escalate; prompt retry may not help |
| Refusal | Respect policy; route only if task allows |
| Truncated output | Retry with smaller input/output plan if no side effect |
| Unknown enum/version | Compatibility failure; alert/rollback |
| Adversarial payload in a field | Treat as data; validate/escape at sink |

Never execute a side effect before validating the complete tool call and authorization context.

## 16. Tool Result Context Management

Tool output is untrusted and often large.

- Enforce MIME/schema/size and per-tool token limits.
- Return references or aggregates instead of dumping raw datasets.
- Preserve source/time/version and partial-result status.
- Redact secrets and instructions not needed by the model.
- Distinguish tool error, empty result, stale result, and timeout.
- Cache only with identity, parameters, source version, and policy scope.

A tool result saying "ignore previous instructions" remains data, not authority.

## 17. Memory Lifecycle and User Control

Before writing memory, decide:

```text
what fact/event → purpose → consent/legal basis → confidence/provenance
→ retention/expiry → conflict resolution → retrieval scope → deletion
```

Use append-only events for history and an explicit consolidation process for durable facts. New evidence may supersede rather than overwrite old facts. Users need visibility/correction/deletion where appropriate. Never infer and permanently store sensitive traits merely because the model mentioned them.

## 18. Prompt-Injection Threat Model

Threat paths include direct user input, retrieved documents, web pages, emails/tickets, tool output, memory, and compromised capability descriptions.

Defense in depth:

1. Keep authorization and secrets outside model discretion.
2. Minimize visible tools/data for this task.
3. Label/isolate untrusted content.
4. Validate tool requests against caller policy.
5. Sandbox and restrict egress.
6. Validate/sanitize output for its sink.
7. Monitor anomalous tool sequences and exfiltration patterns.
8. Test indirect injection with realistic documents and multi-step attacks.

Injection detection classifiers are signals, not complete security boundaries.

## 19. Model Routing and Escalation Policy

Routing inputs may include task, risk, modality, context length, residency, latency tier, budget, and previous validation failures.

Use deterministic policy for hard constraints; optional classifiers for complexity. Define escalation and de-escalation explicitly. Avoid cascading through many models during an outage—fallback storms amplify cost and latency. Evaluate each route and fallback pair on the task's slices.

## 20. Context and Prompt Incidents

**Sudden token-cost increase:** compare prompt/history/tool/retrieval token breakdown by version; detect context accumulation and cache misses.

**Quality regression after prompt change:** freeze rollout, compare paired traces, inspect tool/retrieval formatting and chat template, then roll back full execution manifest.

**Cross-tenant content appears:** treat as a security incident; disable route/cache, preserve trace and authorization filters, assess exposure, and fix retrieval/cache isolation—not the prompt.

**Model follows retrieved malicious instructions:** revoke/contain tools, inspect trust separation and authorization, add adversarial regression tests and deterministic constraints.

## 21. Staff-Level Design Questions

**How do you measure context value?**
Ablate sources and measure task quality, faithfulness, latency, and cost. Track whether each source is cited/used; do not assume retrieved tokens help.

**How do you handle contradictory context?**
Preserve authority/version/time metadata, surface conflict, apply deterministic source precedence where policy exists, and abstain/escalate otherwise.

**Should prompts live in code?**
They need versioning, review, tests, rollout, and rollback. Storage location is secondary; runtime edits without release discipline are risky.

**How much conversation history do you retain?**
Only what improves the current task under privacy and token budgets. Keep authoritative facts separately, summarize older dialogue with provenance, and support expiry/deletion.

## 22. Frequently Asked Questions

**System prompt vs application control?**
A system prompt influences model behavior. Authorization, validation, rate limits, budgets, and side-effect controls must be enforced by code/infrastructure.

**When should I use temperature zero?**
For extraction, classification, and reproducibility. It improves consistency but does not guarantee determinism across model/provider versions.

**How do you handle context overflow?**
Reserve output budget, retrieve/rerank, deduplicate, summarize low-priority history, reject oversized tool output, and expose truncation metrics.

**How do you version prompts safely?**
Store prompts outside ad-hoc code paths, evaluate against a fixed dataset, shadow/canary the new version, trace version per request, and retain rollback.

**How do you keep model output safe?**
Schema validation, domain invariants, policy engine checks, escaping/encoding for sinks, tool authorization, and human approval for high-risk decisions.

## 23. Interview Sound Bites

- "The model is a probabilistic component inside a deterministic control plane."
- "Context is a scarce resource; more tokens can reduce quality."
- "Prompts guide behavior—they do not enforce security."
- "The model may choose a tool, but code decides whether it is allowed to run."
- "Treat structured output as an API contract and validate it like external input."
