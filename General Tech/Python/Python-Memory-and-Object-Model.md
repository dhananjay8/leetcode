# Python Memory & Object Model — Staff-Level Interview Notes

Covers: pass-by-object-reference, mutable vs immutable, identity vs equality, interning, assignment vs shallow vs deep copy, function arguments, mutable default trap, reference counting, cyclic GC, memory leaks, `del`, `id()`, `+=` semantics, list-multiplication trap, hashability, `is None`, weak references, `__del__`.

---

## 1. The One Rule That Answers Everything

**Pass-by-object-reference** (a.k.a. pass-by-assignment / call-by-object-sharing):

1. **Variables never contain objects — they contain references to objects.**
2. **Function parameters are new local variables that receive copies of those references.**
3. **Mutation affects the shared object; reassignment affects only the local variable.**

| Question | Answer |
|---|---|
| Is Python pass-by-value? | No |
| Is Python pass-by-reference? | No |
| What is the mechanism? | **Pass-by-object-reference** |
| What is copied on a call? | Only the object reference |
| Can a function mutate the caller's mutable object? | Yes — both names share the object |
| Can a function rebind the caller's variable? | No — rebinding is local only |
| Why don't ints/strings "change" | Immutable — every "modification" creates a new object |
| Does a call increase refcount? | Yes — the parameter is an extra reference for the call's duration |

```py
def test(lst):
    lst.append(10)      # mutates shared object — caller sees it

a = [1]; test(a); print(a)   # [1, 10]

def test2(lst):
    lst = []            # rebinds LOCAL name — caller unaffected
```

```text
Caller name ──┐
              ├──► [1, 10]      (one object, two references)
Parameter ────┘
```

**JavaScript comparison:** JS is strictly pass-by-value, but for objects the *value passed is the reference* — so objects behave like Python's shared-object model while primitives behave like Python's immutables. Same observable behavior, different terminology.

| Operation | Immutable (`int`, `str`, `tuple`, `float`, `bool`, `bytes`, `frozenset`) | Mutable (`list`, `dict`, `set`, custom objects) |
|---|---|---|
| Parameter passing | Reference copied | Reference copied |
| New object during call? | No | No |
| Modification possible? | No | Yes |
| `x += ...` | Creates a new object | Usually mutates in place (`list +=` mutates; `tuple +=` creates new) |
| Reassignment `x = ...` | Binds name to new object | Binds name to new object |
| Caller sees reassignment? | No | No |
| Caller sees in-place mutation? | N/A | **Yes** |

```py
first_name = "XYZ"
person = Person(first_name, "ABC")
first_name = "LMN"            # rebinds caller's name — person unaffected
person.last_name = "PQR"      # mutates shared object
print(person.first_name, person.last_name)   # "XYZ PQR"
```

---

## 2. Mutable vs Immutable

| Immutable — cannot change after creation | Mutable — modified in place |
|---|---|
| `int`, `float`, `bool`, `str`, `tuple`, `frozenset`, `bytes` | `list`, `dict`, `set`, `bytearray`, most custom objects |

**Q: Why is `str` immutable?** Every "modification" creates a new object:

```text
a = "hello"        a ──► "hello"
a += " world"      a ──► "hello world"     ("hello" now eligible for GC)
```

**Q: Why can a tuple contain a mutable list — and it still "works"?**

```py
t = (1, [2, 3])
t[1].append(4)      # works! → (1, [2, 3, 4])
```

The **tuple stores references**, and those references never change. The *list object* mutates; the tuple itself is untouched. Immutability is shallow — it protects the tuple's slots, not the objects they point to.

---

## 3. Identity vs Equality — `is` vs `==`

```py
a = [1, 2];  b = [1, 2]
a == b   # True  — same value (calls __eq__)
a is b   # False — different objects in memory
```

### The interning trap (interview favorite)

```py
a = 256;  b = 256;   a is b   # True  — CPython interns small ints (-5 to 256)
a = 1000; b = 1000;  a is b   # maybe False — large ints get separate objects

a = "hello"; b = "hello";          a is b   # often True — string literals interned
a = "".join(["he", "llo"])         # may be a different object
```

