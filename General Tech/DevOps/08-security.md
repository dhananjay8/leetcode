# DevOps Security

## Security Layers
```
Code → Dependencies → Container Image → Registry → Deployment → Runtime → Network
```

## Shift-Left Security (Integrate Early)

### 1. Code Level
- **Static Analysis (SAST)**: SonarQube, Semgrep — scan code for vulnerabilities
- **Secret scanning**: GitLeaks, TruffleHog — detect committed secrets
- **Pre-commit hooks**: Run linters, secret detection before commit

### 2. Dependency Level
- **SCA (Software Composition Analysis)**: Snyk, Dependabot — find vulnerable packages
- **Lock files**: `package-lock.json`, `Pipfile.lock` — pin exact versions
- **Update regularly**: Automated PRs for dependency updates (Renovate, Dependabot)

### 3. Container Image Level
- **Image scanning**: Trivy, Snyk Container, AWS ECR scanning
- **Minimal base images**: Alpine, distroless (smaller attack surface)
- **No root**: Run as non-root user in Dockerfile
- **SBOM**: Software Bill of Materials — know what's in your image

### 4. Secrets Management
| Tool | Use Case |
|------|----------|
| **AWS Secrets Manager** | Cloud-native, auto-rotation |
| **HashiCorp Vault** | Multi-cloud, dynamic secrets, PKI |
| **Kubernetes Secrets** | Base64-encoded (not encrypted by default!) |
| **Sealed Secrets** | Encrypted K8s secrets committed to Git |
| **External Secrets Operator** | Sync cloud secrets → K8s secrets |

**Rules:**
- Never commit secrets to Git (ever)
- Rotate secrets regularly
- Use short-lived tokens where possible
- Encrypt secrets at rest (KMS)
- Audit secret access

### 5. Network Security
- **Zero Trust**: Never trust, always verify. No implicit trust based on network location.
- **mTLS**: Mutual TLS between services (service mesh: Istio, Linkerd)
- **Network Policies**: Restrict pod-to-pod traffic in K8s
- **WAF**: Web Application Firewall in front of ALB (block SQL injection, XSS)

### 6. Supply Chain Security
- **Sign images**: Cosign (Sigstore) — verify image wasn't tampered
- **Admission controllers**: Only allow signed/scanned images in K8s
- **SLSA framework**: Provenance and integrity of build artifacts

## Interview Questions

**Q: How do you handle secrets in a CI/CD pipeline?**
1. Store in pipeline secret manager (GitHub Secrets, Jenkins Credentials Store)
2. Inject as environment variables at runtime (never bake into image)
3. For K8s: use External Secrets Operator to pull from Vault/AWS SM
4. Mask in logs (most CI tools do this automatically)
5. Rotate regularly, use short-lived tokens

**Q: What is the principle of least privilege?**
Grant only the minimum permissions needed to perform a task. Apply to: IAM users/roles, K8s RBAC, container capabilities, network access. Regularly audit and remove unused permissions.

**Q: How do you secure a Docker container?**
1. Non-root user, 2. Read-only filesystem, 3. Drop all Linux capabilities, 4. Scan image for CVEs, 5. Use minimal base image, 6. No secrets in image layers
