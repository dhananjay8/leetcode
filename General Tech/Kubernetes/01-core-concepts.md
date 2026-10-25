# Kubernetes Core Concepts — Interview Notes

## 1. Architecture — Control Plane vs Worker

```text
Control Plane                          Worker Node(s)
API Server ──(only writer)──▶ etcd     kubelet  → starts/stops Pods via CRI
Scheduler → assigns pods→nodes         kube-proxy → Service VIP → Pod rules
Controller Manager → reconcile loops   Container Runtime (containerd/CRI-O)
Cloud Controller Mgr → cloud LB/disks  Pods (your workloads)
```

| Component | Role | Interview detail |
| ----------- | ------ | ------------------ |
| **kube-apiserver** | Only cluster entry point; validates + persists to etcd | Scales horizontally; everything (kubectl, controllers, kubelets) talks to it |
| **etcd** | Distributed KV store of ALL cluster state | Raft consensus; only apiserver talks to it; losing etcd = losing the cluster → backups mandatory |
| **kube-scheduler** | Picks a node per pending Pod | Filters (resources, taints, PVCs) → scores (spread, affinity) → binds |
| **kube-controller-manager** | Runs reconcile loops (Node, Deployment/ReplicaSet, Endpoints, Job…) | Desired ≠ actual → act; leader-elected |
| **cloud-controller-manager** | Cloud-specific loops: LB provisioning, node addresses, storage | Separates cloud logic out of core |
| **kubelet** | Node agent; turns PodSpecs into running containers | Enforces restart policy, runs probes, reports status |
| **kube-proxy** | Per-node Service routing via iptables or **IPVS** | IPVS = O(1) hash vs iptables O(n) chain — ask which mode at scale |
| **container runtime** | Pulls images, runs containers | containerd/CRI-O; **Docker runtime removed in v1.24** (dockershim) |

**`kubectl apply` flow** (memorize): kubectl→apiserver (authn/authz/admission) → object persisted to etcd → scheduler binds Pod→node → kubelet pulls image via runtime → probes → controller-manager keeps replicas converged.

---

## 2. Pod — the Atomic Unit

**Pod** = smallest deployable unit; one or more containers sharing **one network namespace (one IP)** + optional shared volumes, always co-scheduled on one node. Kubernetes never runs a bare container — it wraps it in a Pod.

### Pod vs Container (from source table)

| Feature | Container | Pod |
| --------- | ----------- | ----- |
| Definition | Code + deps package | Execution context hosting containers |
| Managed by | containerd directly | Kubernetes control plane |
| Networking | Own netns | **Shared** netns + one Pod IP (containers talk over localhost) |
| Storage | Ephemeral fs | Shared volumes across its containers |
| Scaling | Manual | As a single unit via workload controllers |

### Multi-container Pod patterns

| Pattern | Role | Examples |
| --------- | ------ | ---------- |
| **Sidecar** | Helper alongside main app | log shipper (Fluent Bit), mesh proxy (Envoy), config reloader |
| **Init** | Runs-to-completion **before** app containers, sequentially | DB migrations, wait-for-dependency, fetch config |
| **Ambassador/Adapter** | Proxy / normalize external interface | egress proxy, metric format adapter |

Rule: multi-container Pod only when containers are **tightly coupled**; independent services (web + DB) live in separate Pods to scale independently.

### Pod lifecycle phases

`Pending → Running → Succeeded/Failed` (+ `Unknown` on node comms loss). Init containers must all complete before app containers start. `CrashLoopBackOff` is a *status symptom*, not a phase — see `09-troubleshooting.md`.

### Pod spec reference

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels: { app: myapp }
spec:
  containers:
    - name: app
      image: myapp:1.0
      ports: [{ containerPort: 8080 }]
      resources:
        requests: { cpu: "100m", memory: "128Mi" }   # scheduling + HPA base
        limits:   { cpu: "500m", memory: "256Mi" }   # over-limit mem → OOMKilled(137)
      livenessProbe:    # alive? fail → kubelet restarts container
        httpGet: { path: /healthz, port: 8080 }
        initialDelaySeconds: 10
        periodSeconds: 5
      readinessProbe:   # serve traffic? fail → pulled from Service endpoints
        httpGet: { path: /ready, port: 8080 }
        initialDelaySeconds: 5
        periodSeconds: 3
```

| Probe | Answers | On failure |
| ------- | --------- | ------------ |
| **liveness** | Is the container alive? | **Restart** container |
| **readiness** | Can it serve traffic? | Removed from endpoints (not restarted) |
| **startup** | Has it finished starting? | Gates liveness/readiness (slow-boot apps) |

### Resources → QoS (memorize the pairing)

**Requests** feed the *scheduler*; **limits** feed the *enforcer*. CPU over-limit → throttled; memory over-limit → OOMKilled (137). The requests/limits combo assigns a **QoS class** — Guaranteed (`req==lim`) / Burstable / BestEffort — which is also the **eviction order** under node pressure. Deep dive: `11-advanced-concepts.md §2`.

### Other spec fields interviewers ask about

`restartPolicy` (Always/OnFailure/Never) · `terminationGracePeriodSeconds` (30s default; preStop hook) · `nodeSelector`/`tolerations`/`affinity` (placement — `11-advanced-concepts.md §1`) · `serviceAccountName` (API identity) · `imagePullSecrets` (private registry) · `dnsPolicy`/`hostNetwork` · `securityContext` (see `05-security.md`).

---

## 3. Workload Controllers — the Comparison Table

| Kind | Identity | Storage | Ordering | Use case |
| ------ | ---------- | --------- | ---------- | ---------- |
| **Deployment** | Interchangeable pods | Shared/none | Parallel | Stateless apps (APIs, web) |
| **StatefulSet** | Stable `name-0,1,2` + headless Svc | Each pod's own PVC (volumeClaimTemplates) | Ordered create (0→n) and delete (n→0) | Databases, Kafka, ZooKeeper |
| **DaemonSet** | One pod per node | Node-local | — | log/metric agents, CNI, kube-proxy |
| **Job** | Run-to-completion | — | — | Migrations, batch |
| **CronJob** | Scheduled Jobs | — | — | Backups, reports |

**Deployment vs StatefulSet** (favorite): stateless ↔ stable identity+ordered ops+dedicated PVC per pod. Also: StatefulSet pods are **not** auto-rescheduled on node failure the same way Deployments are.

```yaml
# Deployment with safe rollout defaults
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # extra pods allowed during rollout
      maxUnavailable: 0    # never drop below replicas
