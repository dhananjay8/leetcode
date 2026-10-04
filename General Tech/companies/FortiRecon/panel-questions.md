# Questions to Ask the Panel + Leadership/Behavioral Prep (Director Round)

For a Director-level system-design round, the panel often includes someone who has operated a real EASM/DRP or similar high-scale security data platform. Questions below are split into technical cross-questions (signal you understand operational reality, not just whiteboard theory) and behavioral/leadership prep (Director rounds weight judgment and org impact heavily). Pick 4-6 per round.

---

## 1. Cross-Questions on Architecture Reality vs Whiteboard Theory

1. "In production, is the control-plane/data-plane split as clean as the diagram, or has config/tenant data ever leaked into the hot path under load?"
2. "What's the actual partitioning key in your Kafka topics today — is it asset-based, tenant-based, or a hybrid — and what forced that decision?"
3. "How many discovery/correlation stages run as separate microservices vs. a shared worker pool? Where did you draw that boundary and why?"
4. "What's your real entity-resolution confidence threshold, and how often does it require analyst review versus fully automated correlation?"
5. "Which storage tier (PostgreSQL, OpenSearch, graph, object storage) has caused the most operational pain, and what would you change about it today?"
6. "Is your DLQ actively monitored and replayed, or does it function more as a silent graveyard in practice?"

## 2. Cross-Questions on Scale & Multi-Tenancy

7. "How do you handle the '100x-larger customer' problem in practice — dedicated infrastructure, aggressive quota tiers, or something else?"
8. "What's your actual peak-to-average event throughput ratio, and how much headroom do you provision versus auto-scale reactively?"
9. "Have you ever had a noisy-neighbor incident where one tenant's discovery jobs degraded another's? What changed afterward?"
10. "How do you decide when a tenant graduates from shared infrastructure to dedicated/isolated resources?"

## 3. Cross-Questions on Team, Roadmap & Org Impact

11. "What's the single biggest technical-debt item on this platform today that a new Director would be expected to prioritize?"
12. "How is the team currently organized around control-plane vs. data-plane ownership — separate teams, or one team owning both?"
13. "What does the on-call rotation look like for a platform with sub-minute detection-latency SLAs? Is it formal paging or more ad hoc?"
14. "Where does this platform's roadmap intersect with other product lines — is correlation/entity-resolution logic shared across products, or built in isolation?"
15. "What's the most recent major incident on this platform, and what organizational (not just technical) change came out of the postmortem?"

## 4. Cross-Questions on Build vs Buy & Technology Choices

16. "Did you evaluate managed alternatives (e.g., managed Kafka, managed OpenSearch, a vendor correlation engine) before building in-house, and what tipped the decision?"
17. "Is the detection rules engine versioned/rule-authored by the platform team only, or can customers/analysts author custom rules? How do you sandbox that safely?"
18. "How do you handle threat-intel feed quality — do you weight/trust feeds differently, and how do you catch a feed that starts producing garbage?"

---

## 5. Leadership & Behavioral Prep (Director-Level)

### Owning a platform-wide architectural decision

- **Likely question:** "Tell me about the most consequential architecture decision you've made and how you drove organizational buy-in for it."
- **Prep approach:** Use a decision with real trade-offs (not an obviously-correct choice) — show how you built the case (data, prototype, risk analysis), how you handled disagreement from senior peers, and what the measurable outcome was. Director-level signal is **organizational influence**, not just technical correctness.

### Handling a production incident at scale

- **Likely question:** "Walk me through a severe incident you led the response for — what broke, how you triaged, and what changed systemically afterward."
- **Prep approach:** Emphasize the incident-command structure you used (who owned comms vs. mitigation vs. root-cause), the specific systemic fix (not just a patch), and how you verified it actually worked (chaos test, synthetic monitoring, etc.).

### Build vs. buy judgment

- **Likely question:** "Describe a time you chose to build something in-house that could have been bought, or vice versa — how did you decide?"
- **Prep approach:** Frame as a TCO + strategic-differentiation argument: build when the capability is core IP/competitive differentiation and control over roadmap matters; buy when it's undifferentiated heavy lifting. Show you considered team bandwidth cost, not just license cost.

### Scaling a team through platform growth

- **Likely question:** "How do you structure a team as a platform scales from thousands to millions of entities under management?"
- **Prep approach:** Talk about splitting ownership along the control-plane/data-plane seam (or similar natural architectural boundary), introducing on-call rotations with clear SLOs as the system grows, and avoiding a single architect becoming the bottleneck for every design review.

### Trade-off under ambiguity

- **Likely question:** "A detection rule change could reduce false positives by 80% but might also hide a genuinely novel attack pattern for 2 weeks while retrained. Do you ship it?"
- **Prep approach:** Reasonable Director-level answer: quantify both risks explicitly (alert fatigue cost vs. missed-detection cost), propose a staged rollout (shadow mode first, compare against the old rule, then cut over), and make the trade-off visible to stakeholders rather than deciding unilaterally and silently.

### Cross-functional conflict (security vs. product speed)

- **Likely question:** "Product wants to ship a feature faster; security review says it introduces risk to tenant isolation. How do you resolve it?"
- **Prep approach:** Show you'd quantify the specific isolation risk (not just invoke "security says no"), propose a scoped mitigation or feature-flagged rollout that satisfies both timelines, and escalate with a clear recommendation rather than letting the conflict stall indefinitely.
