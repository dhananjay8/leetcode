# Kubernetes Security

## RBAC (Role-Based Access Control)
Controls who can do what in the cluster.

```
Subject (User/Group/ServiceAccount) → RoleBinding → Role (permissions)
```

### Role (namespace-scoped) vs ClusterRole (cluster-wide)
```yaml
# Role — permissions within a namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
  - apiGroups: [""]           # core API group
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]

---
# RoleBinding — binds role to a subject
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
  - kind: User
    name: alice
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### ServiceAccount
Identity for pods (not humans). Each namespace has a `default` SA.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123:role/my-role  # IRSA for AWS

---
# Pod using ServiceAccount
spec:
  serviceAccountName: app-sa
  automountServiceAccountToken: false  # disable if not needed (security)
```

## Pod Security

### Security Context
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
```

### Pod Security Standards (replaces PodSecurityPolicy)
| Level | Description |
|-------|-------------|
| **Privileged** | No restrictions (system workloads) |
| **Baseline** | Minimally restrictive (prevents known privilege escalations) |
| **Restricted** | Heavily restricted (best practices, non-root, read-only) |

```bash
# Enforce on namespace
kubectl label namespace production pod-security.kubernetes.io/enforce=restricted
```

## Secrets Management
K8s Secrets are **base64-encoded, NOT encrypted** by default in etcd.

**Best practices:**
1. Enable etcd encryption at rest
2. Use **External Secrets Operator** to sync from Vault / AWS Secrets Manager
3. Use **Sealed Secrets** if you must commit secrets to Git
4. Limit RBAC access to secrets
5. Audit secret access

## Interview Questions

**Q: A developer needs read-only access to pods in staging namespace. How?**
Create a Role with `verbs: [get, list, watch]` on `resources: [pods]` in staging namespace. Bind it to the developer's user/group via RoleBinding.

**Q: How do you prevent containers from running as root?**
Set `runAsNonRoot: true` in securityContext. Enforce with Pod Security Standards (restricted mode) on the namespace.

**Q: Role vs ClusterRole?**
Role = scoped to a namespace. ClusterRole = cluster-wide or can be bound to a namespace via RoleBinding.
