# Helm & Kustomize

## Helm — Kubernetes Package Manager

### Core Concepts
- **Chart**: Package of K8s manifests (like npm package for K8s)
- **Release**: Installed instance of a chart
- **Values**: Configuration parameters for a chart
- **Repository**: Collection of charts (like npm registry)

### Common Commands
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm search repo nginx

helm install my-nginx bitnami/nginx              # install chart
helm install my-nginx bitnami/nginx -f values.yaml  # with custom values
helm upgrade my-nginx bitnami/nginx -f values.yaml  # upgrade
helm rollback my-nginx 1                          # rollback to revision 1
helm uninstall my-nginx                           # delete release
helm list                                          # list releases
helm template my-nginx bitnami/nginx              # render templates locally (dry-run)
```

### Chart Structure
```
mychart/
├── Chart.yaml          # metadata (name, version, dependencies)
├── values.yaml         # default configuration values
├── templates/
│   ├── deployment.yaml # templated K8s manifests
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl    # reusable template snippets
│   └── NOTES.txt       # post-install instructions
└── charts/             # sub-charts (dependencies)
```

### Templating Example
```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-app
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

```yaml
# values.yaml
replicaCount: 3
image:
  repository: myapp
  tag: "1.0"
resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

---

## Kustomize — Template-Free Customization

Built into kubectl. No templating engine — uses **overlays** to patch base manifests.

### Structure
```
├── base/                    # shared base manifests
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── overlays/
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── replica-patch.yaml
│   └── production/
│       ├── kustomization.yaml
│       └── replica-patch.yaml
```

```yaml
# base/kustomization.yaml
resources:
  - deployment.yaml
  - service.yaml

# overlays/production/kustomization.yaml
resources:
  - ../../base
patchesStrategicMerge:
  - replica-patch.yaml
namespace: production

# overlays/production/replica-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 5    # override base replicas
```

```bash
kubectl apply -k overlays/production/     # apply kustomized manifests
kubectl kustomize overlays/production/    # preview rendered output
```

## Helm vs Kustomize
| Aspect | Helm | Kustomize |
|--------|------|-----------|
| Approach | Templating (Go templates) | Patching (overlays) |
| Complexity | Higher (template syntax) | Lower (plain YAML) |
| Packages | Helm Hub, community charts | N/A (your own manifests) |
| Dependencies | Supports sub-charts | No built-in |
| Best for | Third-party apps (nginx, prometheus) | Your own app across environments |

**In practice**: Use Helm for third-party charts, Kustomize for your own applications.
