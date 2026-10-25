# Docker & Kubernetes Troubleshooting Interview Guide

Practical diagnosis patterns for developers and on-call engineers. Start
with read-only evidence, identify the failing layer, and make the smallest
safe change. For broader production case studies, see
[Docker/Kubernetes Case Studies](./Docker-Kubernetes-Case-Studies-and-Scenarios.md).

## 1. Universal Troubleshooting Sequence

Use this sequence before changing the workload:

1. **Scope**: namespace, workload, Pod, node, zone, version, time window,
   user impact, and whether one replica or the fleet is affected.
2. **Inspect state and events**:

   ```bash
   kubectl get pods -n <namespace> -o wide
   kubectl describe pod <pod> -n <namespace>
   kubectl get events -n <namespace> --sort-by=.metadata.creationTimestamp
   ```

3. **Read current and previous logs**:

   ```bash
   kubectl logs <pod> -n <namespace> -c <container>
   kubectl logs <pod> -n <namespace> -c <container> --previous
   ```

   `--previous` is useful only when a prior container instance exists.
   A container that never started may have no application logs.
4. **Inspect the owning controller and effective spec**: Deployment,
   ReplicaSet, StatefulSet, Job, rendered configuration, probes,
   resources, image digest, volumes, and identity. Avoid printing Secret
   data into terminals or shared logs.
5. **Follow the dependency path**: Pod readiness → Service selector and
   EndpointSlices → DNS → NetworkPolicy/CNI → Ingress/Gateway/LB →
   downstream dependency.
6. **Check node and cluster constraints**: pressure, allocatable
   resources, quota, storage, runtime, CNI, admission webhooks, and
   control-plane health.
7. **Mitigate with a reversible action**, then verify user-facing SLOs
   and monitor for recurrence.

Avoid making several changes at once; otherwise you lose causal evidence.
Use privileged debug tools only with authorization and a bounded scope.

## 2. Status and Error Taxonomy

Pod status strings are clues, not complete root causes. Some terms below
are Kubernetes waiting reasons; others are underlying causes or runtime
errors.

- **`ErrImagePull`**: A pull failed. Read Pod events for the registry
  response, image reference, credentials, TLS, DNS, and egress.
- **`ImagePullBackOff`**: Kubernetes is backing off after failed pulls.
  Check the same evidence as `ErrImagePull`; backoff is not the cause.
- **`InvalidImageName`**: The configured image reference is malformed or
  cannot be resolved. Check rendered manifests and templating.
- **Registry unavailable**: Could be network, DNS, TLS, authentication, or
  a registry-side failure. Test the node/runtime path and event details.
- **`CrashLoopBackOff`**: A container repeatedly exits and is restarted
  with backoff. Check previous logs, exit reason, probes, config,
  dependencies, and memory.
- **`CreateContainerConfigError`**: A required config reference or
  container setup is invalid. Events often identify the missing key or
  object.
- **`CreateContainerError`**: The runtime could not create the container.
  Check mounts, entrypoint, permissions, and runtime events.
- **`Pending`**: The Pod is not yet running; it may be unscheduled or
  waiting on setup. Inspect events, PVC, and image-pull state.
- **`OOMKilled`**: The container was killed after memory enforcement.
  Check last state, cgroup/container metrics, memory profile, and limit.
- **Kill/stop runtime error**: Kubelet/runtime had trouble stopping a
  container. Inspect node, kubelet, and CRI runtime logs.

**Important distinction**: `RegistryUnavailable` and `InvalidImageName`
describe causes or event text; they are not universal Kubernetes Pod
phases. `KillContainerError` can appear in runtime/event contexts, but is
not a standard Pod phase. `CrashLoopBackOff` is a backoff state, not an
application diagnosis.

## 3. Image Build and Pull Failures

### Q1. A Pod reports `ErrImagePull` and then `ImagePullBackOff`. What do you do?

1. Read the exact event message and inspect the effective image reference:

   ```bash
   kubectl describe pod <pod> -n <namespace>
   kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.containers[*].image}'
   ```

