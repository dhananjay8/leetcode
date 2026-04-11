# DevOps Interview — Top 50 Questions & Answers

## General DevOps

**Q1: What is DevOps?**
A culture and set of practices that combines software development (Dev) and IT operations (Ops). Goal: shorten the development lifecycle while delivering high quality. Key practices: CI/CD, IaC, monitoring, automation, collaboration.

**Q2: What is Infrastructure as Code?**
Managing infrastructure through code instead of manual processes. Benefits: version controlled, repeatable, auditable, testable. Tools: Terraform (multi-cloud), CloudFormation (AWS), Pulumi (programming languages).

**Q3: Explain the CI/CD pipeline you've built.**
*(Tailor to your experience)* Typical: Push to Git → GitHub Actions runs tests → Build Docker image → Push to ECR → Terraform provisions infra → ArgoCD deploys to K8s → Health checks → Slack notification.

**Q4: How do you handle a production incident?**
1. **Detect**: Alerts fire (PagerDuty)
2. **Triage**: Assess severity, communicate in incident channel
3. **Mitigate**: Rollback deployment, scale up, redirect traffic
4. **Fix**: Identify root cause, deploy fix
5. **Post-mortem**: Blameless review, action items to prevent recurrence

**Q5: Difference between Continuous Delivery and Continuous Deployment?**
Delivery = automated pipeline up to staging, manual approval for prod. Deployment = fully automated to prod, no human gate. Most companies use Delivery (manual approval for prod).

## Docker & Containers

**Q6: What is a container?**
Lightweight, portable package containing application + dependencies. Uses kernel namespaces (isolation) and cgroups (resource limits). Shares host OS kernel (unlike VMs which run full OS).

**Q7: Docker image vs container?**
Image = read-only template (blueprint). Container = running instance of an image. You can create multiple containers from one image.

**Q8: How do you debug a container that keeps crashing?**
```bash
docker logs <container>           # check error logs
docker inspect <container>        # check config, exit code
docker run -it <image> sh         # override CMD, get shell
docker events                     # watch events in real-time
```

## Cloud & Networking

**Q9: What is a VPC and why do you need it?**
Virtual Private Cloud — isolated network in the cloud. You control: IP ranges (CIDR), subnets, routing, firewalls. Segregate environments (prod/staging), control ingress/egress.

**Q10: How does a load balancer work?**
Distributes incoming traffic across multiple backend servers. ALB (Layer 7): HTTP routing, path-based rules. NLB (Layer 4): TCP/UDP, ultra-low latency. Health checks remove unhealthy backends.

**Q11: What is the difference between horizontal and vertical scaling?**
- **Vertical**: Bigger machine (more CPU/RAM). Simpler, has limits.
- **Horizontal**: More machines. Scales infinitely, needs load balancer, app must be stateless.

## Terraform

**Q12: What is Terraform state?**
JSON file tracking real infrastructure. Maps config to resource IDs. Must be remote (S3) with locking (DynamoDB) for teams.

**Q13: How do you manage multiple environments with Terraform?**
Option A: Workspaces (`terraform workspace new staging`). Option B: Separate state files + tfvars per environment (preferred for large projects). Option C: Terragrunt for DRY multi-env configs.

## Monitoring & SRE

**Q14: What are the four golden signals?**
Latency, Traffic, Errors, Saturation. Monitor these for any service.

**Q15: What is an error budget?**
If SLO is 99.9%, you have 43.2 min of downtime/month. Spend it on risky deployments. Used up → slow down, focus on reliability.

**Q16: How do you set up alerting that doesn't cause alert fatigue?**
Only alert on actionable items. Use severity levels. Group related alerts. Require alerts to have runbooks. Review and prune noisy alerts regularly.

## Scenario-Based

**Q17: Your website is down. Walk me through troubleshooting.**
1. Check monitoring dashboards — what broke?
2. Check DNS — `dig example.com`
3. Check load balancer — healthy targets?
4. Check application — pods running? `kubectl get pods`
5. Check logs — `kubectl logs <pod>`
6. Check dependencies — DB, cache, external APIs
7. Check recent changes — was something deployed?
8. Check resources — disk full? OOM killed?

**Q18: You need to migrate a database with zero downtime. How?**
1. Set up replication from old → new DB
2. Wait for replication lag to reach 0
3. Switch application to new DB (via config/DNS change)
4. Verify, then decommission old DB
5. Use blue-green or feature flag for the cutover

**Q19: How do you ensure high availability for a stateless web application?**
Multi-AZ deployment, ALB, Auto Scaling Group (min 2 instances), health checks, RDS Multi-AZ, S3 for static assets, CloudFront CDN, Route 53 failover routing.

**Q20: A deployment caused a spike in errors. What do you do?**
1. Immediate: Rollback (`kubectl rollout undo` or revert commit)
2. Verify: Error rate returns to normal
3. Investigate: Compare old vs new code, check logs for new error patterns
4. Fix: Create proper fix, add tests to prevent regression
5. Re-deploy with monitoring
