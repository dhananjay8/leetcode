# AWS Security, IAM & Governance — Staff/Principal Interview Deep Dive

## 1. Authentication vs Authorization

| Question | Authentication | Authorization |
|---|---|---|
| Answers | "Who are you?" | "What are you allowed to do?" |
| AWS services | IAM, STS, Cognito, Directory Service | IAM policies, SCPs, RCPs, resource policies, permissions boundaries |
| Tokens/credentials | Password, access key, SAML assertion, OIDC token, session token | Policy Allow/Deny decisions |

Staff answer: authentication proves identity; authorization evaluates policy.

---

## 2. IAM Policy Evaluation Logic

AWS evaluates policies in a deterministic order. The final decision is **Deny unless explicitly allowed by every required policy type**.

### Request flow

```text
Principal makes API call
   │
   ▼
AWS Enforcement Code
   │
   ├── 1. Is there an explicit Deny in any policy?
   │      Yes -> DENY
   │      No -> continue
   │
   ├── 2. Organization RCP allow? (if enabled)
   │      No Allow -> DENY
   │
   ├── 3. Organization SCP allow? (if member account)
   │      No Allow -> DENY
   │
   ├── 4. Identity-based policy allow?
   │      No Allow -> DENY
   │
   ├── 5. Permissions boundary allow? (if attached)
   │      No Allow -> DENY
   │
   ├── 6. Session policy allow? (if session)
   │      No Allow -> DENY
   │
   ├── 7. Resource-based policy allow? (if resource has one)
   │      For most services: Allow from identity OR resource is enough
   │      For IAM trust / KMS: explicit allow required
   │
   └── 8. VPC endpoint policy allow? (if used)
          No Allow -> DENY
   ▼
ALLOW
```

Key rules:
- **Explicit Deny always wins**.
- **SCPs and RCPs do not grant permissions**; they limit maximum permissions.
- For most resources, an **Allow in either identity-based or resource-based policy is sufficient**.
- IAM role trust policies and KMS key policies are exceptions: they **must explicitly allow** the principal.

---

## 3. Policy Types Deep Dive

### Identity-based policies

