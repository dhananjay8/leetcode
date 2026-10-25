# Docker & Kubernetes Case Studies and Scenario Questions

Use this guide for system-design and production-operations prompts that
combine container images, Kubernetes orchestration, networking, storage,
autoscaling, delivery, and reliability. For command-by-command diagnosis,
see [Docker/Kubernetes Troubleshooting](./Docker-Kubernetes-Troubleshooting-Interview-Guide.md).
For fundamentals, use the [Kubernetes topic index](./README.md) and
[DevOps Docker notes](../DevOps/03-docker.md).

## 1. Scenario Answer Pattern

1. Establish user impact, scope, timeline, recent changes, and data risk.
2. Identify the layer: image/build, container process, Pod, scheduler,
   node, Service/Ingress, storage, dependency, or control plane.
3. State the evidence that would distinguish the top hypotheses.
4. Mitigate with a reversible action; protect data and preserve useful
   evidence.
5. Verify through user-facing signals and representative traffic.
6. Add an owner, guardrail, and measurable follow-up.

Commands and thresholds below are examples. Confirm Kubernetes version,
runtime, cloud integration, permissions, and service SLO before using them.

## 2. Container Delivery and Runtime Cases

### Case 1: "It works on my machine" but the image fails in the cluster

**Prompt**: The developer's local container starts, but the Kubernetes
workload exits immediately.

**Investigation**:

1. Compare the local and deployed **image digest**, platform architecture,
   build arguments, entrypoint, command, working directory, user, and
   mounted configuration. Tags alone do not prove image identity.
2. Check `kubectl describe pod` events, current and previous container
   logs, exit code, and the rendered Pod spec.
3. Verify that required files are present in the final image stage and
   that executable permissions and paths are correct.
4. Check whether the application binds to `0.0.0.0` and the expected
   port, rather than only loopback or a developer-specific address.
5. Validate runtime architecture (`amd64`/`arm64`), libc assumptions,
   CA certificates, DNS, and environment variables.

**Fix and prevention**:

- Reproduce with the exact digest and runtime configuration.
- Use a multi-stage build with an explicit runtime stage, a non-root
  process, pinned base image digest, and a `.dockerignore`.
- Add a container smoke test that runs the final image—not just the
  build stage—in CI.
- Promote the same digest through environments.

### Case 2: A container exits during Kubernetes shutdown; rollout causes 502s

**Prompt**: Readiness is configured and `maxUnavailable: 0`, but users see
errors during rolling updates.

**Investigation**:

- Compare Pod termination timestamps, EndpointSlice changes, ingress/LB
  logs, application shutdown logs, request duration, and termination
  grace-period events.
- Verify the application receives `SIGTERM`. An exec-form `ENTRYPOINT`
  or an init process may be needed when a shell wrapper prevents proper
  signal delivery.
- Check whether the app stops accepting new work, waits for in-flight
  requests, closes keep-alive connections, and exits before grace expires.
- Check long-lived HTTP/2, WebSocket, streaming, or queue-consumer work;
  HTTP readiness alone does not drain all protocols.

**Fix and prevention**:

1. On termination, mark the instance unready and stop accepting new work.
2. Allow endpoint and proxy updates to propagate while maintaining a
   bounded graceful-drain period.
3. Finish or cancel in-flight work according to the request deadline;
   then close dependencies and exit.
4. Set `terminationGracePeriodSeconds` from measured drain time, with
   a bounded fallback. Use a `preStop` delay only if measurements show
   endpoint propagation needs it.
5. Test under real traffic and verify error rate, drain duration, and
   termination events.

There is no universal sleep value or guarantee that `maxUnavailable: 0`
alone provides zero downtime.

### Case 3: A Docker/OCI host is running out of disk

**Prompt**: Image builds or container starts fail with no space left,
although application data volumes appear small.

**Investigation and response**:

- Check filesystem blocks and inodes separately (`df -h`, `df -i`),
  container runtime storage, writable layers, build cache, image layers,
  log rotation, and deleted-but-open files.
