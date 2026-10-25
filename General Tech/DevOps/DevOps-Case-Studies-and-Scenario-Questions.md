# DevOps Case Studies & Scenario-Based Interview Guide

This guide turns the DevOps source notes into answerable staff-level
scenarios. It complements the topic references:

- CI/CD and GitOps: `04-cicd.md`
- Linux and networking: `01-linux-networking.md`
- Security: `08-security.md`
- Terraform: `../Terraform/README.md`
- Kubernetes-specific scenarios: `../Kubernetes/Docker-Kubernetes-Case-Studies-and-Scenarios.md`
- Docker/Kubernetes troubleshooting: `../Kubernetes/Docker-Kubernetes-Troubleshooting-Interview-Guide.md`

Use the response pattern below instead of reciting a tool list. State what
you know, what you would verify, and what evidence would change your plan.
Treat example thresholds as placeholders; derive production gates from the
service's SLO, capacity, and risk.

## 1. Staff-Level Scenario Answer Pattern

For each scenario, cover these points in order:

1. **Clarify impact and constraints**: user impact, scope, urgency, change
   window, data risk, compliance, and who owns the decision.
2. **Stabilize safely**: mitigate immediate harm without destroying evidence
   or making an irreversible change.
3. **Build a hypothesis from evidence**: identify the relevant dashboards,
   logs, traces, events, plans, audit records, or deployment history.
4. **Choose a reversible action**: state the expected benefit, risk,
   rollback path, and required approval.
5. **Verify recovery**: check user-facing SLOs and downstream health, not
   just whether a command returned successfully.
6. **Prevent recurrence**: assign an owner and a measurable follow-up.

In an interview, distinguish an observed fact from a hypothesis. Say
"I would check" when describing a proposed investigation; do not present
an illustrative case study as personal experience unless it is yours.

## 2. CI/CD, Delivery & GitOps

### Case 1: The pipeline fails at apparently random stages

**Prompt**: Builds fail intermittently in tests, dependency installation,
image publishing, and deployment. Developers retry until a run passes.

**Answer**:

1. Quantify failure rate and time-to-green by stage, runner image, branch,
   dependency source, and failure signature. Preserve logs and artifact
   metadata so "random" failures can be grouped.
2. Separate causes:
   - Test flakiness: race conditions, time dependence, shared mutable test
     data, or order dependence.
   - Infrastructure: runner eviction, registry throttling, DNS, disk, or
     unavailable external services.
   - Nondeterminism: floating dependency versions, mutable image tags,
     time-sensitive generated files, or unpinned toolchains.
   - Deployment defects: non-idempotent scripts, stale state, or a
     dependency that is not ready.
3. Make builds reproducible: lock dependencies, pin toolchains and base
   images by digest, build from a known commit, and promote the same
   artifact across environments rather than rebuilding it.
4. Retry only operations that are safe and plausibly transient. Bound
   retries, add exponential backoff with jitter, and do not retry a failed
   test indefinitely until it turns green.
5. Quarantine a confirmed flaky test only with an owner, tracking issue,
   visible status, and expiry/review date. Keep the rest of the suite
   useful and restore the test after its cause is fixed.
6. Validate with stage-level failure and duration trends; track flaky-test
   rate, queue time, change failure rate, and escaped defects.

**Trade-off**: A retry can hide a transient infrastructure failure, but it
can also mask a real race. Record first-attempt failures separately from
eventual success.

### Case 2: Product asks for faster releases; builds are slow

**Prompt**: The pipeline takes a long time, and the proposed shortcut is to
remove security and integration gates.

**Answer**:

1. Measure queue time and p50/p95 wall time for checkout, dependency
   restore, compile, tests, scans, image build, and deployment. Profile the
   bottleneck before buying runners or removing checks.
2. Improve safe reuse: cache dependencies by lockfile/toolchain key, use a
   remote build cache for hermetic builds, and enable container build-layer
   caching. Do not reuse artifacts across incompatible inputs.
3. Parallelize independent jobs and shard long tests. In a monorepo, use
   dependency-graph-based affected tests, but retain periodic full-suite
   validation and test the graph logic itself.
