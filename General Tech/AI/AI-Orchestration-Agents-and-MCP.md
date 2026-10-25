# LangChain, LangGraph, Agents & MCP

## 1. First Response

> "I use a deterministic workflow when the steps are known and an agent only when the model must choose the next action. LCEL composes mostly linear runnables; LangGraph models stateful branches, fan-out/fan-in, loops, checkpoints, and human interrupts."

## 2. LCEL / Runnable Composition

A Runnable maps input to output and supports composition, async execution, batching, streaming, tracing, retries, and configuration.

```text
input → retriever → prompt → model → parser → validated output
```

Use LCEL for straightforward pipelines. Parallelize independent retrieval/profile/history calls to reduce critical-path latency.

### Streaming caveat

After partial output reaches a client, retrying can duplicate text. Define replay/resume semantics, propagate cancellation, bound buffers, and apply backpressure.

## 3. LangGraph

LangGraph is a stateful computation graph:

- **State:** explicit typed workflow data.
- **Node:** state → partial state update.
- **Edge:** fixed transition.
- **Conditional edge:** runtime routing.
- **Reducer:** deterministic merge for parallel branches.
- **Checkpoint:** durable snapshot addressed by thread/run identity.
- **Interrupt:** pause for external/human input.
- **Subgraph:** reusable workflow with an explicit state boundary.

```text
START → retrieve → grade
                  ├─ sufficient → generate → validate → END
                  └─ weak → rewrite ─────────────┘
```

Every loop needs termination by iteration count, deadline, token/cost budget, or confidence threshold.

## 4. Fan-Out/Fan-In

```text
              ┌→ branch A ─┐
input → split ├→ branch B ─┼→ reducer/join → output
              └→ branch C ─┘
```

Staff-level invariants:

- Branches write disjoint keys or use an associative reducer.
- The join waits for all intended branches—not merely the first arrival.
- Concurrency is bounded.
- Partial failure policy is explicit.
- Retries are idempotent.
- Correlation and child run IDs remain traceable.

## 5. Workflow vs Agent

| Dimension | Workflow | Agent |
|---|---|---|
| Control | Code chooses steps | Model chooses next action |
| Predictability | High | Lower |
| Testability | Easier | Trajectory evaluation needed |
| Cost/latency | Bounded | Variable |
| Best fit | Stable business process | Open-ended task/tool selection |

Start deterministic; add agency only where it creates measurable value.

## 6. Agent Loop

```text
observe → reason/plan → select tool → authorize → execute
→ observe result → update state → stop or continue
```

Stopping conditions: max steps, deadline, budget, terminal tool result, repeated-action detection, confidence threshold, or human interrupt.

### Reasoning patterns

- **ReAct:** interleave reasoning and actions.
- **Plan-and-execute:** create plan, execute steps, replan on changes.
- **Reflection:** critique/revise; bound it to avoid loops.
- **Tree search:** explore candidates; expensive, reserve for high-value problems.
- Do not expose private chain-of-thought; persist concise decisions/tool traces instead.

## 7. Agent State and Memory

Keep state minimal and typed. Separate:

- Immutable request identity and policy.
- Working artifacts.
- Tool observations.
- Budget/deadline.
- Retry/step counts.
- Approval status.
- Final response.

Subgraphs should receive explicit input/output adapters—not the entire parent state.

## 8. Checkpointing and Recovery

A checkpoint enables resume, not automatically exactly-once execution.

- Stable run ID is an idempotency key.
- Side-effecting nodes need their own idempotency key/transaction.
- A crash after effect but before checkpoint can replay the effect.
- Persist result/effect atomically when possible, or reconcile.
- Version graph/state schemas and define migration policy.

## 9. Human-in-the-Loop

Use interrupts for high-impact, ambiguous, or policy-sensitive actions.

```text
agent proposes action → persist proposal → notify reviewer
→ approve/edit/reject → resume from checkpoint
```

Approval must bind to the exact action payload/version; otherwise a changed action could execute under stale approval.

## 10. MCP — Model Context Protocol

MCP standardizes how an AI host discovers and invokes external capabilities.

| Component | Responsibility |
|---|---|
| Host | AI application/orchestrator |
| Client | Connection from host to an MCP server |
| Server | Publishes capabilities |
| Tool | Callable operation |
| Resource | Readable context/data |
| Prompt | Reusable prompt template |

MCP improves interoperability—not trust. The host still enforces server allowlists, identity, authorization, schemas, timeouts, network controls, audit, and user confirmation.

## 11. Multi-Agent Systems

Use multiple agents only when roles have genuinely different tools, context, policies, or parallelizable objectives. Otherwise they add communication overhead, emergent failure modes, and evaluation complexity.

Patterns: supervisor-worker, router-specialists, debate/reviewer, blackboard/shared workspace.

Risks: loops, contradictory state, privilege escalation through delegation, duplicated calls, shared-memory contamination, and unclear accountability.

## 12. Repository-Aware Coding Agents

Safe workflow:

```text
map repo → identify authoritative code/tests → propose bounded plan
→ edit smallest surface → run focused tests/lint → inspect diff
→ summarize assumptions and unresolved risks
```

Security: never expose secrets, sandbox commands, constrain write paths, review dependency changes, resist prompt injection in repository text, and require approval for destructive/network actions.

## 13. State Schema and Reducer Design

Treat graph state as a versioned API, not an arbitrary dictionary.