2. Classify the failure:
   - `manifest unknown` / not found: repository, tag, or digest is wrong.
   - `unauthorized` / `denied`: pull identity or registry permissions.
   - timeout / connection refused: DNS, egress, proxy, firewall, registry
     availability, or node routing.
   - certificate error: registry trust chain or node/runtime CA config.
   - unsupported platform: image manifest lacks the node architecture.
3. Verify the node's container runtime can reach and authenticate to the
   registry. Kubernetes pulls from the node/runtime path, not from the
   developer laptop.
4. Fix the source reference or credentials and roll out through the
   normal deployment path. Use a digest for production identity.

Do not create a registry Secret with a password directly on a shared
command line: shell history and process listings may expose it. Use an
approved secret workflow or a protected interactive/automation mechanism.
Do not print Secret YAML during diagnosis.

### Q2. The image name looks like a URL or contains an unexpanded variable

**Cause**: Image references are registry/repository references, not
arbitrary HTTP URLs. A template such as `${VERSION}` may reach the API
literally if substitution did not run.

**Fix**: Inspect the rendered manifest and effective Pod spec, validate
the tag/digest in CI, and fail manifest rendering when required variables
are unset. Pin by digest or immutable release tag.

### Q3. Image builds succeed locally but fail in cluster on architecture

**Cause**: Local machine and nodes may use different CPU architectures,
base images, libc, certificates, or build targets.

**Fix**:

- Publish a multi-platform manifest or build for the cluster's target
  architecture.
- Inspect node architecture and image manifest.
- Test the final runtime image on a compatible platform.
- Avoid relying on developer-specific paths or locally cached layers.

For Kubernetes node-level inspection, use the supported CRI tooling (for
example `crictl`) rather than assuming Docker Engine is installed.

## 4. Container Starts, Then Exits

### Q4. How do you debug `CrashLoopBackOff`?

1. Get `lastState`, exit code, restart count, and events:

   ```bash
   kubectl describe pod <pod> -n <namespace>
   kubectl logs <pod> -n <namespace> -c <container> --previous
   ```

2. Check the termination reason:
   - `OOMKilled`: investigate cgroup memory and allocation.
   - exit `1`: inspect application/config/dependency errors.
   - exit `126`/`127`: executable permission or command/path issue.
   - exit `0` with repeated restarts: process may be a one-shot task
     incorrectly running under a controller/restart policy.
   - `137` or `143`: interpret with termination reason and events;
     exit code alone does not prove OOM or an orderly shutdown.
3. Check startup/readiness/liveness probes and timing. A liveness check
   that begins before initialization finishes can restart a healthy but
   slow-starting process; use `startupProbe` where appropriate.
4. Compare effective environment and mounted configuration without
   exposing secret values. Verify required keys exist and are current.
5. Check dependencies using bounded startup retries. Do not make
   transient dependency failure a liveness failure for every replica.
6. Apply one fix, observe several restart/traffic cycles, and verify the
   process is stable under representative load.

### Q5. The Pod restarts, but logs appear empty

Check `--previous`, container name, event timestamps, exit state, and
whether the application ever reached its logger initialization. A probe
may kill it before logs flush. Check OOM events and node/kernel evidence.
For a process that exits before `exec`, inspect image `ENTRYPOINT`,
`command`, `args`, permissions, and mounted files.

### Q6. What does exit code 137 mean? Is it always OOM?

No. `137` commonly represents termination by `SIGKILL` (`128 + 9`), which
can result from a cgroup OOM kill, forced termination after a grace
period, eviction, or another external kill. Confirm `reason: OOMKilled`,
Pod events, cgroup `memory.events`, node pressure, and runtime logs.
Similarly, `143` commonly corresponds to `SIGTERM`, but inspect the
termination context rather than assuming it is always graceful.

### Q7. A Pod is OOMKilled while application heap metrics look healthy

**Why**: The container limit covers more than language-managed heap:
native allocations, thread stacks, direct buffers, runtime overhead, and
charged page cache can contribute. Metrics such as working set are useful
signals but are not the kernel enforcement counter or identical to RSS.

