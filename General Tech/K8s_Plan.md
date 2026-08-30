∟ 📂 Phase 1 (Weeks 1–4) Foundations
 ∟ 📂 Linux basics for Kubernetes processes, and networking - Done
 ∟ 📂 Git and GitHub for storing manifests and workflows - Done
 ∟ 📂 Networking basics IP, DNS, HTTP, and load balancers - Done

Interview-focused roadmap from fundamentals to production-grade clusters.

## Phase 1 (Weeks 1–4): Foundations
- Linux basics for Kubernetes processes and networking
- Git and GitHub for manifests and workflows
- Networking basics: IP, DNS, HTTP, load balancers

## Phase 2 (Weeks 5–8): Containers First
- Docker fundamentals: images, containers, layers
- Dockerfile build/tag/push cycle
- Container networking: ports and health checks
- Registry setup: ECR, ACR, GCR, Docker Hub
- Multi-container apps with Docker Compose

## Phase 3 (Weeks 9–12): Kubernetes Fundamentals
- Core objects: Pods, Deployments, ReplicaSets
- Services: ClusterIP, NodePort, LoadBalancer
- ConfigMaps and Secrets
- Probes: liveness, readiness, startup
- `kubectl` contexts, namespaces, logs, describe

## Phase 4 (Weeks 13–16): Kubernetes Networking
- CNI basics and pod IP addressing
- Ingress controllers (NGINX/ALB) and Gateway API
- DNS inside cluster with CoreDNS
- NetworkPolicies for traffic isolation
- Networking troubleshooting (`exec`, `curl`, logs)

## Phase 5 (Weeks 17–22): Kubernetes Storage
- PersistentVolume and PersistentVolumeClaim
- StorageClasses and dynamic provisioning
- CSI drivers (EBS/AzureDisk and equivalents)
- StatefulSets and workload identity
- Backup and restore strategy

## Phase 6 (Weeks 23–28): Kubernetes Scaling
- HPA with CPU, memory, custom metrics
- VPA and where to use it
- Cluster Autoscaler basics
- PodDisruptionBudgets
- Karpenter or equivalent node autoscaling approach

## Phase 7 (Weeks 29–34): Kubernetes Security
- RBAC with clean role/rolebinding design
- Image scanning and SBOM basics
- NetworkPolicies with least privilege
- Secrets management (KMS, SealedSecrets, External Secrets)

## Phase 8 (Weeks 35–40): GitOps and IaC
- Kustomize overlays and environment patches
- Helm charts: values, templates, packaging
- Terraform for EKS/AKS/GKE provisioning
- ArgoCD sync, health checks, rollback, drift detection

## Phase 9 (Weeks 41–46): Kubernetes Observability
- Metrics with Prometheus and Grafana
- Alerting for errors, crashes, SLO thresholds
- Dashboards for health, latency, saturation

## Phase 10 (Weeks 47–52): Real Projects
- Deploy production-grade microservice stack
- Add autoscaling with HPA + node autoscaler + PDBs
- Add observability (logs, metrics, alerts)
- Secure workloads with RBAC and policy controls
- Document architecture and learnings on GitHub/LinkedIn