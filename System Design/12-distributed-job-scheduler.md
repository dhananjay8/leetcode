# Design a Distributed Job Scheduler

## 1. Requirements

### Functional
- Schedule one-time and recurring jobs (cron-like)
- Execute jobs reliably at specified times
- Job status tracking, retries on failure
- Priority-based execution

### Non-Functional
- Exactly-once execution (no duplicate runs)
- Scalable to millions of scheduled jobs
- Fault tolerant (job runs even if a node dies)

---

## 2. Architecture

```
API → Job Service → Job Store (DB)
                        ↓
              Scheduler (polls for due jobs)
                        ↓
              Message Queue (Kafka/SQS)
                        ↓
              Worker Pool (execute jobs)
                        ↓
              Status Reporter → Job Store
```

---

## 3. Core Components

### Job Store (Database)
```
jobs:
  id, name, cron_expression, next_run_at, status, payload
  priority, max_retries, retry_count, last_run_at, created_by
```

### Scheduler Service
- Polls DB every second for jobs where `next_run_at <= now() AND status = 'scheduled'`
- Claims job: `UPDATE jobs SET status='queued' WHERE id=X AND status='scheduled'`
- Atomic update prevents duplicate claims
- Pushes claimed jobs to message queue

### Worker Pool
- Consumers pull from queue, execute job logic
- Report success/failure back to Job Store
- On failure: increment retry_count, reschedule with backoff

### Cron Parser
- Parse cron expression → compute `next_run_at` after each execution
- Store next scheduled time in DB for efficient querying

---

## 4. Ensuring Exactly-Once Execution

1. **DB-level locking**: Optimistic locking with version column
2. **Leader election**: Only one scheduler instance picks jobs (using ZooKeeper/etcd)
3. **Idempotent workers**: Jobs should handle being called twice safely
4. **Queue deduplication**: Message dedup by job_id

---

## 5. Scaling

- **Multiple schedulers**: Partition jobs by hash(job_id) % N
- **Worker auto-scaling**: Scale based on queue depth
- **DB indexing**: Index on `(next_run_at, status)` for efficient polling
- **Sharding**: Shard job store by tenant/namespace

---

## 6. Interview Talking Points

- Exactly-once is hard; design for at-least-once + idempotent workers
- DB polling vs. time-wheel algorithm for scheduling
- How to handle clock skew across distributed nodes (NTP)
- Priority queues for urgent jobs
- Dead letter queue for permanently failing jobs
