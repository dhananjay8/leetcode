# Terraform State, Backends and Drift

## 1. First Response

> "I treat Terraform state as sensitive, versioned operational data. Each independently deployed stack gets a separate state and least-privilege identity. The backend must provide durable storage and safe concurrency; CI serializes writers, and recovery is tested through version restore, refresh/plan, import, and reconciliation."

## 2. State Semantics

State stores resource-address-to-remote-object mappings, provider references, outputs, dependencies/attributes, lineage, and serial/version metadata.

### State metadata that matters

- **Lineage:** identifies a logical state history and helps reject unrelated snapshots.
- **Serial:** increases on state updates and helps reject stale pushes.
- **Provider address:** binds instances to the provider source/configuration lineage used to manage them.
- **Instance key:** preserves `count` index or `for_each` key identity.
- **Outputs:** may expose values to automation/consumers and can contain sensitive data.

State is a private implementation artifact, not a stable integration API. Use supported commands instead of editing JSON; internal schema can vary by Terraform version.

It can contain credentials or sensitive attributes even when outputs are marked sensitive. Never commit state to Git or expose unrestricted plan/state artifacts.

## 3. Backend Requirements

- Durable storage and encryption in transit/at rest.
- Locking or equivalent writer serialization.
- Versioning and tested restore.
- Least-privilege read/write access.
- Audit logs and break-glass procedure.
- Separation by environment/account/stack.
- High availability appropriate to deployment SLOs.

### Backend selection

Choose from durability, consistency/locking semantics, versioning, encryption/KMS, IAM granularity, audit, regional availability, operational burden, integration with runners, and tested recovery—not storage cost alone.

A backend stores state; a managed Terraform platform may additionally provide run queues, policy, approvals, variables, and private execution. Separate those control-plane decisions in architecture discussions.

## 4. Backend Initialization and Migration

`terraform init` discovers/configures the backend, installs providers/modules, and prepares local metadata. A backend configuration change requires explicit reconfiguration or migration.

Safe migration:

```text
freeze writers → back up source and destination
→ run supported backend migration
→ verify lineage, serial, resource inventory, and outputs
→ test lock and restore → run non-destructive plan
→ switch CI identity/config → retain source read-only through rollback window
```

Never copy state while applies can run. Changing a state key/workspace can point Terraform at an empty state and produce mass-create plans; treat backend address/key changes as identity migrations.

## 5. Locking and Consistency

A lock prevents concurrent state-changing operations; it does not make provider API operations transactional.

Before force-unlock:

1. Identify lock owner/operation.
2. Prove the original process is dead.
3. Check CI and provider activity.
4. Force-unlock using the backend's supported path.
5. Run refresh/plan and inspect partial changes.
6. Reconcile before the next apply.

Never automate blind force-unlock.

Locking relies on every writer using the same backend and lock mechanism. It cannot prevent console/API changes, a second state from managing the same object, or side effects already accepted by a provider API. Backend replication alone does not make multi-region active-active state writing safe.

For S3 backends, locking capabilities and recommended configuration depend on Terraform version; standardize one supported organization-wide approach and verify current documentation during migration.

## 6. Crash and Partial-Apply Semantics

Terraform applies graph operations incrementally; it is not an all-or-nothing transaction. On interruption:

- Some remote resources may have changed.
- State may include only completed writes.
- The lock may remain.
- Provider operations may still be running.

### Unknown API outcomes

A timeout means outcome unknown, not necessarily failure. Query provider/cloud operation logs and remote object identity before retrying. Prefer APIs with idempotency tokens; otherwise a retry may duplicate a side effect. Terraform cannot roll back arbitrary provider actions transactionally.

Recovery: stop competing writers, inspect provider activity, restore state only if necessary, run `plan`/refresh, and reconcile. Do not assume rerunning apply is harmless for every resource.

## 7. Refresh and Planning Semantics

A normal plan usually refreshes managed objects before comparing them with configuration. Refresh updates Terraform's working view; state is persisted only by an operation that writes state.

- **Normal plan/apply:** compare configuration with refreshed remote objects and propose/apply infrastructure changes.
- **Refresh-only plan:** preview state updates required to record remote changes.
- **Refresh-only apply:** persist refreshed values to state without changing remote infrastructure.
- **Refresh disabled/skipped:** may speed constrained workflows but risks decisions from stale state; use only with explicit rationale.

Refresh cannot discover arbitrary unmanaged/orphan resources absent from state. Use cloud inventory, ownership tags, configuration databases, policy, or asset-management queries for that.

## 8. Drift Ownership and Detection

Drift is divergence among configuration, state, and remote objects. Sources:

- Console/manual changes.
- External controllers or autoscaling.
- Provider defaults/API behavior.
- Failed/partial operations.
- Changes made by another stack/tool.

Detection: scheduled plans/refresh-only plans, platform drift tooling, and cloud audit events. Alert by risk—replacement/deletion/security drift matters more than benign tag differences.

Remediation choices:

- **Code wins:** apply to restore declared state.
- **Reality wins:** update configuration, review, then apply/reconcile.
- **Ownership changes:** stop managing an attribute/resource and migrate ownership explicitly.

`refresh-only` accepts remote reality into state; it does not update configuration or fix the underlying ownership decision.

## 9. Import and Adoption

Safe adoption flow:

