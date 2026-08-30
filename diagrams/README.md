# E2E Deployment Blueprints for React/Vite + Node.js/Express (Monorepo)

This workspace contains production-ready architecture diagrams for multiple deployment approaches using a single GitHub repository containing both frontend and backend code.

## Draw.io Diagrams

1. [drawio/aws-ec2-ha.drawio](drawio/aws-ec2-ha.drawio)
   - EC2 Auto Scaling, ALB, RDS Multi-AZ, Redis, CloudFront/WAF, strong VPC segmentation.

2. [drawio/aws-eks-multi-az.drawio](drawio/aws-eks-multi-az.drawio)
   - EKS multi-AZ, ALB Ingress, HPA/autoscaling, Aurora, Redis, service mesh readiness.

3. [drawio/aws-serverless-lambda.drawio](drawio/aws-serverless-lambda.drawio)
   - S3 + CloudFront frontend, API Gateway + Lambda backend, async event backbone.

4. [drawio/azure-aks-enterprise.drawio](drawio/azure-aks-enterprise.drawio)
   - AKS enterprise deployment with Front Door, App Gateway, ACR, managed data services.

5. [drawio/aws-ecs-fargate-ha.drawio](drawio/aws-ecs-fargate-ha.drawio)
   - AWS ECS Fargate production pattern with ALB, ECR, Aurora, Redis, and secure CI/CD.

6. [drawio/aws-multi-region-active-active.drawio](drawio/aws-multi-region-active-active.drawio)
   - Staff-level global architecture with multi-region active-active traffic and data strategy.

7. [drawio/aws-zero-trust-private-eks.drawio](drawio/aws-zero-trust-private-eks.drawio)
   - Zero-trust private EKS model with strict network and identity controls.

8. [drawio/aws-event-driven-microservices.drawio](drawio/aws-event-driven-microservices.drawio)
   - Event-driven microservice architecture with outbox, EventBridge, SQS, and DLQ patterns.

9. [drawio/aws-multi-account-landing-zone.drawio](drawio/aws-multi-account-landing-zone.drawio)
   - Multi-account landing zone with shared services VPC and centralized logging/security services.

10. [drawio/aws-hybrid-connectivity-dx-vpn.drawio](drawio/aws-hybrid-connectivity-dx-vpn.drawio)
   - Hybrid enterprise architecture with Direct Connect primary path, VPN failover, and segmented on-prem domains.

11. [drawio/aws-centralized-identity-secrets.drawio](drawio/aws-centralized-identity-secrets.drawio)
   - Centralized identity and secrets architecture with OIDC, IAM Identity Center, KMS hierarchy, and rotation flows.

## Sequence Diagrams

1. [sequence/aws-ec2-ha-sequence.md](sequence/aws-ec2-ha-sequence.md)
2. [sequence/aws-eks-sequence.md](sequence/aws-eks-sequence.md)
3. [sequence/aws-serverless-sequence.md](sequence/aws-serverless-sequence.md)
4. [sequence/azure-aks-sequence.md](sequence/azure-aks-sequence.md)
5. [sequence/aws-ecs-fargate-sequence.md](sequence/aws-ecs-fargate-sequence.md)
6. [sequence/aws-multi-region-failover-sequence.md](sequence/aws-multi-region-failover-sequence.md)
7. [sequence/aws-event-driven-sequence.md](sequence/aws-event-driven-sequence.md)

## Interview-Focused Topics Covered

- Monorepo deployment options: VM, containers, serverless, and Kubernetes.
- Multi-region active-active tradeoffs: consistency, latency, blast radius, and cost.
- Zero-trust platform design: private clusters, policy as code, and workload identity.
- Event-driven reliability: idempotency, outbox pattern, retries, and DLQ replay.
- Advanced AWS networking: TGW, PrivateLink, endpoints, firewalling, and DNS policies.
- Multi-account governance: Control Tower, SCPs, identity federation, and centralized security telemetry.
- Hybrid networking: BGP route control, DX/VPN failover, and segmented north-south/east-west policy.
- Centralized identity and key management: OIDC trust boundaries, STS federation, KMS hierarchy, and secret rotation lifecycle.

## Monorepo CI/CD Baseline (applies to all)

- One repo with folders like frontend/ and backend/.
- Pull request checks: lint, unit/integration tests, SAST, dependency scanning, IaC scanning, secret scanning.
- Build pipeline: immutable artifacts/images, signed builds, SBOM generation.
- Deploy pipeline: OIDC federation (no long-lived cloud keys), progressive deployment (blue/green or canary), automatic rollback.

## Availability and DR Baseline

- Multi-AZ at minimum for compute and data.
- Health checks at DNS and load balancer layers.
- Backups with tested restore drills.
- Cross-region strategy for critical systems (active-passive or active-active based on RTO/RPO).

## Security Baseline

- Defense in depth: WAF, DDoS protection, SG/NACL segmentation, private subnets.
- Encrypt in transit (TLS) and at rest (KMS-managed keys).
- Secret management in cloud-native services (no plaintext secrets in CI).
- Centralized audit trail and security analytics.
