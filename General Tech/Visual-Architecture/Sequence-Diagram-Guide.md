# Sequence Diagram Guide

Use these Mermaid sequence diagrams to explain **runtime behavior**, **deployment flow**, and **failure handling**.

## Role-Based Interview Tracks

### Staff Cloud Engineer
- Start with Azure AKS or AWS EKS sequences.
- Emphasize deployment safety gates, observability hooks, and rollback automation.
- Deep dive into runtime bottlenecks (cache/database/concurrency/queue lag).

### Cloud Architect
- Start with multi-region or FortiRecon sequences.
- Add one workload-specific runtime flow (Azure AKS, AWS serverless, etc.).
- Emphasize isolation boundaries, RTO/RPO trade-offs, and governance controls.

## How to Present in Interviews

1. Start with the deployment pipeline path.
2. Show runtime request path from edge to data layer.
3. Call out one failure mode and recovery behavior.
4. Mention one scale bottleneck and mitigation.
5. Close with one explicit trade-off and a phased simplification path.

## Sequence Index

| Diagram | Best Use Case | Key Concepts |
|---|---|---|
| [Azure-AKS-Sequence.md](../Azure/Azure-AKS-Sequence.md) | Azure enterprise AKS deployment | Front Door + App Gateway, AKS ingress, progressive rollout |
| [FortiRecon-Event-Pipeline-Sequence.md](../companies/FortiRecon/FortiRecon-Event-Pipeline-Sequence.md) | Security data platform design | Discovery, stream correlation, idempotent alerting |

## Staff-Level Prompt Checklist

- What is the first bottleneck under 10x traffic?
- Which failures are isolated vs customer-visible?
- Where is idempotency enforced?
- What telemetry gates block unsafe rollout?
- Which controls are mandatory Day 1 vs scale-triggered?
