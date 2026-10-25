# GitOps & ArgoCD — Interview Notes

## 1. GitOps Principles

- **Git is the single source of truth** for cluster state (declarative, versioned, reviewed via PR).
- An in-cluster operator **pulls and reconciles** — no `kubectl apply` from a CI laptop.
- Pull > push: CI builds/pushes the image; GitOps updates manifests and the cluster converges — cluster credentials never leave the cluster.

```text
Code push → CI (test, build, scan, push image:tag)
         → GitOps repo PR updates manifest (image.tag / kustomization)
         → ArgoCD detects diff → syncs cluster
         → health/status reported back; drift reverted (self-heal)
```

Repo topology (from source): **app repo** (code + Dockerfile) · **centralized config repo** (shared values/policies) · **env/overlays repo** (dev/stage/prod desired state). Keep them separate — blast radius + review ownership differ.

---

## 2. ArgoCD Architecture & Core Concepts

```text
ArgoCD Control Plane (in-cluster, namespace: argocd)
  ├── argocd-server (API + Web UI + gRPC/CLI endpoint, SSO via Dex/OIDC, RBAC enforcement)
  ├── argocd-repo-server (clones Git repos, runs helm template / kustomize build → caches rendered YAML in Redis)
  ├── argocd-application-controller (stateful controller: diffs Redis rendered YAML vs live K8s API state, executes Sync)
  └── argocd-applicationset-controller (generates Applications dynamically from Git dirs, clusters, PRs, matrices)
```

- **Application** = (`source`: repo + revision + path/chart) → (`destination`: cluster + namespace) + `project` (RBAC/cluster/repo boundary) + `syncPolicy`.
- **Sync modes**: **manual** (click/CLI) vs **auto** (`syncPolicy.automated`, with `prune: true` to delete removed git objects + `selfHeal: true` to overwrite live manual edits).
- **Sync Phases & Hooks**:
  1. `PreSync` (e.g., DB schema migration Job or backup before rollout)
  2. `Sync` (applies main manifests, ordered by **`argocd.argoproj.io/sync-wave: "-1" → "0" → "1"`** — lower numbers go first, waiting for health before advancing)
  3. `PostSync` (smoke tests, Slack notification)
  4. `SyncFail` (alert/cleanup hook if sync fails)
- **App of Apps vs `ApplicationSet`**:
  - **App of Apps**: an `Application` pointing to a folder of child `Application` YAMLs (classic pattern).
  - **`ApplicationSet`**: single CRD using **Generators** (`List`, `Cluster`, `Git directory/file`, `Pull Request`, `Matrix`) to template and spawn 100s of `Application`s across clusters/environments automatically without writing N YAML files.
- **How ArgoCD Compares to Qualys `etmaudit` / `quadfile` / `qhelm` Flow**:
  - In pure ArgoCD, `argocd-repo-server` renders Helm/Kustomize and `application-controller` orders resources via **Sync Waves**.
  - In Qualys pods (`sjc01-eng-p19`, `sjc01-eng-p43`), the 3-repo GitOps model (`etm-audit-<service>` → `etm-audit-config-mgmt` → `etmaudit`) achieves the same declarative Git source of truth: **`quadfile.yaml`** (`wait_for_success: true`, `timeout: 700s`) plays the role of `ApplicationSet` + Sync Waves, while the controlled Ansible/Jenkins pod runner syncs **Consul KV**, applies **Vault `qvaultsi` HCL policies**, and executes **`qhelm` (`helm upgrade --install`)** with layered base + pod values overrides.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: api, namespace: argocd }
spec:
  project: default
  source:
    repoURL: git@github.com:org/env-repo.git
    targetRevision: main
    path: overlays/prod
  destination: { server: https://kubernetes.default.svc, namespace: prod }
  syncPolicy:
    automated: { prune: true, selfHeal: true }
    syncOptions: [CreateNamespace=true]
```

```bash
argocd app list | get api | sync api | history api | rollback api 5
```

## 3. Progressive Delivery with GitOps

- Argo Rollouts adds **canary/blue-green** CRDs: sync new version → shift 5% → analysis template queries Prometheus (error rate, latency) → promote or auto-rollback.
- Rollback in GitOps = **git revert** (or `argocd rollback` for emergency, then reconcile git after — don't leave desired state lying).

## 4. GitOps vs Push CD (X vs Y)

| | Push (Jenkins → kubectl) | Pull (ArgoCD/Flux) |
| --- | -------------------------- | -------------------- |
| Cluster creds | CI needs cluster access | None needed outside cluster |
| Drift handling | Invisible until next deploy | Continuously detected/reverted |
| Audit | CI logs | Git history = audit trail |
| Rollback | Re-run old pipeline | `git revert` |
| Multi-cluster | Credential sprawl | One agent per cluster, same repo |

### ArgoCD vs Flux

| | ArgoCD | Flux |
| --- | ------ | ---- |
| Model | App-centric CRDs + UI + RBAC SSO | GitOps-Toolkit controllers, composable, CLI-first |
| Multi-source apps | Yes (v2.5+ multiple sources) | Native kustomize/helm controllers |
| Secrets integration | External Secrets, SOPS plugin, ArgoCD Vault Plugin | Native SOPS/Mozilla + KMS |
| Fleet mgmt | `ApplicationSet` / app-of-apps | `Flux` per cluster + shared repo conventions |
| Fit | Teams wanting visibility/UI | Minimalist, operator-heavy shops |

**Secrets in GitOps** (every interview): never commit plaintext — Sealed Secrets (encrypted-by-cluster-key, committed safely), SOPS+KMS (encrypted yaml in git), or External Secrets Operator (git holds only a reference; value pulled at sync from Vault/AWS SM/etc.).

## 5. Interview Q&A

**Q: Someone edits live state (`kubectl edit`) — what happens?**
ArgoCD shows OutOfSync; with `selfHeal` it reverts within ~seconds. Answer the follow-up: use `ignoreDifferences` for HPA-managed replicas or autoscaling-owned fields.

**Q: Secrets in a GitOps repo?**
Never plaintext — Sealed Secrets, SOPS+KMS, or External Secrets Operator; the manifest in git references, not contains, the secret.

**Q: Failed sync — now what?**
`argocd app get` shows the failing resource + k8s events; fix-forward via PR (preferred) or `argocd app rollback`, then reconcile git so source matches cluster.

**Q: ArgoCD vs Flux?**
ArgoCD = UI + app-centric UX, richer ecosystem; Flux = GitOps-toolkit CRDs, lighter, CLI/composable. Same principles; pick by team taste.

---

## 6. Recall — Sound Bites

- "CI produces artifacts; GitOps converges environments — separate jobs."
- "Pull model: cluster pulls truth; no kubeconfigs in CI."
- "`git revert` is the rollback button."
- "selfHeal + prune = the cluster fights manual edits — use ignoreDifferences deliberately."
- "One LB of truth: out-of-sync is a question, not a mystery."
