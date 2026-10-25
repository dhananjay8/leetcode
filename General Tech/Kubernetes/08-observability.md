# Kubernetes Observability — Interview Notes

## 1. The Three Pillars on K8s

```text
Metrics   Prometheus (scrape /metrics, PromQL, rules) → Grafana → Alertmanager
Logs      Fluent Bit (DaemonSet) → Elasticsearch/Loki → Kibana/Grafana
Traces    App → OTel collector → Jaeger/Tempo → trace IDs join logs+metrics
```

K8s-specific wrinkle: nodes/pods are ephemeral — collection must be per-node (DaemonSet) or via OTLP sidecar/gateway, not host-installed agents on app servers.

## 2. Metrics — Prometheus on K8s

- **kube-state-metrics** exposes object state (pod phase, deploy replicas, PVC usage). **node-exporter** → node CPU/mem/disk. Apps expose `/metrics`; ServiceMonitor/PodMonitor CRDs wire scraping with Prometheus Operator.
- Golden signals for services — **RED**: Rate, Errors, Duration. For infra: **USE** (Utilization, Saturation, Errors).
- Cardinality warning: label explosion (user_id as label) kills Prometheus — keep labels bounded.

```promql
# p95 latency per service
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="api"}[5m])) by (le, service))
# crashlooping pods
increase(kube_pod_container_status_restarts_total[1h]) > 3
```

## 3. Logging

- Fluent Bit/Fluentd **DaemonSet** tails `/var/log/containers/*.log` (stdout/stderr is the contract — apps must not write local files).
- Enrich with k8s metadata (namespace, pod, labels) at the agent; **structured JSON logs** so queries work; ship to ES/Loki/CloudWatch.
- Sidecar logging only when stdout can't be used (multi-stream legacy apps); ephemeral pods mean agent must ship fast — pod can die mid-flush.

## 4. Tracing

- OpenTelemetry SDK/agent → OTLP → collector (DaemonSet or deployment) → Jaeger/Tempo.
- Value on K8s: a request crosses ingress → service → pods → DB; only a trace shows which hop burned the latency.
- Connect the pillars: `trace_id` in log lines + exemplars in metrics = jump metric→trace→logs.

### eBPF & agent-less observability (worth a mention)

- **Cilium Hubble** — network flow visibility straight from eBPF (who talked to whom, dropped by which policy) with zero app instrumentation.
- **Pixie / Cilium Tetragon** — auto-instrumented service maps + runtime security events via eBPF.
- **K8s events are signals too**: `kubectl get events` feeds (FailedScheduling, Unhealthy, BackOff) → alert on them via event-exporter — pod failures often announce themselves there before metrics move.

## 5. Alerting — Rules, Alertmanager, Fatigue

- Prometheus `rules` (alerts) → Alertmanager: grouping, inhibition (page once per incident), silences (maintenance windows), routing (pager vs slack by severity).
- **Alert-fatigue playbook**: every page must be actionable; symptom alerts (error budget burn) over cause alerts (CPU high); auto-remediate the noisy stuff first (restart policy, HPA) then alert on residual.

```yaml
groups:
- name: api
  rules:
    - alert: HighErrorRate
      expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
      for: 10m
      labels: { severity: page }
      annotations: { summary: "API 5xx > 5% for 10m", runbook: "https://..." }
```

## 6. Failure → Observe → Fix Loop (interview frame)

```text
Symptom (page) → dashboards localize (which svc/pod/node)
             → metrics say WHAT, traces say WHERE, logs say WHY
             → kubectl describe/events for infra causes
             → fix + postmortem + SLO/error-budget update
```

## 7. Interview Q&A

**Q: Monitor a cluster you've never seen?**
Layers: node health (USE), cluster objects (KSM: crashlooping, pending pods, unbound PVCs), golden signals per service (RED), then SLOs + error budgets. Tools are secondary to the layers.

**Q: Metrics vs logs vs traces?**
Metrics = cheap aggregates for alerting; logs = detailed events, expensive at scale; traces = request path across services. Complementary — don't try to alert on logs or grep metrics.

**Q: Prometheus HA/scale?**
Two replicas + external dedupe/TSDB (Thanos/Cortex/Mimir) for long-term + multi-cluster; remote-write to central store; Federation for hierarchical rollups (older pattern).

**Q: How do you know alerts are good?**
Every page has a runbook + owner; measure pages/week/oncall and false-positive rate; prune monthly.

---

## 8. Recall — Sound Bites

- "Metrics alert, logs explain, traces locate."
- "DaemonSet for collectors — the nodes are your agents."
- "RED for services, USE for resources."
- "Cardinality is Prometheus's kryptonite — bound your labels."
- "Page on symptoms (error budget), not causes (CPU 90%)."
