# AWS Networking, Edge & Content Delivery — Staff/Principal Interview Deep Dive

## 1. Mental Model: Traffic Flows in Layers

A single user request passes through several decisions before reaching your application:

```text
User
  │
  ▼  "Which IP/endpoint?"
Route 53 (DNS + routing policy)
  │
  ▼  "Can I serve from the edge?"
CloudFront / Global Accelerator
  │
  ▼  "Should I allow this request?"
AWS WAF / Shield
  │
  ▼  "Which backend target?"
API Gateway / ALB / NLB
  │
  ▼  "Which path inside the VPC?"
VPC Route Table / Subnet / NACL
  │
  ▼  "Is this connection allowed?"
Security Group / ENI
  │
  ▼
Application / Database / AWS Service
```

Each layer answers a different question. Staff-level answers separate these concerns cleanly.

---

## 2. VPC, Subnets, and Gateways

### VPC fundamentals

A VPC is an isolated software-defined network in an AWS Region. Inside it you define:
- **CIDR block** (IPv4/IPv6)
- **Subnets** (partitioned across Availability Zones)
- **Route tables** (decide next hop)
- **Internet gateways (IGW)**, **NAT gateways**, **VPC endpoints**

### Public vs private subnet

```text
Public Subnet
   Route Table:
      10.0.0.0/16  -> local
      0.0.0.0/0    -> igw-xxx
   Hosts: ALB, NAT Gateway, bastion, public-facing EC2

Private Subnet
   Route Table:
      10.0.0.0/16  -> local
      0.0.0.0/0    -> nat-xxx
   Hosts: app servers, databases, internal services
```

A subnet is **public only because its route table points 0.0.0.0/0 to an IGW**; the name alone means nothing.

### IGW vs NAT Gateway

| Feature | Internet Gateway | NAT Gateway |
|---|---|---|
| Direction | Bidirectional | Outbound only |
| Needs public IP on instance | Yes | No |
| Elastic IP | No | Yes |
| Typical use | Public ALB/EC2 | Private subnet updates/APIs |
| Cost | No hourly charge | Hourly + data processing charge |

### Outbound-only IPv6 with Egress-Only IGW

For IPv6, every address is public. Use an **Egress-Only Internet Gateway** so internal hosts can initiate outbound IPv6 connections while remaining unreachable from the internet.

---

## 3. Security Groups vs NACLs

| Feature | Security Group | NACL |
|---|---|---|
| Scope | ENI / resource | Subnet |
| Stateful | Yes | No |
| Default behavior | Deny all inbound, allow outbound | Allow all |
| Rule type | Allow only | Allow + Deny |
| Evaluation | All rules evaluated together | Rules evaluated in number order |
| Return traffic | Automatically allowed | Must be explicitly allowed |

Production pattern:
- Use **Security Groups** as the primary firewall (fine-grained, least privilege).
- Use **NACLs** as coarse subnet-level guardrails (e.g., block known bad IP ranges).

---

## 4. VPC Connectivity Options

### VPC Peering

```text
VPC A (10.0.0.0/16)          VPC B (172.31.0.0/16)
      │                              │
      └──── VPC Peering Connection ──┘
```

- Direct, point-to-point Layer 3 connection.
- **Non-transitive**: A↔B and B↔C does **not** mean A↔C.
- **No overlapping CIDRs** between peered VPCs.
- Routes and Security Groups must be configured on both sides.

### AWS Transit Gateway (TGW)

```text
                    ┌───────────────┐
    VPC-A  ────────▶│               │
    VPC-B  ────────▶│ Transit GW    │──── VPN / Direct Connect
    VPC-C  ────────▶│               │
    Shared-Svc ────▶│               │
                    └───────────────┘
```

TGW is a regional cloud router that supports transitive routing. Key capabilities:
- Attachments: VPC, VPN, Direct Connect Gateway, cross-Region peering.
- **Route tables per attachment**: implement segmentation (prod vs dev, shared services spoke model).
- Cross-Region peering uses AWS backbone with encrypted traffic.

### AWS PrivateLink and VPC Endpoints

**PrivateLink** is the technology; **VPC endpoints** are the resource you create.

```text
Consumer VPC                          Provider VPC
   │                                      │
   ├── Interface Endpoint (ENI) ─────────┤
   │   (private IP in your subnet)        │
   │                                      │
   └── Traffic stays on AWS backbone; no public internet
```

