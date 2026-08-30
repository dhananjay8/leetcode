# Diagram Presentation Playbook (Staff/Director Rounds)

Use this playbook to explain diagrams with ownership-level clarity.

## 1) 60-Second Opening
- State the business objective first.
- Name the architecture style (event-driven, multi-tenant, active-active, etc.).
- Call out the top 2-3 non-functional priorities.

## 2) Walkthrough Order
1. Ingress and trust boundary
2. Stateless compute path
3. Data path (transactional + analytical)
4. Async path (queues, stream processing)
5. Reliability and failure controls
6. Security and compliance controls
7. Scaling knobs and bottlenecks

## 3) What Interviewers Expect at Staff Level
- Clear SLO-aligned choices, not tool memorization.
- Trade-off awareness (latency, consistency, cost, complexity).
- Failure-mode handling and blast-radius control.
- Safe deployment and rollback strategy.

## 4) Phrases to Use
- "I am optimizing for predictable latency under bursty load."
- "This boundary prevents control-plane impact from data-plane spikes."
- "I would start simpler and introduce this component only after measured bottlenecks."
- "This subsystem is eventually consistent by design; user-critical writes stay strongly consistent."

## 5) Common Pitfalls to Avoid
- Spending too long on one component (e.g., Kafka internals).
- Presenting every technology as mandatory from day one.
- Ignoring tenant isolation and idempotency.
- Missing observability or deployment safety.

## 6) 30-Second Closing Template
- Reiterate architecture shape and core trade-off.
- Confirm reliability, security, and operability posture.
- Mention phased rollout and simplification path.
