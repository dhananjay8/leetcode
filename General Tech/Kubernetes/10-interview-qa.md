# Kubernetes Interview — Top 50 Questions & Answers

## Architecture

**Q1: What is Kubernetes?**
Open-source container orchestration platform. Automates deployment, scaling, and management of containerized applications. Originally from Google (Borg), now maintained by CNCF.

**Q2: Explain K8s architecture.**
Control Plane: API Server (frontend), etcd (state store), Scheduler (assigns pods to nodes), Controller Manager (desired vs actual state). Worker Nodes: kubelet (pod lifecycle), kube-proxy (networking), container runtime (containerd).

**Q3: What is etcd and why is it critical?**
Distributed key-value store holding ALL cluster state (pods, services, configs, secrets). If etcd is lost, the cluster is gone. Must be backed up regularly. Uses Raft consensus for distributed consistency.

**Q4: What happens when you run `kubectl apply -f deployment.yaml`?**
1. kubectl sends YAML to API Server (authenticated + authorized via RBAC)
2. API Server validates and stores in etcd
3. Scheduler watches for unscheduled pods → assigns to a node
4. kubelet on that node pulls image, starts container
5. Controller Manager ensures desired replicas match actual

## Workloads

**Q5: Pod vs Container?**
Pod = smallest K8s unit, one or more containers sharing network/storage. Container = single process running in a pod. Multi-container pod use cases: sidecar (logging), init container (setup).

**Q6: Deployment vs StatefulSet vs DaemonSet vs Job?**
| Workload | Use Case |
|----------|----------|
| **Deployment** | Stateless apps (web servers, APIs) |
| **StatefulSet** | Stateful apps (databases) — stable IDs, own PVC |
| **DaemonSet** | One pod per node (log collectors, monitoring agents) |
| **Job** | Run-to-completion tasks (migrations, batch) |
| **CronJob** | Scheduled Jobs (backups, reports) |

**Q7: What are init containers?**
Containers that run and complete before main containers start. Use cases: wait for DB to be ready, download config, run migrations. They run sequentially; main containers start only after all init containers succeed.

**Q8: What are sidecar containers?**
Additional container in same pod alongside main container. Shares network and storage. Use cases: log shipper (Fluentd), service mesh proxy (Envoy/Istio), config reloader.

## Networking

**Q9: How does service discovery work in K8s?**
Every Service gets a DNS entry: `<service>.<namespace>.svc.cluster.local`. CoreDNS resolves it. Pods can reach services by name within same namespace or by FQDN across namespaces.

**Q10: ClusterIP vs NodePort vs LoadBalancer?**
ClusterIP: Internal only (default). NodePort: Expose on each node's IP at port 30000-32767. LoadBalancer: Cloud LB provisioned automatically (ALB/NLB). Use Ingress for HTTP routing.

**Q11: What is an Ingress?**
Layer 7 (HTTP) routing. Maps external URLs to internal Services. Requires an Ingress Controller (NGINX, ALB). Supports path-based and host-based routing, TLS termination.

**Q12: What are NetworkPolicies?**
Firewall rules for pod-to-pod traffic. By default all traffic allowed. NetworkPolicy restricts ingress/egress based on pod labels, namespaces, IP blocks. Requires CNI that supports it (Calico, Cilium).

## Storage

**Q13: PV vs PVC?**
PV (PersistentVolume): Actual storage resource. PVC (PersistentVolumeClaim): Request for storage. Pod uses PVC. With StorageClasses, PVs are dynamically provisioned when a PVC is created.

**Q14: What is a StorageClass?**
Defines how storage is provisioned. Specifies provisioner (EBS, EFS), parameters (disk type, IOPS), reclaim policy. Enables dynamic provisioning — create PVC, PV auto-created.

## Scaling

**Q15: How does HPA work?**
Monitors pod metrics (CPU, memory, custom). If metric exceeds target, increases replicas. Checks every 15s. Requires Metrics Server. Pods must have resource requests defined.

**Q16: Cluster Autoscaler vs Karpenter?**
CA: Adds/removes nodes from predefined node groups (ASGs). Slower (minutes). Karpenter: Provisions right-sized nodes directly from cloud API. Faster (seconds). Supports spot instances, consolidation.

## Security

**Q17: What is RBAC?**
Role-Based Access Control. Role defines permissions (verbs on resources). RoleBinding binds Role to a subject (User, Group, ServiceAccount). ClusterRole/ClusterRoleBinding for cluster-wide access.

**Q18: How do you manage secrets in K8s?**
K8s Secrets are base64, not encrypted. Best practices: Enable etcd encryption, use External Secrets Operator (sync from Vault/AWS SM), Sealed Secrets for GitOps, limit RBAC access to secrets.

## Operations

**Q19: How do you perform a zero-downtime deployment?**
Rolling update (default): `maxSurge=1, maxUnavailable=0` → always maintains all replicas. Readiness probes ensure traffic only goes to ready pods. PDB prevents too many pods down during drain.

**Q20: How do you rollback a deployment?**
```bash
kubectl rollout undo deployment/myapp                 # previous version
kubectl rollout undo deployment/myapp --to-revision=3 # specific version
kubectl rollout history deployment/myapp              # see revisions
```

**Q21: A pod is in CrashLoopBackOff. How do you debug?**
1. `kubectl logs <pod> --previous` — see crash logs
2. `kubectl describe pod <pod>` — check exit code, events
3. Exit 137 = OOM, exit 1 = app error
4. Check ConfigMaps/Secrets exist
5. Check liveness probe config (too aggressive?)

**Q22: How do you upgrade a K8s cluster?**
1. Upgrade control plane first (one minor version at a time)
2. Upgrade node groups (rolling: cordon → drain → upgrade → uncordon)
3. Test workloads after upgrade
4. Managed clusters (EKS/GKE) handle control plane upgrade automatically

## Scenario Questions

**Q23: Design a production K8s setup for a microservices app.**
- Managed cluster (EKS/GKE) in multi-AZ
- Separate namespaces per team/environment
- Ingress controller + TLS certificates
- HPA for auto-scaling, PDB for availability
- Prometheus + Grafana for monitoring
- ArgoCD for GitOps deployments
- RBAC per team, NetworkPolicies per namespace
- External Secrets for secret management

**Q24: How do you handle a node failure?**
K8s automatically: detects via kubelet heartbeat (5 min timeout), marks NotReady, reschedules pods to healthy nodes (for Deployments). StatefulSet pods are NOT auto-rescheduled (need manual intervention or operator). Cluster Autoscaler adds replacement node.

**Q25: Your pods keep getting OOMKilled. What do you do?**
1. Check actual memory usage: `kubectl top pods`
2. Increase memory limits if under-provisioned
3. If memory grows over time → investigate memory leak in application
4. Add VPA to auto-tune resource requests
5. Consider profiling the application (heap dumps)
