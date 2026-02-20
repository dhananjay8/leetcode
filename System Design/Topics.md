## System Design Resources:

### ➤ 𝗕𝗮𝘀𝗶𝗰𝘀 𝗼𝗳 𝗦𝘆𝘀𝘁𝗲𝗺 𝗗𝗲𝘀𝗶𝗴𝗻

    • What is System Design?
    • Functional vs Non Functional Requirements
    • What are the components of System Design?
    • System Design Life Cycle | SDLC (Design)
    • Structured Analysis and Structured Design
    • System Design Strategy
    • Database Sharding - Concept
    • Horizontal and Vertical Scaling
    • Load Balancer in System Design
    • Routing requests through Load Balancer
    • Latency and Throughput in System Design
    • Object-Oriented Analysis and Design
    • Difference between Structured and Object-Oriented Analysis

### ➤ Basic Fundamentals 
    1. Scalability 
    2. Availability 
    3. CAP Theorem 
    4. ACID Transactions 
    5. BASE Transactions 
    6. Consistency Patterns (Strong vs Eventual) 
    7. Rate Limiting 
    8. Fault Tolerance 
    9. Single Point of Failure (SPOF) 
    10. Disaster Recovery 
    11. Content Delivery Network (CDN) 
    12. Proxy vs Reverse Proxy 
    13. Domain Name System (DNS) 
    14. Caching Strategies (LRU, LFU) 
    15. Distributed Caching 
    16. Load Balancing (Round Robin, Weighted, etc.) 
    17. Database Types (SQL vs NoSQL) 
    18. Database Indexes 
    19. Data Replication 
    20. Database Sharding 
    21. Failover Mechanisms 
    22. Distributed Tracing 
    23. Message Queues (Kafka, RabbitMQ) 
    24. WebSockets 

### ➤ Tradeoffs  + Patterns
    25. Vertical vs Horizontal Scaling 
    26. Stateful vs Stateless Design 
    27. Batch vs Stream Processing 
    28. Push vs Pull Architecture 
    29. Long-polling vs WebSockets 
    30. REST vs RPC 
    31. Synchronous vs Asynchronous Communication 
    32. Latency vs Throughput 
    33. Read-Through vs Write-Through Cache 
    34. Client-Server Architecture 
    35. Microservices Architecture 
    36. Serverless Architecture 
    37. Event-Driven Architecture 
    38. Peer-to-Peer (P2P) Architecture 
    39. API Gateway Design 
    40. Service Discovery Mechanisms


### Design

#### ➤ 𝗟𝗼𝘄 𝗟𝗲𝘃𝗲𝗹 𝗗𝗲𝘀𝗶𝗴𝗻 (𝗟𝗟𝗗)
    • What is Low Level Design or LLD
    • Data Structures and Algorithms for System Design
    • Event-Driven Architecture
    • Difference between Authentication and Authorization
    • What is API Gateway
    • What is Data Encryption?
    • Design Patterns
    • Code Optimization Techniques
    • Unit Testing
    • Integration Testing
    • CI/CD: Continuous Integration and Continuous Delivery
    • Introduction to Modularity and Interfaces In System Design
    • Data Partitioning Techniques
    • Class Diagrams | UML

#### ➤ 𝗛𝗶𝗴𝗵 𝗟𝗲𝘃𝗲𝗹 𝗗𝗲𝘀𝗶𝗴𝗻 (𝗛𝗟𝗗)
    • What is High Level Design
    • Availability in System Design
    • Consistency in System Design
    • Reliability in System Design
    • CAP Theorem
    • Difference between Process and Thread
    • Difference between Concurrency and Parallelism
    • Load Balancer
    • Consistent Hashing
    • Content Delivery Network (CDN) in System Design
    • Caching in System Design
    • Cache Eviction Policies
    • Message Queues
    • Communication Protocols
    • Network Protocols and Proxies in System Design
    • Unified Modeling Language (UML)


## System Design Topics
[1] Observability, metrics, and control
- Distributed metrics logging and aggregation
- Collecting performance metrics from thousands of servers
- Monitoring health for a large compute cluster
- Designing a distributed tracing system
- Building a system to sort huge datasets across machines
- Control plane for a distributed database

[2] Streams, queues and live features
- Kafka style distributed stream processing
- Distributed queue service like RabbitMQ
- Surge pricing engine for ride sharing
- ETA and live location sharing between driver and rider
- Live comments system for a social app
- Showing live viewer count on a page

[3] Storage, sync and large files
- Key value store at scale
- Cloud file storage like Dropbox or Google Drive
- Photo sharing platform like Google Photos or Flickr
- Distributed file transfer like Bittorrent
- Reliable file downloader library
- Bulk data migration from on-prem to cloud

[4] Consumer apps, content and feeds
- Calendar application like Google Calendar
- User analytics dashboard and data pipeline
- Hotel booking system with availability, reservation and booking
- Weather application backend
- Marketplace feature inside a social app
- Ads management and serving for a social feed

[5] Money, commerce and pricing
- API rate limiter for public or paid APIs
- Price alert system for products or stocks
- Credit card processing engine
- Wire transfer API between banks
- Parts compatibility system for an ecommerce site
- Rider matching for a ride hailing or food delivery app

[6] Platform, auth and reliability
- Login and authentication system for web and mobile apps
- Distributed job scheduler for background tasks
- Notification system that works at global scale
- A/B testing platform for experiments
- On call escalation system for incidents
- IoC or dependency injection framework
- Counting and broadcasting likes for very high traffic users