```text
inventory and choose ownership boundary
→ write/review resource configuration
→ back up state
→ import block/command
→ plan
→ reconcile configuration until no unintended changes
→ add policy/drift controls
```

Import associates a remote object with an address; it does not automatically guarantee complete, maintainable configuration. Generated configuration requires review.

Import one remote object into exactly one Terraform address. Before bulk adoption, inventory dependencies and decide state/ownership boundaries; otherwise imports can institutionalize an unsafe monolith.

## 10. Refactoring Without Recreation

Changing an address—renaming a resource, switching `count` to `for_each`, or moving into a module—can appear as destroy/create.

Prefer reviewed `moved` blocks for declarative migrations; use `terraform state mv` for controlled operational cases. Back up state and verify a no-destroy plan.

`terraform state rm` removes management without deleting the remote object; use only with an explicit new owner or decommission plan.

### Safe state-operation discipline

For `state mv`, `state rm`, `state replace-provider`, import, or state pull/push:

1. Freeze automated writers and select the exact workspace/state.
2. Back up and record lineage/serial.
3. Review source and destination addresses/providers.
4. Perform the smallest supported operation.
5. Run plans on every affected state.
6. Resume automation only after no unintended create/destroy/replace actions remain.

## 11. Lost or Corrupt State Recovery

Priority order:

1. Stop all writers and preserve evidence.
2. Restore a known-good version from backend history.
3. Compare serial/lineage and run a refresh/plan.
4. Reconcile remote changes made after the restored version.
5. If no backup exists, reconstruct configuration and import objects.
6. Validate no unintended create/delete/replace actions.
7. Document cause and test the recovery runbook.

`state push` and manual JSON edits are break-glass operations requiring backups, expert review, and lineage/serial awareness.

Define separate objectives:

- **State RPO:** how much state history can be lost.
- **State RTO:** time to restore a trustworthy state and lock path.
- **Deployment-control-plane RTO:** time to regain safe plan/apply capability.

Test restore in isolation; a backup that has never produced a clean refresh/plan is not proven recovery.

## 12. State Boundaries

Split states by ownership, lifecycle, blast radius, deployment frequency, permissions, and failure domain.

Benefits: faster plans, reduced lock contention, least privilege, smaller incidents. Costs: more pipelines/backends and cross-stack interfaces.

Expose cross-stack data through stable, minimal outputs or a service/config registry. `terraform_remote_state` couples consumers to state access and output contracts; avoid circular dependencies.

### Cross-state contract choices

| Mechanism | Trade-off |
|---|---|
| `terraform_remote_state` | Simple, but couples consumers to state backend/access and output lifecycle |
| Parameter/config registry | Explicit access and decoupling; adds publication/consistency workflow |
| DNS/service discovery | Natural runtime contract; limited to discoverable endpoints |
| Provider data lookup | Fresh remote truth; can be ambiguous, slow, or time-varying |

Version shared outputs like APIs. Use expand/migrate/contract and orchestration for dependency order; backend locks do not coordinate changes across states.

## 13. Custom HTTP Backend

A production HTTP backend must correctly implement state read/write/delete and optional lock/unlock semantics expected by the Terraform version, plus:

- Atomic/conditional writes to prevent lost updates.
- Durable versioned storage.
- Authentication, authorization, TLS, and audit.
- Lock ownership/expiry/recovery semantics.
- Payload limits and availability.
- Conformance and failure-injection tests.

Do not implement a custom backend when a supported managed backend satisfies requirements; state correctness is high-risk infrastructure.

Test conditional writes, duplicate lock requests, stale locks, process crashes, retries, payload corruption, authorization boundaries, storage outages, and recovery—not only happy-path HTTP status codes. Verify exact protocol behavior against the pinned Terraform/OpenTofu version.

## 14. Interview Questions

**State is locked after a CI crash—what do you do?**
Prove the writer is dead, inspect provider activity, force-unlock only as break-glass, then refresh/plan and reconcile partial effects.

**Someone changed production manually—what happens?**
Refresh during plan detects divergence. Decide whether code or the emergency change becomes authoritative; update/apply through review and prevent repeated bypass.

**A bucket moved into a module and plan deletes it—fix?**
Map the old address to the new address with a `moved` block or controlled state move; verify no replacement.

**How do you recover missing state?**
Restore backend version first. If unavailable, inventory, reconstruct configuration, import, and iterate plans until clean.

**Why is a replicated object store not automatically an active-active backend?**
Correct state writes require one coherent lock and ordering/conditional-write model. Replication durability does not guarantee globally serialized writers.

**Can Terraform detect resources created outside Terraform?**
Not generally from state refresh alone. It refreshes known identities; detect orphans through cloud inventory, ownership metadata, policy, or asset-management systems.

**When should you avoid `terraform_remote_state`?**
When consumers should not read the producer's state backend, when contracts need independent lifecycle, or when many consumers would become tightly coupled to state outputs.

**What do you verify after state migration?**
Lineage/serial, complete resource addresses and outputs, backend lock behavior, access/audit, restore procedure, and a plan with no unintended actions.

## 15. Sound Bites

- "A state lock serializes state writers; it does not make the cloud API transactional."
- "Refresh-only accepts reality into state; it does not decide whether reality is correct."
- "One state boundary is one operational blast radius."
- "Replication protects bytes; locking and conditional writes protect state history."
- "Terraform refreshes known objects—it is not a complete cloud inventory system."
- "A backup is only credible after a tested restore and clean reconciliation plan."
