# Embeddings, Vector Search & RAG

## 1. First Response

> "RAG separates knowledge retrieval from generation: retrieve authorized, relevant evidence; rerank and fit it into a context budget; generate a structured, cited answer; then evaluate retrieval and generation independently. Most RAG failures are retrieval or context-engineering failures, not model failures."

## 2. Core Mental Model

```text
Raw data → parse → structure-aware chunks → embeddings + metadata
→ vector/lexical indexes → query rewrite → hybrid retrieval
→ reranking → context selection → LLM → validated output + citations
```

## 3. Vectors and Embeddings

- A vector is an ordered numeric representation; dimensionality is fixed by the model.
- An embedding maps text/image/code into a learned vector space where relative geometry carries meaning.
- Individual dimensions are usually not interpretable.
- Similarity is meaningful only with the chosen metric and within a compatible embedding space.

| Metric | Meaning | Typical use |
|---|---|---|
| Cosine similarity | Angle, ignoring magnitude | Semantic text retrieval |
| Dot product | Alignment and magnitude | Fast search; equivalent to cosine for normalized vectors |
| Euclidean distance | Geometric distance | Spatial/index workloads |

### Model migration

Never query v1-indexed documents with a v2 query embedding unless compatibility is proven.

```text
Build v2 index → dual-write/dual-query → shadow evaluation
→ compare quality, latency, cost → gradual cutover → retire v1
```

Track `embedding_model`, `embedding_version`, dimension, normalization, and chunker version with every vector.

## 4. Chunking

Chunking defines the unit of retrieval and therefore the quality ceiling.

| Strategy | Strength | Risk |
|---|---|---|
| Fixed tokens + overlap | Simple and predictable | Splits semantic units; duplicate context |
| Sentence/paragraph | Better local coherence | Large sections may remain fragmented |
| Structure-aware | Preserves headings/tables/procedures | Parser complexity |
| Semantic | Topic-aligned boundaries | More compute and non-determinism |
| Parent-child | Retrieve small child, return larger parent | More indexing/state complexity |

Preserve metadata: tenant, document/version, section, page, line, ACL, timestamps, content hash, parser/chunker versions.

**Staff trade-off:** small chunks improve pinpoint retrieval but lose context; large chunks preserve context but dilute relevance and consume tokens. Tune using retrieval evals—not intuition.

## 5. Vector Indexes and ANN

Exact KNN is O(N) per query. Approximate nearest-neighbor indexes exchange perfect recall for latency/cost.

| Index | Mechanism | Trade-off |
|---|---|---|
| HNSW | Navigable multi-layer graph | High recall/low latency; memory-heavy and costly updates |
| IVF | Search selected centroid partitions | Tunable probes; training and partition imbalance |
| PQ | Compress vector subspaces | Lower memory; quantization hurts recall |
| Flat/exact | Compare every vector | Baseline quality; expensive at scale |

Define the SLO first: legal/compliance retrieval may favor recall; interactive assistance may prioritize P95 latency.

## 6. Metadata Filtering and Security

Authorization is part of retrieval, not post-processing.

```text
Authenticate → resolve tenant/identity → build ACL filter
→ vector/lexical search inside authorized scope → generate
```

Never retrieve globally and ask the LLM to ignore unauthorized records. Prompting is not a security boundary.

## 7. Hybrid Retrieval

Semantic search handles paraphrases; lexical search handles exact identifiers such as CVEs, policy IDs, error codes, and names.

```text
query
 ├─ BM25 / keyword candidates
 └─ vector candidates
       ↓
 reciprocal-rank fusion / weighted merge
       ↓
 cross-encoder or LLM reranker
       ↓
 top context
```

Use Reciprocal Rank Fusion when scores from different retrieval systems are not directly comparable.

## 8. Query Transformation

- **Rewrite:** normalize conversational query into standalone search query.
- **Expansion:** generate synonyms/domain terms.
- **Decomposition:** split multi-hop question into subqueries.
- **HyDE:** generate a hypothetical answer/document and embed it.
- **Routing:** choose index, tenant corpus, SQL, or web/tool path.

Guard against semantic drift: retain the original query and evaluate whether rewrites improve Recall@K.

## 9. Reranking and Context Construction

