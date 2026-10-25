# Kubernetes Troubleshooting — Interview Notes

## 1. The Debugging Sequence (from source — 9 commands)

```text
kubectl get pods                          # symptom: phase + restarts + age
kubectl describe pod <p>                  # events: scheduling, pulls, probes, OOM
kubectl logs <p> [-c ctr] [--previous]    # app output; --previous = last crashed run
kubectl get events --sort-by=.metadata.creationTimestamp
kubectl exec -it <p> -- sh               # inside: env, dns, connectivity, fs
kubectl get endpoints <svc>              # service has backends?
kubectl top pods|nodes                   # resource pressure
kubectl describe node <n>                # conditions: Disk/Memory/PID pressure, taints
kubectl get hpa|pvc|networkpolicy        # autoscaler/storage/policy blockers
```

Order matters: **symptom → events → logs → inside the pod → outward to svc/node/policy**.

---

## 2. The Six-Error Taxonomy (from source) + friends

| Error | Meaning | First moves |
| ------- | --------- | ------------- |
| **ImagePullBackOff / ErrImagePull** | Can't fetch image | Image name/tag exists? registry auth (`imagePullSecrets`)? network egress to registry? |
| **CrashLoopBackOff** | Container starts then dies, kubelet backoff 10s→5m | `logs --previous`; app error vs probe vs OOM |
| **CreateContainerConfigError** | Missing ConfigMap/Secret referenced | `describe pod` names it; create or fix the ref |
| **Pending (unschedulable)** | No node fits | `describe pod` → events list the reason (CPU, taints, PVC, affinity) |
| **KillContainerError** | Kill failed at runtime level | Node/kubelet issue → `describe node`, kubelet logs |
| **OOMKilled (exit 137)** | cgroup memory limit exceeded | `lastState` in describe; raise limit or fix the leak — don't just bump memory |
| **CreateContainerError** | Container can't start (bad mount/entrypoint) | describe events; check volume mounts + command |

## 3. Exit Codes Cheat Sheet

| Code | Meaning | Typical cause |
| ------ | --------- | --------------- |
| 0 | Clean exit | Job done — or app exits silently (check `restartPolicy`/command) |
| 1 | App error | Exception, failed init — read logs |
| 126 | Command not executable | Bad entrypoint perms |
| 127 | Command not found | Wrong image/path — `command`/`args` typo |
| **137** | SIGKILL | **OOMKilled** or forced kill (eviction/drain) |
| 143 | SIGTERM | Graceful shutdown — normal for rolling updates; slow shutdown = hook/timeout issue |

## 4. Scenario Playbooks (from source)

**Pod Pending forever?** `describe pod` → Insufficient cpu (scale/rights-size), node taints (tolerations missing), PVC unbound (storage class/provisioner), node affinity unsatisfiable.

**CrashLoopBackOff?** `logs --previous` → app crash (fix code), liveness too aggressive (initialDelaySeconds), bad env/config, exit-0 container with `restartPolicy: Always` (should be a Job), OOM.

**Service unreachable?** `get endpoints` empty → selector/labels mismatch or pods not ready; endpoints fine → DNS (CoreDNS logs), NetworkPolicy, targetPort mismatch, container not listening on 0.0.0.0.

**Node NotReady / disk pressure (RCA, from source)?**
`describe node` → conditions tell you which pressure (Disk/Memory/PID). Disk: node filesystem full — images + logs + emptyDir; fix: image GC, `ephemeral-storage` limits, log rotation, expand disk. Then uncordon.

**30% latency spike overnight (RCA)?**
Diff the window: deploys (`rollout history`), config changes, traffic mix, node/zone events, dependency latency (traces). Check metrics first: p95 by service → which hop (traces) → pod-level vs infra-level → correlate with events + node conditions + noisy-neighbor CPU steal.

**Pod keeps restarting but logs look clean?**
Liveness probe failing (endpoint changed, initialDelay too low for slow start), OOMKill between log lines (check `lastState`), or app exits 0 and restartPolicy loops it.

**DNS resolution fails inside pods?**
resolv.conf → CoreDNS pod health (`-n kube-system`) → NetworkPolicy on 53 → `ndots:5` search-path surprise (external names doing extra lookups).

## 5. Control-Plane & Node-Level Failures

