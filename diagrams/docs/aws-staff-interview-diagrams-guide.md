# AWS Staff-Level Interview Diagram Guide

Use the diagram set in this folder to discuss architecture choices using tradeoffs, not just components.

## Which Diagram to Use for Which Interview Question

- Scale stateless web/API quickly:
  - [drawio/aws-ecs-fargate-ha.drawio](../drawio/aws-ecs-fargate-ha.drawio)
  - [drawio/aws-eks-multi-az.drawio](../drawio/aws-eks-multi-az.drawio)

- Minimize ops overhead and ship fast:
  - [drawio/aws-serverless-lambda.drawio](../drawio/aws-serverless-lambda.drawio)

- Extreme resilience and global traffic:
  - [drawio/aws-multi-region-active-active.drawio](../drawio/aws-multi-region-active-active.drawio)

- High-security/regulated environments:
  - [drawio/aws-zero-trust-private-eks.drawio](../drawio/aws-zero-trust-private-eks.drawio)

- Decoupled systems and asynchronous reliability:
  - [drawio/aws-event-driven-microservices.drawio](../drawio/aws-event-driven-microservices.drawio)

- Platform governance and enterprise scale:
  - [drawio/aws-multi-account-landing-zone.drawio](../drawio/aws-multi-account-landing-zone.drawio)

- Hybrid enterprise networking and migration scenarios:
  - [drawio/aws-hybrid-connectivity-dx-vpn.drawio](../drawio/aws-hybrid-connectivity-dx-vpn.drawio)

- Identity and secrets at enterprise scale:
  - [drawio/aws-centralized-identity-secrets.drawio](../drawio/aws-centralized-identity-secrets.drawio)

## Staff-Level Talking Points

- Define SLOs first, then choose architecture shape.
- Explain blast-radius boundaries and failure domains.
- Quantify tradeoffs: latency, consistency, availability, and cost.
- Show deployment safety: progressive rollout, rollback, and observability gates.
- Show data safety: backups, replication, and tested restore paths.
- Show security posture: identity model, key management, traffic controls, and auditability.

## Networking Concepts to Explicitly Mention

- Public vs private subnet boundaries and least privilege routes.
- NAT per AZ to avoid zonal egress dependency.
- Security groups vs NACL responsibilities.
- Route 53 routing policies and health checks.
- CloudFront + WAF + Shield edge protections.
- VPC endpoints/PrivateLink for private service access.
- Transit Gateway for hub-and-spoke multi-VPC topologies.

## Sequence Walkthrough References

- [sequence/aws-ecs-fargate-sequence.md](../sequence/aws-ecs-fargate-sequence.md)
- [sequence/aws-multi-region-failover-sequence.md](../sequence/aws-multi-region-failover-sequence.md)
- [sequence/aws-event-driven-sequence.md](../sequence/aws-event-driven-sequence.md)
