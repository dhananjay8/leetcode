# Production-Grade Controls Checklist

## AWS Networking Concepts Covered Across Blueprints

- VPC CIDR planning and subnet tiering (public/app/data).
- Multi-AZ design and AZ-aware routing.
- Internet Gateway (IGW) and egress via NAT Gateway per AZ.
- Route Tables with explicit east-west and north-south control.
- Network ACLs (stateless) and Security Groups (stateful).
- ALB/NLB ingress patterns and cross-zone balancing.
- Route 53 routing policies (latency/failover/weighted) with health checks.
- CloudFront edge acceleration and origin shielding.
- AWS WAF and Shield for L7/L3-L4 protection.
- VPC Endpoints (Gateway + Interface) for private service access.
- PrivateLink for private service exposure.
- Transit Gateway for multi-VPC connectivity.
- VPC Peering for direct VPC links where suitable.
- AWS Network Firewall for centralized egress filtering.
- VPC Flow Logs and Traffic Mirroring for forensic visibility.
- Hybrid connectivity options: VPN/Direct Connect considerations.

## Security and Compliance Controls

- IAM least privilege and role separation for CI/CD and runtime.
- Federated identity (OIDC) from GitHub Actions to cloud IAM.
- KMS-managed encryption keys and automatic key rotation.
- Secrets in Secrets Manager / Key Vault, never in repo.
- Continuous vulnerability scanning and policy gates in CI.
- Runtime threat detection (GuardDuty/Defender) and SIEM forwarding.

## Scalability and Resilience Controls

- Horizontal autoscaling (ASG/HPA/Karpenter/Lambda concurrency).
- Graceful degradation with caching and queue-backed async processing.
- Circuit breakers, retries, timeouts, and idempotency on APIs.
- Multi-AZ databases and read replicas.
- Capacity planning and load testing before peak events.

## Operational Excellence

- Golden dashboards for latency, saturation, errors, traffic, cost.
- SLOs and alerting thresholds with actionable runbooks.
- Immutable infrastructure and reproducible environment promotion.
- Backup/restore drills and game-day failure testing.
