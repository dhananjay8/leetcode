# AWS Cloud Essentials for DevOps Interviews

## Core Services Cheat Sheet

### Compute
| Service | Purpose |
|---------|---------|
| **EC2** | Virtual machines (instances) |
| **Lambda** | Serverless functions (pay per execution) |
| **ECS** | Container orchestration (AWS-managed) |
| **EKS** | Managed Kubernetes |
| **Fargate** | Serverless containers (no EC2 management) |

### Storage
| Service | Purpose |
|---------|---------|
| **S3** | Object storage (files, backups, static hosting) |
| **EBS** | Block storage (attached to EC2, like a hard drive) |
| **EFS** | Shared file system (NFS, multi-AZ) |
| **Glacier** | Archive storage (cheap, slow retrieval) |

### Database
| Service | Purpose |
|---------|---------|
| **RDS** | Managed relational DB (Postgres, MySQL, Aurora) |
| **DynamoDB** | NoSQL key-value store (serverless, fast) |
| **ElastiCache** | Managed Redis/Memcached |

### Networking
| Service | Purpose |
|---------|---------|
| **VPC** | Virtual network (your private cloud network) |
| **Subnet** | Segment of VPC (public or private) |
| **Security Group** | Instance-level firewall (stateful) |
| **NACL** | Subnet-level firewall (stateless) |
| **ALB** | Application Load Balancer (Layer 7, HTTP routing) |
| **NLB** | Network Load Balancer (Layer 4, TCP/UDP, ultra-fast) |
| **Route 53** | DNS service |
| **CloudFront** | CDN (edge caching) |

### Security & Identity
| Service | Purpose |
|---------|---------|
| **IAM** | Users, roles, policies (who can do what) |
| **KMS** | Key Management Service (encryption keys) |
| **Secrets Manager** | Store/rotate secrets (DB passwords, API keys) |
| **Certificate Manager** | Free SSL/TLS certificates |

## VPC Architecture (Must Draw in Interviews)
```
Region: us-east-1
└── VPC: 10.0.0.0/16
    ├── AZ: us-east-1a
    │   ├── Public Subnet: 10.0.1.0/24
    │   │   ├── NAT Gateway
    │   │   └── ALB
    │   └── Private Subnet: 10.0.3.0/24
    │       ├── App Server (EC2/ECS)
    │       └── RDS (primary)
    └── AZ: us-east-1b
        ├── Public Subnet: 10.0.2.0/24
        │   └── ALB
        └── Private Subnet: 10.0.4.0/24
            ├── App Server (EC2/ECS)
            └── RDS (standby)

Internet Gateway → Public Subnets → NAT Gateway → Private Subnets
```

## IAM — Critical for Interviews

### Key Concepts
- **User**: Human identity (username + credentials)
- **Group**: Collection of users (attach policies to group)
- **Role**: Identity assumed by services/apps (no credentials, temporary tokens)
- **Policy**: JSON document defining permissions

### Example Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "*"
    }
  ]
}
```

### Principle of Least Privilege
- Give minimum permissions needed
- Use roles (not users) for EC2/ECS/Lambda
- Avoid `"Action": "*"` or `"Resource": "*"`
- Regularly audit with IAM Access Analyzer

## Interview Questions

**Q: How do you make an application highly available on AWS?**
1. Multi-AZ deployment (app servers in 2+ AZs)
2. ALB distributing traffic across AZs
3. RDS Multi-AZ (automatic failover)
4. Auto Scaling Group (replace failed instances)
5. S3 for static assets (11 nines durability)
6. Route 53 health checks + failover routing

**Q: Security Group vs NACL?**
- **SG**: Instance-level, stateful (return traffic auto-allowed), allow rules only
- **NACL**: Subnet-level, stateless (must allow both inbound+outbound), allow + deny rules

**Q: Public subnet vs Private subnet?**
- **Public**: Has route to Internet Gateway, resources get public IPs
- **Private**: No direct internet access, uses NAT Gateway for outbound-only internet

**Q: What is an IAM Role and when do you use it?**
A role is an identity with permissions that can be assumed by services (EC2, Lambda, ECS). Use roles instead of hardcoding credentials. Example: EC2 instance assumes a role to read from S3.