- Identify which data is disposable before pruning. Do not run broad
  system-prune commands on a shared production host without ownership
  and impact review.
- Bound log retention, use external log collection, remove unused
  images through the platform's supported garbage-collection process,
  and separate ephemeral scratch from persistent application data.
- Add disk/inode alerts with headroom and test cleanup policies.

**Kubernetes follow-up**: Check node `DiskPressure`, Pod
`ephemeral-storage` requests/limits, `emptyDir` usage, image garbage
collection, and eviction events. Kubernetes node storage pressure is
not fixed by increasing a container's memory limit.

## 3. Kubernetes Architecture and Traffic Scenarios

### Case 4: Design the traffic path for an internet-facing application

**Prompt**: Explain how a request reaches a Pod, how to expose it, and how
you would debug uneven or failed traffic.

**Answer**:

1. Select exposure by requirement: `ClusterIP` for in-cluster access,
   `LoadBalancer` for a cloud L4/L7 service, and Ingress or Gateway API
   when an installed controller provides shared L7 routing.
2. Map external listener → load balancer/controller → Service
   `port`/`targetPort` → ready endpoints → process listener. A
   `containerPort` declaration documents a port; it does not make the
   process listen or expose it by itself.
3. Define health semantics: startup for slow initialization, readiness
   for traffic eligibility, and liveness only for a process that should
   be restarted when it is irrecoverably unhealthy.
4. Verify selectors, labels, EndpointSlices, target port, NetworkPolicy,
   DNS, TLS, proxy protocol/source IP requirements, and service mesh
   behavior.
5. Consider L4 versus L7 balancing, HTTP/2/gRPC connection reuse,
   WebSocket stickiness, client retries, idle timeouts, and cross-zone
   routing. Balancing often occurs per connection, not per request.
6. Measure request-level distribution, errors, latency, connection
   counts, and zone/node placement before changing topology.

### Case 5: Choose a traffic model for an internal service

**Prompt**: A service needs to be reached from other namespaces and a
selected external consumer.

**Answer**:

- Use a stable Kubernetes Service DNS name for in-cluster clients; apply
  namespace-aware NetworkPolicy for least-privilege traffic.
- For controlled external access, select an internal load balancer,
  Gateway/Ingress, or private endpoint according to protocol and cloud
  requirements. Avoid exposing a `NodePort` directly unless the network
  design specifically calls for it.
- Decide whether client identity must be preserved and whether proxies
  terminate TLS. Configure trusted forwarded headers only at known
  proxy boundaries.
- Check DNS, route tables, firewall/security rules, Service endpoints,
  and return path symmetry.
- Include a failure-mode test: one zone unavailable, endpoint removed,
  certificate rotation, and client reconnect.

### Case 6: HPA does not scale during a traffic spike

**Prompt**: Latency grows, but the number of replicas remains unchanged.

**Investigate**:

1. Inspect HPA status/events, target metric, current/desired replicas,
   metric API availability, and `minReplicas`/`maxReplicas`.
2. For CPU utilization, verify resource requests are present and reflect
   realistic capacity. Utilization is generally computed relative to
   requests; missing or unrealistic requests can make a CPU target
   ineffective.
3. Check whether pods can schedule: requests versus allocatable capacity,
   affinity/taints, quota, IP capacity, node-pool limits, and PVC zones.
4. Check scaling stabilization, readiness delays, startup time, and
   whether the workload is actually CPU-bound.
5. For queue-driven work, consider a queue-depth/custom metric and
   KEDA/HPA integration; use `minReplicas` or scale-to-zero only when
   cold-start and queue semantics allow it.

**Fix and validation**:

- Correct metrics and requests; configure the cluster autoscaler or
  Karpenter with eligible capacity and quotas.
- Load-test the scale-out and scale-in path, including metric lag,
  cold-start, and downstream connection budgets.
- Ensure scaling the app does not overwhelm the database or an external
  dependency.

### Case 7: Cluster capacity is exhausted, but some nodes appear idle

**Prompt**: Pods remain Pending while dashboards show capacity somewhere
in the cluster.

**Answer**:

