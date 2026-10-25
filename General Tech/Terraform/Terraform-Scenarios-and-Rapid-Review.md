# Terraform Scenarios and Rapid Review

## 1. Scenario Answer Framework

```text
contain writers → preserve state/evidence → inspect plan and provider activity
→ choose authoritative truth/ownership → migrate or reconcile
→ verify no unintended actions → improve controls/runbook
```

Never lead with a destructive command. State what you verify first and how you preserve recovery.

## 2. Stale Lock After Crash

- Prove the original process and provider operations stopped.
- Identify lock owner/ID and preserve logs.
- Force-unlock only as break-glass.
- Run refresh/plan; inspect partial operations and state writes.
- Reconcile before allowing another apply.

**Invariant:** only one live writer targets the state.

## 3. Manual Production Change

- Plan detects drift after refresh.
- Determine whether the emergency change is valid.
- If valid, update code and reconcile through review; if invalid, apply code to revert.
- Investigate why normal delivery was bypassed.

Do not use refresh-only as a substitute for updating desired configuration.

## 4. Resource Deleted Out of Band

Terraform generally proposes recreation when configuration still declares a missing managed object. Before apply:

- Confirm deletion and dependencies.
- Assess whether recreation is safe or data was lost.
- Restore data/backups where required.
- Review replacement effects on dependents.
- Recreate or remove from configuration according to intent.

## 5. Refactor Wants Destroy/Create

Likely cause: resource address changed. Add a `moved` block or perform a controlled state move. Back up state and require a no-replacement plan before apply.

## 6. Adopt Existing Infrastructure

- Inventory and define ownership/state boundaries.
- Write reviewed configuration.
- Back up state and import using declarative import blocks or CLI.
- Reconcile generated/configured arguments.
- Iterate until plan has no unintended actions.
- Add pipeline, policy, backup, and drift controls.

Import does not prove configuration quality.

## 7. Lost State

- Stop writers.
- Restore a versioned backend object/backup.
- Verify lineage/serial and refresh/plan.
- Reconcile remote operations newer than backup.
- Without backup: reconstruct and import.
- Test recovery afterward.

Avoid manual state editing unless no safer supported path exists.

## 8. Provider Upgrade Causes Large Diff

- Freeze apply and compare provider changelog/schema/default behavior.
- Confirm lockfile and version selected in CI.
- Run representative upgrade plans and identify replacements.
- Add configuration/migration required by the provider.
- Canary low-risk stack; promote by cohort.
- Roll back version if safe and necessary.

## 9. `count` to `for_each` Migration

Addresses change from numeric indexes to keys. Define stable keys, add `moved` blocks for each mapping, and verify no recreate. Ambiguous mappings require explicit migration decisions.

## 10. State Is Too Large/Slow

- Measure refresh/plan time, graph size, lock contention, ownership, and change coupling.
- Split by lifecycle, ownership, permission, or failure domain.
- Migrate resources with moved/state operations under backup.
- Define stable cross-stack outputs and deployment order.
- Avoid replacing one mega-state with hundreds of tightly coupled micro-states.

## 11. Two Stacks Manage the Same Resource

Contain both pipelines. Choose one owner, remove/import/state-migrate the duplicate association, and verify both plans. Enforce resource/state cataloging and ownership policy. Two Terraform addresses must not independently own one remote object.

## 12. Secret Appears in State

- Restrict state/artifact access immediately.
- Rotate the credential; redaction is insufficient.
- Assess logs, backups, plans, and replicas.
- Change design to avoid storing the secret where possible.
- Retain encrypted state according to incident/legal policy and update controls.

## 13. Partial Apply on Critical Database

- Stop competing applies; inspect provider operation and state.
- Protect data and verify backup/replication status.
- Refresh/plan; distinguish completed, pending, and unknown operations.
- Reconcile deliberately; do not blindly destroy/recreate.
- Review lifecycle/prevent-destroy, approval, and failure runbook.

## 14. API Timeout With Unknown Outcome

Do not assume failure means no side effect. Preserve the run, inspect provider/cloud operation logs and remote identity, refresh/plan, and reconcile. Blind retry may create duplicates when the API lacks idempotency. Escalate provider defects and prefer client tokens/idempotent APIs where supported.