Attached to users, groups, roles. Define what the principal can do.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::example-bucket/*",
    "Condition": {
      "StringEquals": {"aws:RequestedRegion": "us-east-1"}
    }
  }]
}
```

### Resource-based policies

Attached to resources (S3 bucket, Lambda, SNS/SQS topic, KMS key, IAM role trust policy).

| Service | Resource Policy |
|---|---|
| S3 | Bucket policy |
| Lambda | Function policy |
| KMS | Key policy |
| SNS/SQS | Topic/Queue policy |
| API Gateway | Resource policy |

### Service Control Policies (SCPs)

- Apply to OUs or accounts in an AWS Organization.
- Set the **maximum permissions boundary** for principals in the account.
- Do **not** apply to the management account or service-linked roles.
- Common uses: deny Regions, deny root actions, require MFA, enforce encryption.

### Resource Control Policies (RCPs)

- Newer Organizations feature.
- Set maximum permissions boundary on **resources** in member accounts.
- Complement SCPs (which apply to principals).

### Permissions boundaries

Attached to IAM users/roles to define the **maximum** permissions they can ever receive, regardless of other identity policies.

```text
Effective permissions = Identity policies ∩ Permissions boundary
```

### Session policies

Passed when assuming a role or federating, further restricting the resulting session.

```text
Effective session permissions = Role identity policy ∩ Permissions boundary ∩ Session policy
```

---

## 4. Cross-Account Access and AssumeRole

```text
Account A (Caller)                          Account B (Target)
   │                                              │
   │  STS:AssumeRole(CrossAccountRole) ----------▶│
   │                                              │
   │                    Trust policy: allow Account A?
   │                    Caller identity policy: allow sts:AssumeRole?
   │◀──────────────── STS temp creds ─────────────│
   │
   │  Use temp creds to call services in Account B
   ▼
Actions evaluated against CrossAccountRole permissions + Account B SCPs/RCPs
```

### Trust policy vs IAM policy

| Policy | Where | Purpose |
|---|---|---|
| **IAM policy on caller** | Caller identity | Grants permission to call `sts:AssumeRole` |
| **Trust policy on target role** | Target role | Specifies who is allowed to assume the role |

Both must align.

### ExternalId for third-party access

```json
"Condition": {
  "StringEquals": {"sts:ExternalId": "vendor-123"}
}
```

Use `ExternalId` when a third party assumes a role in your account to prevent the **confused deputy problem**.

---

## 5. Federation Patterns

### SAML federation

```text
User -> Enterprise IdP (Okta/ADFS/Azure AD)
   │
   └── IdP authenticates user
   └── IdP sends SAML assertion to AWS STS
   └── STS:AssumeRoleWithSAML
   └── Temporary AWS credentials issued
```

### OIDC / web identity

```text
User -> Google/Auth0/Cognito
   │
   └── OIDC provider returns JWT
   └── AWS STS:AssumeRoleWithWebIdentity
   └── Temporary AWS credentials issued
```

### IAM Identity Center (successor to AWS SSO)

- Centralized portal for workforce access.
- Supports SAML 2.0 and OIDC.
- Maps users/groups to permission sets (temporary IAM roles) across accounts.

---

## 6. AWS KMS and Envelope Encryption

### KMS key types

| Type | Scope | Use |
|---|---|---|
| **AWS managed key** | Created automatically per service | aws/s3, aws/dynamodb, etc. |
| **Customer managed key (CMK)** | Created by you | Full control, cross-account, rotation |
| **AWS owned key** | AWS-managed, not in your account | Default for some services |
| **Multi-Region key** | Same key material across Regions | Global data encryption |

### Envelope encryption with S3 SSE-KMS

```text
1. S3 requests KMS GenerateDataKey
2. KMS creates:
      - Plaintext data key (DEK)
      - Encrypted data key (EDEK) sealed under KMS key
3. S3 encrypts object with DEK, then discards plaintext DEK
4. S3 stores object + EDEK as metadata

Decryption:
1. S3 sends EDEK to KMS Decrypt
2. KMS returns plaintext DEK
3. S3 decrypts object, discards DEK
```

Key policy best practice:
- Restrict `kms:Decrypt`/`GenerateDataKey` to specific services or roles.
- Use `aws:SourceArn` and `kms:EncryptionContext` conditions to avoid confused deputy.
- Enable automatic key rotation (annual) for CMKs.

### KMS grants

Grants are an alternate permission mechanism used by AWS services to use keys on your behalf (e.g., S3 replication, DynamoDB).

---

## 7. Encryption in AWS

| Layer | Service / Mechanism |
|---|---|
| Data at rest | S3 SSE-S3 / SSE-KMS / DSSE-KMS, EBS encryption, RDS/Aurora encryption, DynamoDB KMS |
| Data in transit | TLS 1.2+, AWS Certificate Manager, mTLS |
| Client-side | AWS Encryption SDK, client libraries |
| Application secrets | AWS Secrets Manager, Parameter Store SecureString |

### S3 encryption modes

| Mode | Key Management | Notes |
|---|---|---|
| **SSE-S3** | AWS-managed key | Default, no extra cost |
| **SSE-KMS** | AWS KMS key | Audit, key policy, rotation, extra cost |
| **DSSE-KMS** | AWS KMS key | Dual-layer encryption |
| **SSE-C** | Customer-provided key | You manage keys, HTTPS only |

---

## 8. AWS Organizations and Control Tower

### Organizations hierarchy

```text
AWS Organizations Root
   │
   ├── Security OU
   │      ├── Log Archive Account
   │      └── Audit Account
   │
   ├── Infrastructure OU
   │      ├── Networking Account
   │      └── Shared Services Account
   │
   ├── Workload OU
   │      ├── Dev Account
   │      ├── QA Account
   │      └── Prod Account
   │
   └── Sandbox OU
          └── Sandbox Account
```

### Service Control Policy examples

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {"aws:RequestedRegion": ["us-east-1", "eu-west-1"]}
    }
  }]
}
```

### AWS Control Tower

- Automates multi-account landing zone setup.
- Provides **guardrails** (preventive and detective).
- Integrates Organizations, SSO/Identity Center, Config, CloudTrail.

Guardrail types:
- **Preventive**: enforced via SCPs (e.g., disallow public S3 buckets).
- **Detective**: monitored via AWS Config rules (e.g., identify untagged resources).

---

## 9. Threat Detection and Data Protection

### Amazon GuardDuty

- Continuous threat detection using ML + threat intelligence.
- Monitors CloudTrail, VPC Flow Logs, DNS logs.
- Finds compromised instances, reconnaissance, data exfiltration, crypto-mining.

### Amazon Macie

- Discovers and protects sensitive data (PII) in S3.
- Automated discovery, classification, risk scoring.
- Integrates with EventBridge for alerting.

### AWS Security Hub

- Aggregates findings from GuardDuty, Macie, Config, Inspector, Firewall Manager, partner products.
- Provides CIS AWS Foundations and AWS Foundational Security Best Practices standards.

### AWS Config and Conformance Packs

- Records resource configuration changes over time.
- Config rules evaluate compliance.
- Conformance packs deploy a set of rules and remediation templates.

---

## 10. IAM Best Practices and Anti-Patterns

### Do
- Use IAM roles, not long-lived access keys.
- Require MFA for sensitive operations.
- Use least-privilege policies with specific actions and resources.
- Use ABAC (tags) for dynamic authorization at scale.
- Use SCPs as guardrails, not as permission grants.
- Audit all access with CloudTrail.

### Don't
- Use root account for daily operations.
- Put `*:*` in identity policies without conditions.
- Share access keys across applications.
- Forget that **resource-based policies can allow access even when identity policies deny** (for IAM users and role sessions).
- Rely on SCPs alone for resource-level access control.

---

## 11. Hard AWS Gotchas

### IAM
- **SCPs do not apply to the management account** or service-linked roles.
- **Resource-based policies for IAM role ARNs** are limited by permissions boundaries and session policies.
- **Resource-based policies for role session ARNs** bypass identity policies, permissions boundaries, and session policies.
- **Role chaining**: a role can assume another role; max session duration cascades to the shortest remaining.

### KMS
- **Key policy is mandatory** for customer-managed keys; you cannot lock yourself out.
- **Deleting a KMS key** is destructive; use key disabling and waiting period.
- **AWS managed keys** cannot have their key policy edited.
- **KMS API calls cost money and can throttle**; large-scale systems must account for `kms:Decrypt` latency.

### Organizations
- **Account removal from Organization** requires a supported payment method and email update.
- **Consolidated billing** can accidentally reserve capacity across accounts; use billing alerts.
- **Tag policies** do not enforce tags at API level unless combined with SCP condition keys.

---

## 12. Staff-Level Interview Sound Bites

- "In IAM, explicit Deny always wins; SCPs and RCPs set the ceiling of what is possible, but they never grant permissions."
- "Cross-account access requires both sides: the caller needs sts:AssumeRole, and the target role's trust policy must trust the caller."
- "Use envelope encryption: KMS protects the data key; the data key protects the data."
- "Resource-based policies can bypass identity policy denials for IAM users and role sessions, but not for the role ARN itself when permissions boundaries or session policies exist."
- "GuardDuty is anomaly detection; Macie is sensitive-data discovery; Security Hub is the aggregation layer."
- "Control Tower is an opinionated landing-zone orchestrator on top of Organizations and Config."

---

## 13. Quick Reference Tables

### Policy type summary

| Policy | Attached To | Grants? | Limits? |
|---|---|---|---|
| Identity-based policy | User/Group/Role | Yes | No (alone) |
| Resource-based policy | Resource | Yes (cross-account) | No |
| Permissions boundary | User/Role | No | Yes (max ceiling) |
| SCP | OU/Account | No | Yes (principal ceiling) |
| RCP | OU/Account | No | Yes (resource ceiling) |
| Session policy | Assumed role/federation session | No | Yes |
| VPC endpoint policy | VPC endpoint | No | Yes (network path) |

### Common condition keys

| Condition Key | Use |
|---|---|
| `aws:RequestedRegion` | Restrict Region |
| `aws:SourceIp` | Restrict source IP |
| `aws:VpcSourceIp` | Restrict VPC source IP |
| `aws:MultiFactorAuthPresent` | Require MFA |
| `aws:RequestTag/` | Enforce tagging |
| `aws:PrincipalTag/` | ABAC authorization |
| `kms:EncryptionContext:` | Tie KMS access to specific resource |
| `aws:SourceArn` | Avoid confused deputy |

### Encryption decision tree

| Requirement | Solution |
|---|---|
| Default S3 encryption | SSE-S3 |
| Audit + access control | SSE-KMS with CMK |
| Compliance multi-layer | DSSE-KMS |
| Customer holds keys | SSE-C or client-side |
| Shared secrets | Secrets Manager |
| Non-secret config | Parameter Store (standard or SecureString) |

---

## 14. Control Plane vs Data Plane in AWS Security

| Plane | What It Controls | Examples |
|---|---|---|
| **Control Plane** | Who can create, modify, or delete resources | IAM, Organizations, SCPs, CloudTrail (management events) |
| **Data Plane** | Who can access the actual data inside resources | S3 object operations, DynamoDB item reads, KMS decrypt, EBS volumes |

Staff point: securing the control plane with SCPs and IAM is necessary but not sufficient. Lock down the data plane with resource policies, encryption, VPC endpoints, and least-privilege IAM.

```text
Admin Action
   │
   ├── Create S3 bucket -> Control Plane (IAM/SCP)
   │
   └── Read object from bucket -> Data Plane (Bucket policy + IAM identity policy)
```

---

## 15. ABAC: Attribute-Based Access Control

ABAC uses tags to make authorization decisions dynamic and scalable.

```json
{
  "Effect": "Allow",
  "Action": "ec2:*",
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "ec2:ResourceTag/Project": "${aws:PrincipalTag/Project}"
    }
  }
}
```

Benefits:
- Reduces the number of policies needed.
- Automatically follows resources as teams change.
- Works well with federated identity attributes from IdP.

Gotchas:
- Tagging discipline must be enforced (use SCP conditions or AWS Config rules).
- Not all AWS resources support tags in policy conditions.

---

## 16. SCPs vs Resource-Based Policies Detailed Comparison

| Feature | Service Control Policy (SCP) | Resource-Based Policy (RBP) |
|---|---|---|
| Scope | Organization-level (OU/account) | Individual resource |
| Attachment | Account or OU | Specific resource |
| Grants access? | No (only limits) | Yes |
| Cross-account use | Indirect (limits what accounts can do) | Direct (allows external principals) |
| Inheritance | Cascades root → OU → account | No inheritance |
| Enforced on | All IAM identities in the account | Any principal accessing the resource |
| Typical example | Deny `s3:DeleteBucket` across an OU | Allow Account B to read an S3 bucket |

Key rule: **Access is allowed only when IAM, SCP, and resource-based policy all align** (with exceptions for resource-based policies that can bypass identity policy denials for users/role sessions).

---

## 17. IAM Identity Center Deep Dive

Identity Center is the modern way to manage workforce access to AWS accounts and cloud applications.

```text
Corporate IdP (Azure AD / Okta / Google)
   │
   ├── SCIM provisioning -> users and groups sync
   └── SAML / OIDC federation
   │
   ▼
IAM Identity Center
   │
   ├── Permission Sets (reusable IAM policies)
   └── Account Assignments
          │
          └── Creates temporary IAM role in target account
   │
   ▼
Temporary STS credentials for Console / CLI / SDK
```

### Identity sources

| Source | Use Case |
|---|---|
| AWS Identity Center directory | Small test setups |
| Active Directory Connector | Existing on-prem AD |
| External IdP (Azure AD, Okta) | Modern enterprise with SCIM/SAML |

### Best practices
- Assign permissions to **groups**, not individuals.
- Use **least-privilege permission sets**.
- Audit assumptions via CloudTrail.
- Use short session durations.

---

## 18. AWS Access Analyzer and External Access

- **IAM Access Analyzer**: identifies resources shared with external principals.
- Helps find S3 buckets, IAM roles, KMS keys, Lambda functions, SQS queues, etc., accessible outside your account or Organization.
- **External access findings** should be reviewed regularly as part of least-privilege hygiene.
- Generates **IAM policy based on CloudTrail access** to tighten policies automatically.

---

## 19. Billing and Cost Governance

Security and governance also mean controlling spend.

| Mechanism | Purpose |
|---|---|
| **AWS Organizations** | Consolidated billing, account isolation |
| **AWS Budgets** | Alert when spend or forecast exceeds threshold |
| **Cost & Usage Report (CUR)** | Detailed line-item billing data |
| **Cost Explorer / Data Exports** | Visualize and attribute costs |
| **Tagging + SCPs** | Enforce cost-center/project tags |

---

## 20. Textual Mind Map: AWS Authorization Decision Flow

```text
Principal makes request
   │
   ├── Explicit Deny anywhere? -> DENY
   │
   ├── Organization RCP allow? -> if not, DENY
   │
   ├── Organization SCP allow? -> if not, DENY
   │
   ├── Identity-based policy allow? -> if not, DENY
   │
   ├── Permissions boundary allow? -> if not, DENY
   │
   ├── Session policy allow? -> if not, DENY
   │
   ├── Resource-based policy allow? (if resource has one)
   │      └── IAM role trust / KMS key -> must explicitly allow
   │
   └── VPC endpoint policy allow? -> if not, DENY
   │
   ALLOW
```

---

## 21. Additional Staff-Level Sound Bites

- "Control plane policies decide who can create resources; data plane policies decide who can read the data."
- "ABAC scales authorization through tags, but it only works if tagging is enforced."
- "IAM Identity Center replaces one-off IAM users with federated groups and reusable permission sets."
- "Access Analyzer continuously audits external access to resources before it becomes an incident."

---

## 22. S3 Block Public Access and Object Ownership

- **S3 Block Public Access (BPA)**: account- and bucket-level guardrails to prevent accidental public buckets. Staff-level: turn on at account level and make exceptions explicit.
- **Object Ownership (Bucket owner enforced)**: disables ACLs; bucket owner owns all objects regardless of uploader. Reduces ACL-based leakage.
- Combine BPA + Object Ownership + bucket policy least privilege for defense-in-depth.

---

## 23. Data Perimeter Guardrails

Use IAM conditions to enforce network and organizational boundaries.

| Condition Key | Purpose |
|---|---|
| `aws:PrincipalOrgID` | Allow/deny based on owning Organization ID |
| `aws:ResourceOrgID` | Restrict access to resources in same Organization |
| `aws:SourceIp` | Restrict source IP for internet-facing calls |
| `aws:VpcSourceIp` | Restrict source IP inside a VPC |
| `aws:SourceVpce` | Restrict to a specific VPC endpoint |

Pair these with SCPs, VPC endpoint policies, and resource policies to build a data perimeter.

---

## 24. VPC Endpoint Policy as a Network Guardrail

Interface and gateway endpoints support endpoint policies. Example: restrict S3 access to only approved buckets.

```json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::approved-bucket/*"
  }]
}
```

Staff note: Endpoint policies are an additional layer; they do not grant permissions by themselves.
