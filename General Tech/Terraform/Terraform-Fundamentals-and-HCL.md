# Terraform Fundamentals and HCL

## 1. First Response

> "Terraform is a declarative infrastructure-provisioning tool. Configuration expresses desired resources; providers translate them to API operations; Terraform builds a dependency graph, compares configuration, state, and refreshed remote objects, then proposes an execution plan. Its key operational concern is safe state and change management—not only writing HCL."

## 2. Lifecycle

```text
init → fmt/validate → plan → review/policy → apply → observe/drift-check
```

- **`init`:** initialize backend; install pinned providers/modules.
- **`fmt`:** normalize formatting.
- **`validate`:** check configuration/schema consistency; does not prove deployment success.
- **`plan`:** refresh/read state and propose actions; inspect replacements/deletes/unknowns.
- **`apply`:** execute a saved or freshly approved plan and persist state.
- **`destroy`:** plan/apply deletion; not a routine lifecycle phase for persistent production stacks.

A plan is time-sensitive: remote objects, data sources, credentials, and provider behavior can change before apply.

## 3. HCL Building Blocks

| Block | Purpose |
|---|---|
| `terraform` | CLI/provider constraints and backend declaration |
| `provider` | Provider configuration/aliases |
| `resource` | Managed object with lifecycle |
| `data` | Read-only lookup evaluated during planning/apply |
| `module` | Reusable child configuration |
| `variable` | Input contract |
| `locals` | Derived internal values |
| `output` | Published root/module interface |
| `moved` | Declarative resource-address migration |
| `import` | Declarative adoption of existing object |
| `check` / pre/postcondition | Assert infrastructure assumptions/invariants |

## 4. Expressions and Collections

- Prefer `for_each` when instances have stable semantic keys.
- Use `count` for truly positional, interchangeable instances; removing an item can shift indexes.
- Normalize complex inputs in `locals` before resource blocks.
- Use `dynamic` only when provider schema requires repeated nested blocks.
- Avoid clever HCL that makes plans difficult to review.

### `for_each` vs `count`

```hcl
resource "example" "item" {
  for_each = var.items_by_name
  name     = each.key
}
```

Stable keys preserve addresses during list reordering. Changing a `for_each` key changes resource identity unless accompanied by a `moved` block/state migration.

### Type and value semantics

- Prefer precise object, map, set, tuple, and optional-attribute types over `any`.
- `null` means omitted/absent where the receiving schema permits it; an empty string or collection is still a concrete value.
- Defaults apply according to the variable/optional-attribute contract; do not use `null` and empty values interchangeably without defining semantics.
- Sets remove ordering and duplicates; converting a list to a set can change instance identity if values are used as `for_each` keys.
- Marking a value `sensitive` propagates display redaction through expressions but does not keep it out of state.

### Input precedence

Later/higher-precedence input sources override lower ones. In interviews, name the principle rather than memorizing every position: defaults are lowest; environment/variable files/automatic files/CLI or run-platform values can override them according to the execution mode. Keep production inputs explicit, versioned where appropriate, and observable without logging secrets.

## 5. Dependency Graph

Terraform infers edges from references:

```hcl
subnet_id = aws_subnet.app.id
```

Use `depends_on` only for dependencies Terraform cannot infer. Overuse reduces parallelism and creates unnecessary unknown values. `terraform graph` helps diagnose cycles and unexpected coupling.

Terraform parallelizes graph nodes whose dependencies are satisfied; ordering is not file order.

## 6. Expressions, Functions and Evaluation

Terraform expressions are declarative value construction, not a general-purpose workflow language.

- Use `for` expressions for deterministic transformations and filtering.
- Use splats only when they remain readable; explicit `for` expressions handle complex shapes better.
- Use `try` for normalization of expected shape variants, not to suppress arbitrary errors.
- Use `can` mainly in validation when testing whether an expression is valid.
- Use `coalesce`/`coalescelist` only when null/empty fallback semantics are intended.
- Keep filesystem, timestamp, UUID, and external lookups out of resource identity when reproducibility matters.
- Normalize inputs once in `locals`; do not duplicate nested conditional logic across resources.

Values can be known, null, sensitive, or unknown. These properties are distinct: an unknown sensitive value remains both unknown and sensitive.

## 7. Providers and Versions

- Pin Terraform CLI and provider constraints intentionally.
- Commit the dependency lock file for reproducible provider selection.
- Upgrade providers through reviewed plans and provider changelogs.
- Use provider aliases for explicit region/account contexts.
- Pass provider configurations deliberately into modules; avoid hidden assumptions.

Provider schema or behavior changes can alter plans without HCL changes, so provider version is part of the deployment artifact.

## 8. Provider Configuration and Inheritance

A root module owns provider configurations. Child modules declare provider requirements and normally receive default configurations from callers; aliases must be declared and passed explicitly when a child uses multiple configurations.

```hcl
module "replica" {
  source = "./modules/database"
  providers = {
    aws = aws.secondary
  }
}
```

Do not configure providers inside reusable child modules: it couples credentials/regions to implementation and complicates `for_each`, migration, and testing. Provider aliases coordinate resources in one graph, but one state then spans every account/region permission involved.

## 9. Provider Execution Model

Terraform Core evaluates configuration and graph semantics; provider plugins implement resource/data-source schemas and CRUD/read behavior over remote APIs. During refresh/plan/apply, providers can introduce computed values, defaults, replacement requirements, retries, eventual-consistency behavior, and diagnostics.

Staff implications:

- A stable CLI version does not guarantee a stable plan if provider version or remote API behavior changes.
- Provider reads must converge after writes; eventual consistency can produce transient diffs.
- Provider-level retries do not replace pipeline deadlines or API quota management.
- Import IDs, replacement rules, and update semantics are resource-specific provider contracts.
- Diagnose unexpected plans by separating Core graph/address behavior from provider schema/read behavior.

## 10. Unknown Values and Plan Determinism

Unknown values preserve dependency correctness when an attribute is available only after apply. They become risky when they affect instance identity or control flow: `count`/`for_each` keys must be known during planning.

For reproducible plans, pin CLI/providers/modules, use the same state and variable inputs, minimize time-varying data sources, record execution identity/environment, and avoid applying stale plans. Even then, remote APIs can reject or invalidate assumptions between plan and apply.

## 11. Resource Identity and Change Semantics

A resource instance is identified by its full address: module path, resource name, and `count` index or `for_each` key. Remote names/IDs do not preserve Terraform identity when the address changes.

Plan actions:

- **Create:** address is declared but not mapped to an existing object.
- **Update:** provider supports changing the differing attributes in place.
- **Replace:** an immutable/force-new attribute, lifecycle rule, explicit replacement, or identity change requires destroy/create semantics.
- **Destroy:** address is removed from configuration while still managed in state.
- **No-op/read:** refreshed remote values already satisfy the declared configuration.

Use `moved` blocks for address-only refactors and import blocks/commands to establish ownership of existing objects. Review `-/+` versus `+/-` ordering and data-loss/downtime implications; `create_before_destroy` cannot overcome unique-name, quota, or data-migration constraints.

## 12. Lifecycle Meta-Arguments

- **`create_before_destroy`:** reduce downtime when parallel existence is supported; may fail on unique names/quotas.
- **`prevent_destroy`:** extra guard, not a substitute for policy/backup.
- **`ignore_changes`:** use only when another declared owner controls an attribute; broad ignores hide real drift.
- **`replace_triggered_by`:** force replacement when a dependency changes.

Every ignored attribute needs an owner and documented reconciliation path.

## 13. Validation, Preconditions, Postconditions and Checks

| Mechanism | Use |
|---|---|
| Variable validation | Reject invalid module input early |
| Resource precondition | Require an assumption before resource operation |
| Resource postcondition | Verify a guarantee from planned/applied resource data |
| `check` block | Assert broader infrastructure behavior without defining resource lifecycle |

Use deterministic policy/security controls for organization-wide invariants; local assertions improve module contracts but are not a complete governance system. Design failure messages to state the violated invariant and remediation.

## 14. Dependency Lock File

`.terraform.lock.hcl` records selected provider versions and checksums, not module versions, backend locks, or Terraform state locks. Commit it for root configurations and CI reproducibility. Version constraints define allowed upgrades; the lock file records the current selection. Review lockfile changes, use trusted mirrors where required, and run controlled `init -upgrade` rather than deleting it casually.

## 15. Sensitive Values

`sensitive = true` redacts normal CLI/UI display; it does **not** guarantee the value is absent from state. Controls:

- Fetch secrets at runtime where possible rather than generating/storing them in Terraform.
- Encrypt and restrict backend access.
- Prevent state and plans from leaking into logs/artifacts.
- Use short-lived CI credentials.
- Separate secret rotation lifecycle when Terraform state exposure is unacceptable.

## 16. Terraform vs Other Tools

| Need | Typical fit |
|---|---|
| Declarative multi-provider infrastructure | Terraform/OpenTofu |
| Cloud-native deep integration | CloudFormation/CDK/Bicep |
| General-purpose language IaC | Pulumi/CDK |
| Host configuration/procedural automation | Ansible |
| Kubernetes application packaging | Helm/Kustomize |
| Continuous Kubernetes-style infrastructure reconciliation | Crossplane |

Choose based on lifecycle ownership, ecosystem, state model, governance, team skill, testing, and operations—not syntax preference.

## 17. Interview Questions

**Why does Terraform need state?**
It maps resource addresses to remote identities, stores attributes/dependencies, and enables lifecycle decisions. It is sensitive operational metadata, not the desired-state source.

**Why can plan show `known after apply`?**
The value depends on an operation/data result unavailable during planning. Excessive unknowns may indicate unnecessary dependencies.

**Why avoid excessive dynamic blocks?**
They obscure intent, complicate review/debugging, and often replace clearer resource/module `for_each` patterns.

**Can Terraform manage mutable systems?**
Yes, but define ownership carefully. If another controller continuously manages the same attributes, Terraform can create drift wars.

**Why must `for_each` keys be known during planning?**
Keys define resource addresses and therefore graph shape. Terraform can defer attribute values, but it cannot plan instances whose identities do not yet exist.

**Does the lock file lock Terraform state?**
No. `.terraform.lock.hcl` pins provider selections/checksums; backend locking serializes state-changing operations.

**Precondition or policy as code?**
Use preconditions for local module/resource contracts. Use centrally owned policy for cross-repository security, compliance, identity, cost, and approval rules.

**Why can provider aliases increase risk?**
They let one graph/state operate across accounts or regions, which simplifies coordination but broadens credentials and failure blast radius.

## 18. Sound Bites

- "Terraform reconciles configuration, state, and remote objects; those are three different truths."
- "File order does not control apply order—the dependency graph does."
- "Stable resource addresses are part of your infrastructure API."
- "Sensitive output is redaction, not secret removal from state."
- "Unknown values can defer attributes, but resource identity must be known at plan time."
- "The dependency lock file pins providers; the backend lock serializes state writers."
