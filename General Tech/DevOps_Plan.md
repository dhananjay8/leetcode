# DevOps Learning Plan (52 Weeks)

Interview-focused progression from fundamentals to production-style projects.

## Phase 1 (Weeks 1–4): Foundations
- Linux basics (files, users, services)
- Git & GitHub (clone, branch, PR)
- Networking basics (IP, DNS, HTTP)
- Go or Python scripting

## Phase 2 (Weeks 5–8): Cloud Basics
- Pick one cloud (AWS or Azure)
- IAM and permissions
- Compute (EC2/VMs) and storage (S3/Blob)
- VPC / Virtual Network and subnets
- Load balancers and security groups / NSGs

## Phase 3 (Weeks 9–12): Containers
- Docker fundamentals (images, containers)
- Dockerfile, build, tag, push
- Volumes and basic networking
- Container registry (ECR/ACR/Docker Hub)
- Local multi-container app with Docker Compose

## Phase 4 (Weeks 13–16): CI/CD
- CI concepts (build, test, artifact)
- Pipeline in GitHub Actions or Jenkins
- Run tests on every commit
- Build and push Docker images from pipeline
- Basic CD to test VM/server

## Phase 5 (Weeks 17–20): Infrastructure as Code
- Terraform basics (providers, resources)
- Remote state and state locking
- Variables, outputs, modules
- Create VPC, subnets, compute with Terraform
- Store Terraform in Git and run via pipeline

## Phase 6 (Weeks 21–26): Kubernetes Fundamentals
- Core objects (Pods, Deployments, ReplicaSets)
- Services (ClusterIP, NodePort, LoadBalancer)
- ConfigMaps and Secrets
- Ingress basics and DNS
- `kubectl` usage and basic troubleshooting

## Phase 7 (Weeks 27–32): Kubernetes in Cloud
- Managed cluster setup (EKS/AKS/GKE)
- Node groups and autoscaling basics
- Storage classes and PVCs
- Namespaces and RBAC
- Rolling updates and rollbacks

## Phase 8 (Weeks 33–36): DevOps Operations
- Logging setup (app + cluster logs)
- Basic metrics and dashboards
- Alerts on failures and high usage
- Backup and restore for workloads
- SLO thinking (availability, latency)

## Phase 9 (Weeks 37–40): DevOps Security
- IAM hygiene and least privilege
- Network security (SG/NSG, firewall rules)
- Image scanning and dependency scanning
- Kubernetes security basics (RBAC, Pod Security)
- Secrets management (KMS, Vault, SealedSecrets)

## Phase 10 (Weeks 41–52): Real Projects & Portfolio
- Build full cloud infrastructure with Terraform
- Deploy microservice app on Kubernetes
- Wire CI/CD to build, test, deploy
- Add logging, metrics, alerts
- Run failure drills and recovery
- Document outcomes on GitHub and LinkedIn