**Rule:** never compare values with `is`. Use `==` for value, `is` only for identity (`is None`, singleton checks).

### `id()`

`id(obj)` returns the object's identity — in CPython, its memory address. `id(a) == id(b)` ⇔ `a is b`. Useful for debugging "is this the same object?"

---

## 4. Assignment, Shallow Copy, Deep Copy

```py
a = [1, 2];  b = a            # NO copy — both names reference one list
b.append(3)                    # a is now [1, 2, 3]

import copy
a = [[1], [2]]
b = copy.copy(a)               # new outer list; inner lists SHARED
b[0].append(100)               # a → [[1, 100], [2]] — shared inner mutated

b = copy.deepcopy(a)           # fully independent recursive copy
```

```text
=          : name ──► same object
copy()     : new outer ──► same inner objects
deepcopy() : new outer ──► new inner objects (recursive)
```

| Operation | What happens |
|---|---|
| `=` | Copies the reference — same object |
| `copy.copy()` | New outer container, nested objects shared |
| `copy.deepcopy()` | Recursive copy — fully independent |

---

## 5. The Mutable Default Argument Trap (most-asked Python question)

```py
def add(item, lst=[]):
    lst.append(item)
    return lst

add(1)   # [1]
add(2)   # [1, 2]   ← same default list reused!
```

**Why:** default arguments are evaluated **once, at function definition time** — not per call. Every call shares that single list object.

**Fix:**

```py
def add(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

Tricky variant:

```py
def f(x=[]):
    x.append(len(x) + 1)
    return x
f(); f()   # [1] then [1, 2] — same shared default list
```

---

## 6. Other Classic Traps

### List multiplication trap

```py
a = [[]] * 3          # one inner list, three references to it
a[0].append(1)        # [[1], [1], [1]] — all three "rows" are the same list

a = [[] for _ in range(3)]   # correct — three independent lists
```

### `+=` behaves differently by type

```py
a = "abc";  a += "d"   # str: NEW object created — id() changes
a = [1];    a += [2]   # list: same object mutated — id() unchanged (uses __iadd__)
```

### `del` doesn't free memory

```py
a = [1]; b = a; del a   # object still alive — b still references it
```

`del` removes **one reference (the name)**. The object is freed only when its reference count hits zero.

### Why `is None` instead of `== None`

`None` is a **singleton** — identity comparison is the intended, reliable check. A class could override `__eq__` to claim equality with `None`; `is` can't be fooled.

---

## 7. Hashability & Dict Keys

- Dict/set keys must be **hashable** — stable `__hash__` + `__eq__` for the object's lifetime.
- Mutable objects have changing/unstable hashes → `list` can't be a key (`d[[1,2]] = 5` → `TypeError`).
- Immutable objects generally are hashable.

```py
(1, 2)      # hashable → valid dict key
([1], 2)    # NOT hashable — contains a list → TypeError
```

**Tuple hashability is conditional:** a tuple is hashable only if *all* its elements are.

### The `__eq__`/`__hash__` contract

- Objects that compare equal **must** have equal hashes — dict/set lookups depend on it.
- Defining `__eq__` without `__hash__` sets `__hash__ = None` → the class becomes **unhashable**. Fix: define both, or `frozen=True` dataclass which generates a consistent pair.
- Hash must be derived only from fields used in `__eq__` and must stay **stable for the object's lifetime** → mutable objects should not be hashable on mutable fields.

### Equality/identity traps worth a sound bite

```py
float('nan') == float('nan')     # False — NaN never equals itself (IEEE 754)
True == 1, False == 0            # True, True — bool is an int subclass
{True: 'a', 1: 'b'}              # {True: 'b'} — same key! hash(True) == hash(1)
[] == ()                         # False — different types, no coercion
```

---

## 8. CPython Memory Management

- All Python objects live in a **private heap** managed by the Python Memory Manager — not directly accessible to the programmer.
- Two reclamation mechanisms: **reference counting** (primary, immediate) + **cyclic garbage collector** (for cycles).
- Memory allocator (**`pymalloc`**) may keep freed blocks for reuse — memory is not always returned to the OS.

### pymalloc internals

```text
arena (256KB, from OS)
  └─ pools (4KB, one size-class each)
       └─ blocks (8B-aligned, ≤512B objects served here)
