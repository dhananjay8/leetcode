# Helm & Kustomize — Interview Notes

## 1. What Each Solves

- **Helm** = package manager for K8s: chart = templated manifests + `values.yaml` + releases/upgrades/rollback.
- **Kustomize** = template-free overlay tool built into kubectl (`kubectl apply -k`): base manifests + per-env patches.

---

## 2. Helm

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install web bitnami/nginx -n prod --create-namespace
helm upgrade web bitnami/nginx -f values-prod.yaml --set image.tag=1.2.3
helm list -n prod | helm history web -n prod | helm rollback web 3 -n prod
helm template web ./chart -f values-dev.yaml     # render without installing
```

```yaml
# templates/deployment.yaml (Go templates)
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources: {{- toYaml .Values.resources | nindent 12 }}
```

```yaml
# values.yaml
replicaCount: 3
image: { repository: myapp, tag: "1.0.0" }
resources: { requests: { cpu: 100m, memory: 128Mi } }
```

Hooks (`helm.sh/hook: pre-install` etc.) run jobs around install/upgrade — e.g. DB migrations. `--wait` gates on readiness. `helm dependency` for sub-charts.

### Helm 3 Internals (Architecture, Release State & 3-Way Merge)

- **Helm 2 vs Helm 3**: Helm 2 ran an in-cluster server (**Tiller**) with `cluster-admin` by default (huge security risk). **Helm 3 is 100% client-side** — it uses the caller's `kubeconfig` / RBAC directly.
- **Where does Helm store release state?** Inside the target namespace as gzipped, base64-encoded **Kubernetes Secrets** of type `helm.sh/release.v1` named `sh.helm.release.v1.<release>.v<N>` (`kubectl get secrets -l owner=helm`).
  - *Gotcha*: Each revision creates a new Secret; set `--history-max 10` so hundreds of revisions don't bloat etcd (`1MiB` secret limit!).
- **Helm 3 Three-Way Strategic Merge Patch**: Helm 2 only diffed the *old chart manifest* vs *new chart manifest* (ignoring live `kubectl edit` drift). Helm 3 diffs **old manifest + live cluster state + new manifest**, so live changes are properly reconciled on `helm upgrade`.
- **Hooks & Hook Weights**: Annotations `helm.sh/hook: pre-upgrade,post-upgrade`, ordered by `helm.sh/hook-weight: "-5"` (ascending), cleaned up via `helm.sh/hook-delete-policy: before-hook-creation,hook-succeeded`.
- **Named Templates (`_helpers.tpl`)**: `{{- define "app.labels" -}}` included via `{{- include "app.labels" . | nindent 4 }}` (`include` returns a string you can pipe to `nindent`; `template` cannot be piped).
- **Enterprise / Qualys Central-Helm (`qhelm` + `quadfile`) Pattern**: Instead of maintaining 50 separate chart copies, services use a shared `nexus/central-helm-chart` (or umbrella chart in `etm-audit-config-mgmt`) and pass layered `-f base-values-override.yml -f pod-values-override.yml` orchestrated via `quadfile.yaml`.

## 3. Kustomize

```text
base/                    # works standalone
  deployment.yaml service.yaml kustomization.yaml
overlays/
  prod/kustomization.yaml   # namePrefix, replicas patch, images: newTag
  dev/kustomization.yaml
```

```yaml
# overlays/prod/kustomization.yaml
resources: [../../base]
namePrefix: prod-
replicas: [{ name: app, count: 5 }]
images:   [{ name: myapp, newTag: "1.2.3" }]
patches:
  - patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/cpu
        value: "500m"
    target: { kind: Deployment, name: app }
```

Also: `configMapGenerator`/`secretGenerator` (hash suffixes auto-trigger rollout on change — a favorite detail), `commonLabels`, `namespace:`.

---

## 4. Helm vs Kustomize (X vs Y)

| | Helm | Kustomize |
| --- | ------ | ----------- |
| Mechanism | Go templates + values | Patch overlays, no templating |
| Package/registry | Yes (chart repos, OCI) | No |
| Lifecycle mgmt | Releases, rollback, hooks | None — it's just `apply` |
| Built into kubectl | No (`helm` CLI) | Yes (`-k`) |
| Logic power | Conditionals, loops — can become spaghetti | Declarative only |
| Fits | Distributing apps, 3rd-party charts, release management | Env variants of your own YAML |
| ArgoCD/Flux | Supported | Supported |

Common combo: **Helm for the package, Kustomize for last-mile per-env patches** (ArgoCD supports both, even chained).

---

## 5. Interview Q&A

**Q: Rollback strategy?**
`helm rollback web 3` restores release revision — but the DB schema may have moved; pair with rollback-compatible migrations. Kustomize path: `git revert` + re-apply (GitOps).

**Q: How do you keep dev/prod configs apart?**
Helm: one chart, per-env `values-<env>.yaml` (or `helm template` output reviewed in CI). Kustomize: shared base + overlays. Either way, never hand-edit live manifests.

**Q: Secret handling with Helm/Kustomize?**
Don't put real secrets in charts/values — use `secrets-generator`-style indirection, SOPS/sealed-secrets, or External Secrets Operator at runtime.

**Q: Drift between chart and cluster?**
Someone ran `kubectl edit` or autoscaler touched replicas — Helm won't know until next upgrade. GitOps (ArgoCD) detects and optionally self-heals drift.

---

## 6. Recall — Sound Bites

- "Helm = package + release manager; Kustomize = overlay renderer."
- "`helm template` renders locally; `helm upgrade --install` is idempotent CI pattern."
- "configMapGenerator hash = config change auto-rolls the Deployment."
- "Never store real secrets in `values.yaml` or committed overlays."
- "GitOps wants declarative render (Kustomize); distribution wants packages (Helm)."
