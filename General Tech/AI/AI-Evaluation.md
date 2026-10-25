# AI Evaluation, DeepEval & RAGAS

## 1. First Response

> "AI evaluation is a layered measurement system, not one judge score: deterministic tests for contracts, retrieval metrics for grounding, task/answer metrics for quality, human calibration for ambiguity, and online monitoring for real-world drift."

## 2. Testing vs Evaluation

- **Tests:** deterministic behavior/contracts—schema, auth, routing, retries, state transitions.
- **Evals:** probabilistic quality—relevance, faithfulness, correctness, style, safety, task success.
- **Monitoring:** production health and drift—latency, errors, costs, distributions.

All three are required.

## 3. Evaluation Layers

1. **Component:** chunker, retriever, reranker, tool, prompt/model.
2. **Pipeline:** retrieval + context + generation.
3. **End-to-end:** real task and business outcome.
4. **Production:** sampled traffic, feedback, drift, incidents.

## 4. Dataset Design

A golden example may contain:

- Input/question and tenant/ACL context.
- Expected relevant source IDs/passages.
- Reference answer and required facts.
- Expected citations.
- Allowed/forbidden tools/actions.
- Risk/category/language/complexity labels.

Sources: expert-curated cases, production failures, edge/adversarial cases, synthetic expansion, and stratified real traffic.

Maintain:

- **Golden set:** small, high-quality, stable release gate.
- **Regression set:** every escaped defect becomes a permanent case.
- **Challenge set:** adversarial/rare/high-risk cases.

### Reference-based vs reference-free

| Mode | Inputs | Best for |
|---|---|---|
| Reference-based | Actual output + trusted answer/labels | Facts, extraction, classification, structured tasks |
| Reference-free | Input + context + actual output + rubric | Relevance, groundedness, coherence, open-ended tasks |

Reference-free scores are proxies: calibrate judges against humans and deterministic evidence where possible.

## 5. Retrieval Metrics

| Metric | What it asks |
|---|---|
| Recall@K | Did top K contain relevant sources? |
| Precision@K | How much of top K was relevant? |
| MRR | How early was first relevant result? |
| NDCG | Were graded-relevant results ordered well? |
| Context relevance | Was supplied context useful? |
| Context recall | Did context cover required evidence? |

Frameworks often call context usefulness **context precision** or **context relevance**. The invariant is the same: precision asks whether retrieved evidence is useful; recall asks whether required evidence is present.

## 6. Generation Metrics

- **Faithfulness/groundedness:** claims supported by supplied context.
- **Correctness:** answer agrees with reference/ground truth.
- **Answer relevance:** addresses the question.
- **Citation correctness/coverage:** citations support claims and important claims are cited.
- **Safety/bias/toxicity:** policy-specific harms.
- **Format compliance:** deterministic schema validation.

Faithfulness is not correctness: a response can faithfully repeat wrong context.

## 7. LLM-as-a-Judge

Useful for semantic criteria that string matching cannot capture, but calibrate it.

Risks: model bias, position/verbosity/style bias, self-preference, prompt sensitivity, nondeterminism, and correlated errors with the system under test.

Controls:

- Clear rubric and score anchors.
- Pairwise comparisons where suitable.
- Randomize candidate order.
- Blind model/prompt identity.
- Require evidence/rationale in internal eval records.
- Compare against human labels; measure agreement.
- Use multiple judges for high-stakes cases.

## 8. DeepEval and RAGAS

| Area | DeepEval | RAGAS |
|---|---|---|
| Orientation | Test-case/CI framework | RAG-focused metrics/datasets |
| Strength | Custom metrics, assertions, agent/tool evals | Retrieval/context/answer evaluation |
| Use | Regression suite integrated with pytest/CI | RAG experiment and dataset analysis |

Framework choice matters less than dataset quality, rubric validity, calibration, and release discipline.

Use generic metrics for common failure modes and deterministic/custom metrics for product contracts such as tenant isolation, required control/evidence IDs, timestamp presence, authorized tool use, and citation completeness. Security invariants are hard gates, not scores that stronger prose may offset.

## 9. Eval-Driven Development

```text
define task + SLO → build representative dataset → establish baseline
→ change one component → run paired eval → inspect slices/failures
→ human-review disagreements → canary/shadow → monitor production
→ add escaped failures to regression set
```

