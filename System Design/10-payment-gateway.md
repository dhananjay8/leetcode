# Design a Payment Gateway (Stripe/Razorpay)

## 1. Requirements

### Functional
- Process payments (credit card, UPI, wallet, bank transfer)
- Support refunds, recurring payments
- Merchant onboarding and dashboard
- Webhook notifications to merchants

### Non-Functional
- 99.999% availability (financial system)
- Exactly-once payment processing (idempotency)
- PCI DSS compliance, encryption at rest and in transit
- Low latency (<2 seconds for payment)

---

## 2. Payment Flow

```
1. Customer → Merchant App → Payment Gateway API (create payment intent)
2. Gateway → Tokenize card info (never store raw card)
3. Gateway → Acquirer Bank → Card Network (Visa/MC) → Issuing Bank
4. Response flows back: Issuing Bank → Card Network → Acquirer → Gateway → Merchant
5. Gateway sends webhook to merchant with payment status
```

---

## 3. Architecture

```
Merchant → API Gateway → Payment Service → Risk Engine (fraud check)
                              ↓                    ↓
                     Payment Router → Processor (Acquirer integration)
                              ↓
                     Ledger Service (double-entry bookkeeping)
                              ↓
                     Notification Service (webhooks)
```

---

## 4. Key Components

### Idempotency
- Every payment request includes `idempotency_key`
- Store in DB: if key exists, return cached response
- **Critical**: Prevents duplicate charges on retries

### Ledger (Double-Entry Bookkeeping)
```
Every transaction creates two entries:
  DEBIT:  customer_account  -$100
  CREDIT: merchant_account  +$100
  (minus fees)
```

### Reconciliation
- Daily batch job comparing: gateway records vs bank settlement files
- Flag discrepancies for manual review

---

## 5. Data Models

```
payments:      id, merchant_id, amount, currency, status, idempotency_key, created_at
payment_methods: id, customer_id, type, token (encrypted), last4, expiry
refunds:       id, payment_id, amount, status, reason
ledger_entries: id, payment_id, account, type (debit/credit), amount
webhooks:      id, merchant_id, event, payload, status, retry_count
```

---

## 6. Reliability & Fault Tolerance

| Challenge | Solution |
|-----------|----------|
| Duplicate payment | Idempotency keys |
| Bank timeout | Pending state → async polling/webhook from bank |
| System crash mid-payment | Saga pattern with compensating transactions |
| Data loss | Write-ahead log, multi-region replication |
| Fraud | ML-based risk scoring, velocity checks, 3D Secure |

---

## 7. Security (PCI DSS)

- **Tokenization**: Replace card numbers with tokens
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Key management**: HSM (Hardware Security Modules)
- **Access control**: Principle of least privilege, audit logs
- **Network segmentation**: Cardholder data in isolated network zone

---

## 8. Interview Talking Points

- Idempotency is the single most important concept
- Double-entry ledger for financial accuracy
- Saga pattern for distributed transactions (payment → inventory → shipping)
- Webhook retry with exponential backoff
- PCI DSS compliance requirements
- Reconciliation as a safety net
