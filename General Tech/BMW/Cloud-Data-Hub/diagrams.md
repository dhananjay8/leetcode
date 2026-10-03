# BMW Cloud Data Hub & Datahub Portal — Diagrams (Mermaid)

Diagrams 1-2 are reconstructed from BMW/AWS's own published architecture descriptions (see `README.md` → Sources). Diagrams 3-4 model the likely architecture of the **Datahub web application** this specific role owns — labeled **(inference)** since BMW hasn't published that app's internals; it's a standard, defensible shape for the exact stack in the JD (Angular + Node/Express + PostgreSQL/Drizzle + ECS + Lambda).

## 1) Cloud Data Hub — Platform-Level Architecture (sourced)

```mermaid
flowchart TB
    U[Data Producers / Consumers / Analysts] --> DP[Data Portal<br/>single entry point: manage providers, datasets, use cases, access requests]
    DP --> API[CDH Management APIs]

    subgraph HubStageGrid[Multi-Account Grid: hub x stage]
      direction LR
      G_DEV[(global / dev)]
      G_INT[(global / int)]
      G_PROD[(global / prod)]
      M1_PROD[(market1 / prod)]
      M2_PROD[(market2 / prod)]
    end

    API --> HubStageGrid

    subgraph Providers[Data Producer Accounts — decentralized compute]
      PG[AWS Glue ETL]
      PE[Amazon EMR]
      PK[Amazon Kinesis]
      PL[AWS Lambda]
    end

    subgraph Consumers[Data Consumer Accounts — decentralized compute]
      CA[Amazon Athena]
      CS[Amazon SageMaker]
      CG[AWS Glue]
      CE[Amazon EMR]
    end

    Providers -->|writes dataset: S3 + Glue Data Catalog entry| CENTRAL[(Centralized Storage<br/>Amazon S3 + AWS Glue Data Catalog)]
    CENTRAL -->|Lake Formation fine-grained access<br/>row/col-level, resource links, tag-based| Consumers

    DP -.manages access grants via.-> LF[AWS Lake Formation]
    LF -.governs.-> CENTRAL

    CENTRAL --> HubStageGrid
```

**Talking points**
- Compute is decentralized (each producer/consumer account picks its own tools); storage conventions are centralized (S3 + Glue Data Catalog) — this is the "decentralized compute, centralized storage" principle.
- The hub × stage grid (`global/market1/market2` × `dev/int/prod`) is a one-to-many mapping to AWS accounts, isolating data by market/regulatory boundary.
- Lake Formation is the **evolution**, not the original design — it replaced an earlier bucket-level sharing + Glue Data Catalog sync-module approach that caused duplicate, filtered datasets.

---

## 2) BMW Financial Services — Regulatory Reporting (sourced, concrete use case)

```mermaid
flowchart LR
    CDH[(Cloud Data Hub<br/>source dataset)] -->|Lake Formation resource link| RR[Regulatory Reporting Account]

    RR --> GLUE[AWS Glue ETL<br/>standard transforms]
    RR --> EMR[Amazon EMR<br/>complex historical joins]

    GLUE --> HUDI[(S3 + Apache Hudi<br/>insert/update/upsert/delete)]
    EMR --> HUDI
    HUDI --> CAT[AWS Glue Data Catalog]

    CAT --> ATH[Amazon Athena<br/>ad hoc SQL]
    CAT -->|VPC peering| RS[Amazon Redshift + Spectrum<br/>dimensional data marts]

    ATH -->|Lambda UDF re-personalizes pseudonymized PII for authorized users| OUT1[Tableau / CSV reports]
    RS -->|Lambda UDF re-personalizes pseudonymized PII for authorized users| OUT1

    SF[AWS Step Functions / Glue Workflows] -.orchestrates.-> GLUE
    SF -.orchestrates.-> EMR

    REG[(DynamoDB<br/>data registry: job metadata, reprocess/rerun)] -.tracked by.-> SF
    KMS[AWS KMS] -.encrypts.-> HUDI
```

**Talking points**
- PII is pseudonymized *before* it lands in CDH to satisfy GDPR/Schrems II; **Lambda UDFs inside Athena/Redshift queries** re-personalize columns only for authorized consumers at query time — pseudonymization and re-identification are kept as separate, auditable steps.
- Apache Hudi is chosen specifically because the use case needs **record-level upsert/delete**, which plain Parquet-on-S3 doesn't support well.
- A DynamoDB-backed data registry exists purely to make ETL **idempotent and re-runnable** (reprocess a failed month-end close without reprocessing everything).

---

## 3) Datahub Web Application — Likely Architecture for This Role (inference)

```mermaid
flowchart TB
    USER[Data Producer / Consumer / Admin] --> CF[CloudFront / ALB]
    CF --> NG[Angular SPA<br/>Standalone Components + RxJS<br/>BMW Density Design System]

    NG -->|REST, JWT bearer| API[Node.js / Express API<br/>on ECS Fargate]

    API --> AUTHZ[RBAC + JWT middleware<br/>OWASP hardening]
    API --> PG[(PostgreSQL<br/>via Drizzle ORM)]
    API --> SEC[AWS Secrets Manager<br/>DB creds, JWT signing keys]
    API --> SDK[AWS SDK calls]

    SDK --> S3[(Amazon S3<br/>dataset objects)]
    SDK --> GLUE[AWS Glue Data Catalog<br/>metadata lookups]
    SDK --> LF[AWS Lake Formation<br/>grant/revoke access]
    SDK --> LAMBDA[AWS Lambda<br/>async jobs: notifications, ETL triggers]

    API --> CW[CloudWatch Logs/Metrics/Alarms]
    API -.traced by.-> XRAY[AWS X-Ray]

    subgraph CICD[GitHub Actions CI/CD]
      LINT[Lint + Type-check] --> TEST[Jest unit/integration + Cypress E2E]
      TEST --> BUILD[Docker build]
      BUILD --> ECR[(Amazon ECR)]
      ECR --> DEPLOY[Deploy to ECS Fargate]
    end

    DEPLOY -.ships.-> API
```

