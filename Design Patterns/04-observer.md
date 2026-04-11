# Observer Pattern (Pub/Sub)

**Intent:** Define a one-to-many dependency so that when one object changes state, all dependents are notified.

**When to use:** Event systems, UI updates, notifications, real-time data feeds, webhooks.

---

## JavaScript
```javascript
class EventEmitter {
  constructor() { this.listeners = {}; }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return this; // allow chaining
  }

  off(event, callback) {
    this.listeners[event] = (this.listeners[event] || []).filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    (this.listeners[event] || []).forEach(cb => cb(...args));
  }
}

// Usage
const emitter = new EventEmitter();
emitter.on("userSignup", (user) => console.log(`Welcome email to ${user.email}`));
emitter.on("userSignup", (user) => console.log(`Analytics: new user ${user.id}`));
emitter.emit("userSignup", { id: 1, email: "a@b.com" });
// "Welcome email to a@b.com"
// "Analytics: new user 1"

// Node.js built-in: const { EventEmitter } = require('events');
```

## Python
```python
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event, callback):
        self._listeners.setdefault(event, []).append(callback)

    def off(self, event, callback):
        self._listeners.get(event, []).remove(callback)

    def emit(self, event, *args, **kwargs):
        for cb in self._listeners.get(event, []):
            cb(*args, **kwargs)

emitter = EventEmitter()
emitter.on("order_placed", lambda order: print(f"Send receipt for order {order['id']}"))
emitter.emit("order_placed", {"id": 123, "total": 99.99})
```

## Java
```java
import java.util.*;
import java.util.function.Consumer;

public class EventEmitter<T> {
    private final Map<String, List<Consumer<T>>> listeners = new HashMap<>();

    public void on(String event, Consumer<T> callback) {
        listeners.computeIfAbsent(event, k -> new ArrayList<>()).add(callback);
    }

    public void emit(String event, T data) {
        listeners.getOrDefault(event, List.of()).forEach(cb -> cb.accept(data));
    }
}
```

## Interview Talking Points
- **Loose coupling**: Publisher doesn't know who subscribes
- Node.js `EventEmitter` is the built-in implementation
- **Memory leaks**: Always clean up listeners (`.off()`) to prevent leaks
- **Async variant**: Event queue with async processing (message brokers like Kafka)
- Related patterns: Mediator, Event Bus, Reactive Streams (RxJS)