Two endpoint types:

| Type | Targets | Mechanism | Notes |
|---|---|---|---|
| **Gateway Endpoint** | S3, DynamoDB | Route table target | Free, no ENI |
| **Interface Endpoint** | Most AWS services + PrivateLink SaaS | ENI in subnet | Hourly per ENI + data processing |

PrivateLink advantages:
- Works even with **overlapping CIDRs** between consumer and provider.
- No need for VPC peering or Transit Gateway for service access.
- Unidirectional: consumer initiates, provider cannot initiate back.

### Centralized PrivateLink hub pattern

```text
Spoke VPCs (prod, dev, qa)
      │
      │ Transit Gateway or Cloud WAN
      ▼
Shared-Services VPC  ──► Interface Endpoints for S3, Lambda, Kinesis, Secrets Manager
      │
      └── Private Hosted Zones shared via Route 53 Profiles / Resolver
```

DNS is the tricky part: AWS-managed Private DNS for interface endpoints only works in the endpoint VPC. Use a **custom Private Hosted Zone** associated with spoke VPCs, or **Route 53 Profiles**, to resolve service names centrally.

---

## 5. Hybrid Connectivity: Direct Connect and VPN

### Site-to-Site VPN

```text
On-Prem Router
   │
   ├── IPSec tunnel over public internet
   ▼
Virtual Private Gateway (VGW) attached to VPC
   │
   ▼
VPC subnets
```

- Quick to set up; encrypted over internet.
- Latency/jitter depend on internet path.
- Supports static or BGP dynamic routing.

### Direct Connect (DX)

```text
On-Prem Data Center
   │
   ├── Dedicated fiber to AWS DX Location
   ▼
AWS Direct Connect
   │
   ├── Private VIF  -> VPC via VGW/DX Gateway
   └── Public VIF   -> public AWS services (S3, DynamoDB)
```

- Private, predictable, lower-latency path.
- Connections: 1/10/100/400 Gbps.
- DX Gateway aggregates multiple DX connections across Regions.

### Resilient hybrid design

```text
On-Prem
   │
   ├── Primary: Direct Connect (active)
   └── Backup: Site-to-Site VPN (failover)
          │
          ▼
   AWS VPC / Transit Gateway
```

Staff point: **Do not rely on a single DX location.** Use diverse physical paths and two DX locations if needed.

---

## 6. DNS: Route 53

### Routing policies

| Policy | Use Case |
|---|---|
| **Simple** | Single record, no health checks |
| **Weighted** | Canary, A/B testing, migration |
| **Latency-based** | Route to lowest-latency Region |
| **Failover** | Primary/secondary with health checks |
| **Geolocation** | Compliance or localization |
| **Geoproximity** | Biased routing by geographic bias |
| **Multi-value** | Return multiple healthy IPs |

### Route 53 Resolver for hybrid DNS

```text
On-Prem DNS                              Route 53 (VPC)
   │                                          │
   │ Conditional forwarder for aws.example.com │
   └────────────────────────────────────────▶│
                                              │
                                              ▼
                                       Inbound Resolver Endpoint
                                              │
                                              ▼
                                       Private Hosted Zone
```

For VPC-to-VPC or on-prem-to-VPC name resolution, use:
- **Inbound endpoints**: on-prem DNS can query Route 53.
- **Outbound endpoints + resolver rules**: VPC can forward queries to on-prem DNS.
- **Private hosted zone associations**: share zones across accounts/VPCs.

### Staff trap: DNS TTL and failover

DNS failover is **not instantaneous** because clients cache records. Combine Route 53 health checks with low TTLs, but expect propagation delays measured in seconds-to-minutes.

---

## 7. Edge and Content Delivery

### CloudFront

CloudFront is a global CDN with **edge locations** + **regional edge caches**.

```text
User in Berlin
   │
   ▼
Frankfurt Edge Location
   │
   ├── Cache hit: return object immediately
   └── Cache miss: fetch from Origin (ALB/S3/API Gateway)
```

Key behaviors:
- **Origins**: S3, ALB, EC2, API Gateway, Lambda@Edge, custom HTTP servers.
- **Cache policies**: TTL, query string, headers, cookies.
- **Origin request policies**: what to forward to origin.
- **Field-level encryption / signed URLs**: protect private content.
- **WAF integration**: block attacks at the edge.

