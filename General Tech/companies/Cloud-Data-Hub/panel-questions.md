# Questions to Ask the Senior Panel + Leadership/Behavioral Prep

The panel for this role likely includes someone who has directly built or operated Cloud Data Hub (or the Datahub portal specifically). The questions below are designed to (a) signal you've done real homework on their platform, not generic AWS trivia, and (b) surface information that actually helps you decide if the role/team is right for you. Pick 4-6 per round — don't ask all of them.

---

## 1. Cross-Questions on Platform Architecture & Evolution

1. "The Cloud Data Hub writeups describe moving from bucket-level sharing with a custom catalog-sync module to Lake Formation's fine-grained access control. Is the Datahub portal's access-request/grant flow now a thin wrapper over Lake Formation APIs, or is there still a layer of bespoke logic/state the portal owns on top of it?"
2. "With the hub × stage multi-account grid, how many AWS accounts does the Datahub portal itself need to orchestrate against in practice — is it a handful of central accounts, or does the portal's API fan out across every producer/consumer account?"
3. "How has the 'decentralized compute, centralized storage' principle held up as the platform scaled — are there now cases where you've had to push back toward more centralization, or domains that outgrew the standard dataset model?"
4. "The AWS blog mentions reusable blueprints for data-provider teams. Does the Datahub portal surface or manage those blueprints directly, or do provider teams still bootstrap them outside the portal?"
5. "BMW's more recent blog describes agentic, natural-language search over the Lakehouse using Bedrock and S3 Vectors. Does that roadmap touch this team's surface area — e.g., will the portal eventually expose that search experience — or is it fully owned by a separate team?"
6. "What's the biggest architectural regret or technical-debt item on the Datahub portal today that you'd want a new tech lead to tackle first?"

## 2. Cross-Questions on This Specific Role & Team

7. "The JD lists Nx monorepo as 'advantageous' rather than mandatory — is the team currently on a monorepo, mid-migration to one, or is that a change you'd want the new tech lead to drive?"
8. "For the 'you build it, you run it' principle — what does on-call actually look like for this team? Is it formal rotation with paging, or more informal ownership during business hours given the Munich/India split?"
9. "How is work currently split between this Architect/Tech Lead role and the Backend Developer/Data Engineer role on the same team — where's the handoff line in practice?"
10. "What does a typical cross-site collaboration day look like between Munich and Pune — synchronous overlap windows, async RFC-style decisions, or something else?"
11. "What's the single biggest source of friction between the Datahub portal team and the data-engineering/platform side of Cloud Data Hub today?"
12. "How do coding standards and code-review expectations get set today — is there an existing style guide/ADR process I'd be inheriting, or would defining that be part of this role from day one?"

## 3. Cross-Questions on Tech Stack & Engineering Practices

13. "For the AWS side — is the team's day-to-day AWS work mostly through the console/CLI, or fully through IaC (CDK/Terraform/CloudFormation)? Who owns that IaC?"
14. "How mature is the CI/CD pipeline today — is GitHub Actions already deploying to ECS with a real rollback strategy, or is there manual intervention still involved in production deploys?"
15. "What does the current Jest/Cypress test suite actually cover well, and where are the known gaps the new tech lead would be expected to close?"
16. "Is PostgreSQL + Drizzle an established, mature part of the stack, or a relatively recent adoption I should expect some rough edges in (tooling, migration patterns, team familiarity)?"
17. "How is RBAC/JWT auth currently implemented — home-grown, or on top of an identity provider (Entra ID, Cognito, Auth0)? How tightly does it integrate with BMW's broader corporate identity system?"
18. "What does the observability stack look like beyond CloudWatch/X-Ray — any centralized tracing/logging platform across the broader CDH ecosystem this portal needs to plug into?"

## 4. Cross-Questions on Compliance, Security & Scale

19. "Given CDH handles regulated data (the BMW Financial Services pseudonymization case is public) — does the Datahub portal itself ever touch PII directly, or does it strictly manage metadata/access while the data plane handles sensitive payloads?"
20. "How often does the access-approval workflow get audited, and does the portal need to produce compliance evidence (who approved what, when) as a first-class feature?"
21. "As the platform has scaled, has IAM/Lake Formation policy management itself become an operational bottleneck — is policy sprawl something this role needs to actively manage?"

---

## 5. Leadership & Behavioral Prep

### "You build it, you run it" ownership

- **Likely question:** "Tell me about a time you owned something end-to-end, including the parts that went wrong in production."
- **Prep approach:** Pick an example with a real production incident you personally fixed (not just designed) — show the full loop: design decision → what broke → how you diagnosed it → the fix → the follow-up (postmortem, regression test, monitoring added). Staff-level signal is the **follow-up discipline**, not just the fix.