4. Keep fast feedback on pull requests: format/lint, type checks, unit
   tests, targeted integration tests, and security policy gates. Run
   longer suites in parallel or in later promotion stages with explicit
   release criteria rather than dropping them.
5. Reduce environment setup time with reproducible prebuilt runner images
   and local developer feedback. Avoid a shared mutable runner state that
   creates cross-build contamination.
6. Compare change lead time and failure/rollback rates before and after;
   a faster green build is not an improvement if escaped defects rise.

**Trade-off**: Parallelism reduces latency but can increase cost and
contention. Cache correctness and isolation are part of build security.

### Pipeline design follow-up: describe commit-to-production flow

**Prompt**: Design a pipeline that is auditable and can roll back without
rebuilding code.

**Answer**:

1. CI checks out an immutable source commit, restores locked dependencies,
   runs tests and static/security checks, then builds the artifact once.
2. Generate an SBOM and provenance, scan and sign the image, and publish
   it to a controlled registry under a digest-addressed identity.
3. A reviewed deployment/config change references that digest. Helm or
   Kustomize renders the desired Kubernetes resources; a GitOps controller
   reconciles the approved state.
4. Kubernetes schedules Pods, starts the process, applies startup and
   readiness gates, then routes Service traffic to ready endpoints.
5. Run post-deploy smoke/synthetic checks and evaluate service SLOs.
   Promote through rings or stop/roll back using an explicit policy.
6. Keep source, build, digest, config, approval, and rollout revision
   linked. Rollback changes the deployed version; it should not require
   rebuilding the previous code.

CI establishes artifact evidence; the registry stores the immutable
artifact; CD controls when and how the artifact is deployed.

### Jenkins-specific follow-up: how do you scale pipeline maintenance?

Keep the controller focused on orchestration and use isolated agents for
builds. Prefer declarative pipelines for standard flows and versioned
shared libraries for repeated logic. Each service should expose a small,
reviewable contract: toolchain, build/test commands, artifact metadata,
and deployment output. Validate shared-library changes against sample
services before rollout. Ephemeral Kubernetes agents reduce persistent
runner drift, but require resource quotas, pod cleanup, and controlled
credentials.

### Case 3: Deployment pipeline is green, but production is unhealthy

**Prompt**: CI tests passed and the deployment command succeeded, yet
production error rates rose.

**Answer**:

1. Mitigate first using the safest available rollback, traffic shift, or
   feature-flag disable. Preserve the deployed image digest, manifest,
   configuration version, and relevant traces.
2. Check whether the artifact was actually promoted unchanged. Compare
   digest, rendered manifests, runtime configuration, schema version,
   rollout events, readiness, and user-facing metrics.
3. Determine whether the failure is application-wide, one zone, one
   dependency, one tenant, or only a traffic cohort. Compare the previous
   healthy revision and control group.
4. Roll back only if the previous version can safely read current data and
   schema. If not, stop rollout and use a compatible fix-forward or
   migration plan.
5. Add a progressive rollout gate based on service SLOs, representative
   smoke/synthetic checks, and dependency saturation. HTTP 200 from a
   shallow health endpoint alone is insufficient.
6. Add a regression test or release guard tied to the observed failure,
   with an owner and review date.

### Case 4: Migrating a legacy Jenkins fleet to GitOps without blocking teams

**Prompt**: Teams have custom jobs, release scripts, and different levels
of readiness. A big-bang migration risks stopping delivery.

**Answer**:

1. Inventory service pipelines, artifact formats, secrets, deployment
   mechanisms, dependencies, and ownership. Classify exceptions by risk
   and business criticality.
2. Define the target contract: immutable image digest, SBOM/provenance,
   versioned deployment configuration, required test evidence, and
   rollback procedure.
3. Use a compatibility phase: keep existing builds initially, but require
   signed artifacts and a machine-readable deployment delta. Move
   deployment ownership to a reviewed environment repository and a
   reconciler in controlled waves.
