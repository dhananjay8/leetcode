# Terraform Advanced Platform and Ecosystem

## 1. First Response

> "At staff level, Terraform is a change-management platform around a graph executor. The hard problems are ownership, state isolation, identity, policy, safe migrations, provider/API behavior, and a paved road that teams will adopt. I choose self-managed CI or a managed control plane from operational requirements—not product preference."

## 2. CLI Automation vs Managed Control Plane

| Capability | Self-managed CI | HCP Terraform / comparable platform |
|---|---|---|
| Execution | Build runners, queues, isolation | Managed/agent-backed runs |
| State | Operate backend, locking, recovery | Managed state/versioning |
| Governance | Integrate policy/approvals | Native policy/run controls vary by tier |
| Private access | Self-hosted runners | Agents/private execution options |
| Cost/control | More control, more operations | Product cost, less control-plane work |
| Portability | Higher if contracts stay generic | Platform workflow coupling |

Decision factors: data residency, private-network reachability, concurrency, policy/audit needs, availability, identity integration, cost, staffing, and exit strategy.

## 3. HCP Terraform Concepts

Know the abstractions without depending on product-specific trivia:

- **Organization/project:** governance and ownership hierarchy.
- **Workspace:** configuration/run/state boundary in the platform; distinct from CLI workspace semantics.
- **Run:** plan/apply lifecycle with variables, policy, cost, and approval context.
- **Execution mode:** remote, local, or agent-backed depending on platform capability.
- **Variable/variable set:** scoped configuration; sensitive marking controls display, not every downstream exposure.
- **Private registry:** versioned module/provider distribution.
- **Run tasks/policy:** external or native checks around run stages.
- **State sharing:** explicit producer/consumer authorization; avoid broad state access.

Interview focus: tenancy, workspace granularity, private connectivity, concurrency, policy ownership, outage behavior, and migration/exit—not memorizing UI names.

## 4. Terraform vs OpenTofu

Evaluate compatibility at the versions and features you use. Consider:

- License/procurement policy and governance model.
- CLI/HCL/state/provider/module compatibility.
- Backend and encryption features.
- Registry/provider availability and signing/provenance.
- Release cadence, security response, and long-term support.
- Managed-platform/tooling integration.
- Migration and rollback tests on representative states.

Do not assume permanent drop-in compatibility. Pin binaries, isolate tool-specific features, test bidirectional state/config compatibility before claiming rollback, and avoid concurrent writers from different engines.

## 5. Provisioners and Imperative Escape Hatches

`local-exec` and `remote-exec` run side effects that Terraform cannot model reliably. Risks:

- Weak idempotency and partial-failure recovery.
- Credentials/network access on the runner.
- No durable resource model for the side effect.
- Re-execution coupled to resource replacement/triggers.
- Hard-to-test ordering and rollback.

Prefer image baking, cloud-init/user data, configuration management, deployment systems, or provider resources. If unavoidable, isolate credentials, define triggers/idempotency, bound time, avoid secrets in output, and provide reconciliation.

## 6. Data Sources and External Dependencies

Data sources improve integration but can make plans time-varying or unavailable when external APIs fail.

- Pin lookups by stable IDs/versions where reproducibility matters.
- Avoid broad "latest" queries for production artifacts.
- Treat external data/provider availability as a plan dependency.
- Do not use data sources to bypass explicit stack interfaces and ownership.
- Validate assumptions with preconditions/checks.

A plan can change with unchanged HCL if data-source results or provider defaults change.

## 7. Backend Migration

```text
freeze writers → back up source/destination
→ configure destination and migrate with supported init workflow
→ verify lineage/serial/state inventory
→ run non-destructive plan
→ switch CI and access policy
→ retain source read-only through rollback window
```

Test locking, identity, audit, versioning, recovery, and concurrent-run prevention. Never copy state casually while writers remain active.

## 8. Provider Namespace or Engine Migration

- Inventory provider addresses, versions, aliases, and states.
- Validate configuration/state compatibility.
- Back up state and freeze applies.
- Use supported provider-address replacement/migration commands when required.
- Reinitialize lockfiles/plugins from trusted sources.
- Run plans across representative resource types and imported objects.
- Canary, observe, and define rollback before broad migration.

