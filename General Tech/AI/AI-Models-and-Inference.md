# LLM Models & Inference

## 1. First Response

> "A decoder LLM repeatedly predicts the next token using transformer attention over prior tokens. Production inference is largely a memory-bandwidth and scheduling problem: KV cache, batching, quantization, model parallelism, and admission control determine throughput and latency."

## 2. Transformer Mental Model

```text
text → tokenizer → token IDs → embeddings + positions
→ repeated attention + feed-forward blocks
→ logits over vocabulary → decoding strategy → next token
→ repeat until stop
```

- **Self-attention:** each token combines information from other visible tokens.
- **Causal mask:** decoder tokens cannot attend to future tokens.
- **Feed-forward network:** transforms each token representation.
- **Residuals/normalization:** stabilize deep training.
- **Parameters:** learned weights; not a factual database.

## 3. Tokenization

Token count—not character count—drives context use, latency, and cost. Code, identifiers, and some languages tokenize less efficiently. Model-specific tokenizers mean counts differ across models.

Always reserve output tokens and account for system/tool/schema overhead.

## 4. Training and Adaptation

| Technique | Purpose | Trade-off |
|---|---|---|
| Pretraining | General language/world patterns | Very expensive |
| Instruction tuning | Follow task instructions | Needs curated data |
| Preference optimization | Align response behavior | Can overfit preferences |
| Full fine-tuning | Change broad model behavior | Expensive; catastrophic forgetting risk |
| LoRA/PEFT | Low-cost domain/task adaptation | Adds adapter lifecycle |
| RAG | Inject current/private knowledge | Retrieval complexity |
| Prompt/few-shot | Fast behavior steering | Context cost and sensitivity |

Use fine-tuning for stable behavioral/task patterns, not as a frequently updated knowledge store.

## 5. Decoding

- **Greedy:** highest probability each step; consistent but can be brittle.
- **Temperature:** rescales logits; lower is less diverse.
- **Top-p:** sample from smallest probability mass ≥ p.
- **Top-k:** sample from k candidates.
- **Stop sequences/max tokens:** bound output.

Temperature zero improves consistency but provider/model/kernel changes can still produce different results.

## 6. Prefill vs Decode

- **Prefill:** process all input tokens in parallel; compute-heavy.
- **Decode:** produce tokens one-by-one; memory-bandwidth/KV-cache-heavy.
- Long prompts increase time-to-first-token; long outputs increase total latency.

Track time-to-first-token and inter-token latency separately.

## 7. KV Cache

Attention keys/values for prior tokens are cached so every new token does not recompute the entire prefix.

Benefits: much faster autoregressive decoding.

Costs: memory grows with batch × sequence length × layers × hidden dimensions. KV pressure limits concurrency; paged attention and cache eviction improve utilization.

Prefix/prompt caching can reuse common prefixes only when model, exact prefix, and relevant settings match.

## 8. Batching

- **Static batching:** wait for a fixed batch; good throughput, queue latency.
- **Dynamic batching:** group arrivals within a small window.
- **Continuous batching:** insert/remove sequences between decoding steps; maximizes accelerator utilization for varied lengths.

Batching improves throughput but can hurt tail latency. Separate latency-sensitive and offline queues.

## 9. Quantization

Reduce weights/KV precision (for example FP16/BF16 → INT8/INT4) to lower memory and improve throughput.

Trade-offs: quality loss, hardware/kernel support, calibration, and sometimes slower execution if optimized kernels are absent. Evaluate on domain tasks—not generic benchmarks alone.

## 10. Parallelism

| Type | Split |
|---|---|
| Data parallel | Requests/batches across replicas |
| Tensor parallel | Matrix/tensor slices across accelerators |
| Pipeline parallel | Model layers across stages |
| Expert parallel | Mixture-of-experts routing |

Distributed inference adds communication and failure complexity. Use the simplest layout that fits model and SLO.

## 11. Serving and Admission Control

Schedule by prompt length, output budget, priority, tenant quota, and deadline. Avoid head-of-line blocking from giant contexts. Bound queued tokens—not only request count.

Capacity signals:

- Active/queued sequences and tokens.
- KV-cache utilization/evictions.
- TTFT, inter-token latency, tokens/sec.
- Batch size and accelerator utilization.
- OOM/rejection/throttle rate.

## 12. Quantitative Capacity Planning

Start from the workload distribution, not average requests:

- Input/output tokens by percentile and task.
- Arrival rate and burstiness.
- TTFT and inter-token-latency SLOs.
- Model/provider token throughput.
- KV-cache memory per active sequence.
- Availability headroom and maintenance/failure capacity.

Approximate application concurrency with Little's Law:

```text
in-flight requests ≈ requests/second × end-to-end seconds
```

For inference, refine this into queued/prefill/decode tokens. Two workloads with equal QPS can differ by orders of magnitude when context and output lengths differ. Capacity-test representative length distributions and multi-turn cache behavior.

### Goodput

Optimize **goodput**—requests or tokens completed within quality and latency SLO—not raw accelerator utilization. Batching that raises tokens/sec while violating TTFT is not an improvement for interactive traffic.

## 13. Attention and Memory Optimizations