4. Provide shared templates, migration examples, test environments, and a
   time-bound exception process. Track adoption and failure rates without
   forcing unsafe conversion of high-risk services.
5. Validate the new path with canaries and a rollback. Ensure an emergency
   does not create permanent drift between Git and the cluster.

**Trade-off**: A transitional adapter reduces migration risk but must have
an owner and retirement date; otherwise it becomes a second permanent
deployment platform.

### Case 5: Monorepo queue is long; build cost must stay controlled

**Prompt**: Pull requests wait for CI capacity, but multiplying runners
would exceed budget.

**Answer**:

- Measure queue time versus execution time and identify hot packages,
  redundant tests, and contention.
- Use an accurate dependency graph for affected tests; cache only
  hermetic outputs keyed on all relevant inputs.
- Shard tests by historical duration and dynamically balance shards.
- Cap concurrency by workload class and prioritize short feedback jobs.
- Quarantine only demonstrated flakes with ownership and expiry.
- Compare p95 PR feedback time, cache hit rate, queue depth, cost per
  change, and full-suite escape rate.

**Risk to call out**: Incorrect impact analysis can skip the test that
would have caught a regression. Retain scheduled or pre-release full
validation and test the graph against known dependency changes.

## 3. Infrastructure as Code & Cloud Operations

### Case 6: Terraform works in development but fails in production

**Prompt**: A plan/apply succeeds in dev but fails or proposes unexpected
changes in prod.

**Answer**:

1. Stop repeated applies and preserve the exact command, Terraform and
   provider versions, backend/workspace, plan, and error. Do not run
   `apply -auto-approve` to "see if it works."
2. Confirm the intended account, region, workspace, backend key, variable
   files, provider lockfile, and identity. Compare the effective inputs
   without exposing secret values.
3. Review a saved plan against the correct production state. Check drift,
   import/state mapping, resource replacement, quotas, IAM/SCP/policy,
   region-specific service availability, and production-only dependencies.
4. Use refresh-only planning or an import/reconciliation workflow when
   appropriate; do not edit state manually as the first response.
5. Get peer review for destructive or replacement actions and apply the
   reviewed plan through the approved identity. Remember that a successful
   plan cannot guarantee that a later cloud API call or quota check will
   succeed.
6. Add pre-merge production plan checks, policy validation, provider
   pinning, and a documented approval path. Ensure plan artifacts are
   access-controlled because they may contain sensitive values.

### Case 7: A change accidentally deletes critical infrastructure

**Prompt**: A routine IaC update removes a database, network, or key
resource.

**Immediate response**:

1. Stop further applies; identify what was deleted, whether deletion is
   still in progress, and whether backups/replicas are intact.
2. Restore service and data using the approved recovery plan. Do not
   assume recreating the resource restores its data or identity.
3. Capture the plan, apply logs, actor identity, commit, state version, and
   audit events. Communicate impact and recovery status.

**Prevention**:

- Apply `prevent_destroy` selectively to critical resources, knowing that
  it only protects a resource while its lifecycle block remains in the
  configuration.
- Enable provider-side deletion protection, retention, backups, and
  recovery testing where supported.
- Separate production state and cloud permissions by blast radius; use
  short-lived CI identities and reviewed plans.
- Parse saved plan JSON in policy checks and require explicit approval
  for deletes/replacements of protected resource classes.
- Test restore procedures; a backup that has never been restored is an
  assumption, not a recovery guarantee.

### Case 8: Manual production change creates Terraform drift

**Prompt**: A security group was changed manually during an incident, and
the next apply wants to undo it.

**Answer**:

1. Determine whether the manual change was an approved mitigation, an
   unauthorized change, or a pre-existing difference. Review cloud audit
   logs and incident records.
2. Compare live state to code using a plan/refresh-only workflow and
   assess security and availability impact. Do not blindly apply a plan
   that may reopen access or remove a needed path.
3. Decide with the resource owner whether to adopt the live state into
   code or restore the declared state. For either choice, review and
   schedule the change with an explicit rollback.
