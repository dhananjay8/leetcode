# Iterator Pattern

**Intent:** Provide a way to access elements of a collection sequentially without exposing its underlying representation.

**When to use:** You need a standard traversal interface across different collection types.

---

## JavaScript
```javascript
class NumberCollection {
  constructor(items) {
    this.items = items;
  }

  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

for (const n of new NumberCollection([10, 20, 30])) {
  console.log(n);
}
```

## Python
```python
class NumberCollection:
    def __init__(self, items):
        self.items = items

    def __iter__(self):
        for item in self.items:
            yield item

for value in NumberCollection([10, 20, 30]):
    print(value)
```

## Java
```java
import java.util.Iterator;
import java.util.List;

class NumberCollection implements Iterable<Integer> {
    private final List<Integer> items;
    NumberCollection(List<Integer> items) { this.items = items; }

    @Override
    public Iterator<Integer> iterator() {
        return items.iterator();
    }
}
```

## Interview Talking Points
- Hides internal data structure details.
- Supports multiple traversal strategies (forward, reverse, filtered).
- Often appears in language-level constructs (`for...of`, `for-each`).
- Useful for lazy traversal (streaming large datasets).