- Start with `FailedScheduling` events for the actual constraint:
  requests, taints, topology, affinity, PVC zone, quota, or maximum pod
  count/IPs.
- Compare pod requests with **allocatable** capacity on eligible nodes;
  cluster-wide free CPU does not imply a node can fit a pod.
- Check fragmentation, anti-affinity/spread rules, dedicated node pools,
  GPU or architecture requirements, and autoscaler provisioning limits.
- Right-size requests from representative peaks, not a single quiet
  sample. Preserve headroom for system daemons and disruption.
- Use quotas and LimitRanges to control tenant use; evaluate priorities
  and preemption carefully so a critical workload does not cause a
  harmful eviction cascade.
- Track Pending duration, utilization, evictions, throttling, OOMs, and
  cost after changes.

## 4. Kubernetes Operations and Resilience Case Studies

### Case 8: One Pod works and another fails despite the same image

**Prompt**: Replicas use the same image tag, but only one reports errors.

**Answer**:

1. Compare `imageID` digests; the same tag may point to different content.
2. Diff Pod specs, owner/controller revision, current and previous logs,
   events, environment at startup, mounted config, Secret references,
   service account, security context, resource limits, and probes.
3. Compare nodes and zones: kernel/runtime version, pressure, CNI,
   DNS/egress, local storage, and neighboring workload contention.
4. Compare traffic assignment, sticky sessions, Kafka partitions,
   hot keys, cache warmup, and connection-pool state.
5. Test the failing Pod and the healthy Pod against the same dependency
   using safe read-only probes. Do not assume a successful `kubectl diff`
   compares the two Pods; it compares desired and live manifests.
6. Drain or restart only after evidence capture and a safety check; verify
   that the failure does not move with the Pod to another node.

ConfigMap and Secret values supplied as environment variables are
snapshots at container start. Normal volume projections update
eventually, but a `subPath` mount does not refresh.

### Case 9: Kubernetes monitoring does not catch a bad release

**Prompt**: Pods are Ready, yet error rate and latency rise after rollout.

**Answer**:

- Put deployment revision, image digest, config revision, and rollout
  markers on service dashboards.
- Correlate Kubernetes events and rollout status with RED metrics
  (rate, errors, duration), saturation, dependency spans, and application
  logs.
- Make readiness answer whether the instance can safely receive traffic;
  do not confuse readiness with complete business validation.
- Add a bounded post-deploy smoke/synthetic transaction and progressive
  rollout analysis based on representative traffic and SLOs.
- Automate pause/rollback only when signals and rollback safety are
  understood; account for incompatible database changes.
- Test alert delivery and rollback in a non-production environment.

### Case 10: A persistent volume claim will not bind or attach

**Prompt**: A stateful Pod remains Pending or stuck mounting its volume.

**Answer**:

1. Read Pod and PVC events; inspect PVC, PV, StorageClass, CSI controller
   and node plugin health.
2. Check access mode, requested size, storage quota, topology/AZ,
   `volumeBindingMode`, node affinity, and whether another Pod already
   owns an exclusive attachment.
3. Separate provisioning failure from attach/mount failure and application
   filesystem errors. Check CSI and cloud-provider logs with the storage
   owner.
4. Protect data: do not delete the PVC/PV or change reclaim policy as a
   speculative fix. Confirm backup/snapshot and reclaim behavior first.
5. Fix the actual constraint; validate attachment, filesystem, ownership,
   and application recovery. Test failover and restore procedures.

### Case 11: A Kubernetes cluster becomes read-only

**Prompt**: `kubectl get` succeeds, but creating or updating resources
fails.

**Answer**:

- Check API server readiness, write errors, etcd endpoint health,
  quorum/member status, disk capacity/latency, certificates, and control
  plane events.
- Distinguish loss of etcd quorum from storage exhaustion, API admission
  failure, authorization, or API server overload.
- Avoid ad-hoc member removal, force-new-cluster operations, or restoring
  a snapshot while the cluster's state and recovery point are unclear.