### Global Accelerator

```text
User anywhere
   │
   ▼
Global Accelerator static Anycast IP
   │
   ▼
AWS backbone routes to nearest healthy endpoint
   │
   ▼
ALB/NLB/EC2 in chosen Region
```

Use Global Accelerator when:
- You need **static IP addresses**.
- You need **UDP** or non-HTTP traffic.
- You want deterministic regional failover independent of DNS caching.

### CloudFront vs Global Accelerator

| Dimension | CloudFront | Global Accelerator |
|---|---|---|
| Layer | HTTP/HTTPS (L7) | TCP/UDP (L4) |
| Caching | Yes | No |
| Static IPs | No | Yes |
| Protocols | HTTP/S, WebSocket | TCP, UDP, HTTP/S |
| Best for | Static/dynamic content caching | Real-time, gaming, VoIP, static-IP failover |

---

## 8. Load Balancers

### Application Load Balancer (ALB)

- Layer 7 (HTTP/HTTPS).
- Path-based, host-based routing, redirects, fixed responses.
- Targets: EC2, ECS, EKS pods, Lambda, IP addresses.
- Integrates with WAF, Cognito, OIDC.

### Network Load Balancer (NLB)

- Layer 4 (TCP/UDP/TLS).
- Extreme performance, low latency, millions of RPS.
- Preserves client IP.
- Static IP per AZ.
- Targets: EC2, IP, ALB, ECS/EKS.

### Gateway Load Balancer (GWLB)

- Transparently routes traffic through third-party appliances (firewalls, IDS/IPS).
- GENEVE protocol encapsulation.
- Useful for centralized inspection with VPCs.

### ALB vs NLB vs API Gateway

| Concern | ALB | NLB | API Gateway |
|---|---|---|---|
| Layer | L7 | L4 | L7 + API management |
| Path routing | Yes | No | Yes |
| Throttling/auth | Basic | No | Built-in |
| Latency | Low | Ultra-low | Slightly higher |
| Use case | Microservices HTTP | TCP/VoIP/gaming | Serverless APIs, external developers |

---

## 9. Network Security Services

### AWS WAF

Sits in front of CloudFront, ALB, API Gateway, AppSync.

Capabilities:
- Managed rule groups (core, known bad inputs, bot control).
- Rate-based rules (IP blocking).
- Custom rules on URI, headers, query strings, body, geo.
- CAPTCHA and challenge actions.

### AWS Network Firewall

Stateful L3–7 firewall inside VPC.

```text
Private Subnet App
   │
   ▼
Route Table: 0.0.0.0/0 -> Firewall Endpoint
   │
   ▼
AWS Network Firewall
   │
   ▼
NAT Gateway / Internet / Transit Gateway
```

Use cases:
- Centralized egress filtering.
- Domain-based allow/deny lists.
- Deep packet inspection between VPCs.

### AWS Shield

- **Shield Standard**: free, protects against common DDoS.
- **Shield Advanced**: 24/7 DRT, cost protection, detailed visibility.

---

## 10. Cross-Region and Global Network Design

### Multi-Region Transit Gateway peering

```text
        ┌──────────────────┐                ┌──────────────────┐
        │ TGW us-east-1    │◄──────────────►│ TGW eu-west-1    │
        │  ├── VPC-A       │   TGW peering  │  ├── VPC-C       │
        │  ├── VPC-B       │   (encrypted   │  └── VPC-D       │
        │  └── VPN/DX      │    backbone)   │     VPN/DX        │
        └──────────────────┘                └──────────────────┘
```

- TGW peering is **regional-to-regional**; not transitive through a third Region.
- Route tables on each TGW control what each attachment can reach.

### AWS Cloud WAN

A managed WAN service that simplifies global network:
- Core network spans Regions.
- Attachments are VPCs, TGWs, VPN, DX.
- Centralized segment-based policies.

Use Cloud WAN when you need a **single global network fabric** rather than per-Region TGW peering.

### VPC endpoint centralization at scale

```text
Spoke VPCs
   │
   │ Transit Gateway / Cloud WAN
   ▼
Shared Services VPC
   ├── Interface endpoints (Kinesis, Lambda, SQS, etc.)
   └── Custom Private Hosted Zones
   │
   └── Route 53 Profiles shared via RAM
```

