# AI-Assisted Software Development

## 1. First Response

> "I treat coding agents as untrusted collaborators operating inside an engineering control plane. I give them the minimum repository context and permissions needed, constrain work to reviewable diffs, and require independent evidence—tests, type/static analysis, security checks, and human review. I increase autonomy only when the task is reversible, observable, and measured to improve cycle time without increasing defects or risk."

## 2. Where AI Helps

- Repository mapping and code explanation.
- Boilerplate/refactoring with existing patterns.
- Test generation and edge-case ideation.
- Documentation and migration plans.
- Review assistance and vulnerability hypotheses.
- Debugging through targeted search/log/test loops.

Weak spots: hidden requirements, broad architectural judgment without context, dependency/API hallucination, security-sensitive code, and large unaudited changes.

### Match autonomy to risk

| Task | Default autonomy |
|---|---|
| Explanation, search, test ideas | Read-only |
| Local implementation/refactor | Scoped writes + automated verification |
| Dependencies, migrations, generated config | Explicit review/approval |
| Deploy, merge, secrets, production data | Human-owned; tightly gated or prohibited |

Assess reversibility, blast radius, data sensitivity, specification clarity, and strength of independent verification.

## 3. Repository-Aware Workflow

```text
understand request → map entry points/data flow/tests
→ identify invariants and impacted consumers
→ plan smallest safe change
→ edit → focused tests/lint/type/security
→ inspect diff → broader verification → document assumptions
```

Prefer retrieval of authoritative local code over stuffing the entire repository into context.

## 4. Context Engineering

Provide:

- Goal and acceptance criteria.
- Relevant files/symbols and architecture.
- Existing conventions/examples.
- Constraints: compatibility, security, latency.
- Test commands and definition of done.

Exclude secrets, customer data, irrelevant generated files, and broad write permissions.

## 5. Test Generation

AI can propose happy paths, boundaries, malformed inputs, concurrency/failure cases, and regression tests. Humans verify that assertions reflect intended behavior rather than current bugs.

Useful test pyramid:

- Unit: deterministic transforms/policies.
- Contract: schemas/provider adapters.
- Integration: DB/queue/tool boundaries.
- End-to-end: critical journeys.
- Property/fuzz: parsers and invariants.

## 6. AI Code Review

Ask the model to review by risk category:

- Correctness and edge cases.
- Auth/data isolation.
- Concurrency/idempotency.
- Resource lifecycle/timeouts.
- Compatibility/migrations.
- Observability and test gaps.

Do not treat model approval as a release gate by itself. Use conventional tooling and accountable reviewers.

## 7. Security

Repository text and issues can contain prompt injection. Controls:

- Trusted instruction hierarchy.
- Command/network/write allowlists.
- Sandbox and least privilege.
- Secret scanning and redaction.
- Human approval for installs, deletes, deploys, or external writes.
- Dependency provenance/SBOM/license checks.
- Audit tool calls and diffs.

Never let a coding agent publish, deploy, or merge solely because its own tests pass.

## 8. Enterprise Reference Architecture

```text
IDE/CI/user
→ identity + repository policy
→ coding-agent orchestrator
   ├─ repository retrieval/index
   ├─ model gateway
   ├─ sandboxed workspace/terminal
   └─ approved tools: build, test, lint, scan
→ diff + execution evidence
→ branch/PR protections + accountable review
→ CI/CD
```

The platform owns identity, model/data policy, sandboxing, telemetry, and common integrations. Repository teams own coding standards, acceptance criteria, tests, approval rules, and production outcomes.

### Trust boundaries

- Model output, repository text, issues, generated code, and tool output are untrusted.
- The sandbox—not the prompt—enforces file, process, network, credential, and resource boundaries.
- Production credentials and customer data should not be available to normal coding sessions.
- Agent identity must be distinguishable in commits, audit, and usage records.

## 9. Rollout and Governance

1. Baseline cycle time, review effort, defects, security findings, and developer experience.
2. Pilot read-only assistance and low-risk, well-tested task categories.
3. Add scoped writes in ephemeral sandboxes with mandatory diffs and CI.
4. Compare against a control or historical baseline by task type and experience level.
5. Expand autonomy only where quality guardrails remain stable.
6. Publish paved-road instructions, repository templates, training, and exception policy.
7. Retain kill switches, provider/model rollback, audit, and incident ownership.