- Follow the provider or etcd operator runbook, preserve snapshots and
  logs, and involve the control-plane owner. Recovery actions can discard
  recent state or worsen quorum.
- After recovery, verify controllers, leases, workloads, and audit events;
  test backups and quorum alarms before closing the incident.

### Case 12: Multi-cluster rollout fails in one region

**Prompt**: A release succeeds in most clusters but one cluster has a
different configuration or capacity issue.

**Answer**:

1. Roll out in bounded waves with per-cluster success criteria, timeout,
   artifact digest, configuration version, and observed status.
2. Pause or isolate the degraded cluster according to its user impact;
   do not assume a global rollback is always safer than leaving healthy
   regions on the new version.
3. Compare control-plane version, admission policies, CRDs, node images,
   secrets/config, quotas, network paths, and capacity.
4. Preserve the desired revision per cluster and ensure retries are
   idempotent. Prevent the next wave if a policy threshold is breached.
5. Reconcile the failed cluster after its specific blocker is fixed; avoid
   permanent version skew and document the deviation.

### Case 13: Kubelet cannot create Pods after a cluster upgrade

**Prompt**: New nodes join, but Pods are Pending or networking fails.

**Answer**:

- Inspect node conditions, kubelet/runtime logs, CNI DaemonSet readiness,
  CRI compatibility, kernel modules, IP allocation, `maxPods`, and
  deprecated APIs.
- Check whether new node images or CNI versions are compatible with the
  control plane and admission policies.
- Pause further node rollout; cordon only affected nodes when safe, with
  awareness of PDBs and workload capacity.
- Roll forward or roll back using the managed provider's supported
  procedure; validate a canary node before resuming.

## 5. Docker/Kubernetes Design Questions

### What container design choices matter in production?

- Build an immutable OCI image, pin dependencies and base digest, keep
  the runtime image minimal, run as non-root, and avoid embedding secrets.
- Use exec-form process startup or a suitable init process so signals and
  child processes are handled correctly.
- Define CPU, memory, and ephemeral-storage requests/limits based on
  measured load; understand CPU throttling and memory cgroup enforcement.
- Send logs to stdout/stderr or a supported collector; do not rely on
  container writable-layer persistence.
- Add startup/readiness/liveness probes for their distinct purposes,
  graceful shutdown, and request deadlines.
- Scan dependencies/images and verify signed provenance at deployment.

### How would you connect Pods to persistent storage?

Use PVCs backed by StorageClasses/CSI for durable data; choose access
mode, topology, performance class, encryption, backup, snapshots, and
reclaim policy based on the workload. StatefulSets provide stable identity
and per-replica claims but do not provide database replication or backup
by themselves. Test restore, zone failure, detach/attach, and recovery time.

### How would you monitor Kubernetes and CI/CD together?

Correlate source commit, build ID, image digest, manifest/config revision,
cluster, and rollout revision. Monitor pipeline queue/failure time;
deployment frequency/change failure/recovery; Pod scheduling, readiness,
restarts, resource saturation; service SLOs; and dependency health.
Keep labels bounded and avoid putting secrets or raw user identifiers in
metrics. Validate the alert path and rollback decision with a staged
failure exercise.

## 6. Interview Follow-Up Checklist

- What is the exact blast radius and which users are affected?
- Which signal or event would distinguish your top two hypotheses?
- Is the proposed operation safe for data, PDBs, and in-flight requests?
- Does an image tag refer to the expected digest?
- Are there hidden dependencies: DNS, identity, network policy, CSI,
  quotas, admission webhooks, or shared databases?
- How will you prove recovery and prevent the same failure?

## 7. Supporting-Source Coverage

- `Docker_Kubernetes.md`: Load-balancer use cases, Deployments and
  Services, autoscaling, CI/CD monitoring, design mistakes, etcd, traffic
  models, and persistent storage.
- `DevOps_ General Notes (1).md`: Kubernetes capacity and
  same-image/different-Pod scenarios.
- `DevOps_ General Notes (2).md`: Multi-cluster rollout, canary,
  noisy-neighbor, Vault/Consul startup dependency, and regional operations.