| Symptom | Likely cause | Check |
| --------- | -------------- | ------- |
| `kubectl` hangs / "connection refused :6443" | apiserver down or LB to apiservers dead | control-plane static pod status, `/etc/kubernetes/manifests`, LB health |
| Cluster accepts reads, rejects writes | **etcd lost quorum** or DB-full alarm | `etcdctl endpoint status -w table`, member health, disk on etcd nodes |
| `x509: certificate has expired` | kubeadm certs aged out (default 1y) | `kubeadm certs check-expiration` → `kubeadm certs renew all` |
| Pods can't be scheduled cluster-wide | scheduler static pod crashed | `kubectl -n kube-system logs -l component=kube-scheduler` |
| Node `NotReady`, pods pile up | kubelet dead, runtime hang (**"PLEG is not healthy"**), disk/pressure | `systemctl status kubelet`, `journalctl -u kubelet`, runtime socket |
| Everything Pending after upgrade | CNI DaemonSet failed on new nodes | CNI pod logs, image compat, `--max-pods` vs IP exhaustion |
| Deleted pod stuck `Terminating` | Finalizer can't complete | `.metadata.finalizers` → fix controller → last resort patch it out |

```bash
# control-plane node surgery
crictl ps | crictl logs <id>          # when docker/cli gone — CRI direct
etcdctl snapshot save backup.db      # etcd backup (self-managed clusters)
kubectl get --raw='/readyz?verbose'  # apiserver health detail
```

## 6. kubectl Debug Toolkit & Low-Level Node Forensics (`nsenter`)

```bash
kubectl debug pod/<p> -it --image=nicolaka/netshoot --target=<ctr>   # shares process/net ns of distroless ctr!
kubectl debug node/<n> -it --image=ubuntu                            # node shell (host fs at /host)
kubectl run tmp --rm -it --image=nicolaka/netshoot -- bash           # network swiss-army scratch pod
kubectl port-forward svc/<s> 8080:80                                 # bypass Ingress/LB to test Service directly
kubectl get --raw /metrics | kubectl get --raw='/readyz?verbose'     # apiserver internal health
```

### Low-Level Node / Kernel Debugging (When `kubectl exec` Can't Run)

When a container is `distroless`, hung, or lacks `tcpdump`/`ss`/`strace`, SSH/debug onto the worker node and enter the container's namespaces directly from the host using **`nsenter`** (uses host binaries inside the container's network/PID namespace!):

```bash
# 1. Find container ID and host PID via crictl on the worker node
CID=$(crictl ps --name myapp -q)
PID=$(crictl inspect $CID | jq '.info.pid')

# 2. Run host's tcpdump/ss/ip INSIDE the pod's network namespace (-n)
nsenter -t $PID -n ss -tulpn
nsenter -t $PID -n tcpdump -nn -i any port 8080 -w /tmp/pod.pcap

# 3. Inspect container's exact cgroup v2 memory & CPU throttling on the host
cat /proc/$PID/cgroup
cat /sys/fs/cgroup/<pod-cgroup-path>/cpu.stat        # check nr_throttled & throttled_usec
cat /sys/fs/cgroup/<pod-cgroup-path>/memory.peak     # peak memory before OOM
dmesg -T | grep -i -E 'oom|killed process|conntrack' # kernel OOM killer & conntrack drops
```

---

## 7. Real-Life Production Kubernetes Case Studies (Staff Interview Scenarios)

### Case Study 1: Random `502`/`504` Errors During Normal Rolling Updates (Zero App Bugs)

- **Symptom**: Every deployment (`maxUnavailable: 0`, readiness probe configured) causes 3–10 seconds of `502 Bad Gateway` / `connection reset by peer` on 1–2% of client requests.
- **Root Cause (Two-Part Race)**:
  1. **Control-Plane Propagation Race**: When a Pod transitions to `Terminating`, two things happen **in parallel, asynchronously**: (a) kubelet sends `SIGTERM` to the container immediately, and (b) `endpointslice-controller` removes the Pod IP → `kube-proxy` / Ingress controller updates iptables/Nginx/ALB. Step (b) takes `1–5 seconds`. If the app closes its listening socket immediately on `SIGTERM`, packets still arriving during that 1–5s window hit a closed port (`RST` → `502`).
  2. **App Ignored `SIGTERM`**: Or the Dockerfile used shell form (`CMD java -jar app.jar`), so `/bin/sh` swallowed `SIGTERM`, the app kept accepting new requests until `30s`, and was killed mid-request by `SIGKILL`.