Best practices:
- Deploy endpoints in **two or more AZs** for HA.
- Share PHZs across accounts using Route 53 Profiles or cross-account associations.
- Use **endpoint policies** to restrict which principals can use the endpoint.

---

## 11. IPv6 Considerations

- IPv6 addresses in AWS are **public by default**. Use egress-only IGW for outbound-only private subnets.
- Dual-stack VPCs use both IPv4 and IPv6.
- IPv6 CIDRs are /56 from AWS; subnets are /64.
- Security Groups and NACLs can have separate IPv6 rules.

---

## 12. VPC Observability and Security Inspection

### VPC Flow Logs

VPC Flow Logs capture IP-level metadata (5-tuple, bytes, action) for traffic on ENIs.

```text
ENI (EC2, ALB, RDS, etc.)
   │
   ├── Accepted traffic
   └── Rejected traffic
   │
   ▼
VPC Flow Logs
   │
   ├── CloudWatch Logs (near real-time, search)
   └── S3 (cheap long-term, Athena analysis)
```

- Do **not** capture packet payload.
- Use for troubleshooting, audit, anomaly detection, and cost attribution.
- Mirror flow logs to S3 and query with Athena/Glue for large-scale analysis.

### Traffic Mirroring

Traffic Mirroring copies raw packets from a source ENI to a target ENI for deep packet inspection.

```text
App ENI
   │
   └── Traffic Mirror Session
          │
          ▼
   Monitoring ENI (IDS/IPS, packet analyzer)
```

Use cases:
- Intrusion detection.
- Malware analysis.
- Network forensics.
- Compliance capture when flow logs are insufficient.

### GuardDuty

GuardDuty analyzes CloudTrail, VPC Flow Logs, and DNS logs using ML + threat intelligence.

```text
VPC Flow Log / CloudTrail / DNS Log
   │
   ▼
GuardDuty
   │
   ├── Reconnaissance (port scans)
   ├── Instance compromise (crypto-mining, backdoor)
   ├── Data exfiltration
   └── Account credential misuse
   │
   ▼
Security Hub / SNS / EventBridge
```

---

## 13. Centralized Security VPC and SaaS Isolation

### Centralized security VPC with Transit Gateway

```text
                    ┌────────────────────┐
                    │  Security / Shared   │
                    │      Services VPC    │
                    │  ├── Network Firewall│
                    │  ├── NAT Gateways    │
                    │  └── VPC Endpoints   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         Spoke VPC-A     Spoke VPC-B      Spoke VPC-C
         (Prod)           (Dev)            (DB)
```

Benefits:
- Single egress path for inspection and logging.
- Shared services (endpoints, DNS, NAT) reduce cost and complexity.
- Spoke VPCs cannot reach the internet directly.

### B2B SaaS / multi-tenant isolation

| Isolation Model | Mechanism | Use Case |
|---|---|---|
| **VPC per tenant** | Separate account/VPC per customer | High-security, regulated tenants |
| **Shared VPC with per-tenant SG/ENI** | Security groups + IAM boundaries | Cost-efficient, lower isolation |
| **PrivateLink-based service** | Expose only the service endpoint | Vendor SaaS model, no CIDR coordination |

Staff point: VPC-per-tenant limits blast radius but increases operational overhead. Use PrivateLink to avoid CIDR conflicts between tenant VPCs and your service VPC.

---

## 14. Hybrid and Zero-Trust Networking

### SASE / Zero Trust hybrid access

```text
Corporate Users / Remote Workers
   │
   ▼
Secure Web Gateway (Zscaler / SASE)
   │
   ▼
IPSec VPN or PrivateLink
   │
   ▼
AWS Landing Zone VPCs
```

- No implicit trust based on network location.
- Identity-aware proxy controls access.
- Useful when enterprises mandate SASE before cloud access.

### Direct Connect resiliency

```text
On-Prem DC
   │
   ├── DX Location A (primary)
   │       └── VIF -> DX Gateway -> VPC / TGW
   │
   └── DX Location B (secondary)
           └── VIF -> DX Gateway -> VPC / TGW
```

Always plan dual DX locations and use BGP for automatic failover.

---

## 15. CIDR Planning and IP Address Management

### IPv4 CIDR rules