## 15. Perpetual Diff

- Confirm pinned CLI/provider and compare raw remote values with state/config.
- Check provider normalization, unordered collections, defaults, timestamps, and co-owning controllers.
- Fix configuration/provider or assign ownership explicitly.
- Use `ignore_changes` only for an intentionally externally owned attribute, not to silence unexplained drift.

## 16. Backend or Terraform Control Plane Outage

Existing infrastructure should continue serving. Freeze competing/manual writers, determine whether the change can wait, use only a rehearsed break-glass path for critical remediation, and reconcile every emergency action afterward. Do not fork state into an ad hoc backend during the incident.

## 17. Common Commands

| Purpose | Command |
|---|---|
| Initialize | `terraform init` |
| Format/check | `terraform fmt -check` |
| Validate | `terraform validate` |
| Plan | `terraform plan -out=tfplan` |
| Inspect saved plan | `terraform show tfplan` |
| Apply saved plan | `terraform apply tfplan` |
| Detect state-only drift | `terraform plan -refresh-only` |
| List/show state | `terraform state list`, `terraform state show ADDRESS` |
| Move address | `terraform state mv OLD NEW` |
| Stop managing | `terraform state rm ADDRESS` |
| Inspect outputs | `terraform output` |
| Dependency graph | `terraform graph` |
| Force unlock | `terraform force-unlock LOCK_ID` |

State commands are operational changes: back up, review, and verify afterward.

## 18. Rapid Definitions

| Concept | Interview-ready definition |
|---|---|
| Provider | Plugin translating Terraform resource operations to an external API |
| State | Mapping/metadata Terraform uses to manage remote objects |
| Backend | State storage and related operational behavior such as locking |
| Root module | CLI/automation entry point and deployment/state boundary |
| Child module | Reusable Terraform configuration with an input/output contract |
| Drift | Divergence among configuration, state, and remote objects |
| Refresh | Read remote objects and update Terraform's working state view |
| Import | Associate an existing remote object with a resource address |
| `moved` block | Declarative resource-address migration |
| Taint/replace | Mark/request a managed object for recreation; use modern replacement options |
| Data source | Read-only provider lookup |
| Workspace | Named state instance for the same root configuration |
| Lock file | Provider dependency selections/checksums, distinct from state lock |
| Policy as code | Automated constraints over configuration/plan/change context |

## 19. High-Frequency Questions

**Terraform vs Ansible?**
Terraform primarily provisions resource lifecycles from desired state; Ansible commonly performs procedural/configuration automation. They can complement each other.

**Why remote state?**
Shared durable access, locking, versioning, security controls, audit, and recovery.

**Why not one state for everything?**
Large blast radius, broad permissions, slow plans, lock contention, and ownership coupling.

**Why not one state per resource?**
Pipeline/state sprawl and brittle cross-state coordination. Boundaries should follow ownership and lifecycle.

**Does `prevent_destroy` guarantee safety?**
No. It is configuration-level protection that can be removed; use policy, approvals, backups, and cloud deletion protection too.

**Does Terraform roll back failed apply?**
No general transaction/automatic rollback. It records completed progress where possible; reconcile with plan and provider state.

**How do you detect drift?**
Scheduled plans/refresh-only plans plus cloud audit/detective controls, with risk-based alerting and named ownership.

## 20. Staff Sound Bites

1. "Configuration, state, and remote infrastructure are three different truths."
2. "A plan is a proposed migration, not proof that apply is safe forever."
3. "State boundaries define lock contention, permissions, ownership, and blast radius."
4. "A state lock prevents concurrent writers; it does not provide cloud transactions."
5. "Resource addresses are persistent identities—refactors need migrations."
6. "Import establishes ownership; a clean plan validates the configuration."
7. "GitOps requires drift reconciliation, not only PR-driven apply."
8. "Short-lived CI identity is safer than long-lived cloud keys."
9. "Policy should block unsafe plans before approval fatigue begins."
10. "Terraform cannot safely co-own attributes with another controller without an explicit contract."
