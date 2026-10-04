# Architecture Diagram Pack (Interview Edition)

Production-style architecture diagrams for deployment, reliability, security, and event-driven design discussions.

## Quick Start

1. Pick one primary architecture from **Draw.io Blueprints**.
2. Use one matching **Sequence Diagram** to explain runtime and failure behavior.
3. Use docs in `General Tech/Visual-Architecture/` for Staff-level trade-off talking points.

## Draw.io Blueprints

| # | Diagram | Location | Best For |
|---|---|---|---|
| 1 | [Azure-AKS-Enterprise.drawio](../Azure/Azure-AKS-Enterprise.drawio) | `General Tech/Azure/` | Enterprise AKS deployment |

AWS architecture diagrams and deep-dives live in `General Tech/AWS/`.

## Sequence Diagrams

| # | Sequence | Location | Focus |
|---|---|---|---|
| 1 | [Azure-AKS-Sequence.md](../Azure/Azure-AKS-Sequence.md) | `General Tech/Azure/` | AKS runtime and progressive rollout |
| 2 | [FortiRecon-Event-Pipeline-Sequence.md](../companies/FortiRecon/FortiRecon-Event-Pipeline-Sequence.md) | `General Tech/companies/FortiRecon/` | FortiRecon EASM/DRP discovery to alert pipeline |

## Companion Docs

- [Diagram-Presentation-Playbook.md](./Diagram-Presentation-Playbook.md)
- [Production-Controls-Checklist.md](./Production-Controls-Checklist.md)
- [Sequence-Diagram-Guide.md](./Sequence-Diagram-Guide.md)

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