4. Commit the approved end state and rerun plan until the intended result
   is stable. Add drift detection and alerting; avoid auto-remediation
   when that could cause an outage.

### Case 9: Choose a cloud migration strategy for a portfolio

**Prompt**: Leadership wants to move a mixed portfolio to cloud quickly.

**Answer**:

1. Build an application inventory: business criticality, dependencies,
   data classification, latency, licensing, RTO/RPO, utilization,
   operational ownership, and migration constraints.
2. Select a disposition per workload using the 7 Rs:
   - **Retire**: decommission unused capability.
   - **Retain**: keep it where it is when migration has no current value
     or a hard constraint remains.
   - **Rehost**: move with minimal changes; fast, but preserves many
     existing inefficiencies.
   - **Relocate**: move a compatible virtualization estate with limited
     redesign.
   - **Replatform**: make targeted changes, such as adopting managed
     database or container services.
   - **Repurchase**: replace with SaaS or a different product.
   - **Refactor/Re-architect**: change the application for cloud-native
     elasticity or resilience; highest change and validation effort.
3. Pilot by risk and dependency order, not by "easy app" alone. Include
   identity, network, data transfer, observability, backup, and rollback.
4. Define a migration wave, dual-run/data reconciliation where needed,
   cutover criteria, rollback boundary, and decommission plan.
5. Measure business outcomes: cost, reliability, lead time, and operating
   burden, not only percentage of servers moved.

**Trade-off**: Rehosting can meet a deadline, but should have a funded
modernization decision rather than an unowned "temporary" architecture.

### Case 10: Design a safe, scalable Ansible inventory

**Prompt**: A playbook must target thousands of hosts across environment,
   region, and application groups.

**Answer**:

- Model inventory groups around stable ownership and operational
  boundaries (environment, region, role); avoid duplicating host facts in
  multiple places.
- Use dynamic inventory for cloud resources when host membership changes
  frequently; filter by explicit tags/labels and validate the selected
  target count before privileged runs.
- Put non-secret defaults in group variables and encrypt sensitive values
  with an approved secret manager or Ansible Vault. Do not commit
  plaintext credentials.
- Use idempotent modules, `serial`/canary batches for risky changes,
  `--check` where supported, explicit privilege escalation, and handlers
  for restart ordering.
- Test against a representative staging group; keep a limit/rollback
  procedure and record the exact inventory and playbook revision.

**Follow-up**: Dynamic inventory is not automatically safe; a bad filter
can select every production host. Add a dry-run target summary and
approval gate.

## 4. Observability, Security & Team Practices

### Case 11: A service fails at night, but no alert fires

**Answer**:

1. Identify which user-facing SLI failed and whether the monitoring,
   alert evaluation, routing, or paging path failed.
2. Page on actionable symptoms such as error ratio, latency, saturation,
   and unexpected traffic loss, with SLO burn-rate windows appropriate to
   the service. Do not page only on CPU or individual pod restarts.
3. Add external synthetic checks for DNS/TLS/ingress and a safe
   authenticated transaction if the full workflow matters.
4. Monitor the monitoring path itself with a dead-man's-switch heartbeat
   that reaches an independent paging destination.
5. Test alert delivery with controlled fault injection and on-call
   exercises; document runbooks and escalation.

**Trade-off**: A synthetic check is useful but can be flaky or create
production side effects. Use a dedicated test identity and idempotent,
bounded transactions.

### Case 12: Logs, metrics, and traces exist, but the team is still blind

**Answer**:

- Correlate signals with trace and span IDs in structured logs; use
  exemplars where supported to navigate from an aggregate metric to a
  representative trace.
- Add deployment, config, feature-flag, and infrastructure change
  markers to dashboards.
- Keep metrics dimensions bounded. Avoid unbounded labels such as raw
  user IDs, request IDs, or tenant IDs; put sensitive/high-cardinality
  context in access-controlled traces or logs with retention controls.
- Map service dependencies and ownership; add saturation signals for
  connection pools, queues, retries, and downstream budgets.
- Make alerts link to a runbook with safe first actions and diagnostic
  commands. Review whether the instrumentation answers actual incident
  questions.