**Investigate**:

- Compare container memory, cgroup current/peak/events, process RSS,
  runtime heap, external/native memory, and OOM events.
- Correlate with request payloads, concurrency, file buffering, queues,
  caches, and native libraries.
- Check whether the limit is too low for measured peak and startup needs,
  or whether unbounded work is accumulating.

**Fix**: Bound concurrency and queues, stream large payloads with
backpressure, close resources, fix retention/native leaks, and size
requests/limits using representative load plus headroom. Increasing the
limit without finding the trend can defer the next OOM.

## 5. Scheduling and Resource Problems

### Q8. A Pod is `Pending` despite free CPU on some nodes

Read scheduler events first:

```bash
kubectl describe pod <pod> -n <namespace>
kubectl get nodes
```

Common constraints include insufficient requested resources on eligible
nodes, taints without tolerations, node/pod affinity, topology spread,
quota, unbound PVC, volume zone mismatch, GPU/architecture requirements,
or maximum pod/IP capacity. Compare requests with **allocatable** capacity
on eligible nodes; unused capacity elsewhere does not make a placement
possible. Fix the constraint rather than blindly lowering requests.

### Q9. Nodes show pressure and Pods are evicted

Inspect node conditions, eviction events, ephemeral storage, memory,
inode use, container logs, `emptyDir`, and image garbage collection.
Check requests/limits, QoS class, system reservations, and which process
consumes resources. Protect critical workloads through correct requests,
capacity planning, and disruption policy; QoS does not prevent every
resource failure. Validate cleanup and autoscaling behavior after repair.

### Q10. HPA shows unknown metrics or does not scale

Check HPA events/status, metrics API availability, target metric,
resource requests, min/max replicas, stabilization, quotas, and whether
new Pods can schedule. CPU utilization depends on requests. If using an
external metric, verify adapter freshness and units. Ensure the node
autoscaler can add eligible nodes and that downstream databases can
support the increased replica connection count.

## 6. Networking and Service Discovery

### Q11. Service is unreachable although the Pods are running

Follow the path:

1. Is the Pod Ready, and does its port listener bind to the Pod interface?
2. Does the Service selector match Pod labels?
3. Do EndpointSlices contain ready endpoints?

   ```bash
   kubectl get svc <service> -n <namespace> -o yaml
   kubectl get endpointslices -n <namespace> \
     -l kubernetes.io/service-name=<service>
   ```

4. Do Service `port` and `targetPort` match the application listener?
5. Is DNS resolving to the expected Service address?
6. Do NetworkPolicies, CNI, service mesh, firewall, or cloud routes block
   the path?
7. Does the return path work, and is the client using the correct protocol?

Test from an authorized diagnostic Pod or ephemeral container where
appropriate. A Pod being `Running` does not mean it is Ready or reachable.

### Q12. DNS lookups fail or take several seconds inside Pods

- Inspect `/etc/resolv.conf`, namespace search domains, `ndots`, DNS
  policy, CoreDNS health and logs, and NetworkPolicy for UDP/TCP port 53.
- Compare lookup behavior for cluster-local and external names.
- Check node-local DNS cache, conntrack pressure, packet drops, and
  upstream resolver behavior when evidence points below CoreDNS.
- Avoid changing cluster DNS options globally based on one Pod. Test the
  change with representative names and both IPv4/IPv6 paths.

For a repeatable delay (for example, a consistent multi-second timeout),
compare resolver timing with packet captures and node/kernel evidence.
Conntrack or UDP handling can be a hypothesis in some environments, but
do not diagnose a kernel race from timing alone. Verify packet loss,
kernel/runtime version, resolver retries, `ndots`, and CoreDNS/upstream
health before considering NodeLocal DNSCache or resolver-option changes.

### Q13. Only some clients see 502/504 or uneven traffic

