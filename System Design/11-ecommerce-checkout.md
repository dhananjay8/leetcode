# Design an E-commerce Checkout System

## 1. Requirements

### Functional
- Add/remove items to cart, view cart
- Apply coupons/discounts
- Checkout: address, shipping, payment
- Order confirmation, tracking
- Inventory management

### Non-Functional
- Handle flash sales (100K concurrent checkouts)
- Prevent overselling (inventory consistency)
- Payment processing reliability

---

## 2. Architecture

```
Client → API Gateway → Cart Service → Inventory Service
                            ↓
                     Checkout Service → Payment Gateway
                            ↓                ↓
                     Order Service    Notification Service
                            ↓
                     Shipping Service
```

---

## 3. Key Flows

### Add to Cart
1. User adds item → Cart Service stores in Redis (session-based)
2. Soft reservation: Don't lock inventory yet
3. Cart persisted with TTL (e.g., 30 min expiry)

### Checkout Flow
1. User clicks "Checkout" → validate cart items still in stock
2. **Reserve inventory** (temporary hold with TTL)
3. Collect shipping address → calculate shipping cost
4. Apply coupons → calculate final price
5. Process payment via Payment Gateway
6. **Success**: Confirm inventory deduction, create order, send confirmation
7. **Failure**: Release inventory reservation

### Inventory Reservation (Preventing Overselling)
```
Option A: Pessimistic locking (SELECT FOR UPDATE)
Option B: Optimistic locking (version column)
Option C: Redis atomic decrement (DECRBY) with Lua script
```

---

## 4. Data Models

```
carts:          user_id, items[{product_id, quantity, price}], updated_at
orders:         id, user_id, items, total, status, shipping_address, created_at
order_items:    order_id, product_id, quantity, unit_price
inventory:      product_id, available_qty, reserved_qty
payments:       id, order_id, amount, status, provider_ref
```

---

## 5. Flash Sale Handling

- **Pre-warm**: Load inventory counts into Redis
- **Token queue**: Issue limited checkout tokens before sale starts
- **Rate limiting**: Throttle requests per user
- **Inventory**: Atomic Redis operations (Lua script for check-and-decrement)
- **Queue-based**: Place orders in queue, process sequentially

---

## 6. Interview Talking Points

- Inventory consistency is the hardest problem
- Cart: Redis for speed, DB for persistence
- Saga pattern: Payment → Inventory → Shipping (with rollback)
- Idempotent order creation to handle payment retries
- Event-driven architecture for order status updates
