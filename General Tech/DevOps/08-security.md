# DevOps Security — Interview Notes

## 1. Security Layers

Lifecycle sequence: `code → dependencies → image → registry → pipeline → deployment → runtime → network`. Attack any layer; defend each independently (defense in depth).

---

## 2. Shift-Left — Code & Dependencies

| Layer | Controls | Tools |
| ------- | ---------- | ------- |
| Code (SAST) | Static AST/dataflow analysis, secret scanning, pre-commit hooks, signed commits | SonarQube, Semgrep, CodeQL, GitLeaks, TruffleHog |
| Dependencies (SCA) | Software Composition Analysis, lockfiles, reachability analysis | Snyk, Dependabot, Renovate, OWASP Dependency-Check |
| Image | OS + language CVE scanning, minimal/distroless base, non-root, SBOM | Trivy, Grype, Clair, syft/cyclonedx |
| Running App (DAST) | Black-box dynamic probing against staging/ephemeral env (XSS, SQLi, auth bypass) | OWASP ZAP, Burp Suite, Nuclei |

- **SAST vs SCA vs DAST**: **SAST** scans *your first-party source code* at rest (white-box); **SCA** scans *third-party open-source dependencies* + lockfiles against CVE databases; **DAST** attacks the *running application* over HTTP from the outside (black-box).
- **CVE vs CVSS vs VEX/Reachability**: CVSS (0–10) measures theoretical severity; **EPSS** / **CISA KEV** measures active exploitation likelihood; **VEX** (Vulnerability Exploitability eXchange) records whether the vulnerable function is actually reachable in your code path (avoids waking teams for unexploitable base-image packages).

---

## 3. Secrets Management

| Tool | Use case | Note |
| ------ | ---------- | ------ |
| **AWS Secrets Manager** | Cloud-native, auto-rotation | Per-secret pricing; watch cost at volume |
| **HashiCorp Vault** | Multi-cloud, dynamic secrets, PKI | Strongest feature set; ops overhead |
| **Kubernetes Secrets** | K8s-native config | **base64 ≠ encryption** — needs etcd encryption at rest |
| **Sealed Secrets** | GitOps-safe secrets in Git | kubeseal encrypts for one cluster's controller |
| **External Secrets Operator** | Sync Vault/AWS SM/GCP SM → K8s Secrets | Standard prod pattern |

### HashiCorp Vault Internals (Enterprise / Qualys Pattern)

```text
Unseal (Shamir keys or Cloud KMS auto-unseal)
  → Auth Method (AppRole: role_id + secret_id | K8s SA JWT | AWS IAM)
  → HCL Policy Check (capabilities = ["read"] on secret/etm-audit/<svc>/*)
  → Secrets Engine:
      ├─ KV v2 (versioned static secrets)
      ├─ Database Dynamic Secrets (generates ephemeral DB user/pass with 1h TTL, auto-revokes!)
      ├─ PKI Engine (issues short-lived X.509 mTLS certs, eliminates manual cert rotation)
      └─ Transit Engine (encryption-as-a-service: encrypt/decrypt without exposing keys)
```

- **AppRole vs K8s Auth**: In VM/hybrid or Qualys-style pods (`qvaultsi` + Spring Cloud Vault), **AppRole** pairs a semi-public `role_id` with a delivered `secret_id` mapped to a narrow HCL policy (`etmaudit.hcl`). In native K8s, **Kubernetes Auth** validates the pod's projected ServiceAccount JWT against the K8s TokenReview API — zero static bootstrap secret.

**Rules** (non-negotiable in interviews): never commit secrets to git · inject at runtime, never bake into image layers (`docker history` exposes them) · rotate regularly · prefer short-lived tokens/OIDC over static keys · encrypt at rest (KMS) · audit access.

---

### CI/CD identity — OIDC over stored keys (modern default)

