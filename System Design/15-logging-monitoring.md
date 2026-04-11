# Design a Logging & Monitoring System

## 1. Requirements
- Collect logs from thousands of services/servers
- Search logs by time range, service, severity, keywords
- Real-time alerting on error patterns
- Dashboards with metrics and visualizations

## 2. Architecture
```
Services → Log Agents (Fluentd/Filebeat) → Message Queue (Kafka)
                                                  ↓
                                    ┌─────────────┼─────────────┐
                                    ↓             ↓             ↓
                              Log Processor   Alert Engine   Metrics Aggregator
                                    ↓             ↓             ↓
                              Elasticsearch   PagerDuty     Time-Series DB
                                    ↓                       (InfluxDB/Prometheus)
                              Kibana Dashboard          Grafana Dashboard
```

## 3. Key Components

### Log Collection
- **Agent**: Runs on each server, tails log files, ships to Kafka
- **Structured logging**: JSON format with timestamp, service, level, message, trace_id

### Log Processing
- Kafka consumers parse, enrich, transform logs
- Add metadata: region, environment, deployment version
- Route: errors → alert engine, all → Elasticsearch

### Storage (Elasticsearch)
- Index per day: `logs-2024-01-15`
- Retention policy: hot (7 days SSD) → warm (30 days HDD) → cold (S3/Glacier)
- Full-text search on message field

### Alerting
- Define rules: "ERROR count > 100 in 5 min for service X"
- Alert channels: Slack, PagerDuty, email
- Deduplication: Don't fire same alert repeatedly

## 4. Scale
- **Kafka**: Partitioned by service_name for parallel processing
- **Elasticsearch**: Sharded indices, replica for HA
- **Sampling**: For very high-volume services, log 10% of DEBUG, 100% of ERROR
- **Compression**: Gzip logs before storage

## 5. Interview Talking Points
- Kafka as buffer handles burst traffic
- ELK stack (Elasticsearch + Logstash + Kibana) is industry standard
- Structured logging with correlation IDs for distributed tracing
- Log levels: DEBUG < INFO < WARN < ERROR < FATAL
- Cost optimization: tiered storage, sampling, retention policies