- Separate immutable identity/policy from mutable working state.
- Store references to large artifacts rather than raw bytes in every checkpoint.
- Define ownership of each field and whether updates replace, append, or merge.
- Parallel reducers should be associative and preferably commutative; arrival order must not change the outcome.
- Avoid unbounded message/tool-output accumulation; summarize or externalize with provenance.
- Include schema version and migration/adaptation rules.

For a map reducer, branches should write unique stable keys. For lists, define deduplication and ordering explicitly; naive concatenation makes retries duplicate entries.

## 14. Durable Execution and Replay Windows

Checkpointing records progress, but a node can fail in these windows:

```text
before effect
→ effect succeeds
→ checkpoint fails
→ node replays
```

Classify nodes:

- **Pure:** safe to replay.
- **Read-only external:** replayable with time/version caveats.
- **Idempotent effect:** replay with stable key.
- **Non-idempotent effect:** transaction, outbox, approval, or reconciliation required.

Persist an effect intent and stable operation ID before execution; record outcome after. On unknown outcome, query/reconcile rather than repeat blindly.

## 15. Tool Gateway and Capability Security

A tool definition is not authorization. The gateway should enforce:

- Caller/run/tenant identity independent of model-supplied arguments.
- Tool and resource allowlists by workflow/policy.
- JSON schema plus semantic validation and size limits.
- Read/write separation and least-privilege credentials.
- Deadlines, rate limits, idempotency keys, and audit.
- Network egress/sandbox restrictions.
- Output size/type sanitization before returning to context.
- Exact-payload human approval for high-impact actions.

Never allow the model to choose another tenant ID, role, or approval scope merely by emitting an argument.

## 16. Agent Budgets and Scheduling

Budget every run by:

- Wall-clock deadline.
- Model/tool steps.
- Input/output tokens and spend.
- Parallel branches and tool concurrency.
- Maximum context/tool-result bytes.
- Human-wait expiration.

Reserve budget for final synthesis and cleanup. If a run spends all tokens on exploration, it cannot safely conclude. Prefer value-of-information routing: call another tool only when its expected decision value exceeds latency/cost/risk.

## 17. Multi-Agent Coordination Semantics

Before adding agents, define:

- Authority hierarchy and final decision owner.
- Private versus shared state.
- Message schema and provenance.
- Conflict resolution and termination.
- Delegation depth and budget inheritance.
- Tool permissions per role.
- Duplicate-work prevention.

A supervisor-worker design is often easier to bound than peer-to-peer negotiation. Shared blackboards need optimistic locking/versioning or append-only events to prevent lost updates. Evaluate whether multiple deterministic specialist tools would be simpler.

## 18. MCP Production Operations

Treat each MCP server as a third-party capability boundary even when internal.

- Pin/allowlist server identity and capability versions.
- Authenticate transport and authorize each invocation.
- Validate tool/resource schemas; detect breaking changes.
- Apply per-server timeouts, concurrency, circuit breakers, and egress rules.
- Audit discovery and calls without logging secrets.
- Handle server disappearance or capability revocation mid-run.
- Prevent confused-deputy delegation across users/tenants.

Dynamic discovery should not mean dynamic trust. Newly discovered tools require policy approval before model visibility.

## 19. Agent Evaluation and Release Gates

Evaluate:

- End-task success and justified abstention.
- Tool choice, arguments, authorization, and side effects.
- Trajectory efficiency: steps, repeated calls, latency, tokens, cost.
- Recovery from tool/model failure.
- Stop behavior and budget compliance.
- Injection resistance and cross-tenant isolation.
- Human approval correctness.

Use deterministic simulated tools for repeatable trajectories, then integration tests for real contracts. Shadow/canary new agent policies because small prompt/model changes can alter tool choice distributions.

## 20. Agent Incident Response

If an unsafe action occurs:

1. Disable the tool/workflow route and revoke credentials.
2. Preserve run state, prompts, model/tool versions, approvals, and tool audit.
3. Reconcile or compensate external effects.
4. Identify whether failure was authorization, schema, stale state, model choice, approval binding, or idempotency.
5. Add deterministic controls and trajectory regression tests.
6. Re-enable gradually with narrowed capability.

Changing the prompt alone is not a sufficient corrective action for an authorization or side-effect failure.

## 21. Frequently Asked Questions

**LCEL or LangGraph?**
LCEL for composable acyclic pipelines; LangGraph when state, branches, loops, fan-out joins, checkpoint/resume, or human approval become first-class.

**How do you prevent infinite agents?**
Hard step/deadline/cost limits, repeated-action detection, terminal schemas, and human escalation.

**Does checkpointing guarantee exactly once?**
No. It records workflow progress; external side effects still need idempotency and reconciliation.

**When should a workflow remain non-agentic?**
When business steps are known, regulated, latency-sensitive, or easy to encode. Deterministic code is cheaper and easier to test.

**How do you test an agent?**
Unit-test tools and policy, integration-test trajectories, evaluate task completion/side effects/cost/steps, adversarial-test injection, and replay production traces.

## 22. Interview Sound Bites

- "Agency is a control-plane decision, not a marketing label."
- "A checkpoint gives at-least-once resume unless side effects are independently idempotent."
- "Parallel state needs an explicit reducer and a real barrier."
- "MCP standardizes capability exchange; it does not authorize capabilities."
- "I start with a workflow and earn each agentic decision with an eval."
