# Production Operations & SRE Scenarios — Staff/Principal Interview Deep Dive

---

## 1. Part A — End-to-End Deployment Flow

A pragmatic, Git-centered flow for a three-repo model:

- **Application repo** — per microservice (Java, frontend, etc.).
- **Centralized config repo** — Helm/Ansible/qhelm templates.
- **Environment overlays repo** — per pod/region overrides.

### 1.1 Local development → branch push

- Commit changes locally; run local lint/test scripts when provided.
- Push to a review branch.
- For environment repos, push for review to the target branch (e.g., `git push -u origin HEAD:refs/for/qa` or `refs/for/dev`).
- For service repos, open a PR against the appropriate base (`dev`/`qa`/`main`).

### 1.2 CI build and validation

- Static checks: lint, formatting, type checks, license headers.
- Unit/integration tests; matrix or selective as needed.
- Build artifacts:
  - Java: Maven/Gradle builds produce JARs.
  - Frontend: Vite/React build with prod artifacts.
- **SBOM generation** (syft/cyclonedx) + vulnerability scan (grype/Trivy) on both artifact and image layers.

### 1.3 Container image build and publish

- Dockerfile-based build.
- Tagging convention: `org/service:branch-<sha>` and immutable `org/service@sha256:…`.
- Push to enterprise registry (ACR/Nexus/Harbor per environment).
- Images are immutable, signed, and retained with lifecycle rules.

### 1.4 Propagate desired version to GitOps manifests

- Update Helm values in:
  - Central config repo for shared chart defaults.
  - Environment overlays repo for the specific pod/region to pin the new image tag.
- Submit review to the correct environment branch.

### 1.5 CD apply

A controlled runner (Jenkins/Ansible) reads approved changes and runs qhelm/Helm:

- `helm upgrade --install` with the exact values override committed in the environment repo.
- Secrets sourced from Vault/Consul or Kubernetes secrets; never from the repo.
- Network egress and proxies configured per pod policy.

### 1.6 Post-deploy checks and promotion

- Health checks and smoke tests run automatically.
- Canary or progressive delivery with SLO guards (error rate, latency, saturation).
- If stable, promote through rings: `dev → qa → prod` via reviewed overlay changes.

### 1.7 Rollback and incident response

- **Primary path**: Git revert in the environment repo to the previous image tag; runner applies Helm rollback/upgrade to prior tag.
- **Fast path**: `helm rollback` with recorded revision, then immediately reconcile the environment repo to match the rolled-back state so Git remains the source of truth.
- All actions are audited by Git history and deployment logs.

---

## 2. Part B — Architecture & Emergency Operations Scenarios

### 2.1 Regional cloud outage + zero-day in auth: secure break-glass

**Objectives**

- Patch critical auth quickly despite control-plane outage.
- Maintain strong auditability and revert-to-Git truth post-fix.

**Design**

- Pre-provision a **break-glass pathway** per cluster:
  - Ephemeral, time-bound service account with minimal RBAC, disabled by default, enabled only via M-of-N approval.
  - **Signed change bundle**: image digest + exact Helm values + attestation (SLSA/Cosign) produced by CI.
  - Offline runner (bastion) with direct kube API access in-region; no dependency on centralized CI/control plane.

**Execution**

- Security declares emergency; M-of-N approves enabling break-glass SA (auto-expires in, e.g., 2 hours).
- Operator applies signed bundle via Helm (values pinned to digest).
- Admission policies only allow artifacts with required attestations.
- Capture a local change journal (commands, diffs) and commit a post-facto PR to the environment repo once the control plane returns.

**Safeguards**

- All secrets pulled from Vault with short TTL.
- Gatekeeper/Kyverno policy: deny unsigned/unauthorized images even in break-glass.
- Automatic disable of break-glass accounts after TTL and alerting to security.

---

### 2.2 Rogue infrastructure state (manual SG change) + drift reconciliation

**Objectives**

- Detect/contain drift; avoid surprise downtime.
- Convert ad-hoc change into tracked IaC.

**Design**

- Continuous drift detection on critical resources (security groups, NACLs, ingress).
- **Quarantine mode**: when drift appears, freeze destructive remediation; open a “drift PR” that imports the live diff into the environment repo as a change proposal.
- Require policy review; either:
  - Merge drift PR (adopt the change), or
  - Revert drift: apply desired Git state with a planned drain window.

**Safeguards**

- Time-boxed drift grace period with alerts.
- Auto-created change tickets link Git commits, approvals, and applied remediation.

---

### 2.3 Legacy migration deadlock (Jenkins → GitOps/ArgoCD-like)

**Objectives**

- 100% adoption without blocking feature delivery.

**Design**

- **Transitional compat adapter**:
  - Keep Jenkins builds but require publishing: signed image, SBOM, deployment manifest fragment (values.yaml delta) to a known registry/repo.
  - A thin GitOps controller consumes those artifacts and commits standardized overlays into the environment repo.
- Golden templates and SDK for teams to port custom scripts progressively.

**Governance**

- Conformance scorecard: signing, SBOM, manifest outputs tracked per service.
- Deadlines with exceptions path; executive dashboard on progress.

---

## 3. Part C — Scale, Speed, & Resource Constraints

