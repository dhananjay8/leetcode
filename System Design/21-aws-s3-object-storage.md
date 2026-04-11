# How AWS S3 / Object Storage Works

## 1. What is S3?
Object storage service: store any amount of data as objects in buckets. Each object has a key (path), value (data), and metadata.

## 2. Core Concepts
| Concept | Description |
|---------|-------------|
| **Bucket** | Top-level container (globally unique name) |
| **Object** | File + metadata, identified by key (e.g., `images/photo.jpg`) |
| **Storage Classes** | Standard, Infrequent Access, Glacier (cost tiers) |
| **Versioning** | Keep multiple versions of an object |
| **Pre-signed URLs** | Temporary authenticated access to objects |

## 3. Architecture (Simplified)
```
Client → API Gateway (REST) → Metadata Service → Metadata DB
                                      ↓
                              Data Placement Service → Storage Nodes
                                                    (replicated across AZs)
```

## 4. How S3 Achieves 99.999999999% (11 nines) Durability
- Each object replicated across **3+ Availability Zones**
- Erasure coding: split data into fragments + parity, store across nodes
- Continuous integrity checking (checksums)
- Automatic repair of corrupted/lost copies

## 5. Key Design Patterns Using S3
- **Static website hosting**: serve HTML/CSS/JS directly from S3 + CloudFront
- **Data lake**: store raw data (logs, analytics) in S3, query with Athena
- **Backup & archive**: lifecycle policies auto-move old data to Glacier
- **Media storage**: user uploads via pre-signed URL, serve via CDN

## 6. Interview Talking Points
- S3 is eventually consistent for overwrite PUTs (strong consistency since 2020)
- Pre-signed URLs for secure direct upload/download without exposing credentials
- Lifecycle policies automate storage class transitions
- Multipart upload for large files (>100MB)
- Server-side encryption: SSE-S3, SSE-KMS, SSE-C
