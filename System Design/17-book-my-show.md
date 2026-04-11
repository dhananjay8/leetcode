# Design BookMyShow (Movie Ticket Booking)

## 1. Requirements
- Browse movies, theaters, showtimes
- Select seats from seat map, book tickets
- Payment processing, booking confirmation
- Handle concurrent bookings (prevent double-booking)

## 2. Architecture
```
Client → API Gateway → Movie/Theater Service → Catalog DB
                            ↓
                     Booking Service → Seat Lock (Redis) → Booking DB
                            ↓
                     Payment Service → Payment Gateway
```

## 3. Key Challenge: Seat Booking Concurrency

### Approach: Temporary Seat Lock
1. User selects seats → **lock seats in Redis** with TTL (10 min)
2. User proceeds to payment
3. **Payment success** → confirm booking in DB, release Redis lock
4. **Payment fails / timeout** → Redis lock expires, seats available again

### Redis Lock Implementation
```
SET seat:{show_id}:{seat_id} {user_id} EX 600 NX  # Lock for 10 min, only if not locked
```
- `NX`: Only set if key doesn't exist (atomic check-and-set)
- `EX 600`: Auto-expire after 10 minutes

## 4. Data Models
```
movies:    id, title, genre, duration, rating
theaters:  id, name, city, screens[]
shows:     id, movie_id, theater_id, screen_id, start_time, price
seats:     id, screen_id, row, number, type (regular/premium/vip)
bookings:  id, show_id, user_id, seats[], total_amount, status, booked_at
```

## 5. Scale
- **Read-heavy**: Cache movie listings, theater info, show schedules
- **Write-hot**: Seat booking concentrated during release window
- **DB sharding**: By city or theater
- **Queue**: For flash releases, use waiting room queue

## 6. Interview Talking Points
- Redis distributed lock for seat reservation is critical
- Optimistic vs pessimistic locking for concurrent bookings
- Waiting room pattern for high-demand events
- Idempotent payment processing
- Seat map rendering: pre-compute available seats per show