```

- Objects **≤ 512 bytes** come from pymalloc pools; larger requests fall through to `malloc`.
- Freed blocks return to the pool, not the OS → explains stable/high RSS after bulk deallocation.
- Arena fragmentation is why long-running services can hold more RSS than their live objects justify.

### Reference counting

```py
a = []        # refcount = 1
b = a         # refcount = 2
del a         # refcount = 1
del b         # refcount = 0 → memory freed immediately
```

### Cyclic garbage collection

Reference counting alone **cannot collect cycles**:

```py
a = A()
a.self = a    # self-cycle — refcount never reaches 0 even after `del a`
```

The **cyclic GC** periodically finds groups of objects that reference each other but are unreachable from roots, and reclaims them (generational: gen-0/1/2, thresholds tunable via `gc` module).

**GC internals worth knowing:**
- **Generational hypothesis** — most objects die young. New objects start in gen-0; survivors promote to gen-1/gen-2. Older generations are scanned less often.
- **Default thresholds:** gen-0 collection triggers every **700 net allocations** (allocations − deallocations); each gen-0 pass increments toward gen-1 (×10), then gen-2 (×10 again).
- `gc.collect()` forces a full collection; `gc.disable()`/`gc.isenabled()` for latency-sensitive paths; `gc.get_objects()` lists tracked objects (containers only — ints/strings aren't tracked).

### Memory leaks still happen

```py
cache = []
while True:
    cache.append(big_object())   # objects stay referenced — GC can't help
```

**Not every leak is a GC problem** — forgotten references (unbounded caches, global registries, observers never detached) keep objects alive legitimately.

### `__del__` finalizer

```py
class A:
    def __del__(self):
        print("Destroyed")