Version dataset, evaluator prompt/model, system prompt/model, retriever/index, and metric code for reproducibility.

## 10. Statistical Thinking

Report distributions and confidence—not just averages.

- Slice by tenant/domain/language/length/difficulty/risk.
- Bootstrap confidence intervals for small/non-normal samples.
- Use paired comparison on the same cases.
- Track win/tie/loss and practical effect size.
- Correct for repeated experimentation where necessary.
- Avoid optimizing to the judge while hurting users.

## 11. Offline vs Online

| Offline | Online |
|---|---|
| Reproducible, cheap, safe | Real behavior/distribution |
| Golden/regression cases | A/B, canary, sampled judge, feedback |
| Pre-release gate | Drift and business outcomes |
| Can miss production distribution | Needs privacy/guardrails and attribution |

Online signals include task completion, correction/escalation, abandonment, citation clicks, tool success, and user feedback—not raw thumbs-up alone.

Sample expensive production evals asynchronously. Use a random baseline sample, then oversample new versions, high-risk workflows, long contexts, low-confidence outputs, complaints, and unusual tool trajectories. Weight analysis appropriately so oversampling does not distort population estimates.

### Evals vs observability

- **Observability:** what happened—latency, errors, retries, tokens, tool calls, trace path.
- **Evaluation:** was it good—retrieval quality, faithfulness, correctness, policy compliance, task success.

A system can have zero HTTP errors and still produce poor or unsafe answers; traces and evals must share run/version identity.

## 12. Agent Evaluation

Evaluate trajectories as well as final answers:

- Task success and policy compliance.
- Correct tool selection and arguments.
- Unnecessary/repeated calls.
- Side effects and idempotency.
- Steps, latency, tokens, cost.
- Stop behavior and recovery.
- Human-intervention rate.

A correct final answer reached through an unauthorized tool call is a failed run.

## 13. Regression Gates

Use hard gates for deterministic/security failures; statistical gates for quality.

Example:

```text
schema/auth/safety critical case: 100% required
retrieval recall@10: no worse than baseline - tolerance
faithfulness: lower confidence bound above threshold
P95/cost: within budget
```

Do not collapse everything into one weighted score; a gain in style must not hide a security regression.

## 14. Debugging Failed Evals

```text
bad answer
├─ source absent? → ingestion/chunking/index/retrieval
├─ source present but low? → reranker
├─ context good? → prompt/model/generation
├─ answer good but citation bad? → attribution
├─ only production? → distribution/version/cache/drift
└─ judge disagreement? → rubric/calibration/human review
```

## 15. Evaluation Contracts and Metric Validity

Before selecting a metric, define:

```text
task → user/risk → acceptable outcome → observable evidence
→ metric/rubric → threshold → decision enabled by threshold
```

A metric is useful only if it changes a release or operational decision. Validate construct validity: does citation precision represent user trust, or merely formatting? Track proxy gaming and periodically compare metric movement with human/business outcomes.

### Threshold selection

- Set safety/security constraints as hard non-compensating gates.
- Derive quality thresholds from baseline, user tolerance, and human agreement—not round numbers.
- Use confidence bounds for noisy metrics.
- Define a minimum detectable effect before running experiments.
- Establish practical significance; a statistically significant 0.2% gain may not justify cost.

## 16. Annotation and Human Calibration

A reliable labeling process needs:

- Written rubric with positive, negative, and borderline anchors.
- Annotator training and blinded examples.
- Multiple labels on a calibration subset.
- Inter-rater agreement such as Cohen's kappa or Krippendorff's alpha where appropriate.
- Adjudication by domain experts.
- Tracking annotator/rubric versions and disagreement reasons.

Disagreement is information: it may reveal an ambiguous task or policy, not bad annotators. Do not hide it by averaging.

## 17. Experiment Design

For a model/prompt/retrieval change:

1. Freeze candidate and baseline versions.
2. Run paired evaluation on identical examples.
3. Stratify by critical slices before aggregate comparison.
4. Bootstrap confidence intervals or use an appropriate paired test.
5. Inspect regressions manually, especially high-risk cases.
6. Estimate latency/cost change and operational capacity.
7. Shadow/canary online using deterministic assignment.
8. Stop or roll back on predeclared guardrails.

