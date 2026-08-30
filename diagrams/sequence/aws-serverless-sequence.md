# AWS Serverless (Lambda) - Runtime + Deployment Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant GH as GitHub Repo (Monorepo FE+BE)
    participant GHA as GitHub Actions
    participant S3 as S3 Static Site
    participant APIGW as API Gateway
    participant L as Lambda (Express Adapter)
    participant DDB as DynamoDB
    participant AUR as Aurora Serverless
    participant SQS as SQS/EventBridge
    participant CON as Async Consumer Lambda
    participant DLQ as Dead-Letter Queue
    participant R53 as Route53
    participant CF as CloudFront/WAF

    Dev->>GH: Push commit
    GH->>GHA: Trigger CI/CD
    GHA->>GHA: Test + security scans
    GHA->>S3: Upload FE assets + invalidate CF cache
    GHA->>L: Deploy BE functions (version + alias)

    Dev->>R53: Resolve domain
    R53->>CF: Route to edge
    CF->>S3: Serve SPA assets
    Dev->>CF: API request /api/*
    CF->>APIGW: Forward API call
    APIGW->>L: Invoke Lambda
    alt Fast-path
        L->>DDB: Read/Write key-value data
        DDB-->>L: Result
    else Relational path
        L->>AUR: Query via RDS Proxy
        AUR-->>L: Result
    end
    L->>SQS: Publish async event (idempotency key attached)

    alt Async consumer throttled/failing
        SQS->>CON: Deliver message
        CON--xSQS: Processing error
        SQS->>DLQ: Move after max receive attempts
    else Consumer healthy
        SQS->>CON: Deliver message
        CON-->>SQS: Ack
    end

    L-->>APIGW: API response
    APIGW-->>CF: Response
    CF-->>Dev: Final response

    opt Burst traffic
        APIGW->>L: Burst invokes at concurrency limit
        L-->>APIGW: 429 or graceful fallback on throttle
    end
```

## Staff Interview Angles

- Show where idempotency is introduced before async fan-out.
- Discuss Lambda concurrency controls and downstream protection.
- Explain DLQ replay operations and failure triage ownership.
