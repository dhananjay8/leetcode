# AWS System Integration & Asynchronous Messaging — Staff/Principal Interview Deep Dive

## 1. Messaging vs Streaming vs Event Bus

AWS offers purpose-built integration services. Choosing the right one depends on coupling, ordering, replay, throughput, and operational model.

| Pattern | Characteristics | AWS Services |
|---|---|---|
| **Queue** | Point-to-point, durable buffer, pull model | SQS |
| **Pub/sub fan-out** | One message, many subscribers | SNS |
| **Event bus / routing** | Content-based rules, schema-aware | EventBridge |
| **Stream / log** | Ordered, replayable, high throughput | Kinesis Data Streams, MSK |
| **Workflow** | Orchestrated multi-step processes | Step Functions |

Most production systems use a combination: **EventBridge routes, SNS fans out, SQS buffers, Kinesis streams, Step Functions orchestrates**.

---

## 2. Amazon SQS

### Core model

```text
Producer
   │ SendMessage
   ▼
SQS Queue
   │
   ├── Message stored (up to 14 days)
   └── Consumer polls (ReceiveMessage)
          │
          ├── Message becomes invisible for VisibilityTimeout
          ├── Consumer processes and calls DeleteMessage
          └── If not deleted, message becomes visible again
```

### Queue types

| Type | Ordering | Duplication | Throughput | Use Case |
|---|---|---|---|---|
| **Standard** | Best-effort | At-least-once | Virtually unlimited | General decoupling |
| **FIFO** | Strict per group | Exactly-once | 3,000 msg/sec with batching | Order-sensitive workflows |

### Key concepts

- **Visibility timeout**: period a message is hidden after being received. If not deleted, it reappears for retry.
- **Dead-letter queue (DLQ)**: messages that fail MaxReceiveCount times are moved here for inspection.
- **Long polling**: `WaitTimeSeconds > 0` reduces empty responses and cost.
- **Batching**: `SendMessageBatch`, `ReceiveMessage` up to 10 messages per call.
- **Delay queues / message timers**: delay visibility up to 15 minutes.

### SQS + Lambda event source mapping

```text
SQS Queue
   │
   ├── Lambda polls automatically
   ├── Sends batch of messages
   ├── Function processes
   └── On success: messages deleted
       On failure (whole batch): retry; after MaxRetries -> DLQ
```

Best practices:
- Set visibility timeout **greater than Lambda function timeout**.
- Use **partial batch responses** to retry only failed messages.
- Enable DLQs on both the queue and the Lambda event source.

---

## 3. Amazon SNS

### Core model

```text
Publisher
   │ Publish
   ▼
SNS Topic
   │
   ├── Fan-out to subscribers
   │      ├── SQS queue
   │      ├── Lambda function
   │      ├── HTTP/S endpoint
   │      ├── Email / SMS / mobile push
   │      └── FIFO SQS queue (for FIFO SNS topic)
   │
   └── Subscribers receive in parallel
```

### Topic types

| Type | Ordering | Deduplication | Throughput | Subscribers |
|---|---|---|---|---|
| **Standard** | Best-effort | At-least-once | Very high | All protocols |
| **FIFO** | Strict per group | Exactly-once | 300 msg/sec | SQS FIFO only |

### Filter policies

Subscriptions can define JSON filter policies so subscribers only receive matching messages.

```json
{
  "eventType": ["orderPlaced", "orderCancelled"],
  "region": ["us-east-1"]
}
```

### Delivery retries

| Protocol | Retry Behavior |
|---|---|
| Lambda / SQS | Managed by target service |
| HTTP/S | Exponential backoff up to ~23 days |
| Email / SMS | No retry |

Always back critical HTTP subscribers with SQS + DLQ.

---

## 4. Amazon EventBridge

### Core model

