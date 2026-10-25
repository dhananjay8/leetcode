# Kubernetes Advanced Concepts — Staff/Kube-Astronaut Depth

## 1. Scheduling & Placement

| Mechanism | Direction | Use |
| ----------- | ----------- | ----- |
| `nodeSelector` | Pod→node label | Simple pinning |
| `nodeAffinity` (required/preferred) | Pod→node labels, expressive | Zoning, instance-type preference |
| `podAffinity` / `podAntiAffinity` | Pod→pod, with `topologyKey` | Cohere (cache near app) or spread (replicas across AZs) |
| **Taints** (on node) / **Tolerations** (on pod) | Node repels; pod tolerates | Dedicated nodes, GPU pools, control-plane protection |
| `topologySpreadConstraints` | Even distribution w/ `maxSkew`, `whenUnsatisfiable` | AZ/hostname balance — the modern answer |
| `PriorityClass` | Preemption order | Critical system pods evict lower-priority ones |
| Descheduler (addon) | Re-balances already-running pods | Fix skew post-hoc — scheduler only acts at bind time |

Rules of thumb: `requiredDuringScheduling` = hard constraint (Pending if unmet); `preferred` = best effort. Anti-affinity on `hostname` for replicas; `zone` for AZ-level HA. Taint-based eviction (`NoExecute` + `tolerationSeconds`) is also how node problems drain pods.

---

## 2. Requests, Limits & QoS Classes

```yaml
resources:
  requests: { cpu: 100m, memory: 128Mi }   # scheduler uses this; cgroup cpu.shares / soft floor
  limits:   { cpu: 500m, memory: 256Mi }   # cgroup cpu quota (throttle) / mem hard cap (OOMKill)
```

| QoS | Condition | Eviction order (under node pressure) |
| ----- | ----------- | ------------------------------------- |
| **Guaranteed** | requests == limits for every container (cpu+mem) | Last |
| **Burstable** | requests < limits | Second |
| **BestEffort** | no requests/limits at all | **First** |

Key semantics interviewers probe:

- **CPU over-limit → throttled** (cfs quota stalls the process; shows as latency, `container_cpu_cfs_throttled_seconds`). **Memory over-limit → OOMKilled (137)** — CPU is compressible, memory isn't.
- Some shops set `requests == limits` for CPU to avoid throttle jitter; JVMs should set `-XX:MaxRAMPercentage` (container-aware since JDK 8u191/10) or the JVM sizes the heap off *node* RAM → OOM.
- `LimitRange` = per-namespace defaults/min-max for requests/limits; `ResourceQuota` = namespace totals (pods w/o requests are rejected when a compute quota exists).
- **Node eviction** (kubelet, before scheduler notices): `memory.available`, `nodefs.available`, `pid.available` thresholds → evicts BestEffort→Burstable→Guaranteed. DiskPressure → `imagefs`/`nodefs` full — see `09-troubleshooting.md`.

---

## 3. Graceful Shutdown — the Sequence

```text
DELETE pod → endpoints removed (async) + preStop hook runs (parallel)
          → SIGTERM → app drains (stop accepting, finish in-flight)
          → terminationGracePeriodSeconds (default 30s) → SIGKILL
```

The classic race: **endpoint removal is async** — kube-proxy may still route to a terminating pod. Fix: `preStop: sleep 5` (or app delays shutdown) so propagation lands before SIGTERM. Also: `SIGTERM` → run as PID 1 or signal handling breaks (shell entrypoints swallow signals — use `exec` form).

---

## 4. API Machinery — What Happens Inside `apply`

```text
kubectl apply → authn → authz → MutatingAdmission → schema validation
             → ValidatingAdmission → persist to etcd → controllers watch+reconcile
```

- **Admission controllers** run in order: mutating (inject sidecars, defaults) then validating (OPA/Kyverno, PodSecurity). A webhook timeout can block *all* writes — `failurePolicy` matters.
- **Finalizers** block deletion until a controller cleans external resources (PVCs, LBs). Stuck `Terminating`? `kubectl get -o json | jq .metadata.finalizers` then patch out — carefully.
- **OwnerReferences + GC**: deleting a Deployment cascades to ReplicaSets→Pods (foreground/background propagation). Orphaned RS = ownerRef stripped.
- **CRD + controller = Operator**: encode app lifecycle (backup, failover, upgrade) in a reconcile loop; maturity levels: install → upgrade → lifecycle → insights → autopilot.
- **Sidecar containers (v1.28+, stable v1.29)**: `initContainers` with `restartPolicy: Always` — start before app, stay up, get their own probes. Replaces the "sidecar dies after init" hack.
- **API discovery/deprecation**: `kubectl api-resources`, `api-versions`; deprecated APIs are removed at cluster upgrades (check with `kubepug`/`pluto` before upgrading).

