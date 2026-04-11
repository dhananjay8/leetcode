# Design a Ride-Hailing System (Uber/Ola)

## 1. Requirements

### Functional
- Rider requests ride with pickup/dropoff locations
- Match rider with nearest available driver
- Real-time location tracking
- Fare estimation and payment
- Trip history, ratings

### Non-Functional
- Low latency matching (<5 seconds)
- Handle 1M+ concurrent rides
- Real-time location updates (every 3-4 seconds)
- High availability

---

## 2. High-Level Architecture

```
Rider App ←→ API Gateway ←→ Ride Service
Driver App ←→                    ↓
                    ┌────────────┼────────────┐
                    ↓            ↓            ↓
             Location Service  Matching    Payment
             (real-time GPS)   Service     Service
                    ↓            ↓
              Geospatial DB   Trip Store
              (Redis/QuadTree)
```

---

## 3. Core Components

### A. Location Service
- Drivers send GPS updates every 3-4 seconds
- Store in Redis with geospatial indexing: `GEOADD drivers longitude latitude driver_id`
- Query nearby drivers: `GEORADIUS drivers lng lat 5km`
- Alternative: QuadTree or Google S2 cells for spatial indexing

### B. Matching Service
1. Rider requests ride → get pickup location
2. Query Location Service for available drivers within radius
3. Rank by distance, rating, ETA
4. Send ride request to top driver
5. If declined/timeout → try next driver
6. Driver accepts → create trip, notify rider

### C. Fare Estimation
- Base fare + (rate per km × distance) + (rate per min × time)
- Surge pricing: demand/supply ratio per geospatial zone
- Pre-computed ETA using routing engine (OSRM/Google Maps API)

### D. Trip Lifecycle
```
REQUESTED → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → ARRIVED → 
TRIP_STARTED → IN_PROGRESS → COMPLETED → PAYMENT_PROCESSED
```

---

## 4. Data Models

```
trips:    id, rider_id, driver_id, pickup, dropoff, status, fare, started_at, ended_at
drivers:  id, name, vehicle, license, rating, status (available/busy/offline)
riders:   id, name, payment_methods, rating
locations: driver_id → (lat, lng, timestamp) [Redis geospatial]
```

---

## 5. Real-Time Location Tracking

- **Driver → Server**: WebSocket or MQTT for continuous updates
- **Server → Rider**: Push location updates via WebSocket
- Use Kafka to stream location events for analytics
- Geofencing for airport/zone-based pricing

---

## 6. Scaling

| Component | Strategy |
|-----------|----------|
| Location | Redis Cluster with geo commands, partitioned by city |
| Matching | Microservice per city/region |
| Trip data | Sharded DB by city or trip_id |
| Real-time | WebSocket servers behind load balancer |
| Maps/ETA | Cache common routes, use routing engine |

---

## 7. Interview Talking Points

- How to efficiently find nearby drivers (geospatial indexing)
- Surge pricing algorithm (supply-demand zones)
- Handling driver going offline mid-trip
- Consistency: what if two riders get same driver? (distributed locking)
- ETA prediction using historical data + real-time traffic
