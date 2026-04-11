# Monitoring & Observability

## Three Pillars of Observability
1. **Logs** — What happened (discrete events with context)
2. **Metrics** — How the system is performing (numeric time-series data)
3. **Traces** — Request journey across services (distributed tracing)

## Metrics — Prometheus + Grafana

### Prometheus Architecture
```
Application (exposes /metrics) → Prometheus (scrapes + stores) → Grafana (visualizes)
                                          ↓
                                   AlertManager → Slack / PagerDuty
```

### Four Golden Signals (Google SRE)
| Signal | What it measures | Example metric |
|--------|-----------------|----------------|
| **Latency** | Time to serve a request | `http_request_duration_seconds` |
| **Traffic** | Demand on the system | `http_requests_total` |
| **Errors** | Rate of failed requests | `http_requests_total{status="5xx"}` |
| **Saturation** | How "full" the system is | CPU usage, memory, queue depth |

### USE Method (for resources)
- **Utilization**: % of resource being used (CPU 80%)
- **Saturation**: Work that can't be serviced (queue length)
- **Errors**: Error count for the resource

### RED Method (for services)
- **Rate**: Requests per second
- **Errors**: Error rate
- **Duration**: Latency distribution (p50, p95, p99)

## Logging — ELK / EFK Stack

```
App → Filebeat/Fluentd (collector) → Logstash/Fluentd (processor) → Elasticsearch (storage) → Kibana (UI)
```

### Structured Logging Best Practices
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "payment-service",
  "trace_id": "abc-123-def",
  "message": "Payment failed",
  "user_id": "u-456",
  "error": "insufficient_funds",
  "duration_ms": 234
}
```

**Rules:**
- Always use structured (JSON) logging
- Include `trace_id` for distributed tracing correlation
- Use appropriate log levels: DEBUG < INFO < WARN < ERROR < FATAL
- Don't log PII (passwords, credit cards, SSN)

## Alerting

### Good Alert Design
- **Actionable**: Someone can do something about it
- **Urgent**: Needs attention now (not informational)
- **No duplicates**: Group related alerts
- **Has runbook**: Link to fix instructions

### Alert Examples
```yaml
# Prometheus alerting rule
groups:
  - name: app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m      # must be true for 5 min (avoid flapping)
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 5% for 5 minutes"
          runbook: "https://wiki.internal/runbooks/high-error-rate"
```

## SRE Concepts

### SLI / SLO / SLA
| Term | Meaning | Example |
|------|---------|---------|
| **SLI** (Indicator) | Measurement of service level | 99.5% of requests under 200ms |
| **SLO** (Objective) | Target for SLI | 99.9% availability per month |
| **SLA** (Agreement) | Contract with consequences | 99.95% uptime or refund credits |

### Error Budget
```
SLO = 99.9% availability
Allowed downtime per month = 30 days × 24h × 60min × 0.1% = 43.2 minutes

If used up → freeze deployments, focus on reliability
If remaining → deploy freely, experiment
```

## Interview Questions

**Q: What would you monitor for a web application?**
- **Latency**: p50, p95, p99 response times
- **Error rate**: 4xx and 5xx percentages
- **Throughput**: Requests/sec
- **Resource utilization**: CPU, memory, disk, network
- **Business metrics**: Signups/min, orders/min
- **Dependencies**: Database query times, external API latency

**Q: How do you troubleshoot a spike in 5xx errors?**
1. Check error rate metrics — when did it start?
2. Check deployment timeline — was something just deployed?
3. Check logs for stack traces / error messages
4. Check dependency health — DB, cache, external APIs
5. Check resource saturation — CPU, memory, disk full?
6. Check for traffic spike — DDoS or unexpected load?

**Q: Prometheus vs Datadog vs CloudWatch?**
- **Prometheus**: Open-source, pull-based, great for K8s, self-hosted
- **Datadog**: SaaS, easy setup, expensive at scale, all-in-one
- **CloudWatch**: AWS-native, good for AWS services, limited custom metrics
