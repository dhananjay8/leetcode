# Terraform GitOps, Security and Organizational Scale

## 1. First Response

> "For production Terraform, Git is the reviewed intent and CI is the only normal writer. Pull requests produce plans under read-oriented identity; policy and owners review risk; protected merge applies a saved or safely regenerated plan with short-lived credentials. State, credentials, stacks, and approvals are separated by blast radius, and scheduled drift detection closes the reconciliation loop."

## 2. GitOps Flow

```text
PR → affected-stack discovery → fmt/validate/lint/security
→ plan → policy/cost/destructive-change analysis
→ CODEOWNERS and risk approval
→ protected merge
→ apply saved plan or controlled re-plan
→ verify, audit, notify
→ scheduled drift detection
```

GitOps is incomplete without reconciliation: out-of-band changes must be detected and dispositioned.

## 3. Plan/Apply Integrity

The applied actions must correspond to reviewed code and assumptions.

Options:

- Apply a saved plan artifact produced for the exact commit/environment.
- Re-plan after merge with the same locked dependencies and block if risk differs.

Protect plan artifacts because they can contain sensitive values. Record commit, provider lockfile, module versions, target state, identity, approvals, and plan checksum.

## 4. Identity and Permissions

- Prefer CI workload identity/OIDC and short-lived cloud credentials.
- Separate plan/read identity from apply/write identity.
- Scope apply roles per stack/account/domain.
- Bind production write access to protected branches/environments and approval.
- Use session tags/claims for repo, workflow, commit, actor, and environment.
- Keep break-glass time-bound, audited, and followed by reconciliation.

A central runner simplifies policy; per-repository roles strengthen isolation. A common compromise is shared controlled runners with stack-specific assumed roles.

## 5. Policy and Security Gates

Layer controls:

- Formatting, validation, linting.
- IaC security and secret scanning.
- Policy as code for encryption, public access, regions, tags, approved services, and destructive actions.
- Cost-diff thresholds.
- Provider/module source and version policy.
- Risk-based approval for delete, replace, IAM, network, and data-store changes.

Preventive policy does not replace cloud detective controls or runtime configuration/security monitoring.

### Policy exceptions

An exception must identify scope, owner, rationale, compensating control, approver, expiry, and review evidence. Encode it narrowly and visibly; alert before expiry. Permanent broad exemptions become an ungoverned second policy system.

## 6. State Security

- Separate backend from managed workload where practical.
- Encrypt with restricted keys; enforce TLS.
- Enable versioning/backup and audit data access.
- Restrict state read as strongly as write—state may contain secrets.
- Deny public access and unmanaged deletion.
- Grant lock-object/table permissions required by the chosen backend.
- Test restoration and document RPO/RTO.

## 7. Scaling Across Teams and Repositories

Platform team provides:

- Standard workflow and reusable CI actions.
- Backend/bootstrap pattern.
- OIDC/role vending and policy library.
- Module registry/golden modules.
- Drift, cost, audit, and inventory views.
- Upgrade/deprecation playbooks.

Domain teams own stack intent, service SLOs, reviews, and outcomes. Use CODEOWNERS and a stack catalog mapping repository, state, owner, account, criticality, and dependencies.

Avoid planning every stack on every commit; compute affected roots conservatively and support explicit full-plan fallback.

## 8. Concurrency and Deployment Ordering

Backend locks serialize one state but not changes across states. For dependent stacks:

- Encode an explicit deployment DAG in orchestration.
- Keep interfaces backward compatible during staged rollout.
- Avoid globally serialized pipelines.
- Prevent two pipelines targeting the same state through deterministic stack identity.
- Bound provider/API concurrency to avoid throttling.

## 9. Drift Operating Model

Define:

- Detection frequency by criticality.
- Owner and response SLO.
- Severity rules for delete/replace/security drift.
- Expected-drift allowlist with expiration.
- Code-wins vs reality-wins decision authority.
- Evidence and audit retention.

If another controller owns an attribute, codify that ownership instead of repeatedly fighting drift with `ignore_changes`.

## 10. Supply Chain and Upgrade Management

- Pin and review provider/module sources and checksums.
- Commit lockfiles and use trusted registries/mirrors where required.
- Scan modules and generated plans.
- Test Terraform/provider/module upgrades on representative stacks.
- Roll out by cohort and retain old runner images/version pins for rollback.
- Track unsupported versions and emergency security upgrades.

## 11. Capacity and Throughput

Plan/apply throughput is constrained by runner slots, provider/API quotas, state locks, graph width, refresh volume, and approval queue—not repository count alone.