Compare request route, ingress/LB target, Pod/zone, protocol, connection
reuse, timeout settings, and recent endpoint changes. Long-lived HTTP/2
or WebSocket connections can stay pinned to one backend. During
termination, endpoint propagation and app shutdown are asynchronous.
Use graceful drain, bounded deadlines, and measured proxy settings.
Correlate ingress logs with application traces; do not assume every 502
is a readiness-probe defect.

## 7. Storage and Stateful Workloads

### Q14. PVC is Pending or volume mount fails

Check PVC/PV events, StorageClass, provisioner/CSI controller and node
plugin, access mode, capacity, topology/AZ, quota, and volume attachment
state. Determine whether failure occurs during provisioning, attach,
mount, filesystem, or application startup. Protect data: do not delete a
claim, PV, or cloud disk until backup and reclaim behavior are understood.
After repair, validate filesystem access and application consistency.

### Q15. StatefulSet Pod does not recover after node failure

Verify whether the old node and Pod are actually gone, whether the volume
is still attached, and the storage driver's fencing/reattach behavior.
Check StatefulSet identity, PVC binding, zone topology, and application
replication. Do not force-delete a Pod or detach a volume until split-brain
and data corruption risks are understood. Follow the storage and
application-specific recovery runbook.

## 8. Node, Runtime, and Control-Plane Failures

### Q16. A Pod is stuck in `Terminating`

Inspect finalizers, deletion timestamp, preStop behavior, termination
grace period, in-flight work, kubelet/runtime health, and volume
detach/controller events. Fix the responsible controller or workload
shutdown. Removing finalizers or force-deleting can orphan resources or
data; use only after understanding ownership and impact.

### Q17. Container runtime reports it cannot stop a container

There is no single standard Pod phase named `KillContainerError`.
Inspect Pod events, node conditions, kubelet logs, CRI runtime logs, and
container ID. Determine whether the process is uninterruptible, the node
is unhealthy, or runtime communication failed.

If the node needs repair, coordinate with the workload owner and capacity
planner. Cordon/drain only when safe for PDBs, local storage, and quorum.
Restarting the container runtime on a live node can disrupt every
container there; use the platform runbook and escalation path.

### Q18. The API server accepts reads but rejects writes

Check API server readiness/error logs, admission webhooks, authorization,
API Priority and Fairness, etcd health/quorum/disk, and control-plane
provider status. Reads working does not uniquely prove etcd quorum loss.
If etcd recovery is suspected, preserve logs and snapshots and follow the
provider/self-managed recovery procedure. Avoid ad-hoc member removal or
snapshot restoration without an approved recovery point.

### Q19. Admission webhook blocks Pod creation

Inspect API server events/logs and the webhook configuration's service,
endpoints, TLS, timeout, `failurePolicy`, selectors, and namespace scope.
Check whether the webhook depends on Pods whose creation it blocks.
Recover webhook availability or apply the documented break-glass policy
with audit approval. Scope exclusions and failure policy must balance
availability against enforcement; do not disable admission checks
cluster-wide as a first response.

For critical webhooks, reduce correlated failure with multiple replicas,
topology spreading, adequate priority/capacity, and carefully scoped
selectors. Excluding system or webhook namespaces can help bootstrap, but
must be justified by the policy threat model. `failurePolicy: Ignore`
improves availability at the cost of bypassing that webhook during its
outage; apply only to rules where that trade-off is accepted.

### Q20. Kubernetes control-plane or node symptom: where do you start?

- **`kubectl` hangs or cannot connect to `:6443`**: Check API endpoint
  and load-balancer health plus provider control-plane status. For
  self-managed clusters, inspect API server health and logs.
- **Reads work but writes fail**: Check API server errors, authorization,
  admission webhooks, APF, etcd quorum, and control-plane storage.
- **`x509: certificate has expired`**: Confirm the affected certificate
  and issuer. Follow the managed-provider or kubeadm-specific renewal
  runbook.
- **Pods remain Pending cluster-wide**: Read scheduler events and
  scheduler health/logs; inspect CNI, node readiness, quotas, and IP
  capacity.
