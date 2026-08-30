# Architecture Diagram Pack (Interview Edition)

Production-style architecture diagrams for deployment, reliability, security, and event-driven design discussions.

## Quick Start

1. Pick one primary architecture from **Draw.io Blueprints**.
2. Use one matching **Sequence Diagram** to explain runtime and failure behavior.
3. Use docs in `diagrams/docs/` for Staff-level trade-off talking points.

## Draw.io Blueprints

| # | Diagram | Best For |
|---|---|---|
| 1 | [drawio/aws-ec2-ha.drawio](drawio/aws-ec2-ha.drawio) | Classic EC2 HA stack with ALB + Multi-AZ DB |
| 2 | [drawio/aws-eks-multi-az.drawio](drawio/aws-eks-multi-az.drawio) | Kubernetes production baseline on AWS |
| 3 | [drawio/aws-serverless-lambda.drawio](drawio/aws-serverless-lambda.drawio) | Serverless-first architecture with async backbone |
| 4 | [drawio/azure-aks-enterprise.drawio](drawio/azure-aks-enterprise.drawio) | Enterprise AKS deployment |
| 5 | [drawio/aws-ecs-fargate-ha.drawio](drawio/aws-ecs-fargate-ha.drawio) | Containerized workloads without cluster ops overhead |
| 6 | [drawio/aws-multi-region-active-active.drawio](drawio/aws-multi-region-active-active.drawio) | Global active-active strategy |
| 7 | [drawio/aws-zero-trust-private-eks.drawio](drawio/aws-zero-trust-private-eks.drawio) | Zero-trust and private-cluster posture |
| 8 | [drawio/aws-event-driven-microservices.drawio](drawio/aws-event-driven-microservices.drawio) | Event-driven services with outbox + DLQ |
| 9 | [drawio/aws-multi-account-landing-zone.drawio](drawio/aws-multi-account-landing-zone.drawio) | Multi-account governance model |
| 10 | [drawio/aws-hybrid-connectivity-dx-vpn.drawio](drawio/aws-hybrid-connectivity-dx-vpn.drawio) | Hybrid cloud and datacenter connectivity |
| 11 | [drawio/aws-centralized-identity-secrets.drawio](drawio/aws-centralized-identity-secrets.drawio) | Identity federation and key/secrets architecture |

## Sequence Diagrams

| # | Sequence | Focus |
|---|---|---|
| 1 | [sequence/aws-ec2-ha-sequence.md](sequence/aws-ec2-ha-sequence.md) | CI/CD + runtime request path on EC2 |
| 2 | [sequence/aws-eks-sequence.md](sequence/aws-eks-sequence.md) | EKS deployment and service flow |
| 3 | [sequence/aws-serverless-sequence.md](sequence/aws-serverless-sequence.md) | API Gateway + Lambda + async event pattern |
| 4 | [sequence/azure-aks-sequence.md](sequence/azure-aks-sequence.md) | AKS runtime and progressive rollout |
| 5 | [sequence/aws-ecs-fargate-sequence.md](sequence/aws-ecs-fargate-sequence.md) | ECS Fargate runtime + deploy path |
| 6 | [sequence/aws-multi-region-failover-sequence.md](sequence/aws-multi-region-failover-sequence.md) | Failure and regional traffic shift |
| 7 | [sequence/aws-event-driven-sequence.md](sequence/aws-event-driven-sequence.md) | Outbox -> EventBridge -> consumers + DLQ |
| 8 | [sequence/fortirecon-event-pipeline-sequence.md](sequence/fortirecon-event-pipeline-sequence.md) | FortiRecon EASM/DRP discovery to alert pipeline |

## Companion Docs

- [docs/aws-staff-interview-diagrams-guide.md](docs/aws-staff-interview-diagrams-guide.md)
- [docs/production-controls-checklist.md](docs/production-controls-checklist.md)
- [docs/diagram-presentation-playbook.md](docs/diagram-presentation-playbook.md)

## Interview Topics Covered

- Monorepo deployment options (VMs, containers, serverless, Kubernetes)
- Multi-region trade-offs (latency, consistency, blast radius, cost)
- Zero-trust architecture (private networking, policy, workload identity)
- Event-driven reliability (idempotency, retries, dead-letter handling, replay)
- Governance and security (multi-account controls, OIDC federation, key hierarchy)

## Diagram Rendering Tips

- Prefer Mermaid-safe labels without complex unquoted symbols.
- If a Mermaid label includes `(` or `)`, wrap it in quotes.
- Keep node labels concise and move detailed explanations to bullets below diagrams.