Retriever optimizes high recall; reranker optimizes precision.

Context assembly should:

- Deduplicate overlapping chunks.
- Preserve source/page/line metadata.
- Allocate an explicit token budget.
- Prefer diverse evidence over five near-duplicate chunks.
- Put instructions and untrusted retrieved content in separate channels.
- Include only evidence needed for the answer.

Increasing `top_k` is not a universal fix: it increases latency, cost, distraction, and the chance of conflicting context.

## 10. RAG Failure Taxonomy

| Symptom | Likely stage | Diagnostic |
|---|---|---|
| Relevant source absent | Ingestion/chunking/retrieval | Recall@K, parser coverage |
| Source retrieved but ranked low | Ranking | MRR/NDCG, reranker ablation |
| Correct context, wrong answer | Generation/prompt | Faithfulness/correctness |
| Correct answer, wrong citation | Attribution | Citation precision/coverage |
| Cross-tenant source | Authorization filter | Security incident; fail closed |
| Old answer | freshness/cache/indexing | Version and ingestion lag |

Debug stage-by-stage; do not change model, prompt, and retriever simultaneously.

## 11. Production Decisions

- Idempotent ingestion keyed by content hash + parser/chunker/embedding versions.
- Blue/green indexes for model/chunker migrations.
- Dead-letter invalid documents; quarantine parser failures.
- Cache embeddings for unchanged content.
- Bound fan-out and apply backpressure.
- Make citations first-class output fields.
- Delete vectors and derived artifacts when source/tenant data is deleted.

## 12. Ingestion State Machine

Model ingestion as durable versioned state:

```text
DISCOVERED → VALIDATED → PARSED → CHUNKED → EMBEDDED
→ INDEXED_LEXICAL + INDEXED_VECTOR → ACTIVE
                         └→ FAILED/QUARANTINED
ACTIVE → SUPERSEDED → DELETING → DELETED
```

Use source ID + source version/content hash + parser/chunker/embedding versions as identity. Activate a version only when required indexes and metadata are ready; otherwise queries can see a mixed partial version. Persist failure reason and support replay from the earliest invalid stage.

## 13. Physical Index and Shard Design

Choose shard/namespace boundaries from:

- Tenant isolation and data residency.
- Corpus size and query locality.
- Update/delete rate.
- Metadata-filter selectivity.
- Hot/cold access patterns.
- Rebuild and recovery time.

Too many tiny shards waste memory/operations; giant shared shards increase blast radius and filter cost. Avoid embedding every metadata field—structured filters belong in metadata/index fields. Plan replicas for query availability and benchmark concurrent filtered search, not only single-query ANN.

## 14. Filtered ANN and Recall

Metadata filters interact with ANN implementation:

- **Pre-filter:** search only authorized candidates; safe and efficient when index supports it, but selective filters may reduce graph connectivity/candidates.
- **Post-filter:** search broadly then filter; can return fewer than K and must never expose unauthorized data to downstream components.
- **Hybrid iterative filtering:** expand candidate search until enough authorized results or budget exhausts.

Authorization must be enforced within the trusted retrieval boundary. Measure Recall@K per filter selectivity/tenant size; aggregate recall can hide poor results for small tenants.

## 15. Freshness, Updates, and Deletion

Define a freshness SLO from source commit to query visibility. Use change events plus reconciliation scans because events can be missed.

For updates:

- Write immutable new version.
- Build all derived artifacts.
- Atomically mark new version active and old superseded.
- Invalidate version-scoped caches.

For deletion, maintain a tombstone/deletion ledger until chunks, vectors, lexical entries, caches, eval copies, replicas, and backups satisfy policy. Retrieval must filter tombstoned content immediately even if physical deletion is asynchronous.

## 16. Retrieval Experimentation

Change one major component at a time where possible: parser, chunker, embedding, ANN parameters, lexical analyzer, fusion, reranker, query transformation, or context builder.

Use paired evaluation:

- Retrieval Recall@K, MRR/NDCG, result diversity.
- Filter/ACL correctness.
- End-answer faithfulness/correctness/citation quality.
- P95/P99 latency, tokens, and cost.
- Slices by source type, language, tenant, query intent, and freshness.

Log candidate sets and scores for offline replay, subject to data policy. ANN parameter tuning should use an exact-search sample as a recall reference.