- **Complete Fix**:
  1. Add `lifecycle.preStop.exec.command: ["sh", "-c", "sleep 10"]` (for distroless without shell, handle the delay in the app's `SIGTERM` handler before closing the listener).
  2. Ensure **exec form** `ENTRYPOINT ["java", ...]` so the app is PID 1 (or use `tini`).
  3. Set `server.shutdown=graceful` (Spring Boot) and ensure `terminationGracePeriodSeconds (45s) > preStop (10s) + max_request_drain (25s)`.

### Case Study 2: Intermittent `5s` DNS Lookup Timeouts on Kubernetes (`conntrack` Race)

- **Symptom**: 0.1% of outbound HTTP calls fail or take **exactly `5000ms` extra** in DNS resolution (`getaddrinfo EAI_AGAIN`). CoreDNS CPU/memory is <10%.
- **Root Cause**:
  1. glibc sends **A (IPv4) and AAAA (IPv6) UDP DNS queries in parallel** from the same source UDP socket.
  2. Linux netfilter `nf_conntrack` had a known race condition when two UDP packets from the same socket traverse DNAT (`ClusterIP 10.96.0.10` → CoreDNS Pod IP) simultaneously on different CPU cores — one packet gets dropped, triggering glibc's **5-second UDP retry timeout**.
  3. Compounded by `ndots:5` multiplying every external lookup by 5×.
- **Complete Fix**:
  1. Deploy **NodeLocal DNSCache** (listens on node-local link-local IP `169.254.20.10` with `NOTRACK` iptables rules bypassing `conntrack`, and upgrades cache misses to CoreDNS over **TCP**).
  2. Or add `dnsConfig: { options: [{ name: single-request-reopen }, { name: ndots, value: "2" }] }`.

### Case Study 3: Java / Go Pod `OOMKilled (137)` When Heap Metrics Show Only 60% Used

- **Symptom**: Grafana shows JVM Heap at `1.2 GiB`, container `limits.memory: 2Gi`, yet kubelet repeatedly kills the container with `OOMKilled (Exit Code 137)`.
- **Root Cause**: Linux cgroup memory limit accounts for **RSS + non-heap memory + kernel page cache**:
  - **JVM total memory** = Heap (`-Xmx`) + **Metaspace** + **Thread Stacks** (`1MB × 300 threads = 300MB`) + **Direct ByteBuffers / Netty off-heap** + **JNI/glibc native `malloc` arenas** (`MALLOC_ARENA_MAX`).
- **Complete Fix**:
  1. Size `-XX:MaxRAMPercentage=70.0` (not `90%+`) to leave 30% headroom for Metaspace, thread stacks, and off-heap Netty buffers.
  2. Cap `MALLOC_ARENA_MAX=2` (or use `jemalloc`) if native memory fragmentation climbs, and cap `-XX:MaxDirectMemorySize`.
  3. Inspect `working_set_bytes` (`container_memory_working_set_bytes`), not JVM heap alone — kubelet evicts and cgroup OOMs on working set / RSS!

### Case Study 4: Webhook Admission Controller Deadlock (`kube-apiserver` Rejects All Pod Creates)

- **Symptom**: After a node drain or cluster outage, **zero pods can be created** anywhere in the cluster (`InternalError: failed calling webhook "validate.kyverno.svc": connection refused`), including the Kyverno/OPA/Istio webhook pods themselves!
- **Root Cause**: A `ValidatingWebhookConfiguration` or `MutatingWebhookConfiguration` was configured with `failurePolicy: Fail` and a broad `namespaceSelector` that matched **`kube-system` and the webhook's own namespace** — creating a circular bootstrap deadlock when all webhook replicas died at once.
- **Complete Fix**:
  1. Always exclude `kube-system` and the webhook controller's own namespace via `namespaceSelector.matchExpressions` (`kubernetes.io/metadata.name notin [kube-system, kyverno, istio-system]`).
  2. Run ≥3 webhook replicas with `PodAntiAffinity` + `PodDisruptionBudget (minAvailable: 1)` + high `PriorityClass`.
  3. Prefer native in-process **CEL `ValidatingAdmissionPolicy`** (K8s v1.30+) for simple rules so no webhook network hop exists.

---

## 8. Recall — Sound Bites

- "`describe` first — events are the black box recorder."
- "`logs --previous` is the difference between crash and mystery."
- "137 = OOM or kill; 143 = normal SIGTERM; 1 = read the app logs."
- "Empty endpoints = selector, labels, or readiness — always."
- "Fix order: pod → service → DNS → policy → node → control plane."
- "Pending = scheduler said no; describe tells you why."
