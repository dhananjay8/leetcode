# CI/CD, GitOps & Production Deployment — Interview Notes

## 1. CI vs Continuous Delivery vs Continuous Deployment

| | CI | Continuous Delivery | Continuous Deployment |
| --- | ---- | -------------------- | ---------------------- |
| Extent | Build + test on every commit | …+ automated release to staging; prod needs manual approval | …+ fully automated to prod, no gate |
| Trust requirement | Green tests | + release candidate verified | + progressive delivery, auto-rollback |
| Typical blocker | Broken build | Product sign-off | Risk appetite / compliance |

**Three independent systems** (staff point): **CI builds trust** (build + validate → immutable artifact), **Artifact Management stores it** (registry + SBOM + signature), **CD applies change** (deploy safely). Separating them lets you roll back a deployment **without rebuilding code**.

---

## 2. End-to-End Production Flow

```text
git push / PR merge
  → CI: checkout → deps → tests → SAST → scans → build → image → scan+sign → push registry
  → deployment repo updated (immutable image tag/digest)
  → GitOps controller (ArgoCD/Flux) detects drift → renders manifests (Helm/Kustomize)
  → apiserver → Deployment controller → new ReplicaSet → scheduler → kubelet
  → startup probe → readiness probe → Service routes traffic
  → post-deploy smoke tests / metrics validation
  → old ReplicaSet scaled down
```

The commit SHA becomes the identity of everything downstream — tag images with it (`myapp:74ae12bc`, `v2.14.6`, `build-1048`). **Never `latest` in production.**

---

## 3. CI Pipeline Anatomy

| Stage | Examples | Fails build when |
| ------- | ---------- | ------------------ |
| Checkout | `git checkout <sha>` | — |
| Deps | `npm ci`, `pip install -r req.txt`, `mvn dependency:resolve`, `go mod download` | lockfile mismatch |
| Tests | `npm test`, `pytest`, `go test`, `mvn test` | any failure — pipeline stops here |
| Static analysis | SonarQube, ESLint, Pylint, golangci-lint, SpotBugs/PMD | quality gate breach |
| Security scans | **Deps**: Snyk/Dependabot/OWASP DC · **Image**: Trivy/Grype/Clair · **IaC**: Checkov/tfsec · **Secrets**: TruffleHog/GitLeaks | CVEs over threshold, leaked secrets |
| Build | `go build`, `npm run build`, `mvn package` | compile errors |
| Image | `docker build -t myapp:<sha> .` → scan → sign | base-layer CVEs fail build |
| Sign | cosign / Notary / Sigstore keyless | — |
| Push | ECR / ACR / GAR / Harbor / Nexus | auth/storage failure |

```yaml
# GitHub Actions skeleton
name: ci
on: { push: { branches: [main] }, pull_request: {} }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm }
      - run: npm ci
      - run: npm test
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .
      - run: docker push app:${{ github.sha }}
```

### Jenkins / GitLab / Actions equivalents

| Tool | Config file | Unit | Runner |
| ------ | ------------- | ------ | -------- |
| Jenkins | `Jenkinsfile` (declarative/scripted Groovy) | stages | Agents/executors |
| GitHub Actions | `.github/workflows/*.yml` | jobs → steps | hosted/self-hosted runners |
| GitLab CI | `.gitlab-ci.yml` | stages → jobs | GitLab runners (tags) |
| Azure DevOps | `azure-pipelines.yml` | stages → jobs | Microsoft/self-hosted agents |

### Jenkins Deep Dive (Architecture, Pipelines & Enterprise/Qualys Pattern)

```text
Jenkins Controller (Master — UI, scheduler, credentials, webhook receiver; NO builds on controller!)
  ├── Inbound JNLP / SSH static agents (VM build pools labeled e.g. 'linux-jdk17', 'docker-builder')
  └── Kubernetes Plugin dynamic pod agents (spins up ephemeral pod per build, destroys on finish)
```

| Concept | Declarative Pipeline (`pipeline { ... }`) | Scripted Pipeline (`node { ... }`) |
| --- | --- | --- |
| **Syntax** | Opinionated structure (`agent`, `stages`, `steps`, `post`, `when`, `environment`) | Free-form Groovy code (`try/catch/finally`, loops) |
| **Validation** | Validated before execution; supports Restart-from-Stage | Validated at runtime; maximum flexibility |
| **Enterprise standard** | **Default choice** + **Jenkins Shared Libraries (`@Library`)** | Legacy or complex dynamic matrix logic |

