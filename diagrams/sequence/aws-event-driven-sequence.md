# AWS Event-Driven Microservices - Order Processing Sequence

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant API as API Gateway/ALB
    participant CMD as Command Service
    participant OLTP as Orders DB
    participant OUT as Outbox CDC
    participant EVB as EventBridge
    participant Q1 as SQS Orders + DLQ
    participant REG as Schema Registry
    participant BILL as Billing Consumer
    participant NOTIF as Notification Consumer
    participant READ as Read Model Builder

    User->>API: POST /orders
    API->>CMD: Forward command request
    CMD->>OLTP: Persist order transaction
    CMD->>OUT: Persist outbox event in same transaction
    CMD-->>API: 202/201 response
    API-->>User: Ack order accepted

    OUT->>EVB: Publish OrderCreated event
    EVB->>REG: Validate event schema version
    EVB->>Q1: Fan-out to durable queue
    Q1->>BILL: Consume idempotently and charge payment
    Q1->>NOTIF: Consume idempotently and send confirmation
    EVB->>READ: Update query/read model

    alt Consumer failure
        BILL--xQ1: Processing error
        Q1->>Q1: Retry with backoff
        Q1->>Q1: Move to DLQ after max retry
    else Replay operation
        Q1->>BILL: Reprocess from DLQ with same idempotency key
    end
```

## Staff Interview Angles

- Mention transactional outbox to avoid dual-write inconsistency.
- Explain schema versioning compatibility across producers/consumers.
- Show why replay safety depends on idempotent consumer behavior.