## 17. Context and Citation Integrity

A citation is valid only if:

1. Source identity/version is preserved.
2. The cited span exists and caller may access it.
3. The span supports the associated claim.
4. Transformations did not change meaning.
5. The source remains active or historical status is disclosed.

Validate page/line/span references and separate citation precision from citation coverage. Deduplication must retain provenance when one normalized chunk came from multiple source locations.

## 18. Scaling and Capacity

Separate ingestion and query capacity.

### Ingestion

- Batch embeddings by token count and provider limit.
- Bound parser/OCR/embedding queues independently.
- Use content hashes to skip unchanged work.
- Apply backpressure and tenant fairness.
- Monitor freshness lag, failed/quarantined documents, and index build pressure.

### Query

- Budget rewrite, lexical/vector retrieval, fusion, reranking, and generation separately.
- Bound candidates and reranker concurrency.
- Cache authorized stable retrieval with complete version scope.
- Route by corpus/tenant rather than broadcast to every shard.
- Use replicas for throughput; understand index update/replication lag.

At 100M vectors, memory and filter behavior can dominate. Quantization lowers memory but needs quality evaluation; HNSW may require substantial graph overhead beyond raw vector bytes.

## 19. RAG Incident Response

**Unauthorized source retrieved:** disable affected route/index/cache; preserve query/filter trace; assess exposure; repair authorization/indexing and add security regression tests.

**Fresh documents missing:** inspect change event, parser state, embedding queue, index activation, replica lag, and cache version—not the LLM first.

**Recall drops after migration:** compare embedding spaces, dimensions/normalization, chunk IDs, ANN parameters, filters, and query model; route back to blue index.

**Latency spikes:** decompose filter, vector, lexical, reranker, context, and model latency; inspect shard skew, cold cache, selective filters, and candidate growth.

## 20. Staff-Level Design Questions

**How do you choose a vector database?**
Benchmark the actual filtered workload, update/delete semantics, recall-latency-memory curve, tenancy/isolation, backup/rebuild, operational skill, and total cost. Feature checklists are insufficient.

**How do you avoid a full reindex outage?**
Immutable versioned indexes, backfill with throttling, dual-write, shadow reads, quality/freshness checks, atomic alias/routing cutover, and retained rollback.

**How do you handle documents with tables and diagrams?**
Structure-aware parsing, modality-specific extraction/embeddings where needed, parent-child context, page/bounding-box provenance, and document-type-specific eval sets.

**When is vector search unnecessary?**
Exact IDs, highly structured filters/joins, tiny corpora, deterministic lookup, or lexical-dominant queries may be better served by SQL/BM25. Route rather than force every query through vectors.

**How do you prevent retrieval cache leaks?**
Include tenant, identity/ACL scope, normalized query, filters, index/source version, and retrieval config; encrypt and expire entries; invalidate on ACL/source changes.

## 21. Frequently Asked Follow-Ups

**Why not fine-tune instead of RAG?**
RAG is better for dynamic/private knowledge, citations, and deletions. Fine-tuning changes behavior/style or teaches stable patterns; it is not a reliable mutable knowledge store. They can be combined.

**Why does cosine similarity not guarantee relevance?**
The model and training objective define the space; cosine only measures geometry within it. Domain mismatch, chunking, and query ambiguity still dominate.

**How do you choose top K?**
Tune candidate K and final context K separately against recall, faithfulness, latency, and token cost. Retrieve broad, rerank narrow.

**How do you prevent stale retrieval?**
Version documents, use event-driven reindexing, monitor ingestion lag, filter superseded versions, and include source version in cache keys.

**How do you scale to 100M vectors?**
Shard by tenant/domain when useful, use ANN with quantization, pre-filter metadata, tier hot/cold indexes, batch ingestion, and benchmark recall-latency-memory jointly.

## 22. Interview Sound Bites

- "Chunking is part of the model—the retrieval model—not preprocessing trivia."
- "Hybrid retrieval gets recall; reranking buys precision."
- "Authorization belongs in the retrieval query, before any text reaches the model."
- "Embedding migrations are index migrations; different model spaces are not automatically compatible."
- "Evaluate retrieval and generation separately or you cannot localize failures."