Avoid measuring success by generated lines, prompts, or seats. Those are activity metrics, not engineering outcomes.

### Adoption scorecard

- **Flow:** lead/cycle time, time to first working change, PR throughput.
- **Quality:** first-pass CI, review rework, escaped defects, rollback rate.
- **Security:** findings, policy violations, secret/dependency incidents.
- **Developer experience:** acceptance, cognitive load, satisfaction by experience level.
- **Economics:** model/tool cost per accepted change and reviewer time.

Compare by task category and cohort; aggregate averages can hide increased risk in complex work.

## 10. Failure Modes and Response

| Failure | Control / response |
|---|---|
| Hallucinated API/dependency | Inspect lockfiles/symbols/docs; compile and contract-test |
| Correct-looking but wrong change | Acceptance tests, independent review, regression and mutation tests |
| Oversized diff | File/line/task limits; split architecture, migration, and rollout |
| Prompt injection in repository | Treat content as data; tool policy and sandbox remain authoritative |
| Secret/data exposure | Redaction, DLP, private endpoints, retention controls, revoke/assess incident |
| Unsafe command or supply-chain change | Approval, allowlists, provenance/SBOM, isolated install/build |
| Agent loop/cost spike | Step/time/token/spend limits; cancellation and anomaly alerts |
| Low-quality automated review | Calibrate findings, track precision/recall, keep accountable reviewers |

For an incident: stop the capability, preserve prompts/tool calls/diffs, revoke exposed credentials, assess repository and downstream impact, revert/reconcile changes, then add deterministic controls and regression cases. A prompt tweak alone is not sufficient.

## 11. Staff-Level Interview Questions

**How would you introduce coding agents to 100 engineers?**
Start with measured low-risk pilots; establish data/tool policy and sandboxing; provide repository-aware paved roads; retain PR/CI ownership; compare cycle time, review effort, defects, and security by task cohort; expand autonomy only where evidence supports it.

**Build or buy the coding-agent platform?**
Buy model capability and commodity IDE integration unless control, data residency, custom workflows, or economics justify building. Own policy, identity, repository instructions, evaluation data, telemetry, and exit paths regardless.

**How do you evaluate a coding agent?**
Use representative repository tasks with acceptance tests. Measure task success, first-pass CI, escaped defects, review rework, security violations, unnecessary edits, tool steps, latency, and cost. Include dependency, migration, concurrency, and adversarial-repository cases.

**How do you prevent metric gaming?**
Balance speed with defect/security guardrails, measure accepted outcomes rather than generated code, inspect slices, and keep developer feedback. Faster PR creation with higher review burden is not success.

**What should be centralized?**
Identity, data policy, model gateway, sandbox controls, telemetry, approved tools, and minimum gates. Keep domain architecture, repository rules, acceptance tests, and merge decisions with owning teams.

**Where should agents never be autonomous?**
Irreversible or high-blast-radius actions without strong deterministic controls: production deploys, permission changes, secret access, destructive migrations, security exceptions, and merging their own work.

## 12. Frequently Asked Questions

**How do you prevent hallucinated APIs?**
Require local dependency/version inspection, retrieve actual symbols/docs, compile/type-check, and run focused tests.

**How large should an agent task be?**
Small enough for explicit acceptance criteria and a reviewable diff. Split architecture, implementation, migration, and rollout.

**Can AI-generated tests be trusted?**
No more than generated production code. Review assertions, use coverage/mutation/property testing, and ensure tests fail before the fix where appropriate.

**How do you adopt across a company?**
Start with low-risk workflows, define data/tool policy, instrument outcomes, train reviewers, publish patterns, and expand based on measured quality—not usage volume.

**How do you keep repository context current?**
Retrieve from the checked-out commit, key indexes/caches by repository revision, prioritize authoritative code and tests, and invalidate summaries when relevant files change.

**Should the agent commit directly?**
Prefer a branch or patch with attributable identity and mandatory review. Direct commits may be acceptable only in low-risk generated repositories with equivalent protections and rollback.

## 13. Interview Sound Bites

- "The unit of safe AI coding is a reviewable diff with executable evidence."
- "Repository retrieval beats giant undifferentiated context."
- "Generated tests can encode the same misunderstanding as generated code."
- "Autonomy should scale with reversibility, observability, and independent verification."
- "The sandbox enforces security; the prompt only requests behavior."
- "Measure accepted engineering outcomes, not generated lines of code."