- **Jenkins Shared Libraries (`vars/*.groovy`) — Enterprise & Qualys Pattern**: Instead of duplicating 300 lines of Groovy across 200 microservices, teams use a central Shared Library (`generic-java-template-with-scripts` / `generic-binaries-template`). Each service repo contains only:
  1. A 3-line `Jenkinsfile` invoking the shared template and pointing to `properties.yaml`.
  2. `properties.yaml` (`jdk: JDK_17`, `maven: apache-maven-3.6.3`, `is-docker-scan-enabled: true`).
  3. `jenkins_build_scripts/build_script.sh` & `post_build_script.sh` (runs `mvn clean deploy`, writes `VERSION.pkg` metadata, calls `build-scripts/build-image.sh`, pushes image + RC bundle to Nexus/Artifactory).

### Failed-build handling

Fail fast (cheapest checks first) → block merge (required status checks) → notify author w/ logs → quarantine flakes via auto-retry + ticket → keep main green (red main = stop-the-line event).

---

## 4. CD Handoff — Helm, GitOps, Deployment Repo

### Helm vs Kubernetes (kill this misconception)

| Tool | Role | Analogy |
| --- | --- | --- |
| **Helm** | Package manager + templating → *generates* K8s YAML | Compiler → bytecode |
| **Kubernetes** | Runtime executing the YAML | CPU → machine code |
| **ArgoCD/Flux** | Reconciles git desired state ↔ cluster | Continuous sync agent |

Helm exists because every service would otherwise duplicate 700+ lines of YAML (replicas, probes, resources, ingress, SA, tolerations…). One chart + per-env values:

| Environment | replicas | cpu |
| --- | --- | --- |
| Development | 1 | 200m |
| Staging | 3 | 500m |
| Production | 20 | 2 |

### Deployment repo pattern