- VPC CIDR: `/16` to `/28`.
- Subnet CIDR: same range as VPC.
- AWS reserves **5 IP addresses** per subnet (network, broadcast, .1 router, .2 DNS, .3 future, .255 last).
- A `/24` subnet has only **251 usable IP addresses**.

### IPAM (IP Address Manager)

- Plan CIDRs across accounts and Regions.
- Avoid overlapping ranges that break peering.
- Allocate pools by environment/Region.

### EKS / container networking gotcha

EKS pods consume VPC IPs. A `/22` pod subnet can exhaust quickly. Solutions:
- Use **prefix delegation** to assign /28 prefixes to nodes.
- Use **IPv6** or custom CNI to decouple pod IPs from VPC.
- Size subnets for **peak pod density**, not just nodes.

---

## 16. Hard AWS Gotchas

### VPC / Subnet
- **CIDR overlap** blocks peering; plan with IPAM.
- **Subnet size**: a `/24` gives only 251 usable IPs; EKS clusters can exhaust IPs fast.
- **Implicit router**: the VPC router handles all routing; you do not manage it directly.
- **NACL return traffic**: stateless, so ephemeral port ranges must be allowed.
- **NAT Gateway per AZ**: a single NAT in one AZ is a single point of failure for cross-AZ egress. Use one NAT per AZ.

### Connectivity
- **VPC Peering is not transitive**; do not build a large mesh.
- **TGW cross-Region peering** incurs data-transfer charges.
- **PrivateLink endpoint AZs** must be in the same AZ as consumers to avoid cross-AZ charges.
- **Direct Connect** does not provide automatic redundancy; plan for dual locations.
- **Unused Elastic IPs** are charged if not attached.

### DNS
- **Route 53 private DNS** only works inside associated VPCs; use Resolver/PHZ sharing for cross-VPC.
- **TTL** determines failover speed; balancing TTL with query cost is key.

### Edge
- **CloudFront cache invalidations** cost money; design cache keys carefully.
- **CloudFront origin failover** requires origin groups.
- **Global Accelerator** routes by health check; still consider data sovereignty.
- **WAF rate-based rules** require at least 100 requests in 5 minutes; sudden low-volume attacks may not trigger.

---

## 17. Staff-Level Interview Sound Bites

- "A subnet is public because its route table points 0.0.0.0/0 to an IGW, not because of its name."
- "VPC peering is point-to-point and non-transitive; Transit Gateway is the cloud router for transitive hub-and-spoke."
- "PrivateLink exposes a service, not a whole VPC, and works across overlapping CIDRs."
- "Security Groups are stateful resource firewalls; NACLs are stateless subnet firewalls."
- "CloudFront caches at the edge; Global Accelerator routes over the AWS backbone to the nearest healthy endpoint."
- "For global networks, TGW peering works, but Cloud WAN gives you a single core network with segment policies."
- "Plan CIDRs with IPAM; overlapping ranges kill peering."
- "One NAT Gateway per AZ; otherwise a single AZ outage takes down cross-AZ egress."

---

## 18. Textual Mind Map: Network Request Journey

```text
User Request
   │
   ├── DNS Layer (Route 53)
   │      ├── Which endpoint? -> Latency / Geo / Failover / Weighted
   │      └── TTL affects failover speed
   │
   ├── Edge Layer
   │      ├── CloudFront: cache / WAF / signed URLs
   │      └── Global Accelerator: static IP / UDP / L4 failover
   │
   ├── Security Layer
   │      ├── WAF: L7 rules, bot control
   │      ├── Shield: DDoS
   │      └── Network Firewall: L3–L7 VPC egress
   │
   ├── Load Balancing Layer
   │      ├── ALB: L7 path/host routing
   │      ├── NLB: L4 high throughput, static IP
   │      └── API Gateway: throttling, auth, usage plans
   │
   ├── Routing Layer
   │      ├── VPC Route Table -> subnet -> NACL
   │      └── Transit Gateway / Cloud WAN / Peering / VPN / DX
   │
   ├── Enforcement Layer
   │      ├── Security Group (stateful)
   │      └── ENI -> instance/pod
   │
   └── Application / Data Layer
          ├── Compute: EC2 / ECS / EKS / Lambda
          ├── Storage: S3 / EBS / EFS
          └── Database: RDS / Aurora / DynamoDB
```

---

## 19. Quick Reference Tables

### Network service selection

