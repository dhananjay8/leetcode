# Terraform Source Coverage

This map prevents source topics from being lost while keeping each concept in one authoritative note.

| Source cluster | Authoritative note |
|---|---|
| Terraform/IaC basics, lifecycle, commands, components | [Fundamentals and HCL](./Terraform-Fundamentals-and-HCL.md) |
| HCL, providers, resources, data, collections, dynamic blocks | [Fundamentals and HCL](./Terraform-Fundamentals-and-HCL.md) |
| State purpose, locking, security and recovery | [State, Backends and Drift](./Terraform-State-Backends-and-Drift.md) |
| Drift detection, refresh-only and remediation | [State, Backends and Drift](./Terraform-State-Backends-and-Drift.md) |
| Import, state move/remove and address refactoring | [State, Backends and Drift](./Terraform-State-Backends-and-Drift.md) |
| S3/native locking details and backend operations | [State, Backends and Drift](./Terraform-State-Backends-and-Drift.md) |
| Custom HTTP backend semantics | [State, Backends and Drift](./Terraform-State-Backends-and-Drift.md) |
| Modules, workspaces, repository layout and graphs | [Modules and Repository Design](./Terraform-Modules-and-Repository-Design.md) |
| Stack/state decomposition and cross-stack dependencies | [Modules and Repository Design](./Terraform-Modules-and-Repository-Design.md) |
| Tool selection: Terraform/OpenTofu, Pulumi, cloud-native, Crossplane | [Fundamentals and HCL](./Terraform-Fundamentals-and-HCL.md) |
| DevSecOps pipeline, GitOps and policy | [GitOps, Security and Scale](./Terraform-GitOps-Security-and-Scale.md) |
| Multi-repository/team/account operating model | [GitOps, Security and Scale](./Terraform-GitOps-Security-and-Scale.md) |
| OIDC, IAM, plan/apply integrity and audit | [GitOps, Security and Scale](./Terraform-GitOps-Security-and-Scale.md) |
| Managed control plane, HCP Terraform, OpenTofu and ecosystem | [Advanced Platform and Ecosystem](./Terraform-Advanced-Platform-and-Ecosystem.md) |
| Provisioners, backend/provider migrations and policy layers | [Advanced Platform and Ecosystem](./Terraform-Advanced-Platform-and-Ecosystem.md) |
| Staff architecture and behavioral practice prompts | [Staff Interview Question Bank](./Terraform-Staff-Interview-Question-Bank.md) |
| Live failures: lock, drift, ghost resource, refactor, adoption | [Scenarios and Rapid Review](./Terraform-Scenarios-and-Rapid-Review.md) |
| Commands, common questions and sound bites | [Scenarios and Rapid Review](./Terraform-Scenarios-and-Rapid-Review.md) |

## Source Files Preserved

- `../../../../supporting-docs/[WIP] Terraform.md`
- `../../../../supporting-docs/Terraform.pdf`
- `../../../../supporting-docs/Terraform Cheat Sheet.pdf`
- `../../../../supporting-docs/10 Terraform Scenarios.pdf`

The Markdown source was used as the editable corpus. PDFs remain unchanged reference material and are not claimed as exhaustively transcribed. Advanced platform topics and the question bank extend beyond the source corpus to cover common Staff Engineer interview expectations; version-sensitive product behavior must be checked against pinned documentation.