- `app-code` repo ≠ `deployment-config` repo — app teams can't accidentally change prod infra.
- CI updates `image: myapp:74ae12bc` (better: `@sha256:` digest — tags can drift, digests can't) in the deploy repo and pushes.
- ArgoCD/Flux polls, detects drift, renders (`helm template` / `kustomize build`), applies. Developers never run Helm against prod.
- **Common deployment models**: `helm upgrade` from CI (small teams) · Helm+ArgoCD (modern default) · Kustomize+ArgoCD · raw manifests (simple projects).

---

## 5. Deployment Strategies (X vs Y)

| Strategy | Mechanism | Rollback | Cost | Best for |
| ---------- | ----------- | ---------- | ------ | ---------- |
| **Rolling** (K8s default) | Replace pods incrementally (`maxSurge`, `maxUnavailable`) | `rollout undo` — fast | None extra | Most stateless services |
| **Blue-Green** | Two full envs; LB switches all traffic at once | Instant — switch back | **2× infra** | Big-bang cutovers |
| **Canary** | Route 5→25→50→100%; measure errors/latency each step | Stop traffic increase | Small extra | Risky changes, metric validation |
| **Feature flags** | Deploy dark, enable at runtime | Kill switch — instant | Flag tech debt | Decoupling release from deploy |

Rolling update for 10 pods (`maxSurge:1, maxUnavailable:1`): `10 old → 11 total → 1 new ready → 1 old removed → repeat`. Zero-downtime needs `maxUnavailable:0` + readiness gates.

### Progressive delivery / canary done right

Soak at each step (`5%→10m, 25%→30–60m, 50%+`). Gate on **user-impacting signals**, not just HTTP 200: p99 latency, error budget burn, memory growth slope, DB pool saturation, GC/thread count. Argo Rollouts + Prometheus analysis templates automate promote/rollback.

---

## 6. Post-Deployment Verification

`kubectl rollout status` ≠ healthy. Real gates: smoke tests on critical endpoints · synthetic transactions (login/checkout) · metrics validation (error rate, latency, CPU/mem) · log scan for new exceptions · alert state. Failure → automatic rollback.

---

## 7. Enterprise Three-Repo Recipe (from Qualys-style pattern — generalizes)

| Repo | Role |
| --- | --- |
| **Service repo** | Code, tests, Dockerfile, CI scripts, bundled consul/helm config skeleton |
| **Central config repo** (`config-mgmt`) | Aggregates every service's config into versioned `consul`/`helm`/`ansible` release artifacts; holds **base** values overrides (probes, resources, Vault env, Java opts) |
| **Env/deployment repo** (per pod/region) | Environment subprojects + release manifest (chart/version/namespace/`wait_for_success`/`timeout`), pod-specific values overrides, consul overrides, vault policies |

### Sequence

1. **Service repo**: code + Dockerfile + CI; config packaged via build plugin (`config/consul/`, `config/helm/`); actuator probes (`/actuator/health/{liveness,readiness}` on mgmt port); secrets at runtime from Vault — never in repo.
2. **CI builds**: JAR → image tagged `registry/repo/name:version[-build]` → consul/helm zips published as versioned artifacts.
3. **Config repo**: register service version property; base values override uses `@service.version@` token → token-replaced at config-release build; `helm lint --with-subcharts` gate.
4. **Env repo**: environment subproject declares `config-mgmt` version deps (`cacheChangingModulesFor(0)` so SNAPSHOTs refresh); release entry (chart+version+namespace, `wait_for_success: true` for services others depend on — **ordering matters**: deploy foundational services before consumers); pod overrides layer on top of base.
5. **Pod-wide common values**: ingress host, consul/vault hosts, Kafka bootstrap, proxy, region/endpoints — one `common-values-override`.
6. **Vault policy** per service: only the secret paths it needs (`capabilities = ["read"]`).
7. Push to the pod branch → controlled runner applies `helm upgrade --install` → validate pods, health endpoints, ingress.

**Layered config model**: base chart defaults → central config overrides → pod-specific overrides → runtime env. Each layer narrows, never duplicates.

### Native ArgoCD GitOps vs Qualys Controlled GitOps (`qhelm` / `quadfile`)

| Dimension | **Pure ArgoCD Pull GitOps** | **Qualys Controlled GitOps (`etmaudit` + `quadfile` + `qhelm`)** |
| --- | --- | --- |
| **Source of truth** | Git deployment repo (`overlays/<env>`) | Git 3-repo hierarchy (`service` → `etm-audit-config-mgmt` → `etmaudit` pod branch) |
| **Who renders & applies** | In-cluster `argocd-repo-server` + `argocd-application-controller` | Controlled Jenkins/Ansible pod runner executing `qhelm` (`helm upgrade --install`) |
| **Ordering across services** | Sync waves (`argocd.argoproj.io/sync-wave: "1"`) + hooks (`PreSync`, `Sync`, `PostSync`) | Explicit sequential list in **`quadfile.yaml`** with `wait_for_success: true` & `timeout: 700s` |
| **Config & Secret wiring** | External Secrets Operator / Sealed Secrets + ConfigMaps | **Consul KV sync** (`etmaudit/apps/<svc>`) + **Vault AppRole** (`qvaultsi` HCL policy) + `qhelm` overrides |
| **How to frame in interviews** | "Both enforce Git as single source of truth, immutable versioned artifacts, and layered Helm overrides; ArgoCD reconciles via an in-cluster pull controller, whereas the Qualys pod runner couples Helm release orchestration (`quadfile`) with Consul KV and Vault policy provisioning in one atomic pod rollout." | — |

*(Deep dives: see `Production-CI-CD-and-GitOps-Deep-Dive.md`, `Enterprise-Microservice-Deployment-Recipe.md`, `Production-Operations-Scenarios.md`, and `../Kubernetes/07-gitops-argocd.md`.)*

---

## 8. Rollback Patterns

| Path | Mechanism | Caveat |
| --- | --- | --- |
| Primary | `git revert` in env repo → controller syncs previous tag | Slowest but always clean |
| Fast | `helm rollback` / `kubectl rollout undo` / `argocd rollback` | **Immediately reconcile git** afterward or source-of-truth lies |
| DB-aware | expand/contract migrations keep both versions readable | Never roll back across a contract phase |

**Poison-pill rollback**: if the old version can't read new state, rollback corrupts data → versioned contracts (`min_readable`/`max_writable`), pre-deploy guard blocks incompatible rollback, dual-format write window guarantees N-version compat.

---

## 9. Production Ops Scenarios (staff-level)

| Scenario | Key technique | Guardrail |
| --- | --- | --- |
| Regional outage + urgent auth patch | **Break-glass**: ephemeral M-of-N-approved SA (auto-expires ~2h) + **signed change bundle** (digest + values + SLSA/Cosign attestation) + offline in-region runner | TTL, admission policy still denies unsigned images, post-facto PR back to git |
| Rogue infra change (manual SG edit) | Drift detection → **quarantine mode**: open "drift PR" importing live diff; adopt-or-revert after review | Time-boxed grace, auto-ticket, planned drain for revert |
| Jenkins → GitOps migration deadlock | Compat adapter: Jenkins keeps building but must publish signed image+SBOM+values delta; thin GitOps layer converts to overlays | Conformance scorecard, exec dashboard, exceptions path |
| Monorepo PR queue (60m→<10m) | Test-impact analysis + remote build cache (Bazel semantics) + dynamic shards + flaky-test quarantine + dev preflight | Cap concurrency to keep cost flat |
| 24-cluster rollout, #11 fails | Per-cluster waves w/ independent success criteria; mark degraded, continue; no global rollback below threshold | Pin desired version per cluster, auto-remediation PR |
| A→B→C dependency, C's contract changes | Contract tests + versioned APIs; DAG-aware orchestrator blocks A until compatible B,C live (or flag-guarded) | Provider publishes contract, consumers test vs simulator |
| Canary passes 5%, leaks at 25% | Long soak + SLO gates beyond HTTP 200 (mem slope, pool saturation) | Auto-rollback w/ conn draining; freeze deploys |
| Schema break at 10k w/s | **Expand/Contract**: add+backfill → flip reads → drop old; gates on lag/parity | Rollback plan per phase |
| Typosquatted dependency | Allowlisted sources + checksum pinning + SBOM diff-on-diff + hermetic builds (egress only to mirrors) | SLSA provenance, signature required at deploy |
| Malicious push to registry | Admission denies unsigned images; registry write = CI service accounts only; digest pinning + `:latest` banned | Running digests map back to Git SHA + PR approval |

Operational rules: reconcile to git after every emergency · store **digests** not tags · rollbacks = git revert + helm rollback · proxy/egress config enforced at build and runtime.

---

## 10. Pipeline Best Practices

| Practice | Why |
| ---------- | ----- |
| **Fail fast** | Lint/unit tests before expensive steps |
| **Cache dependencies** | `actions/cache`, Docker layer cache |
| **Pin versions** | `node:20.11.0`, action SHAs, image digests |
| **OIDC over stored keys** | `id-token: write` → cloud role; no long-lived cloud creds in CI |
| **Least privilege** | Job-scoped `permissions:` block |
| **Immutable artifacts** | Tag by SHA + digest; promote, never rebuild per env |
| **Branch protection** | Required checks + reviews before merge |
| **SBOM + signing** | syft/cyclonedx + cosign — supply-chain non-negotiables |

---

## 11. Sound Bites & Quick Reference

- "CI proves the artifact is good; CD decides when and how it reaches production."
- "Immutable tags let you roll forward and back without rebuilding."
- "Helm is a YAML generator, not a deployment engine."
- "GitOps makes the deployment repo the source of truth — `git revert` is the rollback button."
- "`kubectl apply` succeeding is not health; post-deploy verification is the real gate."
- "Schema migrations at scale are expand/contract projects, not single deploys."
- "Supply-chain security requires provenance, not just scanning."

| Step | Output | Failure mode |
| --- | --- | --- |
| Source control | Commit SHA | Conflicts, untested code |
| CI tests | Test report | Build blocked |
| Scans | CVE/quality report | Vulnerable deps, secrets |
| Image build+sign | Signed immutable image | Build errors, supply-chain risk |
| Registry push | Stored artifact | Auth/storage failure |
| GitOps reconcile | Desired state applied | Drift, sync failure |
| K8s rollout | Ready pods | Probe/scheduling failures |
| Post-deploy verify | Health signal | Rollback triggered |