- **Node is `NotReady` or reports PLEG/runtime errors**: Check kubelet
  and CRI runtime health, node pressure, CNI, and node events. Avoid
  restarting the runtime without a node maintenance plan.
- **Pods fail after a node upgrade**: Compare node image/runtime/CNI
  versions, IPAM capacity, kernel support, and DaemonSet readiness.
  Pause further rollout while diagnosing.
- **Pod remains Terminating**: Check finalizers and controller/volume
  detach progress. Patch finalizers only as a documented last resort.

For self-managed etcd, use the cluster's secured `etcdctl` configuration
and recovery runbook to inspect member health and snapshots. Do not run
member removal or snapshot restore as a generic troubleshooting command.

## 9. Safe Debugging Tools

### Read-only first

```bash
kubectl get pod <pod> -n <namespace> -o wide
kubectl describe pod <pod> -n <namespace>
kubectl get events -n <namespace> --sort-by=.metadata.creationTimestamp
kubectl get deploy,rs,svc -n <namespace>
kubectl top pod <pod> -n <namespace>
kubectl describe node <node>
```

`kubectl top` requires a functioning metrics pipeline and is not a
historical profiler. Compare it with monitoring and cgroup evidence.

### When the image is distroless or has no shell

Use an approved ephemeral debug container or node-debug workflow with
least privilege. Verify the target namespace and sharing behavior: an
ephemeral container may share Pod networking, but process namespace
sharing depends on configuration and runtime. Capture only required
traffic/data, protect packet captures, and remove temporary resources
through the supported process.

Example command shapes; available flags and permissions vary by cluster:

```bash
kubectl debug pod/<pod> -n <namespace> -it \
  --image=<approved-debug-image> \
  --target=<container>
kubectl debug node/<node> -it \
  --image=<approved-node-debug-image>
```

Node-level `crictl`, `nsenter`, packet capture, or cgroup inspection
requires node access and may expose other tenants' traffic or data. Use
the platform's audited break-glass process. On the node, identify the
container through the CRI runtime, verify its host PID and cgroup, and
inspect only the required namespace/metrics. Do not copy a generic
`nsenter` command into production without confirming PID namespace,
runtime, cgroup layout, and authorization.

### Exit code quick reference

- `0`: Process exited successfully. Check workload type and restart policy.
- `1`: Application error. Check logs and application diagnostics.
- `126`: Command found but not executable. Check file mode, interpreter,
  and mount options.
- `127`: Command not found. Check entrypoint, `command`, `args`, and image.
- `137`: Often killed by `SIGKILL`. Check termination reason, cgroup OOM
  events, eviction, and force-kill context.
- `143`: Often terminated by `SIGTERM`. Check rollout, shutdown logs, and
  grace-period timing.

## 10. Interview Sound Bites

- "`describe` and events explain the control-plane decision; logs explain
  what the process did."
- "`ImagePullBackOff` is retry state, not the root cause."
- "`CrashLoopBackOff` needs the previous container state, probe history,
  and exit reason—not just a larger delay."
- "`137` means SIGKILL commonly, not automatically OOM."
- "Running is not Ready; Ready is not proof that the full user journey
  works."
- "A Pod's image digest can be identical while its node, configuration,
  identity, network path, storage, and traffic differ."
- "Protect data and quorum before force deletion, detach, or runtime
  restart."

## 11. Supporting-Source Coverage

- `Docker_Kubernetes (1).md`: `ErrImagePull`, `ImagePullBackOff`,
  registry reachability, invalid image references, `CrashLoopBackOff`,
  and container stop/runtime failures.
- `Docker_Kubernetes.md`: OOMKilled and image-pull failures,
  Services/traffic, autoscaling, monitoring, etcd, persistent storage,
  and common design mistakes.
- `DevOps_ General Notes (1).md`: Cluster capacity,
  same-image/different-Pod diagnosis, and scenario-oriented answers.
- `DevOps_ General Notes (2).md`: Retry storms, noisy neighbors,
  dependency bootstrap failures, and outbound proxy/pool exhaustion.