### Inside a Controller / Operator — The `client-go` Informer Architecture

```text
kube-apiserver (watch stream, resourceVersion)
  └──▶ Reflector (List + Watch)
         └──▶ DeltaFIFO Queue
                ├──▶ SharedInformer → Indexer / Store (local in-memory cache; Listers read here at 0 etcd cost!)
                └──▶ ResourceEventHandler (Add/Update/Delete)
                       └──▶ Workqueue (RateLimitingQueue stores ONLY "namespace/name" keys, deduplicates!)
                              └──▶ Worker Loop: get(key) from Lister → reconcile(desired vs actual) → requeue on error w/ backoff
```

- **Level-triggered vs Edge-triggered**: Kubernetes controllers are **level-triggered** — the workqueue stores only `"namespace/name"`, not the event diff. When the worker runs, it inspects the **current desired state vs current actual state** (so if 10 updates happen while a key is queued, they coalesce into 1 reconcile).
- **Optimistic Concurrency (`resourceVersion`)**: Every K8s object has `metadata.resourceVersion` (backed by etcd's MVCC revision counter). If two controllers `Update` the same object concurrently, the second gets `409 Conflict` and must re-read from cache and retry (or use **Server-Side Apply** field ownership).

---

## 5. etcd & Control Plane — Deeper

- etcd = Raft KV (leader + quorum, **odd member counts**: 3 or 5 — quorum math, not symmetry: `quorum = floor(N/2) + 1`; a 4-node cluster tolerates only 1 failure, same as 3, with slower writes!). Quorum loss = **read-only cluster** (apiserver still serves reads; no writes).
- **etcd MVCC, Compaction & Defrag**: etcd never overwrites keys in place; every mutation creates a new revision (Multi-Version Concurrency Control). Old revisions are pruned by **Compaction** (`--etcd-compaction-interval=5m`), but compacted space isn't returned to the OS filesystem until **`etcdctl defrag`** runs (run one member at a time — `defrag` blocks that member briefly!). Default quota is `2GiB` (max recommended `8GiB`); hitting quota triggers `NOSPACE` alarm → cluster goes read-only.
- **API Priority and Fairness (APF)**: Protects `kube-apiserver` from overload (`FlowSchema` classifies requests by user/SA + `PriorityLevelConfiguration` assigns isolated queues/concurrency shares) so a runaway `kubectl get pods -A` loop from one team cannot starve `system:nodes` kubelet heartbeats or leader-election `Lease` renewals.
- **Node Heartbeats (`coordination.k8s.io/v1 Lease`)**: Each kubelet updates a lightweight `Lease` object in namespace `kube-node-lease` every `10s` (Instead of patching the heavy `Node` status object every 10s, which used to crush etcd in 5,000-node clusters).
- Backups: `etcdctl snapshot save` (+ `--cacert/--cert/--key`); restore rebuilds the DB then rejoins members. Managed K8s (EKS/GKE/AKS) hides etcd — you back up *objects* instead (Velero).
- Watch + compaction: clients watch `resourceVersion`; if their rv falls behind the compaction window → `410 Gone` → relist (`WatchBookmark` events keep idle watch `resourceVersion` fresh).
- **Control plane is just pods on itself** (self-hosted/kubeadm): check `kube-system` static pods — `kube-apiserver`, `etcd`, `scheduler`, `controller-manager` manifests live in `/etc/kubernetes/manifests/` (kubelet runs them directly, no apiserver needed — that's why the control plane can bootstrap).
- Certificates: kubeadm CAs + client certs rotate on `kubeadm certs renew` / upgrade; expired certs = `x509: certificate has expired` — everything talks TLS, always.
- kubelet internals worth knowing: PLEG (pod lifecycle event generator — "PLEG is not healthy" = runtime hang), image GC thresholds, `--max-pods` (default **110**/node).

---

## 6. Networking Deep Cuts

- kube-proxy modes: `iptables` (O(n) rule scan, random pick) vs **`ipvs`** (O(1) hash, round-robin/least-conn) vs nftables (newer). At >~1k Services, IPVS wins.
- Service DNAT happens on the **node** — the packet leaving a pod targets ClusterIP; conntrack rewrites. `conntrack -L` on node for stale-session debugging.
- `dnsPolicy: ClusterFirst` (default) vs `Default` (inherit node resolv.conf); `hostNetwork: true` pods see node DNS — a favorite "why is DNS weird" cause.
- NAT hairpin: pod curling its own Service IP that routes back to itself — works via masquerade in most CNIs but bites in some setups.
- eBPF CNI (Cilium) bypasses kube-proxy entirely — socket-level LB; mention as "the direction things are going."

---

## 7. Cluster Operations

| Topic | Core points |
| ------- | ------------- |
| **Upgrade** | Control plane → nodes (drain or surge) → addons; **skew policy**: apiserver ≤1 minor ahead of kubelet, ≤2 ahead of kubectl; check deprecated APIs first |
| **HA control plane** | 3 etcd members, stacked vs external etcd topology; LB in front of apiservers (6443) |
| **One big cluster vs many** | Big = bin-packing efficiency, shared control plane, blast radius + etcd size (default DB ~2GB, keep <8GB) + noisy neighbor; Many = isolation, per-env lifecycle, more ops |
| **Multi-tenancy** | Soft: namespaces+RBAC+quota+NetworkPolicy+PSS. Hard: separate node pools/clusters, vCluster |
| **etcd object growth** | Secrets/CRDs bloat etcd; huge ConfigMaps (1MiB limit/object) and event spam hurt watch latency |
| **Node pools** | Taint+label per pool (GPU, spot, high-mem); CA/Karpenter scales per pool |
| **etcd/object backups** | `etcdctl snapshot` (self-managed) or Velero (objects+PV snapshots) — restores are practiced, not assumed |
| **FinOps / Cost Optimization** | Right-size inflated `requests` (`VPA Off` / Goldilocks / OpenCost); Karpenter bin-packing consolidation; Spot pools for stateless/batch w/ on-demand fallback; scale dev/preview namespaces to 0 off-hours (KEDA); reap orphaned PVCs + idle `LoadBalancer` Services (use 1 Ingress instead of N LBs); VPC Endpoints to cut NAT Gateway $/GB |

---

## 8. Runtime & Kubelet Edge Cases

- **Container runtime ≠ Docker**: containerd via CRI; images are OCI — `docker build` images run on containerd (image format compat, not daemon compat).
- `imagePullPolicy`: `Always` for `:latest`, `IfNotPresent` default for tagged — pull failures: creds (`imagePullSecrets`), arch mismatch, egress.
- Ephemeral debug containers: `kubectl debug -it pod/x --image=busybox --target=<container>` — needs `EphemeralContainers` (stable since v1.25); the *supported* way to shell into a distroless pod.
- Pod `securityContext` + fsGroup chowns volumes (slow on huge volumes — `fsGroupChangePolicy: OnRootMismatch`).

---

## 9. Interview Q&A (advanced)

**Q: Pod Pending, nodes have spare CPU?**
Other constraints: untolerated taints, nodeAffinity unmet, PVC in another AZ, `topologySpreadConstraints` `whenUnsatisfiable: DoNotSchedule`, port/hostPort conflicts.

**Q: Requests set low but pods throttle anyway?**
Throttling is on *limits*. `limits.cpu` caps cfs quota — burst CPU throttling (v1.27+ `cpuCFSQuotaPeriod` tuning) or raise the limit.

**Q: Why does the cluster go read-only?**
etcd quorum loss or disk-full alarm. Reads work; writes fail — the most dangerous "looks fine" failure.

**Q: Pod Terminating forever?**
Finalizer waiting on a controller that can't finish (deleting a PVC bound to a running pod, cloud LB call hanging). Inspect finalizers → fix controller → only then force.

**Q: How do you run a pod on every node including tainted control plane?**
DaemonSet + `tolerations` for `node-role.kubernetes.io/control-plane:NoSchedule` (that's exactly how kube-proxy/CNI land everywhere).

**Q: Kubelet vs kube-proxy — who does what at 3am?**
kubelet = pod/container lifecycle (start, probe, evict, report). kube-proxy = Service VIP packet rules. A "Service unreachable but pod is Running" split-brain is usually kube-proxy/endpoints, not kubelet.

---

## 10. Recall — Sound Bites

- "Requests schedule, limits enforce; CPU throttles, memory kills."
- "Guaranteed QoS is a contract: requests == limits."
- "Endpoint removal races SIGTERM — preStop buys you the gap."
- "etcd quorum = write availability; losing it makes the cluster a museum."
- "Taints repel, tolerations permit, affinity attracts, spread constraints balance."
- "Finalizers are IOUs — deletion waits until they're paid."
- "The control plane is pods manifesting themselves — static pods in `/etc/kubernetes/manifests`."
