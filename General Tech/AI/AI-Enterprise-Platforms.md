# Enterprise AI Platforms

## 1. First Response

> "An enterprise AI platform is a governed control plane over models, data, tools, identity, evaluation, and operations. The cloud product matters less than isolation, portability, auditability, and whether teams can ship safely without rebuilding the same controls."

## 2. Platform Capabilities

- Model catalog/endpoints and routing.
- Embeddings, vector/hybrid search, and RAG services.
- Agent/tool orchestration.
- IAM, secrets, network isolation, encryption, and audit.
- Prompt/model/dataset/eval registries.
- Observability, quotas, budgets, and chargeback.
- CI/CD, canary, rollback, and policy gates.

## 3. Build vs Buy

| Managed service | Self-hosted |
|---|---|
| Faster delivery, provider operations | More control, portability, optimization |
| Native IAM/network integration | Higher platform/ML operations burden |
| Provider lock-in and service limits | Capacity/model lifecycle ownership |

Choose per layer; a hybrid model is common.

## 4. OCI AI Mental Model

OCI provides managed Generative AI/model access, Data Science, vector search/database integration, agent-oriented services, IAM, Vault, networking, logging, monitoring, and security services.

Staff-level design:

```text
Application/API
→ OCI IAM/API gateway/private network
→ model/agent service
├─ Oracle Database AI Vector Search / enterprise data
├─ approved tools/services
└─ object/document sources
→ logging/monitoring/audit + evaluation
```

Avoid memorizing product names without mapping them to control-plane responsibilities.

## 5. AI Inside the Database

Oracle Database AI Vector Search and comparable database-native vector features let applications combine:

- SQL predicates and joins.
- Transactional/structured source data.
- Vector similarity.
- Hybrid lexical/semantic retrieval.
- Existing backup/security/governance.

Trade-off: operational simplicity and consistent filters vs specialized vector-engine features/scaling economics. Benchmark filtering, recall, index build/update, concurrency, and total operating cost.

## 6. Multi-Tenancy

Isolation choices:

- Shared index/table with mandatory tenant filter.
- Namespace/schema per tenant.
- Database/index per high-risk tenant.

Consider noisy-neighbor controls, encryption keys, regional residency, deletion, backup/restore, quotas, and chargeback.

## 7. Provider Portability

Create a thin internal contract for model invocation, embeddings, errors, usage, and streaming—but do not erase meaningful provider differences.

Portable assets:

- Prompt/task schemas.
- Evaluation datasets and SLOs.
- Tool interfaces.
- Traces and cost model.
- Versioned retrieval pipeline.

## 8. Governance

- Approved model/provider registry.
- Data classification and permitted model destinations.
- Prompt/model/eval release approval.
- Retention and deletion propagation.
- Audit of identity, data sources, tools, and decisions.
- Human accountability for high-impact outcomes.

## 9. Enterprise Reference Architecture

```text
product applications / data platforms
→ API gateway + workload identity
→ AI access plane
   ├─ model gateway and provider adapters
   ├─ retrieval/embedding services
   ├─ tool registry/gateway
   └─ workflow runtimes
→ approved models, databases, object stores, enterprise tools

control plane:
model/prompt/tool/dataset/eval registries
policy, quotas, budgets, releases, audit, lineage

operations plane:
traces, quality monitoring, cost, incidents, capacity
```

Separate control plane from data plane. A registry outage should not necessarily break already approved inference traffic; cache signed/versioned policy safely and define expiry/fail behavior.

## 10. Platform Team Boundaries

| Central platform owns | Product/domain teams own |
|---|---|
| Identity, provider access, secrets | Business workflow and user experience |
| Model/tool registries and policy | Domain prompts and tool definitions |
| Quotas, telemetry, cost attribution | Domain datasets and quality SLO |
| Common serving/retrieval primitives | Outcome monitoring and human process |
| Release/eval infrastructure | Acceptance criteria and risk ownership |

The platform should provide a paved road, not absorb every domain decision. Define extension points, exception process, and deprecation policy.

## 11. Tenancy and Isolation Tiers

Choose isolation from risk and workload:

| Tier | Pattern | Fit |
|---|---|---|
| Shared | Shared compute/index with mandatory tenant keys | Low-risk, many small tenants |
| Namespaced | Logical index/schema/queues and quotas | Stronger operations and noisy-neighbor control |
| Dedicated | Tenant-specific data plane/keys/network/compute | Regulated or very large tenants |

Isolation spans identity, network, encryption keys, caches, indexes, logs, eval datasets, queues, quotas, backups, and deletion. A tenant filter in the vector query is necessary but not the complete tenancy design.

## 12. Control-Plane Reliability

Critical dependencies include identity, policy, secrets, quota state, routing configuration, registries, and audit delivery.

