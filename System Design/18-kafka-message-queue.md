# How Kafka / Message Queues Work

## 1. What is Kafka?
A distributed event streaming platform. Producers publish messages to **topics**, consumers subscribe and process them. Key for decoupling microservices.

## 2. Core Concepts
| Concept | Description |
|---------|-------------|
| **Topic** | Named stream/category of messages |
| **Partition** | Topic split into ordered, immutable logs. Enables parallelism |
| **Producer** | Publishes messages to topics |
| **Consumer** | Reads messages from topics |
| **Consumer Group** | Set of consumers sharing workload; each partition read by one consumer in the group |
| **Broker** | A Kafka server that stores data and serves clients |
| **Offset** | Position of a message within a partition (consumer tracks its offset) |
| **Replication** | Each partition replicated across brokers for fault tolerance |

## 3. Architecture
```
Producer → Broker Cluster (partitioned topics with replicas) → Consumer Groups
                          ↓
                    ZooKeeper / KRaft (metadata & leader election)
```

## 4. Message Ordering & Delivery Guarantees
- **Ordering**: Guaranteed within a partition (not across partitions)
- **At-most-once**: Consumer commits offset before processing (may lose messages)
- **At-least-once**: Consumer commits after processing (may duplicate — use idempotent consumers)
- **Exactly-once**: Kafka transactions (producer + consumer in same transaction)

## 5. When to Use Kafka
- Event-driven microservice communication
- Log aggregation and streaming
- Real-time analytics pipelines
- Change Data Capture (CDC) from databases
- Buffering between fast producers and slow consumers

## 6. Kafka vs Traditional Message Queues
| Feature | Kafka | RabbitMQ/SQS |
|---------|-------|--------------|
| Model | Log-based (pub/sub) | Queue-based (point-to-point) |
| Retention | Keeps messages after consumption | Deletes after consumption |
| Throughput | Very high (millions/sec) | Moderate |
| Replay | Yes (consumers can re-read) | No |
| Ordering | Per-partition | Per-queue |

## 7. Interview Talking Points
- Partitioning key determines which partition a message goes to (consistent hashing)
- Consumer groups enable horizontal scaling of consumers
- Log compaction: keep only latest value per key
- Backpressure: consumers read at their own pace