```text
Event source
   │ (AWS service, SaaS partner, custom app, schedule)
   ▼
EventBridge Event Bus
   │
   ├── Rules match event patterns
   │      ├── Target 1: Lambda
   │      ├── Target 2: SQS
   │      ├── Target 3: Step Functions
   │      ├── Target 4: API destination
   │      └── Target 5: Kinesis, SNS, etc.
   │
   └── Event delivered to targets
```

### Key features

- **Event pattern matching**: any field in the JSON event.
- **Input transformation**: reshape payload per target.
- **Schema registry**: discover and validate event schemas.
- **Archive and replay**: store events and replay later.
- **EventBridge Scheduler**: schedule one-time or recurring events.
- **Pipes**: point-to-point integration with filtering, enrichment, and transformation.

### EventBridge vs SNS vs SQS

| Dimension | SQS | SNS | EventBridge |
|---|---|---|---|
| Model | Queue (pull) | Pub/sub (push) | Event bus (push with rules) |
| Ordering | FIFO only | FIFO topic only | No ordering guarantee |
| Filtering | None (consumer filters) | Attribute/policy filters | Rich JSON pattern matching |
| Replay | No | No | Yes (with archive) |
| Schema registry | No | No | Yes |
| SaaS integrations | No | No | Native |
| Targets | Consumer apps | Many protocols | AWS services + HTTP destinations |

---

## 5. Amazon Kinesis Data Streams

### Core model

```text
Producer
   │ PutRecord / PutRecords
   ▼
Kinesis Stream
   │
   ├── Shards (ordered partitions)
   │
   └── Consumers
          ├── Shared-fan-out consumers (2 MB/s per shard across all)
          └── Enhanced fan-out consumers (2 MB/s per shard each)
```

### Key concepts

- **Shard**: partition unit; throughput 1 MB/s write, 2 MB/s read shared; 1,000 records/s write.
- **Partition key**: determines which shard receives the record.
- **Sequence number**: ordering within a shard.
- **Retention**: default 24 hours, up to 365 days.
- **Consumer types**: shared (poll), enhanced fan-out (push to HTTP/2), KCL.

### When to use Kinesis

| Use case | Why Kinesis |
|---|---|
| Clickstream / logs | High throughput, durable stream |
| Real-time analytics | Kinesis Data Analytics, Lambda, EMR |
| Replay | Consumer can restart from any point in retention window |
| Multi-consumer | Enhanced fan-out gives isolated throughput per consumer |

### Kinesis Data Streams vs Firehose

| Feature | Kinesis Data Streams | Kinesis Data Firehose |
|---|---|---|
| Retention | 24h–365h | None (delivery stream) |
| Replay | Yes | No |
| Consumers | Custom | Managed delivery to S3/Redshift/Elasticsearch/Splunk |
| Ordering | Per shard | Per delivery stream (best-effort) |

---

## 6. Amazon MSK (Managed Streaming for Apache Kafka)

MSK is managed Apache Kafka. It provides the full Kafka API, including topics, partitions, consumer groups, log retention, and Kafka Connect/KSQL.

### When to choose MSK over Kinesis

| Requirement | MSK | Kinesis |
|---|---|---|
| Existing Kafka clients/tools | Yes (wire compatible) | No |
| Kafka Streams / ksqlDB / Connect | Yes | No |
| Per-partition ordering + replay | Yes | Yes |
| Operational simplicity | Lower (more knobs) | Higher |
| Scaling model | Add brokers / partitions | Add shards |
| Multi-AZ / VPC networking | Required | Built-in |

MSK Serverless removes broker management but still exposes Kafka APIs.

---

## 7. Service Comparison Matrix

| Feature | SQS | SNS | EventBridge | Kinesis | MSK |
|---|---|---|---|---|---|
| Model | Queue | Pub/sub | Event bus | Stream | Stream/log |
| Delivery | Pull | Push | Push | Pull | Pull |
| Ordering | FIFO only | FIFO topic only | No | Per shard | Per partition |
| Replay | No | No | Archive replay | Yes | Yes |
| Retention | 14 days | None | Archive only | 1h–365d | Configurable |
| Fan-out | 1:1 | 1:many | 1:many filtered | 1:many consumers | 1:many consumer groups |
| Max payload | 256 KB | 256 KB | 256 KB | 1 MB | Kafka default |
| Throughput | Very high | Very high | High | Shard-limited | Broker-limited |
| Best for | Buffering | Notifications | Routing | Real-time streams | Kafka ecosystem |