```

Called when the object is about to be finalized — but **don't rely on it** for critical cleanup: timing isn't guaranteed across implementations, and reference cycles complicate finalization. **Prefer `with` / context managers** for deterministic cleanup.

### Weak references

`weakref` module: a reference that **doesn't increase the reference count**. Use cases: caches (`WeakValueDictionary`), observer patterns, breaking reference cycles.

### Probing tools

| Tool | Reveals | Caveat |
|---|---|---|
| `sys.getsizeof(obj)` | Shallow byte size of one object | Doesn't count nested objects — use `asizeof`/deep walk |
| `sys.getrefcount(obj)` | Current refcount | Always **+1** — the argument itself is a temporary reference |
| `sys.intern(s)` | Force string interning | Useful for hot-path key comparisons via `is` |
| `tracemalloc` | Allocation traceback per site | The standard leak-hunting tool |
| `objgraph` | Reference-graph visualization | Finds what's holding a leaking object alive |
| `__slots__` | Replaces per-instance `__dict__` with fixed slots | Big memory win at ~millions of instances; no dynamic attrs without `__dict__` slot |

---

## 9. Lifecycle View — Memory in Production

| Stage | Concern | Concrete point |
|---|---|---|
| Design | Aliasing bugs | Default `None` + new object; avoid shared mutable defaults |
| Scale | Memory footprint | Generators/`array`/NumPy; stream instead of materializing lists |
| Secure | Object safety | `is None` for sentinel checks; never `pickle.load` untrusted bytes |
| Fail | Leak patterns | Unbounded caches, missing `close()`, ref cycles with `__del__` |
| Monitor | Memory growth | `tracemalloc`, `objgraph`, RSS trending; `gc.get_objects()` |
| Cost | Allocator behavior | `pymalloc` retains freed blocks — RSS won't always drop after `del` |

---

## 10. Senior-Level Tricky Questions

**Q: `=` vs `copy.copy()`?**
`=` adds another reference to the same object; `copy.copy()` creates a new outer object but shares nested objects; `copy.deepcopy()` copies recursively.

**Q: Why does `del obj` not free memory?**
`del` removes one reference. Deallocation only happens at refcount 0 — or later via the cyclic GC if the object is in a cycle.

**Q: Does Python return freed memory to the OS?**
Not necessarily — `pymalloc` keeps freed blocks in its pools for reuse, so process RSS can stay high after objects die.

**Q: How do refcounting and cyclic GC cooperate?**
Refcounting reclaims most objects instantly at zero; the cyclic GC periodically collects unreachable cycles refcounting can't see.

---

## 11. Interview Sound Bites

- *"Python passes the object reference by value — mutation is visible to the caller, reassignment never is."*
- *"`is` compares identity, `==` compares value — and interning means small ints and short literals often share identity by accident."*
- *"Default arguments are evaluated once at `def` time — that's the entire mutable-default trap."*
- *"Shallow copy copies the container; deep copy copies the graph."*
- *"Refcounting handles acyclic garbage instantly; the cyclic GC exists solely for cycles."*
- *"`del` deletes a name, not an object."*
- *"A tuple is immutable but its elements aren't — `(1, [2])` can still grow."*
- *"Hashable means stable hash for the object's lifetime — that's why lists can't be dict keys."*
- *"pymalloc serves small objects from pools — `del` frees the object, not necessarily the RSS."*
- *"`getrefcount` always over-reports by one — the argument is itself a reference."*
- *"`__slots__` trades dynamic attributes for a big per-instance memory win at scale."*
- *"Define `__eq__` alone and your class silently becomes unhashable — the contract is: equal objects, equal hashes."*
- *"`True == 1` collides as a dict key — `bool` is an `int` subclass, hash and all."*

---

## 12. Quick-Reference Table

| Question | Answer |
|---|---|
| Parameter passing | Pass-by-object-reference (reference copied) |
| `is` vs `==` | Identity vs value equality |
| Small-int cache | `-5` to `256` interned in CPython |
| Copy nested structures | `copy.deepcopy()` |
| Shared mutable default | Fix with `lst=None` + create inside |
| `[[]] * 3` | One inner list shared 3 times — use comprehension |
| `del x` | Removes one reference only |
| `id(x)` | Object identity (memory address in CPython) |
| Dict key requirement | Hashable (stable `__hash__` + `__eq__`) |
| `x is None` | Correct — `None` is a singleton |
| Cycles collected by | Cyclic GC (`gc` module), not refcounting |
| Leak despite GC | Still strongly referenced (caches, globals) |
| Non-owning reference | `weakref` — doesn't bump refcount |
| Deterministic cleanup | `with` / context manager, not `__del__` |
| Small-object allocator | `pymalloc` — arena → pool → block, ≤512B |
| GC trigger | gen-0 every 700 net allocations; ×10 promotion |
| Refcount probe | `sys.getrefcount` (returns true + 1) |
| Byte size | `sys.getsizeof` (shallow only) |
| Force interning | `sys.intern(s)` |
| Kill per-instance `__dict__` | `__slots__` |
| Leak hunting | `tracemalloc` + `objgraph` |
| `__eq__` without `__hash__` | Class becomes unhashable (`__hash__` = None) |
| Hash contract | Equal objects → equal hashes; stable for lifetime |
| `True` as dict key | Collides with `1` — `bool` subclasses `int` |

---

## 13. Mental-Model Recap

```text
Name ──ref──► Object (private heap)
                 │
                 ├─ refcount = # of strong references
                 ├─ refcount → 0  ⇒ immediate free (refcounting)
                 └─ in unreachable cycle ⇒ cyclic GC

Passing to a function = copying the ref (not the object)
  mutate  → caller sees it
  rebind  → caller unaffected

Copy ladder:  = (share)  →  copy() (new outer)  →  deepcopy() (new everything)
```

Cross-references: data-type catalog → `Python-Core-Language.md`; `__eq__`/`__hash__`/`__del__` definitions → `Python-OOP.md`; concurrency implications of shared mutable state → `Python-Concurrency.md`.
