# Builder Pattern

**Intent:** Construct complex objects step-by-step. Separate construction from representation.

**When to use:** Objects with many optional params, query builders, config objects, HTTP request builders.

---

## JavaScript
```javascript
class QueryBuilder {
  constructor() { this._table = ""; this._conditions = []; this._limit = null; this._orderBy = null; }

  from(table) { this._table = table; return this; }
  where(condition) { this._conditions.push(condition); return this; }
  limit(n) { this._limit = n; return this; }
  orderBy(col, dir = "ASC") { this._orderBy = `${col} ${dir}`; return this; }

  build() {
    let sql = `SELECT * FROM ${this._table}`;
    if (this._conditions.length) sql += ` WHERE ${this._conditions.join(" AND ")}`;
    if (this._orderBy) sql += ` ORDER BY ${this._orderBy}`;
    if (this._limit) sql += ` LIMIT ${this._limit}`;
    return sql;
  }
}

const query = new QueryBuilder()
  .from("users")
  .where("age > 18")
  .where("active = true")
  .orderBy("name")
  .limit(10)
  .build();
// "SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name ASC LIMIT 10"
```

## Python
```python
class QueryBuilder:
    def __init__(self):
        self._table = ""
        self._conditions = []
        self._limit = None

    def from_table(self, table):
        self._table = table
        return self

    def where(self, condition):
        self._conditions.append(condition)
        return self

    def limit(self, n):
        self._limit = n
        return self

    def build(self):
        sql = f"SELECT * FROM {self._table}"
        if self._conditions:
            sql += f" WHERE {' AND '.join(self._conditions)}"
        if self._limit:
            sql += f" LIMIT {self._limit}"
        return sql

query = QueryBuilder().from_table("users").where("age > 18").limit(10).build()
```

## Java
```java
public class User {
    private final String name;
    private final int age;
    private final String email;

    private User(Builder builder) {
        this.name = builder.name; this.age = builder.age; this.email = builder.email;
    }

    public static class Builder {
        private String name;
        private int age;
        private String email;

        public Builder name(String name) { this.name = name; return this; }
        public Builder age(int age) { this.age = age; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public User build() { return new User(this); }
    }
}

User user = new User.Builder().name("Alice").age(30).email("a@b.com").build();
```

## Interview Talking Points
- **Method chaining** (fluent API) is the hallmark of Builder
- Solves the "telescoping constructor" problem (too many params)
- Immutable objects: Builder collects params, `build()` creates the final immutable object
- Real-world: StringBuilder, ORM query builders, HTTP client builders