| Need | Service |
|---|---|
| Expose REST/HTTP API | API Gateway / ALB |
| Private VPC-to-VPC (2–10) | VPC Peering |
| Many VPCs + on-prem hub-and-spoke | Transit Gateway / Cloud WAN |
| Access AWS service privately from VPC | VPC Endpoint / PrivateLink |
| Dedicated on-prem connection | Direct Connect |
| Cheap encrypted backup path | Site-to-Site VPN |
| CDN / caching | CloudFront |
| Static IP + ultra-low-latency global routing | Global Accelerator |
| L7 web firewall | AWS WAF |
| VPC intrusion/egress firewall | AWS Network Firewall |

### Routing policy selection

| Goal | Route 53 Policy |
|---|---|
| Simple single target | Simple |
| 90/10 canary | Weighted |
| Lowest latency per user | Latency-based |
| Automatic failover | Failover |
| Country-level compliance | Geolocation |
| Return multiple IPs | Multi-value |

---

## 20. VPC Lattice — Cross-VPC Service Networking

VPC Lattice provides application-layer (HTTP/HTTPS) service networking across accounts and VPCs with built-in routing and IAM-based authorization.

Key points:
- Define services with friendly names and expose them across accounts/VPCs.
- Path and header-based routing; integrates with TLS and AWS WAF.
- Backends: ALB/NLB, IP/instance, Lambda, ECS/EKS services.
- Central access policies with IAM; avoid peering/security group sprawl.

When to use which:
- Use VPC Lattice for cross-account, cross-VPC HTTP(S) routing with IAM auth.
- Use PrivateLink (interface endpoints) to expose a single service privately without routing (works with overlapping CIDRs; unidirectional consumer->provider).
- Use Transit Gateway/Cloud WAN for L3 routing between many networks; combine with Lattice or PrivateLink for L7 access.
- Use Cloud Map for service discovery only (no policy or L7 routing).

---

## 21. Networking Pricing Gotchas

| Charge | Watch out for |
|---|---|
| NAT Gateway | Hourly per gateway + per-GB data processing; one per AZ for HA |
| PrivateLink / Interface endpoints | Hourly per ENI + per-GB data processing |
| Transit Gateway | Hourly per attachment + per-GB processed |
| Cross-AZ traffic | Charged even within same VPC if traffic crosses AZ |
| Direct Connect | Port hourly + data transfer out; no free egress |
| CloudFront | Cache misses generate origin fetch data-transfer charges |

---

## 22. Networking Deep-Dive Additions

### Route 53 record types

| Record | Purpose |
|---|---|
| **A** | Map a domain to an IPv4 address |
| **AAAA** | Map a domain to an IPv6 address |
| **CNAME** | Alias one domain to another (cannot be used at zone apex) |
| **MX** | Mail exchange / email routing |
| **TXT** | Verification, SPF, DKIM, general records |
| **NS** | Delegates DNS to nameservers |
| **Alias** | AWS-specific; maps an apex/domain to an AWS resource (ELB, CloudFront, S3 website) |

Staff note: Prefer **Alias records** for AWS targets — they are free, follow target health, and work at the zone apex.

### Route 53 Resolver endpoints and rules

For hybrid DNS, Route 53 Resolver bridges on-premises and VPC name resolution.

- **Inbound endpoints**: let on-prem DNS servers query private Route 53 hosted zones.
- **Outbound endpoints + resolver rules**: forward VPC DNS queries to on-prem DNS.
- **Conditional forwarding**: forward only specific domains (e.g., `corp.local`) while resolving AWS names locally.

```text
On-Prem DNS                          VPC / Route 53
   │                                          │
   │  Query aws.example.com                    │
   ├─────────────────────────────────────────►│ Inbound endpoint
   │                                          │ Private hosted zone
   │◄─────────────────────────────────────────┤
   │
   │  Query corp.local
   │
   VPC outbound endpoint with resolver rule
   │
   ▼
On-Prem DNS forwarder
```

### CloudFront cache behaviors, origin groups, and access control

- **Cache behavior**: per-path-pattern rules for TTL, query strings, headers, cookies, compression, and viewer protocol.
- **Origin group**: primary + secondary origin for failover on timeout/5xx.
- **Origin Access Control (OAC) / OAI**: restrict S3 bucket access to CloudFront only.
- **Field-level encryption**: encrypt sensitive fields at the edge with a public key; only the origin can decrypt with its private key.
- **Signed URLs / signed cookies**: time-limited, IP-restricted access to private content.