Provider source address is part of state identity; changing a binary alone may not complete migration.

## 9. Testing with Terraform-Native and External Tools

Testing layers:

- **Language/static:** format, validate, lint, security and policy checks.
- **Native tests:** module setup/run/assertions using the Terraform test framework supported by your pinned version.
- **Plan contract:** machine-readable plan assertions for critical actions/invariants.
- **Integration:** isolated real infrastructure with teardown and leak detection.
- **Upgrade:** prior module/provider/CLI version to candidate.
- **Resilience:** permission denial, quota, throttling, interruption, and recovery.

Mocking improves speed but cannot validate provider/API semantics. Real tests need budgets, concurrency limits, unique naming, TTL cleanup, and ownership tags.

## 10. Policy Layers

| Stage | What it can catch |
|---|---|
| HCL/static | Syntax, known insecure declarations, source/version policy |
| Plan | Computed actions/values, delete/replace, cost/risk |
| Apply authorization | Actor, environment, approval, change window |
| Cloud runtime | Out-of-band drift and properties absent from plan |

Use non-compensating hard gates for critical security/destruction; warnings for advisory standards. Test policy against positive, negative, unknown-value, and exception cases. Measure false positives and bypasses.

## 11. Ephemeral Resources and Credentials

Prefer short-lived workload identity and avoid persisting secret material. Where supported by pinned Terraform/provider versions, ephemeral/write-only patterns may reduce state exposure, but verify exact lifecycle and downstream behavior. They do not remove the need for backend security because state still contains broad infrastructure metadata.

## 12. Multi-Region and Control-Plane Failure

Separate infrastructure availability from deployment-control-plane availability. If the backend, CI, identity provider, registry, or managed Terraform service is unavailable:

- Existing workloads should continue serving.
- Freeze unsafe/manual writers rather than fork state.
- Define which emergency changes can bypass normal automation.
- Preserve deterministic reconciliation back into code/state.
- Maintain provider/module/binary availability according to RTO.
- Test backend restoration and runner/private-network failover.

Do not create active-active writers against replicated state unless the backend explicitly guarantees correct locking/consistency semantics.

## 13. Platform Adoption and Leadership

A staff engineer should define:

- Stack ownership catalog and support model.
- Paved-road modules/workflows with explicit escape hatches.
- Version support and coordinated upgrade policy.
- Platform SLOs for plans, applies, drift, and incidents.
- Migration funding and deprecation enforcement.
- Office hours, examples, and automated remediation guidance.
- Decision rights between platform, security, and domain teams.

Measure adoption through safe outcomes and reduced toil, not module download count.

## 14. Staff-Level Questions

**When would you choose HCP Terraform over CI plus S3/GCS?**
When managed runs/state, governance, private agents, registry, and audit reduce enough operational burden to justify cost and platform coupling. Evaluate outage, residency, integration, and exit requirements.

**How would you migrate Terraform to OpenTofu?**
Inventory features/providers/backends, pin both versions, test representative state/config plans in isolation, verify tooling and registry compatibility, freeze writers during cutover, canary, and retain a proven rollback path.

**How do you reduce plan time without hiding risk?**
Measure refresh, provider calls, graph size, and lock wait; split by real ownership/lifecycle boundaries, remove unnecessary data/dependency edges, bound API concurrency, and avoid indiscriminate refresh skipping.

**When is Terraform the wrong reconciler?**
For high-frequency control loops, application/data-plane transactions, or resources co-owned by another controller. Use a system matching the required reconciliation frequency and semantics.

**How do you design the platform for an acquisition with different Terraform practices?**
Inventory stacks/states/providers/identities, classify risk, establish minimum controls first, preserve functioning delivery, standardize interfaces and ownership, then migrate backends/modules/workflows by cohort with measurable exit criteria.

## 15. Sound Bites

- "Terraform is the graph engine; the production system is identity, state, policy, orchestration, and recovery around it."
- "Managed control planes trade operational burden for cost and workflow coupling."
- "Provisioners create side effects Terraform cannot fully reconcile."
- "Compatibility is proven on representative state—not assumed from similar CLIs."