---

## 8. Choreography vs Orchestration

### Choreography

```text
Order Service
   │ OrderCreated event
   ▼
EventBridge / SNS
   │
   ├──► Payment Service
   ├──► Shipping Service
   └──► Analytics Service
```

- No central coordinator.
- Services react to events independently.
- Loose coupling, but flow is implicit in event schemas.
- Harder to trace and debug.

### Orchestration

```text
Step Functions state machine
   │
   ├── Call Payment Service
   ├── On success: Call Shipping Service
   ├── On failure: Call Compensation
   └── Complete
```

- Central state machine controls the workflow.
- Built-in retries, branching, parallelism, error handling.
- Easier observability, but couples services to the orchestrator's contracts.

### When to use which

| Concern | Choreography | Orchestration |
|---|---|---|
| Coupling | Low | Higher |
| Visibility | Harder | Built-in |
| Error handling | Distributed responsibility | Centralized |
| Complex compensations | Difficult | Easier |
| Long-running workflows | Hard | Native |

---

## 9. Sagas and Compensation Patterns

A **saga** splits a long transaction into local transactions, each followed by an event or orchestration step. If a step fails, run **compensating transactions** to undo previous steps.

### Choreographed saga

```text
1. Order Service: create order -> emit OrderCreated
2. Payment Service: charge -> emit PaymentCompleted OR PaymentFailed
3. If PaymentFailed -> Order Service cancels order (compensation)
4. If PaymentCompleted -> Shipping Service ships -> emit OrderShipped
```

### Orchestrated saga

```text
Step Functions:
   1. Reserve inventory
   2. Charge payment
   3. If charge fails -> release inventory (compensation)
   4. If charge succeeds -> ship order
   5. If shipping fails -> refund payment + release inventory
```

Compensation design principles:
- Compensations must be **idempotent**.
- Compensations may fail; design for retry and observability.
- Not all actions can be undone (e.g., email sent); use **semantic undo** where possible.

---

## 10. Idempotency and Message Handling

Every message-based system must handle duplicates. Common patterns:

### Idempotency key table

```text
Consumer receives message with idempotencyKey
   │
   ▼
Conditional write to DynamoDB idempotency table
   │
   ├── Key exists -> return stored result, do not reprocess
   └── Key new -> process, store result, commit
```

### SQS FIFO deduplication

- Provide `MessageDeduplicationId` (or enable content-based deduplication).
- Deduplication window: 5 minutes.

### SNS FIFO deduplication

- Requires `MessageDeduplicationId` per message.
- Must fan out to SQS FIFO queues.

---

## 11. End-to-End Textual Sequence Diagrams

### Fan-out with SNS + SQS

```text
Producer
   │
   ▼
SNS Topic
   │
   ├──► SQS Queue A ──► Worker A
   ├──► SQS Queue B ──► Worker B
   └──► Lambda Function C
```

### EventBridge routing

```text
AWS Service / Custom App
   │
   ▼
EventBridge Bus
   │
   ├── Rule: eventType = "userSignedUp"
   │      └──► Lambda: send welcome email
   │
   ├── Rule: eventType = "orderPlaced" AND amount > 100
   │      └──► SQS -> Fraud Check
   │
   └── Rule: schedule every hour
          └──► Step Functions: report generation
```

### SQS + Lambda with DLQ

```text
SQS Queue
   │
   ├── Lambda event source polls batch
   │
   ├── Success -> DeleteMessage batch
   │
   └── Failure -> retry (visibility timeout)
          │
          └── After MaxReceiveCount -> DLQ
                 │
                 └── Alarm -> manual / automated replay
```