- **FlashAttention:** IO-aware exact attention that reduces high-bandwidth-memory traffic.
- **Paged attention:** manages KV blocks like virtual memory, reducing fragmentation.
- **Multi-query attention (MQA):** heads share one key/value set, reducing KV memory.
- **Grouped-query attention (GQA):** compromise between multi-head quality and MQA memory.
- **Sliding-window attention:** bounds attention to recent tokens for some layers/models.
- **Prefix caching:** reuses exact common prefixes; invalidation includes model and prompt bytes/configuration.

These change serving economics, but model architecture determines availability and quality implications.

## 14. Speculative Decoding

A smaller draft model proposes multiple tokens; the target model verifies them in parallel. Accepted tokens reduce serial target-model decode steps without changing the target distribution when implemented correctly.

Best when draft acceptance is high and verification is cheaper than serial decoding. Poor draft alignment, short outputs, or extra memory/operational complexity can erase gains. Benchmark acceptance rate, TTFT, inter-token latency, total cost, and tail behavior.

## 15. Mixture of Experts

MoE routes each token through a subset of expert feed-forward networks. It increases parameter capacity without activating every parameter per token.

Trade-offs:

- Router/load imbalance and hot experts.
- Expert-parallel all-to-all communication.
- Larger total weight memory despite sparse compute.
- Capacity factors and dropped/rerouted tokens.
- Harder deployment and fault domains.

Sparse activation does not mean inexpensive serving automatically; communication and memory placement matter.

## 16. Scheduling and SLO Isolation

Schedulers should account for estimated prompt/output tokens, priority, deadline, tenant quota, model, adapter, and cached prefix.

Patterns:

- Separate interactive and offline queues.
- Cap long-context concurrency to prevent head-of-line blocking.
- Preempt or chunk prefill where the serving engine supports it.
- Use weighted fair scheduling across tenants.
- Reserve capacity for high-priority traffic.
- Reject early when deadline cannot be met rather than wasting compute.

Protect against starvation: shortest-job-first improves mean latency but can indefinitely delay long contexts without aging/fairness.

## 17. Distributed Serving and Failure Domains

- **Data parallelism:** independent model replicas; simplest scaling if one model fits.
- **Tensor parallelism:** collective communication every layer; needs fast interconnect.
- **Pipeline parallelism:** stage layers; bubbles and uneven stages hurt utilization.
- **Expert parallelism:** routes MoE tokens across expert devices.
- **Disaggregated prefill/decode:** specialized pools scale compute-heavy prefill separately from memory-heavy decode; adds KV transfer/routing complexity.

A multi-GPU replica fails as a unit. Capacity planning must survive a host/accelerator loss without creating retry storms. Health checks should detect model readiness and collective failures, not only HTTP liveness.

## 18. Model and Adapter Lifecycle

Treat weights, tokenizer, runtime, quantization, adapter, chat template, and generation defaults as one deployable version.

Rollout:

```text
offline quality/performance benchmark → load test
→ shadow → canary by stable cohort → compare quality/TTFT/ITL/cost
→ gradual promotion → drain old replicas → retain rollback
```

LoRA adapters can improve multi-tenancy but introduce adapter loading/cache pressure, compatibility constraints, and many-version operations. Do not hot-swap incompatible adapters without explicit routing identity.

## 19. Inference Economics

Compare:

- Managed price per input/output token.
- Self-host accelerator-hours, utilization, idle headroom, licenses, storage/network, and staffing.
- Batch/offline discounts and reserved capacity.
- Cache hit rates and failed/retried token waste.
- Cost per successful quality-compliant task.

Self-hosting wins only when sustained utilization and control needs exceed the operational burden. Peak-sized fleets with low average use can cost more than managed APIs.

## 20. Staff-Level Failure Scenarios

**KV cache is saturated but GPU compute is low.**
Reduce/bucket context, reject or queue long requests, lower concurrency, use GQA/MQA-capable models or quantized/paged KV, and inspect fragmentation. Adding compute alone may not help.

**P99 TTFT rises after a batching change.**
Inspect queue delay, prefill batch composition, long-context head-of-line blocking, and scheduling fairness. Roll back or isolate traffic; throughput gain is irrelevant if goodput falls.

**One replica produces different outputs.**
Compare weights, tokenizer, runtime/kernel, quantization, adapter, chat template, and generation defaults; remove the replica and preserve request/version traces.

**Traffic spike triggers OOM and retry storm.**
Admission control must reject/queue before allocation; cap retries, circuit-break unhealthy replicas, shed low-priority traffic, and recover gradually.

## 21. Frequently Asked Questions

**Why can GPU utilization be high while latency is bad?**
Large batches maximize throughput but increase queueing and contention. Utilization is not the user SLO.

**Why are long contexts expensive?**
Prefill computation grows significantly with sequence length and KV memory grows linearly; attention implementation/model architecture determines exact scaling.

**When self-host?**
When volume, data control, model customization, or latency justifies accelerator/platform operations. Compare total cost including idle capacity and staffing.

**How do you avoid OOM?**
Admission control by tokens, context/output limits, quantization, paged KV cache, lower concurrency, and load shedding.

**Streaming vs faster generation?**
Streaming improves perceived latency/TTFT, not necessarily total completion time.

## 22. Interview Sound Bites

- "Inference capacity is constrained by tokens and KV memory, not just requests per second."
- "Prefill drives TTFT; decode drives inter-token latency and output time."
- "Continuous batching increases throughput by scheduling at token-step granularity."
- "Quantization is a quality-and-kernel benchmark, not a checkbox."
