# AI Engineering — Staff Interview Guide

Refactored from `supporting-docs/AI Foundations.md` into focused, interview-ready notes.

## Start Here

- **Rapid review:** [Glossary](./AI-Rapid-Review-Glossary.md) → [FAQ](./AI-Interview-FAQ.md)
- **System design:** [Production Systems](./AI-Production-Systems.md) → [Design Drills](./AI-System-Design-Drills.md)
- **Behavioral/project rounds:** [Case Studies & Resume Stories](./AI-Case-Studies-and-Resume-Stories.md)

## Core Concepts

- [Embeddings, Vector Search & RAG](./AI-Embeddings-Vector-Search-and-RAG.md)
- [LLMs, Context & Prompt Engineering](./AI-LLMs-Context-and-Prompting.md)
- [LLM Models & Inference](./AI-Models-and-Inference.md)
- [LangChain, LangGraph, Agents & MCP](./AI-Orchestration-Agents-and-MCP.md)
- [Advanced AI Engineering Patterns](./AI-Advanced-Patterns.md)

## End-to-End Mental Model

### One-line view

```text
Request → model selection → context/retrieval → inference
→ validation/action → reliability/scale → observability/security
```

### Offline knowledge plane

```text
Raw sources
→ validate and parse
→ structure-aware chunks + metadata/ACLs
→ embeddings
→ lexical + vector indexes
→ version activation, freshness, and deletion lifecycle
```

### Online request plane

```text
Client
→ API gateway
   └─ identity, authorization, quotas, admission control
→ workflow or agent
   └─ state, deadline, budget, tool policy, checkpoints
→ model router
   └─ capability, quality, latency, cost, modality, residency
→ context builder
   ├─ system prompt and output schema
   ├─ authorized memory and conversation history
   ├─ tool results
   └─ RAG
      └─ query rewrite
         → ACL-filtered lexical + vector retrieval
         → fusion and reranking
         → deduplication and context budget
→ LLM inference
   └─ prefill → KV-cached decode/continuous batching → token streaming
→ tool gateway when needed
   └─ schema validation → authorization → idempotent execution → sanitized result
→ output validation
   └─ schema → business rules → citations/grounding → safety policy
→ response or approved side effect
```

### Cross-cutting controls

| Concern | Controls |
|---|---|
| Scale | Load balancing, bounded concurrency, token-aware rate limits, backpressure, async queues |
| Reliability | Deadlines, cancellation, retries with jitter, circuit breakers, bulkheads, idempotency, DLQ |
| Performance/cost | Batching, streaming, model routing, exact/semantic caching, token and spend budgets |
| Security | Identity, retrieval/tool authorization, tenant isolation, least privilege, egress controls, audit |
| Operations | Traces, logs, metrics, quality evals, version lineage, canaries, rollback, incident runbooks |

### Staff-level invariants

- **Authorization:** enforce before retrieval and tool execution; prompts are not a security boundary.
- **Bounded work:** limit requests, tokens, branches, queue age, steps, context, and spend.
- **Replay safety:** checkpoints recover state; idempotency protects external effects.
- **Quality isolation:** evaluate retrieval, generation, tools, and end-task success separately.
- **Versioned execution:** trace model, prompt, schema, index, workflow, tool, and evaluator versions.
- **Safe rollout:** offline eval → shadow/canary → production monitoring → rollback.

## Production and Leadership

- [Production AI Systems](./AI-Production-Systems.md)
- [AI Evaluation, DeepEval & RAGAS](./AI-Evaluation.md)
- [Enterprise AI Platforms](./AI-Enterprise-Platforms.md)
- [AI-Assisted Software Development](./AI-Assisted-Software-Development.md)

## Reference

- [Frequently Asked Questions](./AI-Interview-FAQ.md)
- [AI System Design Drills](./AI-System-Design-Drills.md)
- [Rapid Review Glossary](./AI-Rapid-Review-Glossary.md)
- [Source Coverage Matrix](./AI-Source-Coverage-Matrix.md)
- [Case Studies & Resume Stories](./AI-Case-Studies-and-Resume-Stories.md)

## Staff Answer Framework

```text
Goal/SLO → trust boundaries → architecture → invariant/trade-off
→ failure/scale/cost → evaluation → rollout/operations
```

State assumptions, quantify one capacity relationship, reject one alternative, and explain how failure is detected.