---

## 12. Hard AWS Gotchas

### SQS
- **Visibility timeout must exceed processing time**, including Lambda timeout.
- **FIFO throughput per message group is 300 msg/sec**; use many message groups for parallelism.
- **SQS does not fan out**; use SNS in front for multiple consumers.
- **DLQs must be of the same type** (Standard DLQ for standard queue, FIFO DLQ for FIFO queue).

### SNS
- **SNS Standard does not guarantee order or exactly-once**; use FIFO for ordering.
- **HTTP/S subscriptions do not buffer**; always place SQS between SNS and fragile HTTP endpoints.
- **SMS delivery depends on carrier**; not guaranteed.
- **SNS message size limit is 256 KB**.

### EventBridge
- **EventBridge has no ordering guarantee**.
- **Targets per rule limit** (default 5, can be increased).
- **EventBridge API destinations** can be throttled by downstream; use SQS buffering if needed.
- **Archive replay** delivers events as new events; consumers must be idempotent.

### Kinesis
- **Resharding splits or merges shards; data is not redistributed** immediately.
- **Hot shards** happen with bad partition keys; use high-cardinality keys.
- **Enhanced fan-out costs per consumer-shard-hour**.
- **Kinesis consumers must checkpoint** to avoid reprocessing.

### MSK
- **Broker upgrades and patching** require maintenance windows; plan for rolling restarts.
- **Topic replication factor** affects durability and availability.
- **MSK Serverless** has throughput limits and may not fit very large workloads.

### Step Functions
- **Standard workflows** have a 1-year execution limit; **Express workflows** up to 5 minutes.
- **State machine payload size limit** is 256 KB; use S3 for large data.
- **Cross-service error handling** requires `Catch` and `Retry` configuration.

---

## 13. Staff-Level Interview Sound Bites

- "SQS is a durable buffer; SNS is fan-out; EventBridge is a router with schema and replay; Kinesis/MSK are replayable streams."
- "If you need one event to reach many independent consumers, put SNS in front of SQS queues."
- "EventBridge is for content-based routing; SNS is for simple fan-out; don't use EventBridge just because it is newer."
- "Sagas split distributed transactions into local steps plus compensations; Step Functions makes compensations explicit and observable."
- "Idempotency is non-negotiable in message-based systems; assume every message can be delivered more than once."

---

## 14. Quick Reference Tables

### Message service selection

| Need | Service |
|---|---|
| Buffer between producer and consumer | SQS |
| Fan-out to many consumers | SNS |
| Content-based routing, SaaS events | EventBridge |
| Replayable ordered stream | Kinesis / MSK |
| Scheduled tasks | EventBridge Scheduler |
| Workflow orchestration + compensation | Step Functions |

### Delivery semantics

| Service | Default | Ordered Option |
|---|---|---|
| SQS Standard | At-least-once | FIFO |
| SNS Standard | At-least-once | FIFO topic |
| EventBridge | At-least-once | None |
| Kinesis | At-least-once | Per shard |
| MSK | At-least-once (configurable) | Per partition |

### Saga pattern choices

| Scenario | Pattern |
|---|---|
| Simple, event-driven, loosely coupled services | Choreography |
| Complex workflows with retries/compensations | Orchestration (Step Functions) |
| Long-running human approval steps | Orchestration |
| High throughput, many simple steps | Choreography + idempotency |

---

## 15. Step Functions Deep Dive

Step Functions orchestrates workflows as state machines. Two workflow types:

| Type | Max Duration | Use Case | Cost |
|---|---|---|---|
| **Standard** | Up to 1 year | Long-running, durable, exactly-once | Per state transition |
| **Express** | Up to 5 minutes | High-volume, short-lived, at-least-once | Per number of requests + duration |

### State types