Avoid test-set overfitting: maintain hidden holdouts, rotate production samples, limit repeated manual tuning against the same golden set, and preserve a challenge set.

## 18. Production Evaluation and Drift Detection

Production evaluation combines delayed ground truth, sampled judgments, implicit behavior, and incidents.

Monitor:

- Input/topic/language/context-length distributions.
- Retrieval score/candidate/source distributions.
- Abstention, escalation, fallback, and correction rates.
- Tool trajectories and side effects.
- Quality by model/prompt/index version.
- Judge score distributions with stable anchor traffic.

Use control charts or statistically justified alerts rather than alerting on every noisy score change. Distinguish data drift, concept/policy drift, model drift, retrieval drift, and evaluator drift because remediation differs.

## 19. Evaluation Platform Architecture

```text
dataset registry + artifact/version store
→ eval orchestrator → system-under-test adapters
→ deterministic metric workers + judge workers
→ human adjudication queue
→ slice/comparison store → dashboards + CI/release policy
```

Platform requirements:

- Immutable run manifests and reproducible artifacts.
- Async execution, caching, retries, budget controls.
- Data access/retention and PII redaction.
- Judge/provider quotas and cost attribution.
- Extensible custom metrics with reviewed ownership.
- Baseline comparisons and audit of gate overrides.

## 20. Evaluation Governance

- Every metric has an owner, definition, failure semantics, and review cadence.
- Dataset additions require provenance, consent, de-identification, and leakage review.
- Critical releases require named approval and documented exceptions.
- Judge/model changes trigger recalibration, not silent score continuation.
- Retire stale metrics and datasets as product behavior changes.
- Separate teams may own platform execution and domain rubrics; domain experts remain accountable for meaning.

## 21. Responding to a Quality Incident

```text
freeze rollout → preserve traces/versions → identify affected slices
→ compare stable anchors → localize retrieval/model/prompt/tool/cache
→ mitigate/rollback → assess users/side effects
→ add regression cases and detection → review release gate
```

Do not retroactively tune the evaluator solely to make the incident disappear. Record whether the evaluation suite failed to represent the case, the metric failed to detect it, or the release process ignored the signal.

## 22. Staff-Level Design Questions

**How do you evaluate without ground truth?**
Use rubric-based human/judge evaluation, pairwise preference, factual verification tools, behavioral outcomes, and targeted expert adjudication. Be explicit that the signal is a proxy and calibrate it.

**How do you evaluate rare catastrophic failures?**
Curated adversarial/challenge sets, red teaming, simulation, policy invariants, fault injection, and hard deterministic gates. Average production sampling will not provide enough examples.

**How do you compare models with different refusal styles?**
Define task-specific utility: correct answer, justified abstention, unsafe answer, and unnecessary refusal have different costs. Build a cost matrix and report slices.

**Who owns the quality SLO?**
The product/domain owner owns outcome quality; the platform team owns measurement reliability and execution infrastructure. Shared ownership without decision rights becomes no ownership.

**How do you estimate evaluator cost?**
Dataset size × candidates × judge calls × repetitions × average tokens, plus human adjudication. Cache immutable evaluations and tier fast PR checks versus broader scheduled suites.

## 23. Frequently Asked Questions

**How large should an eval set be?**
Large enough for representative slices and confidence. Start with tens of expert cases, grow to hundreds/thousands from production failures; prioritize coverage over arbitrary size.

**Can synthetic data replace humans?**
It accelerates breadth but may inherit model biases and miss real distributions. Seed from real/expert examples and audit synthetic cases.

**RAGAS or DeepEval?**
RAGAS for standard RAG analysis; DeepEval for test-style CI/custom/agent metrics. Either can work—the evaluation contract is the key.

**How do you prevent judge drift?**
Pin judge model/prompt, keep human-calibrated anchor cases, track agreement, and rerun baseline when judge changes.

**What goes into CI?**
Fast deterministic tests every commit; small golden smoke eval on PR; broader/stochastic suite nightly or pre-release; online canary afterward.

## 24. Interview Sound Bites

- "The dataset and rubric matter more than the eval framework."
- "Faithfulness asks whether context supports the answer; correctness asks whether reality does."
- "One aggregate score hides the exact regressions staff engineers need to stop."
- "Every production escape should become a regression case."
- "Evaluate agent trajectories—not just polished final text."
