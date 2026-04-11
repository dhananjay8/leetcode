# Design a Notification System (Email/SMS/Push)

## 1. Requirements

### Functional
- Send notifications via Email, SMS, and Push
- Support templates, scheduling, and user preferences
- Track delivery status and analytics

### Non-Functional
- At-least-once delivery guarantee
- Handle millions of notifications/day
- Low latency for real-time notifications

---

## 2. High-Level Architecture

```
Trigger Sources (Services/Cron) → Notification Service → Message Queues
                                                              ↓
                                              ┌───────────────┼───────────────┐
                                              ↓               ↓               ↓
                                        Email Worker    SMS Worker     Push Worker
                                              ↓               ↓               ↓
                                        SendGrid/SES    Twilio       FCM/APNs
```

---

## 3. Core Components

### A. Notification Service (API)
```
POST /api/notifications
{
  "user_id": "123",
  "type": "order_shipped",
  "channels": ["email", "push"],
  "data": { "order_id": "456", "tracking": "..." }
}
```

### B. User Preference Service
- Stores per-user channel preferences, quiet hours, opt-outs
- Check before sending: respect user's notification settings

### C. Template Service
- Pre-defined templates with variable substitution
- Supports i18n/localization

### D. Message Queues (Kafka/SQS)
- Separate queue per channel (email_queue, sms_queue, push_queue)
- Enables retry, back-pressure, and independent scaling

### E. Channel Workers
- Consume from respective queues
- Call third-party providers (SendGrid, Twilio, FCM)
- Handle retries with exponential backoff

---

## 4. Database Design

```
notifications:     id, user_id, type, channel, status, created_at, sent_at
templates:         id, type, channel, subject, body, variables
user_preferences:  user_id, channel, enabled, quiet_start, quiet_end
delivery_log:      id, notification_id, provider, status, error, timestamp
```

---

## 5. Reliability & Delivery Guarantees

- **Idempotency**: Use notification_id to deduplicate
- **Retry with backoff**: 1s → 5s → 30s → 5min (max 3-5 retries)
- **Dead Letter Queue (DLQ)**: Failed after all retries → DLQ for manual review
- **Rate limiting**: Per-provider rate limits (e.g., SES 100 emails/sec)
- **Circuit breaker**: If provider is down, stop sending, switch to backup

---

## 6. Scaling Strategies

- **Horizontal scaling**: Add more workers per channel
- **Priority queues**: Urgent (OTP, password reset) vs batch (marketing)
- **Batching**: Group emails for batch send (marketing campaigns)
- **Fan-out**: One event → multiple notifications (message queue fan-out)

---

## 7. Interview Talking Points

- Decouple notification logic from business logic via events/queues
- Always check user preferences before sending
- Monitoring: track delivery rates, bounce rates, latency per provider
- Multi-provider failover for each channel
- Analytics: open rates, click rates, unsubscribe rates
