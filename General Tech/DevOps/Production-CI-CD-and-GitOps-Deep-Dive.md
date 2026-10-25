# Production CI/CD, GitOps & Helm Deep Dive — Staff/Principal Interview Guide

---

## 1. The Three Independent Systems

A production-grade Continuous Deployment (CD) pipeline at companies like Google, Netflix, Uber, Amazon, Microsoft, Stripe, and Datadog is far more than running `kubectl apply` after a build.

There are **three independent systems** working together:

1. **Continuous Integration (CI)** — Build and validate the software.
2. **Artifact Management** — Store immutable artifacts (JARs, images, SBOMs).
3. **Continuous Deployment/Delivery (CD)** — Deploy those artifacts safely.

> Staff point: **CI builds trust; CD applies change. Separating them lets you roll back a deployment without rebuilding code.**

---

## 2. Helm vs Kubernetes

One of the biggest misconceptions is that **Helm replaces Kubernetes**. It does not.

| Tool | Role | Analogy |
| --- | --- | --- |
| **Helm** | Package manager and templating engine that generates Kubernetes YAML | JVM compiles Java to bytecode |
| **Kubernetes** | Runtime that executes the YAML and manages container lifecycle | CPU executes machine code |
| **ArgoCD/Flux** | GitOps controller that reconciles desired state with cluster | Continuous sync agent |

Helm's job is to render environment-specific YAML from charts and values. Kubernetes' job is to run it.

---

## 3. Complete Production Flow

```text
Git Repository
    │
    ├── git push / PR merge to master
    │
    ▼
CI Pipeline Starts
    │
    ├── Checkout code
    ├── Install/restore dependencies
    ├── Unit + integration tests
    ├── Static analysis (SAST)
    ├── Security scans (deps, container, IaC, secrets)
    ├── Build binary
    ├── Build Docker image
    ├── Scan + sign image
    └── Push image to registry (ECR/ACR/GCR/Harbor)
    │
    ▼
Update deployment repository
(Helm values / Kustomize overlays with immutable image tag)
    │
    ▼
GitOps controller detects drift
(ArgoCD / Flux)
    │
    ▼
Helm template render
    │
    ▼
Kubernetes manifests generated
    │
    ▼
Kubernetes API Server
    │
    ▼
Deployment Controller
    │
    ▼
New ReplicaSet created
    │
    ▼
Scheduler → Kubelet → Pod creation
    │
    ▼
Startup probe → Readiness probe pass
    │
    ▼
Service routes traffic
    │
    ▼
Post-deploy smoke tests / metrics validation
    │
    ▼
Old ReplicaSet scaled down
```

---

## 4. Phase 1 — Source Control

```text
Developer
    │
    ├── git push origin master
    │
    or
    │
    └── Merge Pull Request
    │
    ▼
Master branch updated
```

Nothing has been built yet. The commit SHA (e.g., `74ae12bc`) becomes the identity of everything downstream.

---

## 5. Phase 2 — CI Pipeline

### 5.1 Checkout

```bash
git checkout 74ae12bc
```

Workspace is created and tied to this exact commit.

### 5.2 Dependency restore

| Language | Command |
| --- | --- |
| Node.js | `npm ci` |
| Python | `pip install -r requirements.txt` |
| Java | `mvn dependency:resolve` |
| Go | `go mod download` |

### 5.3 Unit tests

```bash
npm test
pytest
go test
```

Pipeline stops immediately if tests fail.

### 5.4 Static analysis

| Tool | Ecosystem |
| --- | --- |
| SonarQube | Multi-language |
| ESLint | JavaScript |
| Pylint | Python |
| golangci-lint | Go |
| SpotBugs / PMD | Java |

### 5.5 Security scans

| Type | Input | Tool examples |
| --- | --- | --- |
| Dependency scanning | `package.json`, `pom.xml`, etc. | Snyk, Dependabot, OWASP Dependency-Check |
| Container scan | Docker image | Trivy, Clair, Grype |
| IaC scan | Terraform/CloudFormation/CDK | Checkov, tfsec, Terrascan |
| Secrets scan | Repo history | TruffleHog, GitLeaks |

### 5.6 Build

```bash
go build
npm run build
mvn package
```

Produces: binary, JAR, `dist/` directory, or executable.

### 5.7 Docker build

```bash
docker build -t myapp:74ae12bc .
```

Key rule: production never uses `latest`. Tags are immutable:

```text
myapp:74ae12bc
myapp:v2.14.6
myapp:build-1048
```

### 5.8 Container scan

The image itself is scanned. If a base layer contains a vulnerable `openssl`, the build fails.

### 5.9 Image signing

