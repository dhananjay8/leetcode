# AI Foundations — Source Coverage Matrix

This matrix maps every major topic cluster from `supporting-docs/AI Foundations.md` into the split interview guide. Repeated source sections are intentionally consolidated rather than copied multiple times.

## 1. Embeddings, Search, and RAG

| Source cluster | Target coverage |
|---|---|
| Vectors, embeddings, semantic vs keyword search | `AI-Embeddings-Vector-Search-and-RAG.md` §§2–3 |
| Cosine/dot/Euclidean similarity | RAG §3 |
| Embedding model choice/version migration | RAG §3 |
| Fixed, semantic, structure-aware chunking | RAG §4 |
| Metadata filtering and tenant authorization | RAG §6 |
| Vector databases and operational selection | RAG §§5, 11; Enterprise Platforms |
| ANN, HNSW, IVF, PQ | RAG §5 |
| Recall vs latency | RAG §§5, 11 |
| RAG architecture | RAG §§2, 7–11 |
| Hybrid search, reranking | RAG §§7, 9 |
| Advanced RAG, query transformation | RAG §8; Advanced Patterns §2 |
| Context window/engineering | LLMs §3; RAG §9 |
| RAG failures/debugging | RAG §10; Evaluation §14 |

## 2. LLM and Inference

| Source cluster | Target coverage |
|---|---|
| LLM capabilities/limitations | `AI-LLMs-Context-and-Prompting.md` §2 |
| Prompt templates/engineering/versioning | LLMs §§4, 12 |
| Structured output | LLMs §5 |
| Context windows and memory | LLMs §§3, 7 |
| Hallucination/grounding | LLMs §8 |
| Temperature/decoding | `AI-Models-and-Inference.md` §5 |
| Transformer/tokenization concepts | Models §§2–3 |
| KV cache | Models §7 |
| Continuous batching/streaming | Models §§6, 8 |
| Model routing | LLMs §10; Production §7 |
| Fine-tuning/RAG/prompt decisions | Advanced Patterns §3; Models §4 |
| Quantization and parallel inference | Models §§9–10 |
| Multimodal systems | Advanced Patterns §4 |

## 3. LangChain, LangGraph, and Agents

| Source cluster | Target coverage |
|---|---|
| LCEL/Runnable, sequential/parallel/streaming | `AI-Orchestration-Agents-and-MCP.md` §§2–4 |
| LCEL failures/retries | Orchestration §2; Production §5 |
| LangGraph state/nodes/edges/loops | Orchestration §§3–4 |
| Human-in-the-loop/checkpointing | Orchestration §§8–9 |
| Subgraphs/shared vs isolated state | Orchestration §§3, 7 |
| LCEL vs LangGraph | Orchestration §§2–3, FAQ |
| Agent/tool calling/loop/reasoning | Orchestration §§5–6 |
| Agent state/memory/tool design | Orchestration §7; LLMs §§6–7 |
| Guardrails/failure/observability/evaluation | Advanced Patterns §§5–6; Evaluation §12 |
| Multi-agent systems | Orchestration §11 |
| Workflow vs agent | Orchestration §5 |
| MCP host/client/server/resources/tools/prompts | Orchestration §10 |
| OpenAI-style agent stack | Advanced Patterns §7 |

## 4. Production Architecture

| Source cluster | Target coverage |
|---|---|
| AI gateway | `AI-Production-Systems.md` §7; Advanced Patterns §9 |
| Rate limiting/concurrency/backpressure | Production §§3–4 |
| Async queues/event-driven AI | Production §6 |
| Timeout/retry/circuit breaker/fallback/bulkhead | Production §5 |
| Exactly-once/idempotency | Production §§5–6 |
| Caching/semantic caching | LLMs §11; Advanced Patterns §8 |
| Load balancing/scalability | Production §§3–4, 11 |
| Security/prompt injection/exfiltration | Production §9; LLMs §§9–10 |
| Observability/tracing/cost | Production §§8, 10 |
| Determinism | LLMs §§2, 5; Evaluation §§2, 13 |
| Staff architecture example | Production; System Design Drills |
| Multi-tenant enterprise concerns | Enterprise Platforms §§6, 8 |

## 5. Evaluation

| Source cluster | Target coverage |
|---|---|
| Evals vs tests/monitoring | `AI-Evaluation.md` §§2, 11 |
| Component/pipeline/E2E/production levels | Evaluation §3 |
| Golden/regression datasets | Evaluation §4 |
| Reference vs reference-free | Evaluation §§5–7 |
| LLM-as-judge and bias/calibration | Evaluation §7 |
| RAG metrics/context relevance/recall | Evaluation §§5–6 |
| RAGAS/DeepEval/custom metrics | Evaluation §8 |
| Eval-driven development/CI | Evaluation §§9, 13 |
| Human evaluation/statistics/distributions | Evaluation §§7, 10 |
| Offline/online/sampling | Evaluation §11 |
| Agents/tool trajectory evaluation | Evaluation §12 |
| Versioning/reproducibility | Evaluation §§9, 13 |

## 6. Enterprise Platforms

| Source cluster | Target coverage |
|---|---|
| OCI enterprise AI services/objectives | `AI-Enterprise-Platforms.md` §4 |
| IAM/logging/security/governance | Enterprise §§2, 8 |
| Oracle AI Database/vector search | Enterprise §5 |
| SQL + AI/hybrid retrieval | Enterprise §5; System Design Drills §7 |
| Provider portability/build vs buy | Enterprise §§3, 7 |

## 7. AI-Assisted Development

| Source cluster | Target coverage |
|---|---|
| Coding assistants/repository-aware agents | `AI-Assisted-Software-Development.md` §§2–4 |
| AI development workflow/context engineering | Assisted Development §§3–4 |
| AI-generated tests/reviews | Assisted Development §§5–6 |
| Secure AI development | Assisted Development §7 |
| Staff adoption/measurement | Assisted Development §§8–9 |

## 8. Interview and Case Studies

| Source/request cluster | Target coverage |
|---|---|
| Frequent staff questions | `AI-Interview-FAQ.md` |
| Staff answer framing | `README.md`; System Design Drills §1 |
| Policy evaluation service | `AI-Case-Studies-and-Resume-Stories.md` §§1–14 |
| Scaling evidences/documents/rules | Case Study §§3–5, 8–14 |
| Generic showcase scenarios | Case Study §§15–20 |
| Full design drills/failure injection | `AI-System-Design-Drills.md` |

## 9. Intentional Consolidations

The source repeats agent, RAG, LangChain/LangGraph, evaluation, and staff-level mental models in multiple long sections. The target retains the concepts once in the authoritative focused document, then cross-references them through the index and FAQ. Vendor/product concepts are separated from vendor-neutral fundamentals.

## 10. Coverage Rule

When adding a new source concept:

1. Put the full explanation in exactly one focused document.
2. Add the interview answer to FAQ if frequently asked.
3. Add system-design application if architectural.
4. Update this matrix and the index.
5. Avoid duplicate paragraphs across documents.
