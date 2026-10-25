# Terraform — Staff Interview Guide

## Start Here

- **Core interview:** [Fundamentals and HCL](./Terraform-Fundamentals-and-HCL.md) → [State and Backends](./Terraform-State-Backends-and-Drift.md)
- **System design:** [Modules and Repository Design](./Terraform-Modules-and-Repository-Design.md) → [GitOps, Security and Scale](./Terraform-GitOps-Security-and-Scale.md)
- **Advanced/platform:** [Platform and Ecosystem](./Terraform-Advanced-Platform-and-Ecosystem.md)
- **Scenario round:** [Scenarios and Rapid Review](./Terraform-Scenarios-and-Rapid-Review.md)
- **Mock interview:** [Staff Question Bank](./Terraform-Staff-Interview-Question-Bank.md)
- **Source audit:** [Source Coverage](./Source-Coverage.md)

### Recommended sequence

1. Read this mental model and invariants.
2. Study fundamentals, then state/backends.
3. Practice modules and GitOps as system-design topics.
4. Review advanced platform trade-offs.
5. Answer scenario/question-bank prompts aloud without notes.

## Mental Model

```text
HCL desired state + provider schemas
→ dependency graph
→ refresh live objects and read state
→ plan proposed actions
→ policy/review gate
→ apply through provider APIs
→ persist new state
→ drift detection and reconciliation
```

Terraform has three distinct truths:

- **Configuration:** declared desired state.
- **State:** Terraform's mapping and last recorded attributes.
- **Remote objects:** infrastructure currently reported by provider APIs.

A plan reconciles these views; state alone is not the desired configuration or the live infrastructure.

## Staff Answer Framework

```text
scope and ownership → state/blast-radius boundary
→ identity and backend → plan/apply workflow
→ policy and approvals → failure/recovery
→ drift, observability, and operating model
```

State assumptions, identify destructive/replacement risk, preserve a rollback/recovery path, and explain how concurrent or out-of-band changes are controlled.

## Core Invariants

- One independently operated stack has one explicit state and ownership boundary.
- Only one writer changes a state at a time.
- Production applies use reviewed code, controlled identity, and the reviewed/safely regenerated plan.
- State is encrypted, versioned, access-controlled, audited, and recoverable.
- Resource address changes are migrations, not cosmetic refactors.
- Drift has an explicit owner and remediation policy.
- Secrets marked `sensitive` are hidden from normal output, not removed from state.

## Source Policy

These notes consolidate the editable `[WIP] Terraform.md` source. The PDFs remain unchanged as reference material. Product/version details should be checked against the Terraform and provider documentation used by the interview or project.
