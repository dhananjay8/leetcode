# Decorator Pattern

**Intent:** Attach additional responsibilities to an object dynamically without modifying its code.

**When to use:** Logging, caching, authentication middleware, input validation, rate limiting.

---

## JavaScript
```javascript
// Base function
function fetchData(url) { return `Data from ${url}`; }

// Decorators (higher-order functions)
function withLogging(fn) {
  return function (...args) {
    console.log(`Calling with args: ${args}`);
    const result = fn(...args);
    console.log(`Result: ${result}`);
    return result;
  };
}

function withCache(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) { console.log("Cache hit"); return cache.get(key); }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const enhancedFetch = withLogging(withCache(fetchData));
enhancedFetch("/api/users"); // logs + fetches
enhancedFetch("/api/users"); // logs + cache hit

// Express middleware is the decorator pattern:
// app.use(authenticate);  // decorates every route with auth
// app.use(rateLimit);     // decorates with rate limiting
```

## Python
```python
import functools, time

# Decorator: timing
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.3f}s")
        return result
    return wrapper

# Decorator: caching
def cache(func):
    memo = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args not in memo:
            memo[args] = func(*args)
        return memo[args]
    return wrapper

@timer
@cache
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(30)  # prints execution time, cached recursive calls
```

## Java
```java
interface Coffee { double cost(); String description(); }

class SimpleCoffee implements Coffee {
    public double cost() { return 2.0; }
    public String description() { return "Simple coffee"; }
}

// Decorator
class MilkDecorator implements Coffee {
    private final Coffee coffee;
    MilkDecorator(Coffee c) { this.coffee = c; }
    public double cost() { return coffee.cost() + 0.5; }
    public String description() { return coffee.description() + ", milk"; }
}

// Usage: Coffee c = new MilkDecorator(new SimpleCoffee());
```

## Interview Talking Points
- In JS/Python, decorators are **higher-order functions** (simpler than class-based)
- Python's `@decorator` syntax is built-in language support
- Express/Koa middleware chain IS the decorator pattern
- **vs Inheritance**: Decorators compose at runtime; inheritance is static
