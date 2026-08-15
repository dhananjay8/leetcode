# System Design Topics and Study Tracks

Use this as a quick interview prep map for HLD + LLD rounds.

## 1) Core Fundamentals (must know)
- Scalability and availability
- CAP theorem, ACID vs BASE, consistency models
- Fault tolerance, SPOF, disaster recovery
- Latency vs throughput
- Caching strategies (LRU/LFU, read-through/write-through)
- Load balancing and failover
- SQL vs NoSQL, indexing, replication, sharding
- Messaging systems (Kafka/RabbitMQ), websockets
- DNS, proxy vs reverse proxy, CDN

## 2) Design Tradeoffs and Architecture Patterns
- Vertical vs horizontal scaling
- Stateful vs stateless services
- Batch vs stream processing
- Push vs pull architecture
- Long-polling vs websockets
- REST vs RPC
- Sync vs async communication
- Event-driven architecture
- Microservices vs modular monolith
- API gateway and service discovery

## 3) Low-Level Design (LLD) Focus
- Requirement clarification and domain modeling
- Interface-first design and modularity
- Authentication vs authorization
- Data validation and error handling
- Idempotency and retries
- Unit/integration testing strategy
- UML class diagrams and sequence diagrams
- Maintainability, extensibility, and clean code tradeoffs

## 4) High-Level Design (HLD) Focus
- Requirement decomposition (functional + non-functional)
- Capacity estimation and bottleneck identification
- Storage selection and partitioning strategy
- Caching, queues, and async workflow design
- Reliability (timeouts, retries, circuit breakers)
- Observability (logs, metrics, tracing)
- Security and compliance boundaries

## 5) Practice Buckets (design prompts)

### [A] Observability, Metrics, and Control
- Distributed metrics logging and aggregation
- Performance metric collection at fleet scale
- Health monitoring for large compute clusters
- Distributed tracing system design
- Control plane for distributed systems

### [B] Streams, Queues, and Live Systems
- Kafka-style stream processing
- Distributed queue service (RabbitMQ-like)
- Surge pricing engine
- Real-time location + ETA sharing
- Live comments and viewer count systems

### [C] Storage, Sync, and Large Files
- Key-value store at scale
- Cloud file storage (Dropbox/Drive)
- Photo/video content storage platform
- Distributed file transfer
- Bulk on-prem to cloud migration

### [D] Consumer Apps and Feeds
- Calendar backend
- Analytics pipeline + dashboard
- Hotel booking with inventory consistency
- Weather aggregation backend
- Marketplace and ads serving systems

### [E] Money, Commerce, and Pricing
- Public API rate limiter
- Price alert system
- Payment processing engine
- Bank transfer API design
- Compatibility/recommendation engine for ecommerce

### [F] Platform, Auth, and Reliability
- Authentication platform (web + mobile)
- Distributed job scheduler
- Global notification system
- Experimentation (A/B testing) platform
- On-call escalation/incident routing system

## 6) Interview Execution Framework
1. Clarify requirements and success metrics.
2. Define APIs and data flow first.
3. Propose baseline architecture, then scale it.
4. Discuss storage, caching, messaging, and consistency tradeoffs.
5. Add reliability, observability, and security.
6. Close with bottlenecks and future improvements.