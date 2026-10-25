# Monitoring & Observability — Interview Notes

## 1. Three Pillars of Observability

| Pillar | Answers | Data | Tools |
| -------- | --------- | ------ | ------- |
| **Metrics** | How is it performing? | Numeric time series | Prometheus, Grafana, Datadog, CloudWatch |
| **Logs** | What happened? | Discrete events | ELK/EFK, Loki, Graylog, Splunk |
| **Traces** | Where did the request go? | Spans across services | Jaeger, Zipkin, Tempo, AWS X-Ray |

Correlate all three with a **trace_id** propagated in logs/metrics.

---

## 2. Metrics — Prometheus + Grafana

### Prometheus data flow (text sequence)

App exposes `/metrics` → Prometheus scrapes (pull, default 15s) → stores in TSDB → PromQL queries → Grafana dashboards + Alertmanager rules → Slack/PagerDuty.

**Pull vs push**: Prometheus pulls (service discovery, easy dev, detects down targets); exceptions are short-lived jobs which **push** to Pushgateway. Datadog/StatsD are push-based.

### Prometheus Metric Types (Histogram vs Summary is a classic trap)

| Type | Behavior | PromQL Usage | Key Interview Nuance |
| --- | --- | --- | --- |
| **Counter** | Monotonically increasing (resets to 0 on restart) | `rate(http_requests_total[5m])`, `increase()` | Never alert on raw counter value; always take `rate()` |
| **Gauge** | Goes up and down (current snapshot) | `node_memory_Active_bytes`, `queue_depth` | Use `avg_over_time()`, `max_over_time()` |
| **Histogram** | Samples observations into configurable cumulative buckets (`_bucket{le="0.1"}`, `_sum`, `_count`) | `histogram_quantile(0.99, sum by (le) (rate(req_duration_bucket[5m])))` | **Aggregatable across pods/instances** — always prefer Histogram in distributed systems |
| **Summary** | Computes streaming φ-quantiles (`quantile="0.99"`) **client-side** inside the app | Direct metric read | **CANNOT be averaged or aggregated across pods** (averaging p99s of 10 pods is mathematically invalid) |

### Golden Signals / USE / RED (favorite follow-up)

| Method | Scope | Signals |
| -------- | ------- | --------- |
| **Four Golden Signals** (SRE) | Any user-facing system | **Latency, Traffic, Errors, Saturation** |
| **RED** | Request-driven services | **Rate, Errors, Duration** (p50/p95/p99) |
| **USE** | Resources (host, disk, NIC) | **Utilization, Saturation, Errors** |

Percentile notes: p99 latency ≠ 99th-most-common — it's "99% of requests were faster than X ms." Alert on p95/p99, not averages (averages hide tail latency).

### Prometheus alerting rule

```yaml
groups:
  - name: app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m                       # sustained, avoids flapping
        labels: { severity: critical }
        annotations:
          summary: "Error rate >5% for 5m"
          runbook: "https://wiki.internal/runbooks/high-error-rate"
```

---

## 3. Logging — ELK/EFK & Centralized Tools

Flow: app → stdout/file → collector (Fluent Bit/Fluentd/Logstash) → processor/indexer (Elasticsearch / Loki / CloudWatch) → UI (Kibana/Grafana).

| Tool | Model | Notes |
| ------ | ------- | ------- |
| **ELK** (ES+Logstash+Kibana) | Full-text indexed logs | Powerful queries; heavy (JVM, storage) |
| **EFK** | Fluentd/Fluent Bit collector instead of Logstash | K8s standard (DaemonSet) |
| **Loki** | Indexes **labels only**, not content | Cheap, pairs with Grafana; PromQL-like LogQL |
| **Graylog** | Centralized log mgmt + alerting | MongoDB+ES underneath |
| **Datadog/New Relic** | SaaS all-in-one | Fast to start, expensive at scale |
| **Splunk** | Enterprise log analytics | Powerful, pricey |

### Structured logging (from source notes)

```json
{"timestamp":"2024-01-15T10:30:00Z","level":"ERROR","service":"payment",
 "trace_id":"abc-123","message":"Payment failed","user_id":"u-456",
 "error":"insufficient_funds","duration_ms":234}
```

Rules: JSON everywhere · `trace_id` for correlation · levels DEBUG<INFO<WARN<ERROR<FATAL · **never log PII/secrets** (passwords, card numbers, tokens — mask or drop).

---

## 4. Tracing — OpenTelemetry & Friends

```text
App (OTel SDK/agent) → spans → Collector (OTLP) → backend (Jaeger/Tempo/X-Ray)
                     ↘ context propagation: traceparent header across HTTP/messaging
```

| Concept | What it is | Interview note |
| --- | --- | --- |
| **Span** | One unit of work (name, start/end, attrs, status) | "DB query took 40ms of the 120ms request" |
| **Trace** | Tree of spans sharing a `trace_id` | Links services hop-by-hop |
| **Context propagation** | `traceparent`/`tracestate` headers (W3C) or B3 | No propagation = orphaned spans |
| **Sampling** | Head (decide at start, cheap) vs tail (decide after, keeps errors) | 100% head sampling at scale = storage meltdown |
| **Exemplars** | Metrics carrying a trace_id sample | Jump from p99 spike → the exact slow trace |
| **Collector** | Receive → process (batch/filter/sample) → export | Run as agent DaemonSet or central gateway |

