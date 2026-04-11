# Design a Stock Exchange / Trading System

## 1. Requirements
- Place buy/sell orders (limit and market orders)
- Match orders in real-time (matching engine)
- Price-time priority (best price first, then earliest)
- Handle millions of orders/sec with <1ms latency

## 2. Architecture
```
Trader → Gateway (validation, auth) → Sequencer (assign order IDs)
                                           ↓
                                    Matching Engine (per symbol)
                                           ↓
                              ┌─────────────┼──────────────┐
                              ↓             ↓              ↓
                         Trade DB    Market Data Feed   Clearing/Settlement
```

## 3. Matching Engine — The Core

### Order Book
- **Buy side (bids)**: Max-heap sorted by price (highest bid first)
- **Sell side (asks)**: Min-heap sorted by price (lowest ask first)
- Within same price: FIFO (first come, first served)

### Matching Algorithm
```
When new BUY order arrives:
  While buy_price >= lowest_ask AND buy_qty > 0:
    Match with best ask
    Create trade record
    Reduce quantities
  If remaining qty: add to buy order book

When new SELL order arrives:
  While sell_price <= highest_bid AND sell_qty > 0:
    Match with best bid
    Create trade record
  If remaining qty: add to sell order book
```

### Order Types
- **Limit**: Execute at specified price or better
- **Market**: Execute immediately at best available price
- **Stop-loss**: Triggered when price reaches threshold

## 4. Key Design Decisions
| Component | Choice |
|-----------|--------|
| Matching engine | Single-threaded per symbol (avoids locking) |
| Sequencer | Assigns monotonic order IDs (deterministic replay) |
| Storage | Event sourcing (log all events, rebuild state) |
| Market data | UDP multicast for low-latency price feeds |
| Resilience | Hot standby matching engine, replays event log |

## 5. Interview Talking Points
- **Single-threaded matching** per symbol is faster than multi-threaded (no lock contention)
- **Event sourcing**: Store every order/trade as immutable events, reconstruct state by replay
- **Colocation**: Traders place servers in same data center for nanosecond advantage
- **Circuit breakers**: Halt trading if price moves too fast (flash crash protection)