| Tool | Purpose |
| --- | --- |
| Cosign | Sign and verify container images |
| Notary | Docker Content Trust v1 |
| Sigstore/Cosign keyless | Identity-based signing |

Protects against tampered images, fake registry pushes, and supply-chain attacks.

### 5.10 Push to registry

| Registry | Cloud |
| --- | --- |
| Amazon ECR | AWS |
| Azure ACR | Azure |
| Google GAR | GCP |
| Harbor | On-prem / multi-cloud |

At this point: **build is complete; nothing has been deployed.**

### 5.11 Artifact promotion — build once, deploy everywhere

The same immutable artifact flows through environments — **never rebuilt per env**:

```text
myapp:74ae12bc  →  dev deploy  →  qa deploy  →  prod deploy
                 (same digest, only values/overlays differ)
```

Rebuilding per environment breaks the "what we tested is what we ship" guarantee and creates digest drift. Promotion = updating which tag/digest each env's deployment repo points to.

---

## 6. CD Starts Here

### 6.1 Deployment repository

Many organizations keep a separate repo:

- `app-code` — application logic.
- `deployment-config` — desired production state.

Why? Application teams cannot accidentally change production infrastructure.

The CI pipeline updates the deployment repo with the new image tag:

```yaml
# Before
image: myapp:63ea90

# After
image: myapp:74ae12bc
```

Then it pushes that change.

### 6.2 GitOps controller

ArgoCD or Flux polls the deployment repo, detects drift, and reconciles.

```text
Git Repository
    │
    ├── Helm Chart
    │
    ▼
helm template
    │
    ▼
Kubernetes YAML
    │
    ▼
kubectl apply
```

Developers never run Helm manually in production; the controller does.

### 6.3 Environment promotion rings

```text
dev (auto-sync on merge) → qa (auto or PR) → staging → prod (PR + approval)
```

- Each env is a separate path/branch in the deployment repo; promotion = a PR copying the verified tag forward.
- Gates tighten per ring: dev = none, qa = automated test pass, staging = soak + sign-off, prod = human approval + change window.
- **Secrets never ride this flow** — each env resolves its own via Vault/External Secrets at apply time.

---

## 7. Where Helm Comes In

### 7.1 Helm is a YAML generator

```text
Helm Chart
    │
    ├── values.yaml
    ├── templates/
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── ingress.yaml
    │   ├── configmap.yaml
    │   ├── secret.yaml
    │   └── hpa.yaml
    │
    ▼
helm template
    │
    ▼
Kubernetes YAML
```

Placeholders in templates:

```yaml
image:
  repository: myapp
  tag: {{ .Values.image.tag }}
```

Values file:

```yaml
image:
  tag: 74ae12bc
```

Rendered output:

```yaml
image: myapp:74ae12bc
```

Helm's job is finished after rendering.

### 7.2 Helm chart structure

```text
my-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml
│   └── secret.yaml
└── charts/
```

### 7.3 Why Helm exists

Without Helm, every microservice would duplicate 700+ lines of YAML for:

- namespace
- replicas
- image
- resources
- probes
- ports
- labels
- service account
- node selector
- ingress
- tolerations

Helm turns that into reusable templates with environment-specific values:

```yaml
replicas: {{ .Values.replicas }}
```

Same chart, different values per environment:

| Environment | replicas | cpu |
| --- | --- | --- |
| Development | 1 | 200m |
| Staging | 3 | 500m |
| Production | 20 | 2 |

### 7.4 ArgoCD + Helm flow

```text
Git
    │
    ▼
Helm Chart
    │
    ▼
helm template
    │
    ▼
Kubernetes YAML
    │
    ▼
kubectl apply
```

---

## 8. Kubernetes Receives YAML

1. API Server stores the `Deployment`.
2. Deployment Controller creates a new `ReplicaSet`.
3. Scheduler assigns pods to nodes.
4. Kubelet downloads the image and starts the container.
5. Startup probe passes.
6. Readiness probe passes.
7. Service begins routing traffic to Ready pods.

Old and new ReplicaSets coexist during the rollout.

---

## 9. Rolling Update

Deployment strategy example:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

For 10 pods:

```text
10 old
    │
    ▼
11 total (1 new added)
    │
    ▼
1 new ready → 1 old removed
    │
    ▼
Repeat until 10 new
```

Result: zero-downtime rollout.

---

## 10. Post-Deployment Verification

Modern CD pipelines do not stop at `kubectl rollout status`. They verify the application is actually healthy:

- Smoke tests against critical endpoints.
- Synthetic transactions (login, checkout).
- Metrics validation (error rate, latency, CPU, memory).
- Log analysis for new exceptions.
- Alert status from monitoring systems.

If checks fail, the pipeline can automatically roll back to the previous version.

