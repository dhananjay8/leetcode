# Kubernetes Security — Interview Notes

## 1. The Layers (text sequence)

```text
API request → authn (who) → authz/RBAC (allowed?) → admission (mutate/validate)
Pod runtime → securityContext → Pod Security Standards → NetworkPolicy → node isolation
Data        → Secrets (etcd encryption) → external secret managers → image scanning/signing
```

---

## 2. RBAC — Who Can Do What

- **Role/RoleBinding** = namespaced · **ClusterRole/ClusterRoleBinding** = cluster-wide (or node-level resources).
- Default-deny: no binding = no permission. `kubectl auth can-i` to check.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { namespace: prod, name: pod-reader }
rules:
  - apiGroups: [""]            # "" = core group
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
kind: RoleBinding
subjects: [{ kind: User, name: alice }]       # or ServiceAccount/Group
roleRef: { kind: Role, name: pod-reader }
```

Rules: **verb × resource** granularity (`get` vs `list` differ); `secrets` access is the crown jewel — audit it; avoid `*` wildcards and `cluster-admin` in production.

## 3. ServiceAccounts & Projected Bound Tokens (`TokenRequest` API)

Every pod has an SA token (default SA = useless baseline). Create dedicated SAs per app → bind Roles to them. `automountServiceAccountToken: false` when the app doesn't call the API. On AWS, **IRSA** (or **EKS Pod Identity**) maps SA→IAM role (no node-level AWS keys).

- **Legacy Secret Tokens vs Modern Bound Projected Tokens (`v1.22+` / `v1.24+`)**:
  - **Old (<1.21)**: K8s created a permanent `Secret` per ServiceAccount with a **non-expiring JWT**. If leaked, valid forever.
  - **Modern (`TokenRequest` API + `ServiceAccountToken` projected volume)**: kubelet mounts a **time-bound (~1h expiry), audience-scoped, pod-bound OIDC JWT** and rotates it automatically before expiry; invalidated immediately when the Pod is deleted.

## 4. securityContext — the Interview Checklist

```yaml
securityContext:                        # pod-level
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 2000
  seccompProfile: { type: RuntimeDefault }
containers:
  - name: app
    securityContext:                    # container-level
      allowPrivilegeEscalation: false   # no setuid
      readOnlyRootFilesystem: true      # needs /tmp as emptyDir volume
      capabilities: { drop: [ALL] }     # add back only what's needed, e.g. NET_BIND_SERVICE
```

## 5. Pod Security Standards (PSS replaced PSP, deprecated v1.21, removed v1.25)

| Level | Enforcement | Use |
| ------- | ------------- | ----- |
| `privileged` | None | kube-system, CNI agents |
| `baseline` | Blocks obvious escalation (hostPID, hostNetwork, privileged) | Default for normal workloads |
| `restricted` | + runAsNonRoot, drop ALL caps, seccomp, RO-rootfs | Prod apps, multi-tenant |

```bash
kubectl label ns prod pod-security.kubernetes.io/enforce=restricted
# modes: enforce | audit | warn
```

## 6. Secrets — Encode ≠ Encrypt (favorite gotcha)

- `kubectl get secret -o yaml` output is **base64 — anyone with read access decodes it**. So: etcd **encryption at rest** (EncryptionConfiguration, KMS provider) + tight RBAC on `secrets`.
- External managers (prod answer): AWS Secrets Manager / GCP SM / HashiCorp Vault / Azure KV via **External Secrets Operator** or CSI driver — K8s stays the consumption layer, manager owns rotation/audit.
- Avoid env-var secrets for high sensitivity (visible in `kubectl exec env`, process lists, crash dumps) — mounted files are marginally better; best is short-lived workload-identity tokens.

## 7. Runtime & Admission Security (from source gaps)

- **Admission controllers**: built-in (LimitRanger, PodSecurity, ResourceQuota) + dynamic webhooks — **OPA/Gatekeeper** (Rego DSL) or **Kyverno** (YAML-native) for policy-as-code ("no :latest", "must have resource limits", "only trusted registries").
- **CEL `ValidatingAdmissionPolicy` (GA in v1.30)**: Compiles Common Expression Language (`object.spec.containers.all(c, !c.image.endsWith(':latest'))`) **in-process inside `kube-apiserver`** — zero external webhook network hop, zero webhook pod crash blocking cluster deployments!
- **seccomp**: syscall allowlist — `seccompProfile: RuntimeDefault` blocks ~44 dangerous syscalls (`kexec_load`, `reboot`, `bpf`) out of ~300+ Linux syscalls for free.
- **AppArmor/SELinux**: MAC confinement at node level (`annotations` / `securityContext.appArmorProfile`).
- **Sandboxed runtimes (`RuntimeClass`)**: **gVisor (`runsc`)** (user-space kernel intercepting syscalls) or **Kata Containers / Firecracker** (lightweight microVM per pod) for untrusted multi-tenant code execution.
- **Runtime detection**: Falco / Cilium Tetragon (eBPF) → alert or kill on shells spawned in pods (`execve /bin/sh`), sensitive file reads (`/etc/shadow`), crypto miners, or unexpected outbound connections.
- **Image supply chain**: scan in CI (Trivy/Grype), sign + verify (cosign), private registries only.

---

## 8. Interview Q&A

**Q: Compromised pod — blast radius?**
Namespaced RBAC limits API calls; NetworkPolicy limits lateral movement; non-root + RO-rootfs + dropped caps limits node damage; PSS stops escalation. Then: detect (Falco), isolate (cordon + delete pod), rotate SA token + secrets.

**Q: How do pods call the K8s API?**
Mounted SA token → apiserver → RBAC decides. That's why `automountServiceAccountToken: false` is a cheap win.

**Q: Secret got exfiltrated from `kubectl get secret -o yaml`?**
RBAC on `get secrets` was too broad — that's the real vuln. Rotate, enable etcd encryption, move to external manager, audit `secrets` access.

**Q: Pod runs as root — how bad?**
Container root ≠ host root by default (user namespaces still maturing), but root + writable rootfs + default caps = easier escape; `runAsNonRoot` is baseline hygiene.

---

## 9. Recall — Sound Bites

- "Authn → authz → admission — three doors, in that order."
- "RoleBinding is namespaced; ClusterRoleBinding reaches the cluster."
- "Secrets are encoded, not encrypted — encrypt etcd + starve RBAC."
- "PSP is dead; Pod Security Standards + admission policies replaced it."
- "`runAsNonRoot + drop ALL + readOnlyRootFilesystem` is the 80% answer."
