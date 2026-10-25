# Terraform Modules and Repository Design

## 1. First Response

> "I design Terraform around independently owned root modules and small versioned child modules. A root module is a deployment and state boundary; a child module is a reusable contract. I optimize for clear plans, stable addresses, least privilege, and safe evolution—not maximum abstraction."

## 2. Root vs Child Modules

- **Root module:** invoked by CLI/automation; owns backend, state, provider wiring, and deployment lifecycle.
- **Child module:** reusable resource composition with explicit inputs, outputs, constraints, and documentation.

Do not put backend configuration inside reusable child modules. Keep environment/account assumptions at the root.

## 3. Module Contract

A production module should define:

- Narrow typed inputs with validation.
- Stable minimal outputs.
- Required provider and Terraform constraints.
- Security/reliability defaults.
- Optional features without deeply nested conditionals.
- Examples and upgrade/migration notes.
- Automated format, validate, lint, security, and behavior tests.
- Ownership and version/deprecation policy.

Avoid exposing every provider argument. A module should encode an approved capability, not merely rename the provider schema.

## 4. Abstraction Judgment

Create a module when there is a repeated policy-bearing pattern, coherent lifecycle, or ownership boundary. Avoid modules that:

- Wrap one resource with no added invariant.
- Support every hypothetical option.
- Hide resource identities and plan impact.
- Couple unrelated resources with different lifecycles.
- Require consumers to understand internal implementation to use safely.

Prefer composition of focused modules over one universal platform module.

## 5. Repository Patterns

### Monorepo by stack

```text
modules/
  network/
  database/
live/
  dev/network/
  prod/network/
  prod/apps/
```

Benefits: shared tooling and atomic cross-folder review. Risks: broad CI, ownership contention, accidental blast radius.

### Repositories by platform domain

Network, data, and application infrastructure evolve independently. Benefits: ownership and permissions. Risks: cross-repo coordination and version management.

Choose based on ownership and deployment boundaries; no layout is universally correct.

## 6. Environments and Workspaces

Prefer distinct roots/backends/credentials for environments requiring different access, lifecycle, or blast radius. CLI workspaces provide separate state for the same configuration; they do not inherently provide strong account/credential/code isolation.

Use workspaces when instances are intentionally homogeneous and automation prevents accidental workspace selection. Avoid using them as the only production isolation mechanism.

## 7. State and Stack Decomposition

Split stacks by:

- Team ownership and IAM boundary.
- Change frequency and lifecycle.
- Failure/blast radius.
- Provider/account/region.
- Plan/apply performance and lock contention.

Do not split so finely that every change requires a fragile chain of cross-state dependencies. Treat outputs consumed by other stacks as versioned APIs.

## 8. Dependencies

- Prefer direct references inside one state.
- Across states, publish stable outputs through controlled interfaces.
- Avoid circular dependencies; merge ownership or introduce an external registry/event/process.
- Use `depends_on` only when semantic dependency is not represented by data flow.
- Diagnose cycles with `terraform graph` and redesign ownership rather than forcing ordering.

## 9. Module Versioning and Upgrades

- Pin module versions/commits for production consumers.
- Use semantic versioning based on consumer impact.
- Publish migration notes and `moved` blocks where possible.
- Test upgrade plans from supported prior versions.
- Canary a low-risk stack before broad rollout.
- Deprecate with an owner and date; avoid indefinite parallel variants.

A module change that causes replacement is breaking even if HCL types remain compatible.

## 10. Testing Strategy

- **Static:** `fmt`, `validate`, lint, policy, security scans.
- **Contract:** input validation, outputs, provider constraints.
- **Plan:** inspect expected resources and destructive actions.
- **Integration:** deploy to an isolated account/project, assert behavior, destroy.
- **Upgrade:** old module version → new version with no unintended replacement.
- **Failure:** quota, permission, partial apply, deletion protection, and recovery.

Snapshotting whole plan text is brittle; assert important invariants and actions.

## 11. Zero-Downtime Migration Design

Treat infrastructure migration as a compatibility sequence, not one apply:

```text
expand capacity/interface → migrate traffic/data/consumers
→ verify → contract old resources → remove compatibility path
```

Examples: create a new resource before routing traffic; publish old and new outputs during consumer migration; replicate/backfill data before cutover; separate schema/data migration from resource replacement.

Terraform can express resources and dependencies, but health checks, traffic shifting, data validation, and rollback may require deployment tooling or service APIs. `create_before_destroy` alone does not guarantee zero downtime.

Before migration, identify naming/quota conflicts, immutable attributes, data movement, DNS/cache propagation, dependent stacks, rollback point, and who owns each phase.

## 12. Interview Questions

**One state or many?**
Separate by ownership/lifecycle/blast radius, but avoid excessive cross-state coupling. Explain both failure containment and operational cost.

**When should you build a module?**
When repeated infrastructure carries shared policy or lifecycle. Not merely to remove duplicated lines.

**Why not use workspaces for dev/stage/prod?**
They isolate state but do not inherently isolate credentials, configuration, or blast radius; explicit roots are clearer for materially different environments.

**How do you evolve a module safely?**
Version the contract, test upgrade plans, preserve addresses with moved blocks, canary, document replacements, and retain rollback.

**When should two resources remain in one state?**
When they share ownership/lifecycle and need direct graph coordination. Split when permissions, failure domain, or deployment cadence differ enough to justify an explicit interface.

**How would you migrate a shared output used by 100 stacks?**
Add a backward-compatible output/interface, inventory consumers, migrate by cohort, observe usage, then remove the old contract in a later version. Avoid synchronized flag-day applies.

**What belongs outside Terraform?**
High-frequency reconciliation, application rollout logic, data-plane transactions, and imperative operations whose lifecycle is better owned by deployment/workflow tools.

## 13. Sound Bites

- "A root module is a deployment boundary; a child module is a reusable contract."
- "Optimize modules for safe consumption, not maximum configurability."
- "Cross-state outputs are APIs—keep them stable and minimal."
- "A syntactically compatible module change can still be operationally breaking."
