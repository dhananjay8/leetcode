# Proxy Pattern

**Intent:** Provide a surrogate or placeholder to control access to another object.

**When to use:** Lazy loading, access control, logging, caching, rate limiting, virtual proxies.

---

## JavaScript
```javascript
// Using ES6 Proxy (built-in!)
const user = { name: "Alice", _password: "secret123", role: "admin" };

const secureUser = new Proxy(user, {
  get(target, prop) {
    if (prop.startsWith("_")) throw new Error("Access denied to private field");
    console.log(`Accessing: ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    if (prop === "role") throw new Error("Cannot modify role");
    target[prop] = value;
    return true;
  }
});

console.log(secureUser.name);      // "Alice" (logged)
// secureUser._password;            // Error: Access denied
// secureUser.role = "user";        // Error: Cannot modify role

// Caching proxy
function createCachingProxy(fn) {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (!cache.has(key)) cache.set(key, target.apply(thisArg, args));
      return cache.get(key);
    }
  });
}
```

## Python
```python
class DatabaseProxy:
    """Lazy-loading proxy — only connects when first query is made."""
    def __init__(self, connection_string):
        self._connection_string = connection_string
        self._db = None  # lazy

    def _connect(self):
        if self._db is None:
            print("Connecting to database...")
            self._db = f"Connection({self._connection_string})"

    def query(self, sql):
        self._connect()  # connect only on first use
        return f"Executing on {self._db}: {sql}"

db = DatabaseProxy("postgres://localhost/mydb")
# No connection yet
print(db.query("SELECT * FROM users"))  # NOW it connects
```

## Java
```java
interface Image { void display(); }

class RealImage implements Image {
    private String filename;
    RealImage(String f) { this.filename = f; loadFromDisk(); }
    private void loadFromDisk() { System.out.println("Loading " + filename); }
    public void display() { System.out.println("Displaying " + filename); }
}

// Virtual Proxy — delays loading until display() is called
class ProxyImage implements Image {
    private String filename;
    private RealImage realImage;
    ProxyImage(String f) { this.filename = f; }
    public void display() {
        if (realImage == null) realImage = new RealImage(filename);
        realImage.display();
    }
}
```

## Interview Talking Points
- **JS Proxy** is a language-level feature — extremely powerful for meta-programming
- Types: Virtual (lazy load), Protection (access control), Caching, Logging
- Real-world: Vue.js reactivity (Proxy), Hibernate lazy loading, API gateways
- **vs Decorator**: Proxy controls access; Decorator adds behavior
