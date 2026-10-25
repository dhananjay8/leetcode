# DevOps Interview — Questions & Answers

## 1. General DevOps

**Q: What is DevOps?**
Culture + practices combining development and operations to shorten the delivery lifecycle while keeping quality. Pillars: CI/CD, IaC, monitoring, automation, shared ownership.

**Q: What is Infrastructure as Code?**
Managing infra through declarative code — versioned, repeatable, auditable, testable. Terraform (multi-cloud), CloudFormation (AWS-only), Pulumi (real languages).

**Q: Explain the CI/CD pipeline you've built.**
Push → CI builds/tests/scans → Docker image tagged by SHA → push to registry → manifests repo updated → ArgoCD syncs to cluster → health/smoke checks → Slack notify. *(See `04-cicd.md` for the full flow and ops scenarios.)*

**Q: How do you handle a production incident?**
Detect (alert) → triage (severity, comms channel) → **mitigate first** (rollback/scale/failover — don't debug in place) → root-cause → blameless postmortem with action items.

**Q: Continuous Delivery vs Continuous Deployment?**
Delivery = auto to staging, human gate to prod. Deployment = fully automated to prod. The gate is the difference.

---

## 2. Docker & Containers

**Q: What is a container?**
A Linux process isolated by **namespaces** (view) and limited by **cgroups** (resources), packaged in layered filesystem layers. Shares host kernel — not a lightweight VM.

**Q: Docker image vs container?**
Image = immutable layered blueprint. Container = writable runtime instance of an image; many containers per image.

**Q: How does `docker run` work under the hood?**
CLI→dockerd→pull if needed→containerd creates writable layer→network namespace+veth+iptables→namespaces/cgroups→runc starts PID 1.

**Q: CMD vs ENTRYPOINT?**
ENTRYPOINT = the executable; CMD = default args (replaceable). `docker run img x` replaces CMD, not ENTRYPOINT.

**Q: Debug a crashing container?**
`docker ps -a` (exit code) → `docker logs` → `docker inspect` (`State.OOMKilled`) → `docker exec`/`--entrypoint sh` → `docker events` → `docker stats`. Exit 137 = OOM/SIGKILL, 1 = app error, 127 = command not found.

**Q: Reduce image size?**
Multi-stage build → minimal base (alpine/distroless) → fewer RUN layers → `.dockerignore` → `--omit=dev` → order layers for cache hits.

**Q: Volumes vs bind mounts vs tmpfs?**
Volumes: Docker-managed, portable, prod persistence. Bind mounts: host path, dev convenience. tmpfs: in-memory, ephemeral.

**Q: COPY vs ADD?**
ADD also fetches URLs and auto-extracts archives — prefer explicit COPY.

**Q: Docker network modes?**
bridge (default, NAT+docker0), host (share host netns), none, overlay (multi-host VXLAN), macvlan (real L2 identity). Embedded DNS at **127.0.0.11** resolves service names on user-defined networks.

**Q: Docker vs Podman?**
Podman is daemonless and rootless-first, docker-CLI-compatible; Docker uses a root daemon (dockerd). Kubernetes uses containerd directly since dockershim removal in v1.24.

**Q: Compose vs Swarm vs Kubernetes?**
Compose = multi-container on one host (dev/CI). Swarm = simple multi-host orchestration (maintenance mode). K8s = full orchestration — self-healing, autoscaling, ecosystem.

**Q: Production Docker challenges you've hit?** *(source Q20)*
Container sprawl → orchestration + labels/quotas. Persistent storage → volumes/external CSI. Security → scanning + least privilege. Disk fill from logs/images → log rotation + `system prune` policy. Clock/timezone drift → explicit TZ.

---

## 3. Cloud & Networking

**Q: What is a VPC?**
Isolated virtual network you control: CIDR, subnets, routes, SGs/NACLs. Segregates environments; public subnet has IGW route, private uses NAT for egress.

**Q: Load balancer types?**
ALB = L7, host/path routing, TLS termination. NLB = L4, ultra-low latency, static IPs. Health checks gate traffic.

**Q: Horizontal vs vertical scaling?**
Vertical = bigger instance (simple, ceiling, no app change). Horizontal = more instances (needs LB + statelessness, near-unbounded, adds resilience). K8s: HPA = horizontal, VPA = vertical.

**Q: High availability on AWS?**
Multi-AZ compute behind ALB + ASG; RDS Multi-AZ; S3 (11 nines durability); Route53 health-check failover; stateless app tier.

**Q: Security Group vs NACL?**
SG = instance-level, **stateful**, allow-only. NACL = subnet-level, **stateless**, allow+deny, numbered-rule evaluation.

---

## 4. Terraform

**Q: What is state?**
State maps configuration to real resource IDs/metadata. Use an encrypted
remote backend with locking and access controls; S3 backends can use an S3
lockfile on supported Terraform versions or legacy DynamoDB locking.
Do not commit or casually hand-edit state.

**Q: Two `terraform apply` at once?**
Without locking → state races and possible corruption. Use backend locking
(for example an S3 lockfile, or DynamoDB on older S3 backend setups).

**Q: Multiple environments?**
Workspaces for simple cases; separate state + `env.tfvars` per env (preferred); Terragrunt for DRY at scale.

**Q: Secrets in Terraform?**
`sensitive = true` vars, `TF_VAR_*` env, or data-source into Secrets Manager/Vault. Never in `.tf` — state also stores values, so encrypt the backend.

---

## 5. Monitoring & SRE

**Q: Four golden signals?**
Latency, Traffic, Errors, Saturation.

**Q: Error budget?**
99.9% SLO = 43.2 min/month of allowed downtime. Spend on velocity; exhausted → freeze risky releases.

**Q: Prevent alert fatigue?**
Actionable-only paging, severity tiers, `for:` durations, grouping, runbooks, escalation, monthly alert review/pruning.

**Q: What do you monitor for a web app?**
p50/p95/p99 latency, 4xx/5xx rate, RPS, saturation (CPU/mem/disk/pools), dependency latency, business KPIs.

---

## 6. Scenarios

**Q: Website down — walk me through it.**
Dashboards → DNS (`dig`) → LB target health → pods (`kubectl get pods`) → logs → dependencies → recent deploys → resources (disk/OOM).

**Q: Zero-downtime DB migration?**
Replicate old→new → lag → 0 → cutover app (config/DNS flag) → verify → decommission. Keep a reversible window.

**Q: Deploy caused an error spike?**
Rollback immediately → verify recovery → diff old/new → fix + regression test → redeploy under canary.

**Q: Failed build in pipeline?** *(source Q23)*
Read the failing stage's logs → notify → retry only transient steps → isolate to stage → keep last-good artifact for deploy.

**Q: Latency spikes for 30% of users, no crashes?** *(source advanced)*
Compare latency histograms by pod/zone/version → filter logs by window+labels → check service endpoints/network policies/sidecars → trace slow requests → load-test suspect pods in isolation.

**Q:Zero-downtime deployments?**
Rolling update (`maxUnavailable:0`) + readiness probes + graceful SIGTERM handling + PDB; canary/blue-green for extra assurance.

**Q: CI/CD secrets handling?**
Pipeline secret store (masked) → env injection at runtime → External Secrets → Vault/AWS SM in cluster → OIDC over static keys → rotate.

**Q: Server says `No space left on device`, but `df -h` shows 45% free?**
Two culprits: (1) **Deleted file still held open** by a running process (`lsof +L1` — truncate via `/proc/<pid>/fd/<n>` or reload the process); (2) **Inode exhaustion** (`df -i` at 100% from millions of tiny files).

**Q: Load average is 40 on an 8-CPU host, but CPU utilization is 10%. Why?**
Linux load average counts processes in **`R` (runnable) + `D` (uninterruptible disk/NFS sleep)**. Threads are blocked on slow storage/NFS I/O — check `iostat -xz 1`, `vmstat 1`, and `ps aux | awk '$8 ~ /D/'`.

**Q: Why does `docker stop` take exactly 10s (or K8s pod deletion 30s) and exit with 137?**
The container's **PID 1** used shell form (`CMD node app.js` → `/bin/sh -c`) or didn't register a `SIGTERM` handler. PID 1 ignores default signals, waits out the grace period, then gets `SIGKILL`ed (`128 + 9 = 137`). Fix: JSON exec form `["node", "app.js"]` + `tini` / `--init`.

**Q: Why is L4 load balancing broken for gRPC, and how do you fix it?**
gRPC multiplexes requests over a **single long-lived HTTP/2 TCP connection**. An L4 LB balances at TCP connection setup, pinning all requests from one client to one backend pod. Fix: L7 proxy (Envoy, Nginx `grpc_pass`, ALB with HTTP/2 target group) or client-side load balancing with headless Service DNS.

**Q: Ansible vs Terraform vs Puppet/Chef — when do you use which?**
**Terraform** = declarative *infrastructure provisioning* with state file (VPCs, EKS, RDS). **Ansible** = agentless (SSH/WinRM) *configuration management & procedural orchestration* (OS patching, running `qhelm`/Helm release playbooks across pods). **Puppet/Chef** = agent-based pull configuration management for large VM fleets with continuous drift convergence.

---

## 7. Staff-Level Scenario Questions (Structured Answers)

### CI/CD & Pipelines

**Q: Your deployment pipeline fails at random stages. How do you make it more reliable?**

- **1. Measure & Classify Failure Modes (Don't Guess)**: Tag every failed build for 2 weeks by failure class: (a) **Flaky test** (timing/race, shared test DB), (b) **Infra/ephemeral flake** (spot runner preemption, Docker registry `503`, npm/Maven timeout), or (c) **Non-deterministic build** (unpinned packages, `:latest` base images).
- **2. Quarantine Flaky Tests**: Move non-deterministic tests into a quarantined suite with an automated **flake budget** (e.g., `>1%` flake rate auto-opens a ticket and blocks the owning team's PRs if unfixed in 7 days — never silently retry tests `5×` forever).
- **3. Harden Infra & Network Calls**: Wrap external artifact/registry pulls in bounded retries with **exponential backoff + jitter**; host a pull-through cache (Nexus/Artifactory/ECR Pull-Through) so public registry blips never break builds.
- **4. Enforce Determinism & Idempotency**: Pin base images by `@sha256` digest, commit lockfiles (`package-lock.json`, `gradle.lockfile`, `.terraform.lock.hcl`), set explicit per-stage timeouts, and make deploy scripts idempotent (`helm upgrade --install --atomic`).

**Q: Product wants faster releases, but your builds are slow. How do you speed up without breaking things?**

- **1. Profile Stage Wall-Clock Time First**: Measure p50/p95 duration per stage (checkout, dependency install, compile, unit test, security scan, image build, E2E) to find the true bottleneck.
- **2. Multi-Layer Caching**: Enable remote build caches (**Gradle Build Cache / Nx / Turborepo**), dependency cache keyed by lockfile hash, and Docker BuildKit layer caching (`--cache-from` / `--cache-to` registry).
- **3. Parallelize & Affected-Graph Execution**: Shard unit/integration suites across parallel workers (`jest --shard=1/4`, Gradle `maxParallelForks`), run SAST/SCA/lint stages concurrently in a fan-out DAG, and in monorepos build/test **only affected modules** (`git diff` graph).
- **4. Rebalance the Test Pyramid (Never Drop Gates)**: Keep unit, contract, and smoke tests in the fast PR path (`<8 min` target); shift heavy browser E2E and chaos suites to post-merge canary / pre-prod promotion rings with automated rollback gates (`Argo Rollouts`).

### Infrastructure as Code (IaC)

**Q: Your Terraform script works in dev but crashes in prod. What's your next step?**

- **1. Freeze & Inspect — Never Re-run `apply -auto-approve`**: Read the exact error from `terraform plan` / `apply` output and classify the divergence between `dev` and `prod`:
  - **Configuration Drift**: Someone hotfixed `prod` manually in the AWS/Azure console → run `terraform plan -refresh-only` to inspect drift, then `terraform import` or reconcile code.
  - **Quota / Cloud Service Limits**: Prod scale hits AWS ENI/VPC/vCPU quotas or Azure regional SKU exhaustion that small `dev` sizing never triggered.
  - **IAM / RBAC Scope**: Prod execution role lacks permissions (`kms:Decrypt`, `iam:PassRole`) or hits an AWS SCP / Azure Policy deny rule active only in prod.
  - **Provider / State Skew**: Missing `.terraform.lock.hcl` or manual state surgery.
- **2. Prevention**: Run `terraform plan -out=plan.tfplan` against the
  intended prod state in CI using appropriately scoped plan permissions.
  Inspect the diff and `terraform show -json plan.tfplan` for policy checks.
  A successful plan cannot guarantee that apply-time quotas or cloud API
  calls will succeed.

**Q: A junior accidentally deleted critical infra using IaC. How do you prevent this next time?**

- **1. Resource-Level Guardrails in Code**: Apply `prevent_destroy`
  to selected critical resources while the lifecycle block remains in
  configuration; it does not protect a resource after its block is removed.
  Combine with RDS deletion protection, S3 versioning/Object Lock where
  retention is required, and Azure `CanNotDelete` locks where appropriate.
- **2. Eliminate Local `terraform apply` to Prod**: Revoke human write access to prod state/cloud accounts; all applies must execute through **GitOps CI pipelines (Atlantis / Terraform Cloud / GitHub Actions)** using OIDC roles.
- **3. Policy-as-Code Gate (`OPA / Conftest / Sentinel`)**: Inspect
  `terraform show -json plan.tfplan` for `delete` or replacement actions
  (replacement includes delete/create) on protected resource types and
  require a separate reviewed exception.
- **4. Blast-Radius Isolation**: Split monolithic Terraform state into small, blast-radius-isolated stacks (`network/`, `data-plane/`, `app-tier/`) so an app-tier change can never touch the database state file.

### Monitoring & Observability

**Q: A service went down at 2 AM. You weren't alerted. What would you fix in your monitoring setup?**

- **1. Shift from Cause-Based to Symptom-Based Alerting**: CPU/memory can be 10% while 100% of requests return `500` (e.g., expired cert, DB pool deadlock). Page on **Golden Signals & SLO multi-window burn rates** (`5xx` error ratio, `p99` latency, and **traffic drop to zero** at the ingress/ALB layer).
- **2. Add Synthetic Blackbox Probes**: External probes can cover DNS,
  TLS, CDN, and ingress. To cover auth and DB, use a safe transaction
  with a test identity; a TCP/HTTP health probe alone cannot prove that
  the entire user journey works.
- **3. Dead-Man's-Switch (`Watchdog` Alert)**: Configure an always-firing Prometheus `Watchdog` alert routed through Alertmanager → PagerDuty heartbeat so if Prometheus, Alertmanager, or the notification webhook itself dies, PagerDuty pages immediately.
- **4. Chaos Validation**: Verify every new alert by injecting a fault in staging (or pausing the endpoint) to prove the page actually wakes on-call.

**Q: You have logs, metrics, and traces — but you're still blind during outages. What's missing?**

- **1. Cross-Signal Correlation (`trace_id` + Exemplars)**: Metrics, logs, and traces are useless in silos. Inject W3C `traceparent` (`trace_id`, `span_id`) into every structured JSON log line and attach **Prometheus Exemplars** to latency histograms so an engineer can click a `p99` spike on Grafana and jump straight to the exact slow trace and its logs.
- **2. Change-Event Overlay**: Correlate deploy markers, Git SHAs,
  feature flags, and configuration changes with golden-signal dashboards;
  do not assume a fixed percentage of outages are change-related.
- **3. Business Dimensions Without Cardinality Explosions**: Group
  metrics by bounded dimensions such as region, AZ, service, or version.
  Put tenant IDs on sampled traces/controlled-access logs instead of
  unbounded Prometheus labels; protect sensitive identifiers.
- **4. Actionable Runbooks & Service Topology**: Link every alert annotation to a concrete runbook with the first 3 diagnostic commands and an up-to-date dependency map.

### Containerisation & Kubernetes

**Q: Your Kubernetes cluster runs out of resources often. How would you manage and optimise it?**

- **1. Separate Requests from True Saturation**: Compare
  `kube_pod_container_resource_requests` with usage and node allocatable
  capacity. Measure headroom per node and workload rather than assuming
  a universal utilization ratio.
- **2. Rightsize Workloads**: Use VPA recommendation mode, Goldilocks,
  or Kubecost alongside peak demand, OOM history, and startup needs.
  Memory `limits = requests` alone does **not** make a pod Guaranteed:
  every container must set matching CPU **and** memory requests/limits.
- **3. Enforce Namespace Governance**: Apply `ResourceQuota` (caps total namespace CPU/memory/pods) and `LimitRange` (enforces default requests/limits so no BestEffort pod can starve a node).
- **4. Smart Node Autoscaling & Bin-Packing**: Use **Karpenter** (with `consolidation` enabled to bin-pack underutilized nodes onto right-sized instances and Spot pools for fault-tolerant workloads) + `PriorityClass` so critical prod services preempt batch/cron pods under pressure.

**Q: One pod works, the other fails with the same image. How would you debug it?**

- **First verify the image digests**, not just the tag, then diff runtime
  state and traffic as well as environment:
  1. **Node & AZ Placement (`kubectl get pod -o wide`)**: Are they on different worker nodes or AZs? Check the failing node for `DiskPressure`/`MemoryPressure`, kernel/cgroup differences, broken CNI/iptables on that node, or AZ-specific NAT Gateway / subnet ACL blackholes.
  2. **Runtime Config & Secret Drift**: Did someone update a `ConfigMap` or `Secret`? Pods reading config via **`env:` variables never refresh** until restarted, whereas volume-mounted files update — or one pod booted before/after a Vault/Consul KV update.
  3. **Resource Neighbours & Throttling**: Is the failing pod co-located with a noisy neighbor causing CFS CPU throttling (`container_cpu_cfs_throttled_seconds_total`) or disk I/O contention?
  4. **Stateful / Sticky Traffic Skew**: Is a broken client session, poison Kafka partition key, or hot Redis shard pinned specifically to the failing pod's IP/consumer instance?
  5. **Ephemeral State**: Check `/tmp` or `emptyDir` exhaustion;
     compare `kubectl get pod -o yaml`, `kubectl describe pod`, current
     and `--previous` logs, and runtime reachability. `kubectl diff`
     compares manifests with live resources, not two pods directly.

### Security & Access Control

**Q: Developers have too many permissions in production. How do you enforce least privilege?**

- **1. Audit Actual Usage Before Revoking**: Analyze 90 days of **AWS IAM Access Analyzer / CloudTrail** and **Kubernetes Audit Logs** (`audit2rbac`) to see which permissions are actually used vs over-granted `ClusterAdmin`/`AdministratorAccess`.
- **2. Default Read-Only + CI-Only Writes**: Give engineers read-only observability (`get`, `list`, `watch` on non-secret resources; logs/metrics in Grafana) in production. All mutations happen via peer-reviewed GitOps/CI pipelines using workload OIDC identities.
- **3. Just-In-Time (JIT) Break-Glass Elevation**: For live incident debugging, use **PAM / AWS IAM Identity Center / Teleport** to grant temporary, ticket-linked, time-bound (`1–2 hour` TTL) elevated roles with full session recording and Slack/SIEM alerting.

**Q: A secret got exposed in a Git commit. What steps would you take now and for future protection?**

- **Immediate Incident Response (Now)**:
  1. **Revoke & Rotate Immediately**: Assume the secret was scraped within seconds of push. Revoke the IAM key / DB password / API token / Vault SecretID **first** — rewriting Git history does *not* make an exposed secret safe!
  2. **Audit Blast Radius**: Query CloudTrail, Vault audit logs, and DB connection logs for any unauthorized access using that credential between commit time and revocation.
  3. **Coordinate History Remediation**: After revocation, assess
     whether history rewrite is necessary with repository owners.
     `git-filter-repo`/BFG and force-push rewrite shared history and
     cannot recall already copied credentials; handle forks, cached
     references, and collaborator clones under an agreed plan.
- **Future Prevention**:
  1. **Pre-Commit + Server-Side Push Protection**: Enforce **`gitleaks` / `trufflehog`** in local pre-commit hooks, CI gates, and GitHub Secret Scanning Push Protection (blocks the `git push` at the server before it lands).
  2. **Eliminate Static Secrets**: Migrate to short-lived **OIDC Workload Identity** (IRSA / Azure Workload Identity) and runtime **Vault / External Secrets Operator** injection.

### Collaboration & Culture

**Q: Developers blame Ops. Ops blame Dev. The release is stuck. How would you bring ownership and alignment?**

- **1. Unblock the Release Safely First**: Establish a single war-room channel, define objective **canary health criteria** (`5xx < 0.1%`, `p99 < 250ms` for 30m) and an instant **1-command rollback trigger** — removing subjective fear from the release decision.
- **2. Replace Siloed KPIs with Shared DORA + SLO Incentives**: Silos happen when Dev is rewarded for feature velocity and Ops is punished for downtime. Align both teams under shared **DORA metrics** (Deployment Frequency, Lead Time, Change Failure Rate, MTTR) and a shared **Error Budget policy** (if the service has error budget remaining, Dev can ship; if the budget is burned, both teams focus on reliability).
- **3. Self-Service Golden Paths ("You Build It, You Run It")**: Platform/Ops builds paved-road templates (`qhelm` charts, CI shared libraries, pre-wired dashboards/alerts), and product engineers own their service's on-call rotation and Helm values.

**Q: Your team is stuck firefighting. How do you build a culture of automation and stability?**

- **1. Quantify & Rank Toil**: Categorize pages and manual tickets
  by frequency and time spent, then rank recurring offenders; do not
  assume a fixed percentage of interruptions comes from the top three.
- **2. Ring-Fence an Explicit Toil Budget (`20–25%` Capacity)**: Make toil reduction a non-negotiable sprint commitment (e.g., the engineer coming off on-call spends the next week eliminating the #1 page cause from their shift, backed by engineering leadership).
- **3. Delete Noisy Alerts & Automate Runbooks**: Prune non-actionable alerts immediately; convert repetitive manual runbooks into Kubernetes self-healing probes, KEDA/HPA scaling rules, or automated remediation jobs, and track **Postmortem Action Items as P0/P1 sprint tickets** with SLA deadlines.

---

## 8. Recall — Top Sound Bites

- "Mitigate first, root-cause second — every minute of MTTR is user impact."
- "Containers: namespaces isolate the view, cgroups limit the budget."
- "Rolling for routine, canary for risk, blue-green for reversibility."
- "An alert you ignore is an alert you should delete."
- "State is Terraform's brain — remote, locked, encrypted."
- "base64 ≠ encryption" (secrets) · "docker.sock = root" (containers).