- Serialize by state key; parallelize independent stacks.
- Bound Terraform/provider parallelism when APIs throttle or dependencies are fragile.
- Prioritize emergency/critical stacks without starving routine changes.
- Track queue age and lock wait; adding runners cannot fix a hot state or provider quota.
- Cache plugins/modules safely, not state or live API assumptions.
- Stagger scheduled drift plans to avoid organization-wide API bursts.

Use measured P95 plan/apply duration and arrival rate to size runner concurrency, with failure/maintenance headroom. Split a stack only when the operational boundary improves more than the added coordination cost.

## 12. Platform Product Scorecard

Measure the Terraform platform as an internal product:

- Time from PR to trustworthy plan and approved apply.
- Change failure, rollback, drift recurrence, and recovery time.
- Policy exception count/age and false-positive burden.
- Stack onboarding and module-upgrade lead time.
- Percentage using short-lived identity, protected apply, and recoverable state.
- Developer wait time/satisfaction and platform support load.

Fast applies with frequent unsafe bypasses are not success; strict controls that teams route around are not success either.

## 13. Disaster-Recovery Exercises

Periodically restore a state version into an isolated recovery path, verify lineage/serial and access, run a non-destructive plan, and rehearse lock/break-glass procedures. Also test loss of CI runner, identity provider, registry/mirror, backend region, and critical module/provider version.

Define which stacks can wait, which have manual recovery, and the RPO/RTO for state and deployment capability. Preserve last-known-good runner images and dependency artifacts where outage requirements justify it.

## 14. Observability and SLOs

Track:

- Plan/apply success, duration, queue age, and lock wait.
- Destructive/replacement action counts.
- Drift count, age, severity, and recurrence.
- Policy/security/cost denials.
- Provider throttling/errors.
- State recovery and break-glass events.
- Change failure/rollback rate and time to remediate.

Redact secrets and store enough provenance to reconstruct who changed what, from which commit, using which plan and identity.

## 15. Staff Design Scenario

**Design Terraform GitOps for 50 repositories and 10 teams.**

1. Catalog independently deployable stacks and owners.
2. One state/least-privilege role per stack or coherent blast-radius boundary.
3. Shared CI templates with affected-stack planning and concurrency key per state.
4. OIDC → stack-specific plan/apply roles; no long-lived keys.
5. Store versioned encrypted state with locking and tested recovery.
6. PR plan plus policy/security/cost gates; risk-based CODEOWNERS approval.
7. Apply reviewed artifact or controlled re-plan from protected merge.
8. Central audit/inventory/drift dashboards; domain teams own remediation.
9. Canary shared module/provider upgrades by stack cohort.
10. Break-glass workflow with expiry, audit, and mandatory reconciliation.

Trade-off: central standards reduce inconsistency but can bottleneck teams; provide self-service paved roads and delegated ownership rather than ticket-based applies.

## 16. Interview Questions

**Why separate plan and apply roles?**
PRs need broad read to calculate plans but should not write production. Apply is restricted to approved protected workflows.

**How do you prevent plan/apply mismatch?**
Tie plan to commit, state, versions, and environment; apply saved artifact or re-plan under strict equivalence/risk checks.

**How do you handle emergency console changes?**
Use audited break-glass, then immediately reconcile through code/state and add prevention or an explicit ownership exception.

**Central runner or runner per repository?**
Central runners simplify controls; repository-specific identities reduce blast radius. Use shared runner infrastructure with per-stack assumed roles when possible.

**How do you govern policy exceptions without blocking teams?**
Use narrowly scoped, expiring exceptions with owners and compensating controls; measure approval latency and false positives; fix recurring exceptions in the policy or paved road.

**Would you auto-apply low-risk changes?**
Only with explicit risk classification, deterministic policy, bounded scope, strong rollback/recovery, and audit. Tags may be low risk; IAM, network, data, delete, and replace actions require stronger review.

**How do you avoid a central platform bottleneck?**
Provide self-service stack onboarding, reusable workflows/modules, delegated CODEOWNERS, transparent SLOs, and risk-based—not universal—central approval.

**How do you handle provider API throttling across hundreds of stacks?**
Global/account-aware concurrency limits, jittered scheduling, priority queues, bounded retries, observability by API/account, and stack decomposition only where it reduces contention.

## 17. Sound Bites

- "GitOps is review plus automated apply plus reconciliation—not Git storage alone."
- "The plan is a security-sensitive change artifact."
- "State locking is per state; orchestration across states is still your responsibility."
- "Centralize guardrails, delegate infrastructure ownership."
