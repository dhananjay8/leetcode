# Kubernetes Core Concepts

## Architecture
```
Control Plane (Master)                    Worker Nodes
┌────────────────────────┐    ┌──────────────────────────────┐
│  API Server             │    │  kubelet (talks to API server)│
│  etcd (key-value store) │    │  kube-proxy (networking)      │
│  Scheduler              │    │  Container Runtime (containerd)│
│  Controller Manager     │    │  Pods (your workloads)        │
└────────────────────────┘    └──────────────────────────────┘
```

### Control Plane Components
| Component | Role |
|-----------|------|
| **API Server** | Frontend for K8s. All kubectl commands go through it. REST API. |
| **etcd** | Distributed key-value store. Stores ALL cluster state. Must be backed up. |
| **Scheduler** | Assigns pods to nodes based on resource requests, affinity, taints/tolerations. |
| **Controller Manager** | Runs controllers (Deployment, ReplicaSet, Node, Job controllers). Ensures desired state = actual state. |

### Node Components
| Component | Role |
|-----------|------|
| **kubelet** | Agent on each node. Ensures containers in a pod are running. Talks to API server. |
| **kube-proxy** | Network proxy. Maintains network rules (iptables/IPVS) for Service routing. |
| **Container Runtime** | Runs containers (containerd, CRI-O). Docker was deprecated as runtime in K8s 1.24+. |

---

## Pod
Smallest deployable unit. One or more containers sharing network namespace and storage.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  containers:
    - name: app
      image: myapp:1.0
      ports:
        - containerPort: 8080
      resources:
        requests:            # minimum guaranteed
          cpu: "100m"        # 0.1 CPU cores
          memory: "128Mi"
        limits:              # maximum allowed
          cpu: "500m"
          memory: "256Mi"
      livenessProbe:         # is the container alive?
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 10
        periodSeconds: 5
      readinessProbe:        # is it ready to serve traffic?
        httpGet:
          path: /ready
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 3
```

### Probes
| Probe | Purpose | Failure Action |
|-------|---------|----------------|
| **Liveness** | Is the container running? | Restart container |
| **Readiness** | Can it serve traffic? | Remove from Service endpoints |
| **Startup** | Has it started? (for slow apps) | Blocks liveness/readiness until passes |

---

## Deployment
Manages ReplicaSets, handles rolling updates and rollbacks.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # max extra pods during update
      maxUnavailable: 0    # always maintain all replicas
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:2.0
          ports:
            - containerPort: 8080
```

**Key commands:**
```bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl rollout status deployment/myapp
kubectl rollout history deployment/myapp
kubectl rollout undo deployment/myapp           # rollback to previous version
kubectl rollout undo deployment/myapp --to-revision=2
kubectl scale deployment/myapp --replicas=5
```

---

## Service
Stable network endpoint for a set of pods. Pods are ephemeral; Services provide a fixed IP/DNS.

### Service Types
| Type | Description | Use Case |
|------|-------------|----------|
| **ClusterIP** (default) | Internal-only IP | Service-to-service communication |
| **NodePort** | Exposes on each node's IP at a static port (30000-32767) | Development, direct access |
| **LoadBalancer** | Provisions cloud LB (ALB/NLB) | Production external access |
| **ExternalName** | DNS alias to external service | Accessing external DB/API |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP
  selector:
    app: myapp       # matches pods with this label
  ports:
    - port: 80       # service port
      targetPort: 8080  # container port
```

**DNS**: Pods access services via DNS: `myapp-service.default.svc.cluster.local` or just `myapp-service` in same namespace.

---

## ConfigMap & Secrets

```yaml
# ConfigMap — non-sensitive config
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "db.example.com"
  LOG_LEVEL: "info"

---
# Secret — sensitive data (base64 encoded, NOT encrypted by default)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQxMjM=   # base64 of "password123"

---
# Usage in Pod
spec:
  containers:
    - name: app
      envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
      # Or mount as files:
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

---

## Namespaces
Logical isolation within a cluster. Default namespaces: `default`, `kube-system`, `kube-public`, `kube-node-lease`.

```bash
kubectl get namespaces
kubectl create namespace staging
kubectl get pods -n staging
kubectl get pods --all-namespaces
```

## Labels & Selectors
Labels = key-value pairs attached to objects. Selectors = filter objects by labels.

```yaml
metadata:
  labels:
    app: myapp
    environment: production
    version: v2
```
```bash
kubectl get pods -l app=myapp
kubectl get pods -l "environment=production,version=v2"
```
