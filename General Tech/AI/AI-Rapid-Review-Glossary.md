# AI Engineering — Rapid Review Glossary

## Retrieval and RAG

| Concept | Interview-ready definition |
|---|---|
| Embedding | Learned fixed-dimensional representation whose geometry encodes model-dependent similarity |
| Cosine similarity | Directional similarity; dot product of normalized vectors |
| ANN | Approximate nearest-neighbor search trading perfect recall for latency/memory |
| HNSW | Memory-heavy navigable graph index with strong recall/latency |
| IVF | Partition vectors by centroids and probe selected partitions |
| PQ | Compress vector subspaces to reduce memory at recall cost |
| BM25 | Lexical ranking based on term frequency, rarity, and document length |
| Hybrid search | Combine lexical and vector candidates |
| RRF | Merge ranked lists by reciprocal rank without comparing raw scores |
| MMR | Select relevant but diverse results |
| Reranker | More expensive model rescoring broad retrieval candidates |
| HyDE | Embed a hypothetical answer/document to retrieve related sources |
| Graph RAG | Retrieve through entities/relationships plus supporting text |
| Grounding | Constrain claims to authoritative supplied evidence |
| Faithfulness | Degree to which answer claims are supported by context |

## Models and Inference

| Concept | Interview-ready definition |
|---|---|
| Token | Model-specific text unit; primary context/cost unit |
| Transformer | Attention + feed-forward architecture processing token representations |
| Temperature | Logit scaling controlling sampling diversity—not truth |
| Top-p | Sample from smallest set whose cumulative probability reaches p |
| Prefill | Parallel processing of input tokens; drives time-to-first-token |
| Decode | Sequential token generation; drives output latency |
| KV cache | Cached attention keys/values for previous tokens |
| Continuous batching | Add/remove requests between decode steps for utilization |
| Quantization | Lower numeric precision to reduce memory/compute |
| LoRA/PEFT | Train small adapters rather than all model weights |
| Fine-tuning | Adapt stable behavior/task patterns with training data |
| Context engineering | Select, order, compress, and isolate all model-visible information |

## Orchestration and Agents

| Concept | Interview-ready definition |
|---|---|
| Runnable/LCEL | Composable input-output execution unit/pipeline |
| LangGraph | Stateful graph for branches, loops, joins, checkpoints, interrupts |
| Reducer | Deterministic rule for merging parallel state updates |
| Fan-out/fan-in | Parallel branches followed by a synchronization/aggregation barrier |
| Agent | Model chooses next action/tool under bounded policy |
| ReAct | Interleave reasoning/action/observation cycles |
| Checkpoint | Durable workflow-state snapshot; not exactly-once by itself |
| HITL | Pause for human approval/input and resume from durable state |
| MCP | Protocol for exposing tools/resources/prompts to AI hosts |
| Tool | Typed external capability; execution remains code-authorized |
| Guardrail | Layered deterministic/probabilistic control around model behavior |

## Reliability and Scale

| Concept | Interview-ready definition |
|---|---|
| Backpressure | Slow/reject/pause intake when downstream cannot keep up |
| Bulkhead | Isolate resource/failure domains |
| Circuit breaker | Stop calls to a failing dependency until recovery probe |
| Token bucket | Rate limiter allowing controlled bursts |
| Semaphore | Bound concurrent in-flight operations |
| Idempotency | Repeating an operation with same key has no additional effect |
| At-least-once | Work may repeat but should not be lost |
| DLQ | Isolate poison/permanently failed events with failure metadata |
| Queue age | Oldest waiting work; better overload signal than depth alone |
| Little's Law | Average in-flight work ≈ arrival rate × service time |
| Admission control | Decide whether/when work may enter constrained system |
| Single-flight | Coalesce concurrent identical cache misses into one computation |

## Evaluation

| Concept | Interview-ready definition |
|---|---|
| Recall@K | Fraction of relevant items found in top K |
| Precision@K | Fraction of top K that is relevant |
| MRR | Reciprocal rank of first relevant result |
| NDCG | Ranking quality with graded relevance and position discount |
| LLM judge | Model scoring semantic quality under a rubric |
| Golden set | Stable expert-curated release-gate cases |
| Regression set | Cases representing previously observed failures |
| Pairwise eval | Compare two outputs on the same input |
| Judge calibration | Measure judge agreement/bias against human labels |
| Drift | Change in data, concepts, models, retrieval, or judge behavior |
| Trajectory eval | Score agent steps/tools/policy, not only final answer |

## Security and Governance

| Concept | Interview-ready definition |
|---|---|
| Prompt injection | Untrusted content attempts to override instructions |
| Indirect injection | Malicious instructions arrive through retrieved/tool content |
| Data exfiltration | Unauthorized sensitive data leaves its trust boundary |
| Least privilege | Tool/model receives only required data and permissions |
| Human approval binding | Approval references exact immutable action/version |
| Denial of wallet | Attack/bug creates excessive paid model usage |
| Data lineage | Trace output to source, transformations, versions, and identity |
| Model gateway | Central policy/routing/quota/telemetry layer for model access |

## Fifteen Staff Sound Bites

1. "The model is probabilistic; the control plane should not be."
2. "Chunking sets the retrieval quality ceiling."
3. "Retrieve for recall, rerank for precision."
4. "Authorization belongs before retrieval and tool execution."
5. "Fine-tuning changes behavior; RAG supplies knowledge."
6. "A checkpoint enables replay; idempotency makes replay safe."
7. "Agent success includes the trajectory and side effects."
8. "Per-pod limits are not global limits."
9. "Retries are load multipliers."
10. "Queue age reveals overload before queue depth tells the full story."
11. "Evaluate retrieval and generation independently."
12. "Faithfulness is not correctness."
13. "More context can lower answer quality."
14. "MCP standardizes access; it does not establish trust."
15. "Optimize cost per successful task, not cost per call."
