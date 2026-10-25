# Kubernetes Interview Q&A — Rapid-Fire

## 1. Fundamentals

**Q: Container vs Pod?**
Container = the process; Pod = the K8s atom wrapping 1+ containers sharing one network namespace (one IP) and volumes, co-scheduled on one node. K8s never schedules bare containers.

**Q: Deployment vs StatefulSet?**
Stateless/interchangeable vs stable identity (`pod-0`), ordered create/delete, per-pod PVC via `volumeClaimTemplates`, headless service DNS. StatefulSet is the answer for DBs/queues — but bring your own backup story.

**Q: ClusterIP vs NodePort vs LoadBalancer vs Ingress?**
Internal-only → node-edge port (30000–32767) → cloud LB per service → L7 host/path routing behind one LB. Cost follow-up: N LoadBalancers = N cloud LBs.

**Q: port vs targetPort vs nodePort vs containerPort?**
Service's ear → Pod's receiving port → every node's published port → documentation of the app's listener. See `02-networking.md §3`.

**Q: ConfigMap vs Secret?**
Both K/V config injection; Secret is base64-**encoded not encrypted** — etcd encryption + RBAC + external manager are the real controls.

**Q: Readiness vs liveness?**
Readiness gates Service endpoints (traffic); liveness triggers container restart; startupProbe gates both for slow-booting apps.

**Q: RollingUpdate knobs?**
`maxSurge` (extra pods) + `maxUnavailable` (allowed down). `maxUnavailable: 0` + readiness = zero-downtime deploys, if capacity allows surge.

---

## 2. Scaling & Scheduling

**Q: HPA vs VPA vs Cluster Autoscaler vs Karpenter?**
More pods / fatter pods / more nodes / faster-smarter nodes. Don't run HPA+VPA on the same metric. See `04-scaling.md §1`.

**Q: Pod won't schedule?**
`describe pod` events: insufficient resources, untainted nodes exhausted, unbound PVC, unmet (anti-)affinity. Ask about requests first.

**Q: How does the scheduler pick a node?**
Filter (taints, resources, volume topology, affinity rules) → score (spread, preference) → bind. You steer it with nodeSelector, affinities, taints/tolerations, topologySpreadConstraints.

**Q: Node dies — what happens?**
kubelet heartbeats stop → node-controller marks NotReady → after pod-eviction-timeout (~5m default) pods are evicted/rescheduled onto healthy nodes; StatefulSet pods need the old pod confirmed gone (or `--force` semantics changed in newer releases).

---

## 3. Security & Ops

**Q: Secure a multi-tenant cluster?**
Namespaces + RBAC least-privilege + NetworkPolicy deny-all baseline + PSS restricted + per-tenant quotas + separate node pools tainted per tier + audit logging.

**Q: Secret got leaked via `kubectl get secret -o yaml`?**
Rotate immediately; fix RBAC (`get secrets` is the vuln); enable etcd encryption; move to external manager; audit API access logs.

**Q: Zero-downtime deploy?**
RollingUpdate `maxUnavailable:0` + readinessProbe + preStop hook/`terminationGracePeriodSeconds` for drain + PDB to cap voluntary disruption. DB migrations must be backward-compatible (expand/contract).

**Q: Upgrade a cluster safely?**
Control plane first (managed services do it for you) → drain + upgrade nodes one-by-one or surge nodes → verify workloads → then node pools; watch API deprecations (`kubectl convert`, `pluto`/`kubepug`).

---

## 4. Scenarios (from source — the hard ones)

**Q: 30% latency spike overnight — RCA?**
Metrics first: which service's p95 moved → traces localize the hop → pods (CPU throttling? restarts?) vs node (pressure, noisy neighbor) vs dependency (DB, external API) → correlate with deploys/config changes in the window (`rollout history`, git log, audit). Don't guess — bisect the pipeline.

**Q: Node disk-pressure eviction — RCA?**
`describe node` shows DiskPressure → image garbage, container logs without rotation, emptyDir growth, `ephemeral-storage` limits absent. Fix: limits + log rotation + image GC thresholds; verify with `df` via debug pod.

**Q: Pod uses local storage — autoscaler can't scale down the node?**
Correct — CA skips nodes with local-storage pods. Options: move to PVC, `--skip-pods-with-local-storage`, or PDB/orchestrated drain. Know the tradeoff.

**Q: In-cluster DNS resolution failing?**
resolv.conf → CoreDNS health → NetworkPolicy on :53 → search-domain/ndots behavior. Detail in `02-networking.md §5`.

**Q: Image works on your machine, ImagePullBackOff in cluster?**
Private registry auth (`imagePullSecrets`), arch mismatch (built arm64 on M-series, cluster is amd64 — use buildx), tag drift (`:latest` + `imagePullPolicy`), or egress rules blocking the registry.

**Q: Deploy went out, error rate spiked, rollback?**
`kubectl rollout undo` (or `argocd rollback` + git revert for GitOps). Then: why did readiness pass while 5xx spiked? — probes checked liveness not real traffic → add real-check readiness + canary.