### Defending a technical decision

- **Likely question:** "Describe a technical decision you made that someone senior disagreed with. How did you handle it?"
- **Prep approach:** Show you can articulate the trade-off space (not just "I was right") — what alternatives existed, what you optimized for, what you'd reconsider if a stated assumption changed. Staff-level signal is being able to **defend with reasoning that updates given new evidence**, not defend ego.

### Mentoring & code review standards

- **Likely question:** "How do you define coding standards for a team of 3-5, and how do you handle a senior engineer who disagrees with them?"
- **Prep approach:** Talk concretely — linting/formatting automated and non-negotiable; architectural conventions (error handling, API response shapes, RBAC enforcement points) documented as lightweight ADRs; disagreements resolved by discussion with a default-to-consistency tiebreaker, not by fiat.

### Cross-site collaboration (Munich/India)

- **Likely question:** "How do you keep architectural decisions aligned across a distributed team with limited overlap hours?"
- **Prep approach:** Emphasize async-first decision records (written RFCs/ADRs before meetings, not instead of them), a small synchronous overlap window reserved for genuinely ambiguous/high-stakes calls, and clear single-threaded ownership per workstream to avoid decisions stalling on timezone gaps.

### Hands-on + leadership balance

- **Likely question:** "This role is hands-on *and* leading. How do you avoid becoming a bottleneck for code review while still writing code yourself?"
- **Prep approach:** Protect focused coding time, delegate review of routine PRs to senior-enough team members with a documented standard, and reserve your own review bandwidth for architecturally significant changes — the failure mode to explicitly name and avoid is being the single point of approval for everything.

### Scenario: conflicting priorities between architecture quality and deadline pressure

- **Likely question:** "The team is behind schedule and a shortcut would hit the deadline but add tech debt to the access-control layer. What do you do?"
- **Prep approach:** Reasonable staff-level answer: quantify the specific debt and its risk (security-sensitive code is a worse place to cut corners than a cosmetic feature), propose a scoped interim solution with a tracked follow-up ticket and owner, and make the trade-off explicit to stakeholders rather than silently absorbing the risk.

---

## 6. Indirect Questions on Team, Product, and Next 6–12 Months (CDH-specific)

1. "If the Datahub portal succeeds in the next 6 months, what will be tangibly different for data-provider teams — faster dataset onboarding, fewer grant tickets, or reduced time-to-first-query?"
2. "What’s the current median time from 'create dataset' to 'first successful consumer query'? What’s the target, and what are the top two bottlenecks you want this role to remove?"
3. "Roughly what share of datasets are fully on Lake Formation fine-grained controls versus legacy sharing paths? What’s the path to 100%, and where does the portal team need help?"
4. "On the access-approval workflow, what are P50/P95 approval times today, and which step typically causes queue buildup (provider, steward, automated checks)?"
5. "How often do schema/contract changes from providers break consumers, and how does the portal communicate deprecations or enforce backward-compatible changes?"
6. "Do you track a north-star metric for the portal (e.g., active providers/consumers, grant success rate, approval latency)? Which one moves the business most?"
7. "Which 1–2 initiatives are non-negotiable for the next quarter (e.g., LF migration completion, dataset discovery search revamp, blueprint automation)? What could block them?"
8. "Where does the team most often get stuck on cross-account orchestration (resource links, role trusts, Lake Formation grants)? Any common anti-patterns you see from domain teams?"
9. "How stable are the RBAC semantics and identity integration today — are there policy changes on the horizon that the portal must absorb?"
10. "What SLOs are defined for the portal (availability, P95 latency, grant success rate)? How do error budgets influence release gating or on-call?"
11. "For compliance audits, what evidence must the portal produce (who approved what, when)? Is this automated today or a manual report?"
12. "How frequently do you release portal updates to production, and what qualifies as a 'risky' change that needs extra gating (e.g., LF policy changes)?"
13. "Team topology today — size, roles, and gaps. Where would you want a new tech lead to lean in first to raise the bar without becoming a bottleneck?"
14. "What upstream/downstream teams are most critical to this portal’s success, and where are relationships strong vs. where do we have recurring friction?"
15. "What’s the last meaningful incident that touched this portal or its integrations, and what changed afterward (runbook, alarm, code, or process)?"
16. "If we had to cut scope on a feature next month, which quality bar would you insist we never cut (e.g., RBAC enforcement point, grant audit trail), and why?"

Tips for phrasing (signal intent, not interrogation):
- "I’m trying to understand where I can remove friction fastest — could you share …"
- "To calibrate expectations for the first 90 days, how do you currently …"
- "What would ‘one small feature shipped end-to-end’ look like here in week 6–8?"
