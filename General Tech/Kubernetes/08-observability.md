# Kubernetes Observability

## Stack Overview
```
Application Pods → ServiceMonitor/PodMonitor → Prometheus (metrics) → Grafana (dashboards)
                 → Fluentd/Fluent Bit (logs) → Elasticsearch → Kibana
                 → OpenTelemetry (traces) → Jaeger/Tempo
                                           → AlertManager → Slack/PagerDuty
```

## Metrics with Prometheus

### How Prometheus Works in K8s
1. **ServiceMonitor** tells Prometheus which services to scrape
2. Prometheus scrapes `/metrics` endpoint from pods every 15-30s
3. Stores time-series data locally (TSDB)
4. Grafana queries Prometheus for dashboards
5. AlertManager evaluates rules, sends notifications

### Key Metrics to Monitor

**Pods/Containers:**
```
container_cpu_usage_seconds_total        # CPU usage
container_memory_working_set_bytes       # Memory usage
kube_pod_status_phase                    # Pod phase (Running, Pending, Failed)
kube_pod_container_status_restarts_total # Restart count (CrashLoopBackOff)
```

**Nodes:**
```
node_cpu_seconds_total                   # Node CPU
node_memory_MemAvailable_bytes           # Available memory
node_disk_io_time_seconds_total          # Disk I/O
node_filesystem_avail_bytes              # Disk space
```

**Application (RED Method):**
```
http_requests_total                      # Rate (requests/sec)
http_request_duration_seconds_bucket     # Duration (latency histogram)
http_requests_total{status=~"5.."}       # Errors (5xx count)
```

### Grafana Dashboards to Build
1. **Cluster Overview**: Node count, CPU/memory utilization, pod count
2. **Namespace Dashboard**: Pods by namespace, resource usage per namespace
3. **Deployment Health**: Replica count, rollout status, restart count
4. **Application Dashboard**: Request rate, error rate, latency (p50/p95/p99)
5. **Resource Usage**: CPU/memory requests vs limits vs actual usage

## Logging

### Log Collection Architecture
```
Pod (stdout/stderr) → kubelet writes to /var/log/containers/
                          ↓
                    DaemonSet: Fluent Bit (lightweight collector)
                          ↓
                    Elasticsearch / CloudWatch / S3
                          ↓
                    Kibana / CloudWatch Logs Insights
```

### Key kubectl Log Commands
```bash
kubectl logs <pod>                        # current container logs
kubectl logs <pod> -c <container>         # specific container in multi-container pod
kubectl logs <pod> --previous             # logs from previously crashed container
kubectl logs -f <pod>                     # follow/stream logs
kubectl logs -l app=myapp --all-containers  # logs from all pods matching label
kubectl logs <pod> --since=1h             # last 1 hour of logs
kubectl logs <pod> --tail=100             # last 100 lines
```

## Alerting Best Practices

### Critical Alerts (Page someone)
- Pod CrashLoopBackOff for > 5 minutes
- Node NotReady for > 5 minutes
- Error rate > 5% for > 5 minutes
- Disk usage > 90%
- PVC nearly full

### Warning Alerts (Notify channel)
- HPA at max replicas for > 15 minutes
- Pod restart count increasing
- CPU/memory usage consistently > 80%
- Certificate expiring in < 30 days

### Alerting Rule Example
```yaml
groups:
  - name: kubernetes-alerts
    rules:
      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod {{ $labels.pod }} is crash looping"
          runbook_url: "https://wiki/runbooks/crashloop"

      - alert: HighMemoryUsage
        expr: container_memory_working_set_bytes / container_spec_memory_limit_bytes > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.pod }} memory > 90% of limit"
```

## Interview Questions

**Q: How do you set up monitoring for a K8s cluster from scratch?**
1. Install Prometheus Stack (kube-prometheus-stack Helm chart) — includes Prometheus, Grafana, AlertManager, default dashboards
2. Add ServiceMonitors for your applications
3. Create Grafana dashboards (or import community dashboards)
4. Configure AlertManager with Slack/PagerDuty
5. Add Fluent Bit DaemonSet for log collection → ship to Elasticsearch or CloudWatch

**Q: A pod keeps restarting. How do you use monitoring to investigate?**
1. Check Grafana: restart count metric increasing for which pod?
2. Check prometheus: `kube_pod_container_status_restarts_total`
3. Check if OOMKilled: `container_memory_working_set_bytes` near limit
4. Check logs in Kibana/CloudWatch filtered by pod name + timeframe
5. Correlate with deployments: did a deploy happen at that time?