**Q: Pods Pending despite free CPU on some nodes?**
Untolerated taints, unmet node/pod-affinity, unbound PVC in wrong AZ, `topologySpreadConstraints: DoNotSchedule`, or PriorityClass preemption blocked by PDBs. `describe pod` names it.

**Q: Requests vs limits vs QoS?**
Requests → scheduling + cpu.shares floor; limits → enforcement (CPU throttle / mem OOMKill). QoS (Guaranteed→Burstable→BestEffort) = eviction order under node pressure.

**Q: Pod deleted but stuck Terminating?**
Finalizer waiting on a controller (LB teardown, PVC detach) that's wedged — find the finalizer, fix the controller, patch out only as last resort.

**Q: Cluster went read-only?**
etcd quorum loss or DB-full alarm — reads work, writes fail. Restore quorum/snapshot; that's why etcd runs 3 or 5 members.

**Q: How does a service in ns `a` call one in ns `b`?**
`<svc>.b.svc.cluster.local` (or `<svc>.b` — search domains expand). Plus NetworkPolicy if egress-restricted.

**Q: Why do rolling updates cause brief `502`s even with `readinessProbe` and `maxUnavailable: 0`?**
Pod shutdown and EndpointSlice propagation are asynchronous. Proxies
may still have an open connection or stale endpoint when the app stops
accepting traffic. Check ingress logs, endpoint termination conditions,
and app drain logs. Stop accepting new work, finish in-flight requests,
and allow for endpoint propagation within `terminationGracePeriodSeconds`.
Tune a `preStop` delay only when measurements show it is needed; there
is no universal 10-second fix.

**Q: How does a Kubernetes Controller / Operator work internally (`client-go`)?**
**Reflector** (`List` + `Watch` on apiserver) → pushes events into **DeltaFIFO** queue → **SharedInformer** updates local thread-safe cache (**Indexer/Lister** so reads don't hit etcd) and fires **ResourceEventHandlers** → handler enqueues only `"namespace/name"` key into a **Workqueue (RateLimitingQueue)** → **Worker goroutines** pop keys, read current state from Lister, and reconcile **level-triggered** (`actual → desired`) idempotently.

**Q: Why did a Java pod get `OOMKilled (137)` when `-Xmx` was set below the memory limit?**
The container's cgroup limit includes more than Java heap (Metaspace,
thread stacks, direct buffers, native allocations, and charged page
cache). `container_memory_working_set_bytes` is a heuristic, **not**
RSS or the enforcement counter. Inspect `kubectl describe pod`, cgroup
`memory.current`/`memory.events`, JVM NMT and heap/direct-memory
metrics. Size heap/direct memory using measured headroom; 70% is not
a universal fix.

**Q: How do you capture a `tcpdump` inside a `distroless` pod that has no shell or `tcpdump` binary?**
Use `kubectl debug pod/<p> -it --image=nicolaka/netshoot --target=<ctr>` (ephemeral container sharing the pod's network namespace), or from the worker node find the container's host PID (`crictl inspect`) and run `nsenter -t <PID> -n tcpdump -nn -i any`.

**Q: Your cluster runs out of resources often. How do you manage and optimise it?**
Distinguish Pending pods (read `FailedScheduling` events for actual
constraints: requests, taints, topology, or PVC zone) from node
pressure/evictions. Compare requests with historical peaks and
allocatable capacity, then rightsize conservatively with VPA
recommendations. Quotas/LimitRanges bound tenant usage; autoscaling
adds nodes only if eligible capacity is available. Spread constraints
improve resilience but can reduce bin-packing. On Spot pools, PDBs
govern voluntary evictions, **not** involuntary interruption.
Validate savings and SLOs over representative peaks.

**Q: One pod works, the other fails with the same image. How do you debug it?**
First compare `imageID` digests; the same tag may resolve to
different images. Compare `kubectl get pod -o yaml`, `describe` events,
current/previous logs, node and zone, mounts and env at startup,
ServiceAccount identity, network reachability, and traffic/partition
assignment. ConfigMap/Secret env vars are startup snapshots; mounted
volumes can refresh eventually (except `subPath` mounts). Check
resource throttling and OOM events before blaming the image.

---

## 5. Quick Reference

| Asked | Answer in one line |
| ------- | --------------------- |
| Smallest unit | Pod (never a bare container) |
| Stable identity + disk | StatefulSet + volumeClaimTemplates |
| One pod per node | DaemonSet |
| Expose HTTP to internet | Ingress (one LB, many services) |
| Scale on queue depth | KEDA or HPA custom metric |
| Secrets safety | etcd encryption + RBAC + external manager |
| Zero-downtime | maxUnavailable:0 + readiness + PDB |
| Pod pending | describe → events name the reason |
| 137 | OOMKilled |
| Rollback | rollout undo / git revert + argocd |

---

## 6. Recall — Sound Bites

- "Every K8s answer lands on: desired state, controllers converge it."
- "Networking, scheduling, storage — pick the layer, then drill."
- "Incidents: metrics → traces → logs → events, in that order."