```

```bash
kubectl apply -f deploy.yaml | kubectl rollout status deploy/myapp
kubectl set image deploy/myapp app=myapp:2.0      # trigger rollout
kubectl rollout history deploy/myapp              # revisions
kubectl rollout undo deploy/myapp [--to-revision=3]
kubectl scale deploy/myapp --replicas=5
```

---

## 4. Service — Stable Endpoint for Ephemeral Pods

Pods die and get new IPs; a **Service** gives a stable ClusterIP + DNS + load-balancing via kube-proxy → **Endpoints** (pods matching the selector **and** passing readiness).

| Type | Scope | Details |
| ------ | ------- | --------- |
| **ClusterIP** (default) | In-cluster only | `svc.ns.svc.cluster.local` |
| **NodePort** | External via node IP | Static port **30000–32767** on every node (`--service-node-port-range` to change) |
| **LoadBalancer** | External via cloud LB | Builds on NodePort; gets `externalIP` |
| **ExternalName** | DNS CNAME | Alias to an external host; no proxying |
| **Headless** (`clusterIP: None`) | DNS → pod IPs directly | StatefulSets, client-side LB |

```yaml
ports: [{ port: 80, targetPort: 8080 }]    # Svc:80 → Pod's containerPort:8080
selector: { app: myapp }                    # must match pod labels or endpoints are empty
```

Full port model (`port`/`targetPort`/`nodePort`/`containerPort` FAQs): see `02-networking.md §3`.

---

## 5. ConfigMap, Secret, Namespace, Labels

- **ConfigMap** = non-sensitive key-values (env or mounted files). **Secret** = sensitive, **base64-encoded — not encryption** (enable etcd encryption-at-rest + restrict RBAC; better: External Secrets Operator).
- **Namespace** = virtual cluster for isolation/RBAC/quotas. Built-ins: `default`, `kube-system`, `kube-public`, `kube-node-lease`.
- **Labels** = arbitrary K/V on objects; **selectors** wire Services→Pods, Deployments→Pods, NetworkPolicies→Pods. `kubectl get pods -l app=x,env=prod`.

```yaml
envFrom: [{ configMapRef: { name: app-config } }, { secretRef: { name: app-secrets } }]
# or mount as files via volumes
```

---

### Config details interviewers probe

- **Mounted ConfigMap/Secret updates propagate** to files (kubelet sync, ~1min) but **env-var values never update** — app must re-read files or pods must restart (checksum annotations / `kubectl rollout restart`).
- `immutable: true` on ConfigMap/Secret prevents accidental edits (better etcd watch perf).
- **Downward API** injects pod metadata (name, IP, labels) as env/files — no API call needed.
- **Labels vs annotations**: labels are *selectable* (indexed, limited charset) — selectors wire Services/PDBs/NetworkPolicies. Annotations are *metadata* (not selectable, larger, richer) — used by tools (checksums, ingress config, ArgoCD waves).

## 6. Object Glossary (from source — one-liners)

Node (worker machine) · Cluster (nodes + control plane) · Volume (pod-attached storage) · Ingress (L7 external HTTP routing) · NetworkPolicy (pod firewall) · HPA (scale pods by metrics) · VPA (resize pod requests) · Operator (CRD + controller automating app lifecycle) · CRD (extend the K8s API) · kubectl (CLI) · PDB (min availability during voluntary disruption) · ResourceQuota/LimitRange (namespace caps).

---

## 7. kubectl Cheat Sheet (from source)

```bash
# cluster & pods
kubectl cluster-info | get nodes [-o wide] | get pods [-n ns -o wide --show-labels]
kubectl describe pod <p> | logs <p> [-c ctr] [--previous] [-f] | exec -it <p> -- sh
kubectl delete pod <p> | get events --sort-by=.metadata.creationTimestamp
# workloads & networking
kubectl get deploy|svc|endpoints|ingress|pvc|configmap|secret [-A]
kubectl apply -f f.yaml | delete -f f.yaml | diff -f f.yaml
kubectl port-forward svc/web 8080:80         # local access without LB
# namespaces
kubectl get ns | create ns <name> | config set-context --current --namespace=<name>
# auth & nodes
kubectl auth can-i <verb> <resource>         # RBAC check
kubectl top pods|nodes | cordon|drain|uncordon <node>
```

---

## 8. Recall — Sound Bites

- "Pod = one IP, one node, shared fate — the atom; container = the electron."
- "Only the apiserver writes etcd; everything else watches it."
- "Readiness gates traffic; liveness gates process restarts."
- "Deployment for stateless, StatefulSet for identity+PVCs, DaemonSet for every node."
- "Empty endpoints? Selector vs labels vs readiness — in that order."
- "K8s is a reconcile loop: desired state in etcd, controllers closing the gap."