**Talking points**
- This is the **control-plane** application: it manages CDH metadata/access (providers, datasets, access requests) through AWS SDK calls against Glue/Lake Formation/S3 — it is not itself running Spark/EMR jobs.
- IAM roles should be scoped per ECS task (task role), never shared broad credentials; Secrets Manager holds DB credentials and JWT signing keys, rotated independently of code deploys.
- Nx monorepo (nice-to-have skill) would let the Angular app and Express API share TypeScript DTO/type definitions, eliminating an entire class of frontend/backend contract drift.

---

## 4) User Journey Sequence — "Request Access to a Dataset"

```mermaid
sequenceDiagram
    autonumber
    participant Consumer as Data Consumer (Angular UI)
    participant API as Datahub API (Express)
    participant DB as PostgreSQL (Drizzle)
    participant LF as AWS Lake Formation
    participant Owner as Data Provider (Angular UI)
    participant Notify as Lambda (notifications)

    Consumer->>API: POST /datasets/{id}/access-requests (JWT)
    API->>API: RBAC check — can this role request access?
    API->>DB: Insert access_request(status=PENDING)
    API->>Notify: Trigger notification event
    Notify->>Owner: Email/notification — new access request

    Owner->>API: PATCH /access-requests/{id} (approve)
    API->>API: RBAC check — is caller the dataset owner?
    API->>LF: Grant permission (resource link or tag-based)
    LF-->>API: Grant confirmed
    API->>DB: Update access_request(status=APPROVED)
    API->>Notify: Trigger notification event
    Notify->>Consumer: Email/notification — access approved

    alt Lake Formation grant fails
        LF--xAPI: Error
        API->>DB: Update access_request(status=FAILED, reason)
        API->>Notify: Alert owner + consumer of failure
    end
```

**Talking points**
- The API is the **only** writer of Lake Formation grants — the UI never talks to AWS directly, keeping IAM permissions concentrated and auditable in one service.
- Two independent RBAC checks (can-request, can-approve) model the real provider/consumer ownership split from the CDH platform design.
- Failure handling matters here precisely because this flow crosses an AWS-service boundary (Lake Formation) that can fail independently of the app's own DB — this is a natural "what if Lake Formation grant fails mid-flow" interview probe.

---

## 5) IAM & Secrets — Task Execution Role vs Task Role (inference)

```mermaid
flowchart LR
  GH[GitHub Actions] -. OIDC assumeRole .-> CIROLE[(IAM Role for CI/CD)]
  CIROLE --> ECR[(Amazon ECR)]
  CIROLE --> ECS[(ECS: register task definition & deploy)]

  subgraph Runtime[ECS Service Runtime]
    direction TB
    TE[Task Execution Role\n(ECR pull, CW logs, secrets fetch refs)]
    TR[Task Role\n(used by app code)]
    APP[Express API Container]
  end

  ECR --> Runtime
  Runtime -->|secrets| SM[Secrets Manager]
  Runtime -->|AWS SDK| S3[(S3 datasets)]
  Runtime -->|AWS SDK| GLUE[AWS Glue Catalog]
  Runtime -->|AWS SDK| LF[AWS Lake Formation]

  TE -.only-> ECR
  TE -.and-> CW[CloudWatch Logs]
  TR -.least-privilege-> S3
  TR -.least-privilege-> GLUE
  TR -.least-privilege-> LF
```

**Talking points**
- The task execution role is used by ECS for image pulls/logging; your **application never uses it** to call AWS APIs.
- The task role is what the app assumes; scope it tightly to the specific S3 prefixes and Lake Formation actions.
- Secrets are stored in Secrets Manager; the task execution role fetches them for the container at start, not the app embedding secrets in env permanently.

---

## 6) CI/CD Flow with GitHub Actions OIDC (inference)

```mermaid
flowchart TB
  PR[Pull Request] --> CI[CI: lint + type-check + tests]
  CI --> BUILD[Docker build]
  BUILD --> SIGN[Scan/Sign Image]
  SIGN --> PUSH[Push to ECR]
  PUSH --> DEPLOY[Update ECS service]
  DEPLOY --> SMOKE[Smoke tests]
  SMOKE --> PROMOTE[Promote/Tag release]

  subgraph Auth[Authentication]
    GH[GitHub Actions OIDC Token] --> STS[STS: AssumeRoleWithWebIdentity]
    STS --> ROLE[(Deploy Role with least-privilege)]
  end

  CI -.uses.-> GH
  ROLE -.permits.-> ECR[(ECR)]
  ROLE -.permits.-> ECS[(ECS)]
  ROLE -.permits.-> CW[CloudWatch (alarms update)]
```

**Talking points**
- No long-lived AWS keys in repo secrets; OIDC + STS issues short-lived credentials per workflow run.
- The deploy role only permits ECR push and ECS updates; CloudWatch alarms updates are optional but recommended.
- Smoke tests gate promotion; full E2E runs can be nightly to keep PR feedback fast.