### Case 13: Developers have excessive production permissions

**Answer**:

1. Inventory effective permissions and audit records; validate usage
   against incident and operational needs before removing access.
2. Separate read-only diagnosis from write actions. Restrict access to
   secrets even when granting read/list on other cluster resources.
3. Put routine writes behind reviewed deployment/IaC workflows using
   workload identity and short-lived credentials.
4. Provide time-bound, ticket-linked break-glass access with approval,
   audit logging, and post-use review.
5. Test emergency access before an incident and ensure the path cannot
   bypass image provenance, admission, or data protection controls.

### Case 14: A secret is committed to Git

**Answer**:

1. Treat it as compromised. Revoke or rotate it immediately; remove
   dependent credentials safely and check whether a replacement is active.
2. Determine scope and exposure from Git host, CI logs, forks, registry,
   cloud audit, service logs, and access history. Preserve evidence.
3. Check for unauthorized use and contain affected identities/resources.
4. Decide with repository owners whether history rewriting is needed.
   Rewriting does not revoke the secret and cannot erase clones, forks,
   caches, or logs; coordinate force-pushes and collaborator cleanup.
5. Prevent recurrence with server-side push protection, secret scanning
   in CI, short-lived workload identity, runtime secret retrieval, and
   clear rotation/runbook ownership.

### Case 15: Developers and Ops blame each other; a release is stuck

**Answer**:

- Name an incident/release lead and create one shared status channel.
- Agree on observable release gates and rollback criteria derived from
  service SLOs; separate evidence from opinion.
- If safe, use a small canary or hold the release while validating the
  uncertain dependency. Keep the rollback path tested.
- Review ownership boundaries and handoffs after the immediate decision.
  Align teams on shared reliability and delivery outcomes, not siloed
  velocity metrics.
- Build paved-road templates and self-service tooling while preserving
  a documented exception path for non-standard services.

### Case 16: The team is trapped in firefighting

**Answer**:

1. Classify incidents and manual work by frequency, duration, customer
   impact, and recurrence. Do not assume a fixed proportion of toil.
2. Pick the highest-impact repeat offender and create a prevention task
   with a named owner and capacity.
3. Reduce alert noise; automate only actions that are safe, bounded,
   observable, and reversible. A liveness probe is not a generic repair
   mechanism.
4. Convert postmortem actions into tracked work and verify completion.
5. Review toil trend, repeat incidents, SLOs, and deployment outcomes
   regularly; adjust staffing or reliability investment if demand exceeds
   capacity.

## 5. Resilience, Data & Supply Chain

### Case 17: Regional outage and an urgent authentication vulnerability

**Answer**:

- Establish incident command, scope, blast radius, and whether the region
  is isolated or control-plane access is lost.
- Prefer a pre-tested break-glass process: time-bound least-privilege
  identity, multi-party approval, signed image digest/config bundle, and
  an in-region runner with recorded actions.
- Maintain admission and provenance controls during emergency response;
  an emergency path should not silently permit unsigned artifacts.
- Record every command/change, verify service and security outcomes, then
  reconcile the emergency state back into version control after recovery.
- Disable temporary access and review the incident, including whether the
  break-glass mechanism itself was available and safe.

### Case 18: A canary passes at low traffic but leaks at higher load

**Answer**:

1. Halt promotion and compare canary and baseline under equivalent
   traffic, request mix, and duration.
2. Check memory slope after GC, latency percentiles, error rate,
   connection-pool wait, queue depth, CPU throttling, and dependency
   saturation—not only HTTP status.
3. Drain or shift traffic away from the canary if user impact is growing.
   Preserve profiles and deployment metadata before terminating the
   replica when safe.
4. Reproduce at representative concurrency and payload sizes; fix the
   resource leak or backpressure issue and test a rollback.
5. Set canary soak and automatic stop criteria based on SLOs and
   detection latency; do not use fixed percentages as universal gates.

### Case 19: Breaking schema change at high write volume

**Answer**:

- Use expand/contract: add a backward-compatible schema, deploy readers
  that tolerate old and new forms, backfill in bounded/throttled batches,
  validate parity, switch reads/writes, then remove old fields only after
  all old application versions are gone.
- Track replication lag, error rates, lock duration, backfill progress,
  and data parity.
- Write down rollback boundaries for each phase. After incompatible
  writes begin, rollback may require a compatibility shim or fix-forward,
  not simply deploying the previous binary.
- Ensure migration jobs are restartable and idempotent; test on
  production-like data volume.

### Case 20: Previous release cannot read state written by the new release

**Answer**:

1. Stop further rollout and inspect which data or message formats changed.
2. Determine whether rollback is safe from the schema/event compatibility
   contract. Do not deploy the old version blindly.
3. If incompatible state was written, choose a tested migration, dual-read
   compatibility shim, or forward fix. Preserve backups and ensure
   idempotency.
4. Add compatibility checks to release policy and test old/new producer
   and consumer combinations before rollout.

### Case 21: A dependency is compromised or a malicious image reaches a registry

**Answer**:

- Contain by disabling the affected artifact/source or credential and
  identifying all builds and deployments that consumed it.
- Trace image digests to source commit, build identity, SBOM, provenance,
  and environments. Do not trust a tag as immutable identity.
- Rebuild from a known-good dependency set in a controlled environment,
  rotate exposed credentials, and scan for runtime indicators.
- Prevent recurrence with approved registries, lockfiles/checksums,
  SBOM/provenance, least-privilege publishing identities, and admission
  verification of trusted signatures.
- Coordinate disclosure and evidence preservation with security and
  incident response owners.

### Case 22: A load-balancer flap triggers a retry storm

**Answer**:

1. Mitigate by limiting or shedding excess load and restoring the
   failing edge path. Watch queue depth and downstream saturation.
2. Verify retries, timeout budgets, and connection churn across hops.
   Retries at multiple layers can multiply total attempts.
3. Use bounded retries with exponential backoff and jitter only for
   idempotent/retryable operations. Add per-request deadlines, retry
   budgets, circuit breakers where appropriate, and `Retry-After`
   handling.
4. Load-test a failure and recovery, including half-open behavior and
   connection pool recovery.

### Case 23: S3 traffic times out through a corporate egress proxy

**Answer**:

- Separate proxy reachability from SDK connection-pool exhaustion using
  connection acquisition, DNS, connect, TLS, and response timing.
- Check whether response streams are always consumed or closed and
  whether concurrency exceeds the configured client pool.
- Reuse a configured client, set bounded acquisition/connect/read
  timeouts, and cap concurrency. Do not simply raise pool size without
  checking proxy and upstream capacity.
- If policy permits, evaluate a private cloud endpoint and explicit
  proxy bypass for approved service destinations. Verify routing and
  egress policy before changing it.

## 6. Quick Review Checklist

Before finishing an answer, ask:

- Did I explain impact and blast radius?
- Did I state evidence that distinguishes competing causes?
- Is the mitigation reversible, authorized, and safe for data?
- Did I define success in terms of user impact and SLOs?
- Did I avoid universal thresholds, unbounded retries, and automatic
  destructive remediation?
- Did I leave an owner, prevention action, and verification measure?

## 7. Supporting-Source Coverage

- `DevOps_ General Notes.md`: CI versus delivery/deployment, pipeline
  reliability and speed, artifact promotion, GitOps, deployment
  verification, rollback, and production delivery failures.
- `DevOps_ General Notes (1).md`: CI/CD, IaC, observability, security,
  Kubernetes resource pressure, collaboration, and firefighting scenarios.
- `DevOps_ General Notes (2).md`: Break-glass, drift, Jenkins-to-GitOps
  migration, monorepo throughput, multi-cluster rollout, service
  contracts, canary, schema compatibility, supply chain, error budgets,
  retries, noisy neighbors, Vault/Consul, and proxy connection exhaustion.
- `Docker_Kubernetes.md`: 7 Rs migration strategy and scalable Ansible
  inventory; Docker/Kubernetes prompts are in the linked Kubernetes guides.
