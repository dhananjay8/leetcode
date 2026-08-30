# AWS Multi-Region Active-Active - Failure and Recovery Sequence

```mermaid
sequenceDiagram
    autonumber
    participant User as Global User
    participant GA as Global Accelerator
    participant R53 as Route53 Health Routing
    participant R1 as Region-1 App Stack
    participant R2 as Region-2 App Stack
    participant ADB as Aurora Global DB
    participant DDB as DynamoDB Global Tables
    participant Obs as Observability + Alarms
    participant OnCall as On-call SRE
    participant Runbook as Incident Automation Runbook

    User->>GA: HTTPS request
    GA->>R53: Endpoint selection
    R53->>R1: Route to healthy nearest region
    R1->>ADB: Read/write transactional data
    R1->>DDB: Read/write global profile/session
    R1-->>User: Response

    Note over R1,Obs: Region-1 partial outage occurs
    Obs->>OnCall: Alert: elevated errors + health check fail
    OnCall->>Runbook: Trigger failover validation checklist
    R53->>R2: Shift traffic by failover policy
    User->>GA: New request
    GA->>R2: Route to secondary healthy region
    R2->>ADB: Promote/redirect writer if RPO policy allows
    R2->>DDB: Continue global-table operations
    R2-->>User: Service continues with low disruption

    opt Region-1 recovery
        Obs-->>OnCall: Region-1 health restored
        OnCall->>Runbook: Controlled failback decision (capacity + consistency check)
        R53->>R1: Gradual traffic rebalance
    end
```

## Architect Interview Angles

- Describe failover trigger source (health checks + SLO burn rate).
- State RTO/RPO assumptions before discussing writer promotion.
- Explain controlled failback to avoid second outage during recovery.
