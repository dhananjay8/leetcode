# GitOps & ArgoCD

## What is GitOps?
Git is the **single source of truth** for declarative infrastructure and applications. An operator (ArgoCD, Flux) continuously reconciles cluster state with Git.

### GitOps Principles
1. **Declarative**: Desired state described in Git (YAML manifests)
2. **Versioned**: All changes through Git commits (auditable)
3. **Automated**: Agent pulls from Git and applies to cluster
4. **Self-healing**: Drift detected → auto-reconcile to match Git

### Push vs Pull Deployment
| Model | How | Example |
|-------|-----|---------|
| **Push** | CI pipeline pushes to cluster (`kubectl apply`) | GitHub Actions + kubectl |
| **Pull** (GitOps) | Agent in cluster polls Git, applies changes | ArgoCD, Flux |

**Pull is preferred**: Cluster credentials never leave the cluster. CI doesn't need cluster access.

## ArgoCD

### Architecture
```
Git Repository (manifests) ← ArgoCD polls every 3 min (configurable)
                                ↓
                        ArgoCD Application Controller
                                ↓
                        Compares Git state vs Live state
                                ↓
                        Syncs if out of drift
```

### Key Concepts
| Concept | Meaning |
|---------|---------|
| **Application** | ArgoCD resource pointing to a Git repo + path + target cluster/namespace |
| **Sync** | Apply Git manifests to cluster |
| **Health** | Is the app running correctly? (Healthy, Progressing, Degraded) |
| **Sync Status** | Synced (matches Git) or OutOfSync (drift detected) |
| **Auto-Sync** | Automatically sync when Git changes detected |
| **Self-Heal** | Revert manual kubectl changes to match Git |

### ArgoCD Application
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests.git
    path: overlays/production    # Kustomize path
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # delete resources removed from Git
      selfHeal: true   # revert manual changes
    syncOptions:
      - CreateNamespace=true
```

### Common Commands
```bash
argocd app list
argocd app get myapp
argocd app sync myapp
argocd app history myapp
argocd app rollback myapp <revision>
argocd app diff myapp             # show what will change
```

## GitOps Workflow (CI + CD)
```
1. Developer pushes code → triggers CI pipeline
2. CI: Build → Test → Build Docker image → Push to registry
3. CI: Update image tag in Git manifests repo (via PR or auto-commit)
4. ArgoCD detects Git change → syncs to cluster
5. Deployment rolls out with new image
```

**Separation**: Code repo ≠ Manifests repo. CI updates the manifests repo.

## Interview Questions

**Q: What is GitOps and why is it better than traditional CI/CD?**
Git is the source of truth for cluster state. Benefits: auditable (git log), rollback (git revert), no direct cluster access needed from CI, drift detection, self-healing. Pull model is more secure.

**Q: How do you rollback in ArgoCD?**
Option 1: `git revert` the bad commit → ArgoCD auto-syncs. Option 2: `argocd app rollback myapp <revision>`. Option 3: ArgoCD UI → History → Rollback.

**Q: How does ArgoCD handle drift?**
If `selfHeal: true`, ArgoCD detects manual kubectl changes and reverts them to match Git. Checks every 3 minutes by default (configurable).