### 3.1 Monorepo gridlock (60m PR queue → <10m, flat cost)

- **Test impact analysis**: run only affected tests based on change graph; cache results across runs.
- **Remote build/test cache** (Bazel-like semantics) + hermetic containers for deterministic caching.
- Parallel shards with dynamic balancing; cap concurrency per class to keep cost flat.
- Quarantine flaky tests with automatic retries outside the critical path.
- Developer preflight: local runner validates the exact subset before pushing.

### 3.2 Global multi-cluster rollout (24 clusters; cluster #11 fails)

- Orchestrate per-cluster waves with independent success criteria and timeouts.
- Isolate failure: mark cluster #11 as degraded; continue others. No global rollback unless policy threshold breached.
- Prevent drift by pinning the desired version per cluster and recording status.
- Reconcile failed clusters when healthy.
- Auto-open remediation issue/PR for the failed cluster with logs and next steps.

### 3.3 Microservice dependency trap (A→B→C; new contract in C)

- Enforce contract tests and versioned APIs:
  - Provider (`C`) publishes contract; consumers (`B`, then `A`) validate against provider simulators.
  - Release gates require upstream provider with compatible version to be deployed (or a beta feature-flag path).
- **DAG-aware orchestrator**: blocks A's deploy until compatible B and C artifacts are live or feature-flag guarded.

---

## 4. Part D — Reliability, Database, & State

### 4.1 False-positive canary (leak at 25%)

- Progressive canary with soak: `5% (10m) → 25% (30–60m) → 50%+` with continuous telemetry.
- **SLO gates beyond HTTP 200**: memory growth slope, GC, thread count, DB pool saturation, P99 latency, error budgets.
- Automated safe rollback with connection draining and surge capacity.
- Freeze new deploys for the service until a fix lands.

### 4.2 Multi-phase schema breaking change (10k writes/sec)

Use **Expand/Contract**:

1. **Phase 1 (Expand)**: add new tables/columns, backfill asynchronously; dual-write behind a flag.
2. **Phase 2**: flip reads to new schema once parity verified; continue dual-write.
3. **Phase 3 (Contract)**: remove old writes; later drop old columns/tables.

Pipeline gates: replication lag, backfill progress, data parity checks, throttled migrators, rollback plans at each phase.

### 4.3 Poison pill rollback (state unreadable by prior version)

- **Versioned state/contracts**: `min_readable` and `max_writable` version advertised by each build.
- **Pre-deploy guard**: if rollback target cannot read current state, block rollback and require fix-forward or a data migration shim.
- Write-once/dual-format period to guarantee at least N versions backward compatibility.

---

## 5. Part E — Security, Compliance, & Supply Chain

### 5.1 Compromised third-party dependency (typosquat)

- Enforce allowlisted sources and checksum pinning for dependencies.
- **SBOM + diff-on-diff scanning** per PR; fail on unexpected transitive additions.
- Hermetic builds with network egress restricted to approved mirrors.
- Provenance attestation (SLSA level targets) and mandatory signature verification for deploys.

### 5.2 Insider threat (malicious direct push to registry)

- **Admission control**: only images with valid CI-issued signatures/attestations are allowed to run.
- **Registry policy**: write-restricted; production tags published only by CI service accounts.
- **Runtime policy** (OPA/Kyverno): enforce image provenance, disallow `:latest`, require digest pinning and SBOM.
- **Immutable audit trail**: map running digests back to Git SHAs and PR approvals.

---

## 6. Checklists and Operational Notes

- Always reconcile to Git after any emergency or manual action; the environment repo remains the source of truth.
- Store **image digests**, not just tags, in values overrides to prevent tag drift.
- For pods requiring proxies (e.g., S3 access), enforce proxy configuration in both build-time tests and runtime clients.
- Rollbacks use Git revert plus Helm rollback; ensure the revert lands in the environment repo immediately after any CLI rollback.

---

## 7. Staff-Level Sound Bites

- "Git is the source of truth; every emergency action must eventually be represented as a committed change."
- "Break-glass is a controlled, auditable, time-bound exception — not a permanent bypass."
- "Drift detection without a quarantine-and-PR workflow creates silent production divergence."
- "Schema migrations at scale are expand/contract projects, not single deploys."
- "Canary gates should measure user-impacting signals, not just HTTP 200 counts."
- "Supply-chain security requires provenance, not just scanning."

---

## 8. Quick Reference Table

| Scenario | Key technique | Guardrail |
|---|---|---|
| Regional outage + urgent patch | Break-glass SA + signed bundle | Time-bound TTL, M-of-N approval |
| Infrastructure drift | Drift detection + quarantine PR | Auto-ticket, policy review |
| Jenkins → GitOps migration | Compat adapter + conformance scorecard | Executive dashboard, exception path |
| Monorepo PR queue bloat | Test impact analysis + remote cache | Flaky-test quarantine |
| Multi-cluster rollout failure | Wave orchestration + per-cluster status | Degraded cluster isolation |
| Breaking schema change | Expand/Contract | Backfill parity gates |
| Poison pill rollback | min_readable/max_writable versions | Dual-format compatibility window |
| Malicious registry push | Admission control + digest pinning | CI-only publish policy |