| State | Purpose |
|---|---|
| **Task** | Call Lambda, ECS, SNS, SQS, DynamoDB, another Step Functions workflow, etc. |
| **Choice** | Branch based on input |
| **Wait** | Delay until a time or for a duration |
| **Parallel** | Run branches concurrently |
| **Map** | Iterate over a list (supports concurrency) |
| **Pass** | Transform input/output without calling a service |
| **Succeed / Fail** | End states |

### Error handling

```text
Task
   │
   ├── Retry: define error equals, interval, max attempts, backoff rate
   │
   └── Catch: on specific errors, transition to fallback state
          │
          └── Compensation logic
```

- Built-in retries for Lambda/ service integration failures.
- `Catch` can route to a cleanup/compensation state.
- State machine payload limit: 256 KB; pass references to S3 for larger data.

---

## 16. SQS Advanced Topics

### Visibility timeout in detail

```text
[Message in SQS Queue]
   │
   ▼
[Consumer receives message]
   │
   ▼
[Visibility timeout starts, e.g. 30s]
   │
   ▼
[Message is invisible to other consumers]
   │
   ├── Success -> DeleteMessage -> message gone
   │
   └── Timeout expires without delete
          │
          ▼
   [Message becomes visible again -> retry by same or another consumer]
```

- Default: 30 seconds.
- Range: 0 seconds to 12 hours.
- For long-running tasks, call `ChangeMessageVisibility` to extend.
- In Lambda event source mapping, set queue visibility timeout **greater than function timeout**.

### Delay queues and message timers

- **Queue-level delay**: applies to all messages (up to 15 minutes).
- **Per-message delay**: `DelaySeconds` on `SendMessage` (up to 15 minutes).
- Useful for scheduled tasks, retry backoff, rate limiting.

### DLQ / dead-letter queue and redrive

```text
SQS Queue
   │
   └── Message fails MaxReceiveCount times
          │
          ▼
   DLQ (same queue type: Standard->Standard, FIFO->FIFO)
          │
          ▼
   Alarm triggers investigation
          │
          ▼
   Fix consumer -> redrive messages back to source queue
```

### SQS resource policies

Like S3, SQS queues can have resource policies for cross-account producers/consumers.

```json
{
  "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::<account-id>:role/MyAppRole" },
  "Action": "sqs:SendMessage",
  "Resource": "arn:aws:sqs:<region>:<account-id>:MyQueue"
}
```

### Key CloudWatch metrics

| Metric | Meaning |
|---|---|
| `ApproximateNumberOfMessagesVisible` | Backlog waiting to be processed |
| `ApproximateNumberOfMessagesNotVisible` | Messages currently in flight |
| `NumberOfMessagesReceived` | Consumer poll rate |
| `NumberOfMessagesDeleted` | Successful processing rate |
| `ApproximateAgeOfOldestMessage` | Oldest unprocessed message age |
| `SentMessageSize` | Average message size |

---

## 17. EventBridge Pipes and Scheduler

### EventBridge Pipes

Pipes provide point-to-point integration with filtering, enrichment, and transformation.

```text
Source (DynamoDB Stream, SQS, Kinesis, Kafka, MQ)
   │
   ├── Filter (optional): drop unwanted events
   │
   ├── Enrichment (optional): call Lambda/API/Step Functions
   │
   ├── Target transformation
   │
   ▼
Target (SQS, Lambda, Step Functions, API destination, etc.)
```

### EventBridge Scheduler

- Schedule one-time or recurring events.
- Replaces CloudWatch Events scheduled rules.
- Supports time zones, flexible windows, and target retries.

---

## 18. Message Handling Patterns and Gotchas

### Poison messages

A message that repeatedly fails processing and loops between queue and DLQ.

Mitigations:
- Validate message schema before processing.
- Catch business exceptions and send to DLQ immediately.
- Use `MaxReceiveCount` threshold that matches retry policy.
- Inspect DLQ and replay only after fix.

### Duplicate handling summary

