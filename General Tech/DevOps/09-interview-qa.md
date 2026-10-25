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
JSON mapping config→real resource IDs/metadata. Remote backend (S3) + locking (DynamoDB) is mandatory for teams; never commit or hand-edit.

**Q: Two `terraform apply` at once?**
Without locking → state corruption/race. DynamoDB lock serializes operations.

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

## 7. Recall — Top Sound Bites

- "Mitigate first, root-cause second — every minute of MTTR is user impact."
- "Containers: namespaces isolate the view, cgroups limit the budget."
- "Rolling for routine, canary for risk, blue-green for reversibility."
- "An alert you ignore is an alert you should delete."
- "State is Terraform's brain — remote, locked, encrypted."
- "base64 ≠ encryption" (secrets) · "docker.sock = root" (containers).