```text
CI job → cloud OIDC token exchange → short-lived role creds (no AWS keys/secrets in CI)
GitHub Actions: id-token: write → aws-actions/configure-aws-credentials → assume role
K8s: ServiceAccount → IRSA (EKS) / Workload Identity (GKE) → cloud IAM role
```

Long-lived static creds in CI = the most common real-world cloud breach path; OIDC kills it.

## 4. Container & Daemon Hardening (from source notes)

### Container-level

```dockerfile
USER appuser                     # non-root
# runtime flags:
# --cap-drop ALL --cap-add NET_BIND_SERVICE
# --read-only --security-opt no-new-privileges
```

- Minimal/distroless base → smaller CVE surface.
- `.dockerignore` + no `.env` in build context.
- Healthcheck so orchestrators can kill hung containers.

### Daemon-level

- `/var/run/docker.sock` = host root — restrict; never expose unauthenticated TCP 2375 (use **TLS on 2376** with client certs).
- **`--userns-remap`** maps container root to unprivileged host UIDs.
- **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`) pulls only signed images; modern equivalent: **cosign** + admission-policy verification.
- Keep engine patched; run rootless where feasible.

### Runtime (K8s side — cross-ref `../Kubernetes/05-security.md`)

seccomp profiles (filter syscalls), AppArmor/SELinux (MAC), Pod Security Standards (`restricted`), OPA/Gatekeeper or Kyverno (policy-as-code), Falco (runtime anomaly detection).

---

## 5. Network Security

- **Zero trust**: no implicit trust from network location; every request authenticated+authorized.
- **mTLS** between services via service mesh (Istio, Linkerd) or SPIFFE/SPIRE.
- **K8s NetworkPolicies**: default-deny ingress/egress per namespace; allow-list only needed flows (note: needs a CNI that enforces them — Calico/Cilium; Flannel doesn't).
- **WAF** at the edge (AWS WAF on ALB) for OWASP-class attacks (SQLi, XSS, bots).
- SG vs NACL (AWS): SG = instance-level **stateful** allow-only; NACL = subnet-level **stateless** allow+deny — see `../AWS` notes.

---

## 6. Supply-Chain Security (increasingly asked)

| Control | Purpose |
| --------- | --------- |
| **Signed images (cosign/Sigstore)** | Prove the artifact you deploy is the one CI built |
| **Admission controllers** | Enforce: only signed+scanned images run |
| **SBOM** | Inventory of components → fast CVE impact answer |
| **SLSA levels (0–4)** | Provenance rigor: L3 = hardened builder + provenance |
| **Pin dependencies by digest** | `image@sha256:…` defeats tag-mutation attacks |
| **Branch protection + required checks** | Stops direct-to-main tampering |

---

## 7. Interview Q&A

**Q: How do you handle secrets in CI/CD?**
Pipeline secret store → injected as env at runtime, masked in logs → K8s gets them via External Secrets Operator from Vault/SM → rotate; prefer OIDC workload identity over stored cloud keys.

**Q: Principle of least privilege?**
Minimum permissions for the task, everywhere: IAM roles, K8s RBAC, Linux capabilities (`--cap-drop ALL`), network rules. Audit and prune unused grants.

**Q: Secure a Docker container?**
Non-root user · read-only rootfs · drop all capabilities · `no-new-privileges` · seccomp profile · minimal base · scanned image · no secrets in layers.

**Q: Someone committed an AWS key to git. Response?**

1. Rotate/revoke the key **first** (assume compromised — scanners find pushes in minutes). 2. Purge from history (`git filter-repo`/BFG) — note history rewrite only helps after rotation, not before. 3. Audit CloudTrail for misuse. 4. Add pre-commit secret scanning + repo-side push protection.

---

## 8. Recall — Sound Bites

- "base64 is encoding, not encryption — say it before they ask."
- "Docker socket = root shell on the host."
- "Shift left: cheapest fix is before the image exists."
- "Rotation first, history-rewrite second."
- "Sign the artifact; verify at admission — trust the pipeline, not the registry listing."