For each, decide:

- Cached last-known-good configuration and maximum staleness.
- Fail-open versus fail-closed by risk.
- Multi-region replication and consistency.
- Break-glass procedure and audit.
- Backward compatibility for clients.
- Recovery point/time objectives.

Avoid a synchronous dependency chain where every inference request calls multiple control-plane databases.

## 13. Security, Risk, and Compliance

- Map data classifications to approved models/providers/regions.
- Use workload identity and short-lived credentials.
- Restrict private connectivity and egress.
- Maintain source-to-output lineage and immutable audit.
- Scan/redact sensitive inputs according to policy.
- Enforce tool least privilege and approval for high-impact actions.
- Support legal hold, retention, deletion, and residency.
- Track model cards, limitations, intended use, and risk acceptance.
- Red-team high-risk use cases and rehearse AI incident response.

Governance should be automatable policy-as-code where possible, with named human accountability for exceptions.

## 14. FinOps and Capacity Governance

Track cost by tenant, application, task, model, prompt version, and environment.

Controls:

- Forecast and hard/soft budgets.
- Request, token, concurrency, and spend quotas.
- Showback/chargeback and anomaly alerts.
- Model routing based on quality tier.
- Idle accelerator and reserved-capacity utilization.
- Cache/batch effectiveness and retry waste.
- Unit economics: cost per successful task or business outcome.

Cost controls must not silently route to an inferior model. Fallback/routing combinations require quality evaluation.

## 15. Platform SLOs and Scorecard

Measure:

- Gateway/model/retrieval availability and latency.
- Provisioning and integration lead time.
- Policy decision and quota-service reliability.
- Trace/evaluation coverage.
- Cost attribution completeness.
- Model/prompt rollout and rollback time.
- Security exceptions and time to remediation.
- Product-team adoption, satisfaction, and escape rate.
- Quality incidents attributable to platform controls.

A platform with high adoption but rising defects is not successful; neither is a secure platform teams bypass because integration takes months.

## 16. Adoption and Operating Model

1. Establish principles and minimum controls with security/legal/product stakeholders.
2. Build a thin paved road around real lighthouse use cases.
3. Publish reference architectures, SDKs, templates, and ownership boundaries.
4. Offer self-service onboarding and transparent SLOs.
5. Measure lead time, quality, reliability, and cost—not API call volume alone.
6. Create architecture review only for risk-based exceptions, not every normal integration.
7. Run a community of practice and feed incidents/evals back into platform defaults.

## 17. Migration and Portability Strategy

For provider/model migration:

```text
inventory capabilities and contracts
→ build/verify adapter and semantic differences
→ replay golden + production samples
→ shadow traffic → canary stable cohorts
→ dual-run critical workflows where justified
→ cut over with rollback → retire after retention window
```

Portable interfaces are not enough. Preserve source data, prompts, tool schemas, eval sets, traces, and workflow identity. Test streaming, tool calling, structured output, tokenization, safety behavior, and error semantics separately.

## 18. Staff-Level Design Questions

**Central gateway or direct provider access?**
Use a gateway when governance, quotas, observability, and routing justify the extra hop. Permit controlled direct paths for exceptional latency/data-plane cases, but keep identity, policy, and audit consistent.

**Shared platform or platform per business unit?**
Centralize common controls and contracts; federate domain configuration, data, and quality ownership. Dedicated data planes may satisfy residency or scale while sharing the control plane.

**How do you avoid lowest-common-denominator APIs?**
Stable core contract plus explicit capability discovery/provider extensions. Make unsupported behavior fail clearly rather than silently degrading.

**How do you prioritize platform roadmap?**
Use recurring product pain, incidents, duplicated controls, risk reduction, integration lead time, and measurable economics. Avoid building abstractions before two or more real use cases validate them.

**What is the platform's blast radius?**
Model routing, policy, identity, SDK, and gateway changes can affect every AI product. Use versioned configuration, cohort canaries, cell-based isolation, kill switches, and rehearsed rollback.

## 19. Frequently Asked Questions

**Database vector search or dedicated vector DB?**
Use database-native search when transactional joins, governance, and operational consolidation dominate. Use specialized stores when vector scale/index features/latency economics justify another system.

**How do you avoid lock-in?**
Own schemas, eval datasets, prompts, tool contracts, and source data; isolate provider adapters; continuously benchmark an alternate path.

**What should the central platform enforce?**
Identity, policy, secrets, network, quotas, telemetry, model registry, release/eval gates. Product teams retain domain prompts/tools/workflows.

## 20. Interview Sound Bites

- "The reusable platform artifact is the control plane, not one universal prompt."
- "Portability comes from owned contracts and evals—not pretending providers are identical."
- "Database-native vector search is an operational trade-off, not automatically inferior or superior."