### CloudFront Functions vs Lambda@Edge

| Feature | CloudFront Functions | Lambda@Edge |
|---|---|---|
| Runtime | Lightweight JavaScript | Node.js / Python |
| Scale | Millions per second | Regional (Lambda) scale |
| Latency | Sub-millisecond | Tens to hundreds of milliseconds |
| Use case | Header manipulation, URL rewrites, cache-key changes | Complex logic, body transforms, external service calls |
| Cost | Very low | Per invocation |

### AWS WAF rule types and WebACL structure

- **Managed rule groups**: AWS Managed Rules (baseline, known bad inputs, SQLi, LFI/RFI), partner rules.
- **Rate-based rules**: track IPs that exceed a request threshold (minimum 100 requests in 5 minutes).
- **Custom rules**: match URI, query string, body, headers, geo-location, IP sets.
- **Bot Control / Account Takeover Prevention**: managed rules for bot mitigation.
- **WebACL capacity units (WCU)**: each rule consumes capacity; WebACL has a hard capacity limit.

### AWS Network Firewall rule groups

A firewall policy is a collection of rule groups attached to VPC subnets.

| Rule Group Type | What It Does |
|---|---|
| **Stateful** | Inspects traffic bidirectionally; supports 5-tuple, domain/URL, Suricata IPS rules |
| **Stateless** | Simple allow/deny by 5-tuple |
| **Domain list** | Allow/deny outbound traffic to specific domains |
| **Suricata-compatible IPS** | Intrusion-prevention signatures |

### Direct Connect details

- **Dedicated connection**: 1 / 10 / 100 / 400 Gbps physical port provisioned by AWS.
- **Hosted connection**: sub-1 Gbps to 10 Gbps via an AWS Direct Connect Partner.
- **LAG (Link Aggregation Group)**: bundle multiple ports for higher throughput and redundancy.
- **Virtual Interfaces (VIF)**:
  - **Private VIF**: reach a VPC via VGW or DX Gateway.
  - **Public VIF**: reach public AWS services (S3, DynamoDB) with public IPs.
  - **Transit VIF**: connect to a Transit Gateway for many VPCs.
- **DX Gateway**: spans Regions; connect on-prem to VPCs in multiple Regions.
- **Resilience**: use dual DX locations and a VPN backup path.

### Site-to-Site VPN components and patterns

Components:

- **Customer Gateway (CGW)**: the on-prem router/device represented in AWS.
- **Virtual Private Gateway (VGW)**: AWS-side VPN concentrator attached to a VPC.
- **Transit Gateway VPN**: terminate VPN on a Transit Gateway to serve many VPCs.

Routing patterns:

- **Static routing**: simple, single tunnel.
- **BGP dynamic routing**: multiple paths, automatic failover, route advertisement.
- **VPN CloudHub**: connect multiple on-prem sites through a single VGW using BGP.

### Gateway Load Balancer (GWLB) deep dive

GWLB transparently inserts third-party network appliances into the traffic path.

```text
Client
   │
   ▼
GWLB
   │ GENEVE encapsulation
   ▼
Security Appliance (EC2 ENI)
   │
   ▼
GWLB
   │
   ▼
Destination
```

- Operates at Layer 3/4 transparently.
- Uses **GENEVE** protocol to preserve original packet metadata.
- Appliances can live in a separate inspection VPC.
- Common with centralized security VPCs for firewall/IDS/IPS inspection.

### VPC Flow Log key fields

Flow logs capture metadata, not payload. Useful fields:

| Field | Meaning |
|---|---|
| `srcaddr` / `dstaddr` | Source and destination IP |
| `srcport` / `dstport` | Source and destination port |
| `protocol` | IANA protocol number |
| `packets` / `bytes` | Transfer volume |
| `start` / `end` | Time window |
| `action` | ACCEPT or REJECT |
| `log-status` | OK, NODATA, SKIPDATA |

Use cases:
- Troubleshoot connectivity (find REJECT entries due to SG/NACL).
- Security analysis and anomaly detection.
- Cost attribution by source/destination.

### AWS Network Manager

- Global dashboard for Transit Gateway and Cloud WAN networks.
- Visualize topology, monitor events, and automate route updates.
- Useful for large multi-Region or multi-account network operations.