| Mechanism | Window | Notes |
|---|---|---|
| SQS FIFO dedup | 5 minutes | Content-based or explicit ID |
| SNS FIFO dedup | 5 minutes | Explicit `MessageDeduplicationId` |
| EventBridge | At-least-once | Consumers must be idempotent |
| Kinesis | At-least-once | Checkpointing + idempotency |
| Custom idempotency table | Configurable (TTL) | DynamoDB/Redis with conditional write |

### Monitoring stack for messaging

| Service | Key Metrics / Tools |
|---|---|
| SQS | CloudWatch queue metrics + DLQ alarms |
| SNS | NumberOfNotificationsDelivered, NumberOfNotificationsFailed |
| EventBridge | FailedInvocations, InvocationAttempts, ThrottledRules |
| Kinesis | IncomingRecords, GetRecords.IteratorAgeMilliseconds, Read/WriteProvisionedThroughputExceeded |
| MSK | Kafka metrics via CloudWatch/Prometheus; consumer lag |
| Step Functions | ExecutionFailed, ExecutionThrottled, StateTransition count |

---

## 19. Textual Mind Map: AWS Messaging Decision Tree

```text
Need to move data between components?
   │
   ├── Point-to-point durable buffer
   │      └── SQS
   │           ├── Need ordering? -> SQS FIFO
   │           └── Multiple consumers? -> Add SNS in front
   │
   ├── One event -> many consumers
   │      └── SNS
   │           ├── Need filtering? -> SNS filter policies
   │           └── Need ordering? -> SNS FIFO + SQS FIFO
   │
   ├── Route/filter/schedule events
   │      └── EventBridge
   │           ├── SaaS events -> EventBridge partner integrations
   │           ├── Scheduled -> EventBridge Scheduler
   │           └── Stream + transform -> EventBridge Pipes
   │
   ├── High-throughput replayable stream
   │      └── Kinesis Data Streams or MSK
   │           ├── Many independent consumers -> Kinesis enhanced fan-out / MSK consumer groups
   │           └── Analytics -> Kinesis Data Analytics / Flink
   │
   └── Long-running multi-step business process
          └── Step Functions
               ├── Up to 1 year -> Standard workflow
               └── High-volume short -> Express workflow
```

---

## 20. Additional Staff-Level Sound Bites

- "SQS FIFO deduplication window is five minutes; anything longer needs a custom idempotency store."
- "Visibility timeout is a temporary lock; set it longer than your longest expected processing time."
- "Step Functions Standard workflows are durable for up to a year; Express is for short, high-volume workflows."
- "EventBridge Pipes remove polling boilerplate by connecting a source directly to a target with optional filtering and enrichment."
- "Poison messages and retry loops are operational risks; use schema validation, DLQs, and idempotency together."

---

## 21. SQS Extended Payloads

SQS messages are limited to 256 KB. For larger payloads, use the SQS Extended Client pattern:

- Store the actual payload in S3.
- Send an SQS message containing a pointer (S3 bucket/key).
- Consumer reads the pointer, fetches from S3, processes, and deletes both.

Trade-offs:
- Adds S3 latency and cost.
- Requires lifecycle/retention alignment between SQS message and S3 object.
- Use it only when payload truly exceeds 256 KB; otherwise prefer message attribute compression.

---

## 22. SQS Redrive to Source Queue

After fixing a consumer bug, move messages from the DLQ back to the source queue safely:

- Use SQS redrive from the console, CLI, or a Lambda.
- Maintain FIFO ordering by using the same `MessageGroupId`.
- Process redriven messages with extra monitoring; ensure the fix resolved the failure cause.
- For high-volume DLQs, redrive in batches and watch queue depth/age metrics.

---

## 23. EventBridge Pipes Concurrency and Backpressure

- Pipes have configurable batch size and concurrency limits.
- Downstream throttling can cause Pipe failures; place an SQS buffer after the Pipe if the target is fragile.
- Use enrichment only when needed; each enrichment adds latency and cost.
