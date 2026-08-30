# Sequence Diagram Guide

Use these Mermaid sequence diagrams to explain **runtime behavior**, **deployment flow**, and **failure handling**.

## Role-Based Interview Tracks

### Staff Cloud Engineer
- Start with `aws-eks-sequence.md` or `aws-ecs-fargate-sequence.md`.
- Emphasize deployment safety gates, observability hooks, and rollback automation.
- Deep dive into runtime bottlenecks (cache/database/concurrency/queue lag).

### Cloud Architect
- Start with `aws-multi-region-failover-sequence.md`.
- Add one workload-specific runtime flow (`aws-serverless-sequence.md` or `aws-ec2-ha-sequence.md`).
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
| [aws-ec2-ha-sequence.md](./aws-ec2-ha-sequence.md) | Classic VM-based architecture | Blue/green deploy, ALB routing, Multi-AZ DB |
| [aws-ecs-fargate-sequence.md](./aws-ecs-fargate-sequence.md) | Container platform without cluster management | Immutable image deploy, ALB to tasks, managed scaling |
| [aws-eks-sequence.md](./aws-eks-sequence.md) | Kubernetes production stack | Helm canary, ingress routing, observability hooks |
| [aws-serverless-sequence.md](./aws-serverless-sequence.md) | Low-ops architecture | API Gateway + Lambda, async events, mixed data stores |
| [azure-aks-sequence.md](./azure-aks-sequence.md) | Azure enterprise equivalent | Front Door + App Gateway, AKS ingress, progressive rollout |
| [aws-multi-region-failover-sequence.md](./aws-multi-region-failover-sequence.md) | Global resilience discussions | Regional failover, routing policies, continuity trade-offs |
| [aws-event-driven-sequence.md](./aws-event-driven-sequence.md) | Event-driven backends | Outbox pattern, fan-out, retry + DLQ |
| [fortirecon-event-pipeline-sequence.md](./fortirecon-event-pipeline-sequence.md) | Security data platform design | Discovery, stream correlation, idempotent alerting |

## Staff-Level Prompt Checklist

- What is the first bottleneck under 10x traffic?
- Which failures are isolated vs customer-visible?
- Where is idempotency enforced?
- What telemetry gates block unsafe rollout?
- Which controls are mandatory Day 1 vs scale-triggered?