---

## 11. Common Deployment Models

| Model | How it works | Best for |
| --- | --- | --- |
| **Helm + CI** | CI runs `helm upgrade --install` directly | Small teams, simpler environments |
| **Helm + ArgoCD (GitOps)** | CI updates image tag in deployment repo; ArgoCD reconciles | Most modern Kubernetes platforms |
| **Kustomize + ArgoCD** | CI updates image tags in Kustomize overlays; ArgoCD applies | Teams preferring native Kubernetes tooling |
| **Raw Kubernetes manifests** | CI/CD applies plain YAML with `kubectl apply` | Smaller projects or simple deployments |

### 11.1 Anti-patterns (interviewers ask "what goes wrong?")

| Anti-pattern | Why it bites |
| --- | --- |
| Rebuilding per environment | Digest drift; you test one artifact, ship another |
| `:latest` tags in prod | Mutable → no reliable rollback target |
| `kubectl apply`/`helm upgrade` from laptops | Untracked drift; no audit trail |
| Secrets in pipeline logs or values files | Permanent exposure in CI history |
| CI cluster creds with cluster-admin | One leaked kubeconfig = total compromise |
| Rollback by editing live state | Git truth diverges; next sync reverts or conflicts |
| Deploy == release coupling | No canary/flag path → every deploy is a launch |

---

## 12. Industry-Standard Flow Summary

```text
Developer
    │
    ▼
Git Push / PR Merge
    │
    ▼
CI Pipeline
    ├── Checkout
    ├── Restore dependencies
    ├── Unit tests
    ├── Integration tests
    ├── Static analysis
    ├── Security scans
    ├── Build binary
    ├── Build Docker image
    ├── Scan image
    ├── Sign image
    └── Push image to registry
    │
    ▼
Update deployment repository
    │
    ▼
ArgoCD / Flux
    │
    ▼
Helm template rendering
    │
    ▼
Generated Kubernetes manifests
    │
    ▼
Kubernetes API Server
    │
    ▼
Deployment Controller
    │
    ▼
New ReplicaSet
    │
    ▼
Scheduler → Kubelet → Pod creation
    │
    ▼
Startup probe
    │
    ▼
Readiness probe
    │
    ▼
Traffic shift (rolling update)
    │
    ▼
Smoke tests & health validation
    │
    ▼
Old ReplicaSet scaled down
```

---

## 13. Staff-Level Sound Bites

- "CI proves the artifact is good; CD decides when and how it reaches production."
- "Immutable image tags let you roll forward and backward without rebuilding."
- "Helm is a YAML generator, not a deployment engine."
- "GitOps turns the deployment repo into the single source of truth and audits every change."
- "Post-deploy verification is the real gate; `kubectl apply` success does not mean the app is healthy."
- "Image signing, SBOMs, and dependency scans are supply-chain non-negotiables at scale."

---

## 14. Quick Reference Table

| Step | Output | Failure mode |
| --- | --- | --- |
| Source control | Commit SHA | Merge conflicts, untested code |
| CI tests | Test report | Build blocked |
| Static analysis | Quality report | Security/style issues |
| Security scan | CVE report | Vulnerable deps/images |
| Image build | Immutable tagged image | Build errors |
| Image signing | Signed digest | Supply-chain risk |
| Registry push | Stored artifact | Auth/storage failure |
| GitOps reconcile | Desired state applied | Drift, sync failure |
| Kubernetes rollout | New pods ready | Probe failures, scheduling errors |
| Post-deploy verification | Healthy signal | Rollback triggered |

---

## 15. Interview Follow-Ups

**Q: Why three systems (CI / artifacts / CD) instead of one pipeline?**
Decoupling = independent scaling, rollback without rebuild, and different trust boundaries — CD never sees source, CI never touches prod.

**Q: How does a commit reach prod?**
SHA → test+scan → immutable image:sha → registry → deploy-repo tag update → GitOps render → K8s rollout → probe-gated traffic → verify. (Recite the §3 sequence.)

**Q: GitOps vs traditional push CD?**
Pull model: no cluster creds in CI, continuous drift correction, git = audit. Push model: simpler, faster feedback loop, but creds sprawl and drift is invisible.

**Q: How do you do a canary in this world?**
Argo Rollouts/Flagger CRD in the chart → analysis template queries Prometheus (error rate, p99) → auto-promote or abort. The deploy repo never changes shape — the rollout controller handles traffic math.

**Q: Pipeline took the prod env down — RCA?**
Bisect the flow: bad artifact (scan gap?) vs bad values (deploy repo diff) vs bad apply (sync error) vs bad runtime (probe/resource). Each stage has its own blame surface — that's the point of the separation.