When traces pay off: multi-hop request paths, tail-latency RCA, dependency mapping. When they don't: single-service apps — logs+metrics suffice.

---

## 5. Alerting & Alert Fatigue (interview favorite)

### Good alert properties

**Actionable** (someone must do something) · **Urgent** (page = wake-up worthy) · **No duplicates** (group related symptoms) · **Has a runbook** (link to fix).

### Fighting alert fatigue (from source notes)

1. **Prioritize by severity** — critical pages a human; warnings go to a channel; info goes to a dashboard. Symptom alerts (5xx rate) over cause alerts (CPU high).
2. **Tune thresholds** — use `for:` duration and hysteresis so transient blips don't page.
3. **Aggregate** — collapse related incidents (one pod down in 50 replicas ≠ one alert per replica).
4. **Runbooks** — every page links an actionable playbook; cuts MTTR and tribal knowledge.
5. **Escalation policies** — PagerDuty rotations; non-critical waits for business hours.
6. **Periodic review** — audit alerts monthly; delete or demote ones that never caused action. If an alert fired 50× and was ignored 50×, it's noise.

**Sound bite**: *"Every alert that doesn't demand action teaches the team to ignore the ones that do."*

---

## 6. SRE Concepts — SLI / SLO / SLA / Error Budget

| Term | What | Example |
| ------ | ------ | --------- |
| **SLI** | Measured indicator | 99.5% of requests < 200ms; availability = good/bad events |
| **SLO** | Internal target for the SLI | 99.9% monthly availability |
| **SLA** | Contract w/ consequences | 99.95% or service credits |

Availability math (monthly, 30d = 43,200 min): 99.9% → **43.2 min** budget · 99.95% → 21.6 min · 99.99% → **4.32 min**.

**Error budget**: `budget = downtime allowed by SLO`. Unused budget → ship faster, take risks. Exhausted budget → freeze risky deploys, prioritize reliability. It converts "fast vs stable" from an argument into arithmetic.

### Multi-Window, Multi-Burn-Rate Alerting (Google SRE Standard)

Why simple threshold alerts (`5xx > 0.1% for 5m`) fail: either they page on brief spikes that barely touch the 30-day budget, or they miss slow leaks that burn 100% of the budget over 3 days, or they stay firing for hours after recovery.

- **Burn rate** = how fast you consume the 30-day error budget relative to sustainable pace (`1×` = consumes 100% in 30 days; `14.4×` = consumes **2% of monthly budget in 1 hour**).
- **Multi-window rule**: require **both** a long window (e.g., `1h`) AND a short window (`5m`) to exceed the burn rate simultaneously — `1h` prevents false positives, `5m` ensures the alert resolves within minutes once the incident ends:

| Severity | Budget Consumed | Long Window | Short Window | Burn Rate Factor (for 99.9% SLO) | Action |
| --- | --- | --- | --- | --- | --- |
| **Page (Fast burn)** | 2% in 1 hour | `1h` | `5m` | **14.4×** (`error_rate > 1.44%`) | Wake on-call immediately |
| **Page (Medium burn)** | 5% in 6 hours | `6h` | `30m` | **6×** (`error_rate > 0.6%`) | Wake on-call |
| **Ticket (Slow burn)** | 10% in 3 days | `3d` | `6h` | **1×** (`error_rate > 0.1%`) | Create Jira/Slack ticket in business hours |

---

## 7. Troubleshooting Playbooks

### Spike in 5xx errors

1. Metrics — when did the rate move? Which endpoint/pod/version?
2. Deploys — correlate with the last release (rollback candidate).
3. Logs — stack traces, error fingerprints, affected endpoints.
4. Dependencies — DB errors/latency, cache misses, third-party API failures.
5. Saturation — CPU/memory/disk-full, connection-pool exhaustion.
6. Traffic — sudden spike or attack; check ingress/LB counts.

### Prometheus vs Datadog vs CloudWatch

| | Prometheus | Datadog | CloudWatch |
| --- | ----------- | --------- | ------------ |
| Model | Pull, self-hosted OSS | SaaS agent-based | AWS-native service |
| Cost | Infra + ops effort | $$$ at scale | Metered, cheap within AWS |
| K8s fit | Native (ServiceMonitor, kube-state-metrics) | Good | Needs Container Insights |
| Query | PromQL | App queries | Metrics Insights |

---

## 8. Recall — Sound Bites

- "Metrics for dashboards, logs for root cause, traces for latency breakdown."
- "Alert on symptoms (user pain), investigate causes (system metrics)."
- "p99 is where users feel it; the average hides it."
- "Every page needs an action; otherwise it's a dashboard item."
- "Error budget = permission to ship fast, paid in reliability."
- K8s-specific monitoring: see `../Kubernetes/08-observability.md`.
