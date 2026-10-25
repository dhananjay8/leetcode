# Python Core Language — Staff-Level Interview Notes

Covers: interpreter/compilation model, type system, built-in & custom data types, collections comparisons, slicing, comprehensions, lambdas, `*args`/`**kwargs`, generics, generators/iterators, exceptions, pickling, modules/packages, Python 2 vs 3.

---

## 1. Interpreted or Compiled?

**First response:** *"Compiled vs interpreted is a property of the **implementation**, not the language. CPython compiles `.py` source to **bytecode** (`.pyc`), then interprets that bytecode on the Python Virtual Machine — no linking, no native machine code. PyPy adds a JIT that compiles hot bytecode to machine code at runtime."*

- `.py` source → compiled to **bytecode** (intermediate, platform-independent instructions) → cached in `.pyc`/`__pycache__` → executed by the **PVM** (Python Virtual Machine).
- No separate link/load step — bytecode is handed straight to the PVM.
- Bytecode compilation is a real performance win over pure line-by-line interpretation; JIT (PyPy) pushes further toward ahead-of-time speeds.
- Projects like **Cython/Nuitka** compile Python subsets to C/C++ and then machine code, blurring the line entirely.

### Compilation pipeline (step-by-step)

```text
.py source
   │
   ├─ 1. Lexical analysis (scanning) → tokens (keywords, identifiers, literals, operators)
   ├─ 2. Syntax analysis (parsing)   → Abstract Syntax Tree (AST)
   ├─ 3. Bytecode compilation        → .pyc (platform-independent intermediate representation)
   ├─ 4. Interpreter execution       → PVM executes bytecode instruction by instruction
   ├─ 5. Dynamic typing + memory mgmt → types resolved at runtime; interpreter allocates/deallocates
   ├─ 6. Module imports              → imported modules go through the same pipeline, executed on first import
   └─ 7. Runtime + output            → expressions evaluated, functions called, output produced
```

**Interview nuance:** "Interpreted but has an underlying compilation mechanism" is the precise answer — Python *is* compiled, just to bytecode rather than native code upfront.

---

## 2. Type System Characteristics

| Property | Python's answer |
|---|---|
| Typedness | **Strongly typed** — no implicit type coercion (`"1" + 1` raises `TypeError`) |
| Checking time | **Dynamically typed** — types checked during execution, not at compile time |
| Variable model | Variables are **names bound to object references**, not typed containers |

---

## 3. Built-in Data Types

### Mutability

| Mutable | Immutable |
|---|---|
| `list`, `dict`, `set`, `bytearray` | `int`, `float`, `complex`, `str`, `tuple`, `frozenset`, `bytes`, `NoneType`, `bool` |

### Ordered vs unordered

| Ordered | Unordered |
|---|---|
| `str`, `list`, `tuple`, `range`, `bytes`, `bytearray`, `memoryview`, `dict` (insertion-ordered since **3.7**) | `set`, `frozenset` |

> **`dict` ordering caveat:** officially guaranteed insertion order from Python 3.7; before that it was unordered (3.6 had it as a CPython implementation detail only).

### Type catalog by category

| Category | Types | Purpose |
|---|---|---|
| Numeric | `int` (e.g. `42`, `-15`), `float` (`3.14`), `complex` | Math operations |
| Boolean | `bool` (`True`/`False`) | Truth values |
| Sequence | `str`, `list` (mutable), `tuple` (immutable) | Ordered data |
| Set | `set` (mutable), `frozenset` (immutable) | Unique-element collections, set ops |
| Mapping | `dict` | Key-value association |
| Binary | `bytes`, `bytearray`, `memoryview` | Raw data, memory-efficient ops |
| Special | `None` (`NoneType`) | Absence of value |

---

## 4. Custom Data Types

| Type | What it is | Example |
|---|---|---|
| **Class** | User-defined blueprint with attributes + methods | `class Person: ...` |
| **NamedTuple** | `tuple` subclass with named fields — lightweight record without methods | `Person = namedtuple('Person', ['name', 'age'])` |
| **Data class** | `@dataclass` (Python **3.7+**) — auto-generates `__init__`, `__repr__`, `__eq__` | `@dataclass class Person: name: str; age: int` |
| **Enum** | Symbolic names bound to unique constants — readability + safety | `enum.Enum`, `enum.IntEnum` |
| **Struct** | Simple attribute bag without methods — implemented via `namedtuple`/`dataclass` (or `struct` module for binary packing) | — |
| **ABC** | Cannot be instantiated; defines an interface subclasses must implement | `from abc import ABC, abstractmethod` |
| **Metaclass** | A class whose instances are *classes* — controls class creation itself | Custom class inheriting `type` |

```py
from collections import namedtuple
from dataclasses import dataclass

Person = namedtuple('Person', ['name', 'age'])
p = Person(name="John", age=30)          # p.name → "John"

@dataclass
class PersonDC:
    name: str
    age: int

from abc import ABC, abstractmethod
class Shape(ABC):
    @abstractmethod
    def area(self): ...
```

---

## 5. Array vs List

**Similarities:** both are collections; both indexable from 0; both *can* hold heterogeneous data (though `array` is designed for homogeneous).

| Dimension | `array.array` | `list` |
|---|---|---|
| Mutability | Mutable | Mutable |
| Memory | **More efficient** for large homogeneous numeric data — stores raw C values, not object pointers | Stores pointers to boxed objects → higher overhead |
| Functionality | Basic: `append`, `extend`, `insert`, `remove`, `pop` | Rich: `sort`, `reverse`, `+`, `*`, slicing, comprehensions |
| Import | `from array import array` — requires typecode | Built-in |
| Use case | Large numeric datasets, math ops | General-purpose dynamic storage |

---

## 6. List vs Tuple

**Similarities:** ordered; indexable (0-based, `-1` last); iterable; heterogeneous elements; support slicing; `len()`; `for` loops.

| Dimension | `list` | `tuple` |
|---|---|---|
| Mutability | Mutable — add/remove/change after creation | Immutable — fixed size and contents |
| Syntax | `[1, 2, 3]` | `(1, 2, 3)` — note `(1)` is an int; `(1,)` is a tuple |
| Performance | Slightly heavier/slower | More memory-efficient, faster to create/iterate |
| Use cases | Data that changes size/content | Fixed collections, coordinates, dict keys (hashable), function multi-return, data integrity |

```py
my_list = [10, 20, 30, 40, 50]
my_tuple = (1, 2, 3, 4, 5)

my_list[0]        # 10          # indexing
my_list[1:4]      # [20, 30, 40] # slicing works on both
my_tuple[0] = 100 # TypeError: 'tuple' object does not support item assignment
```

---

## 7. Slicing

**Syntax:** `sequence[start:stop:step]` — `start` inclusive, `stop` exclusive, `step` defaults to `1`.

```py
lst = [0,1,2,3,4,5,6,7,8,9]

lst[2:6]     # [2,3,4,5]      — positive indices, left→right
"Hello, World!"[-6:-1]   # "World" — negative indices, right→left
lst[:5]      # [0..4]         — omitted start = beginning
lst[5:]      # [5..9]         — omitted stop = end
lst[::2]     # [0,2,4,6,8]    — step of 2
"Hello, World!"[::-1]  # "!dlroW ,olleH" — negative step reverses
lst[8:15]    # [8,9]          — out-of-range clamps, never raises
lst[6:1:-1]  # [6,5,4,3,2]    — negative step counts down
```

**Rules:**
- Out-of-range `start`/`stop` → returns as many elements as possible (no `IndexError`).
- Negative `step` with both indices out of range → empty sequence.
- Slicing returns a **new** object — it never modifies the original sequence.

---

## 8. Comprehensions

Syntactic sugar for building altered/filtered `list`, `dict`, `set` (and generator expressions) from an existing iterable — replaces verbose loop+append code.

```py
[x*x for x in range(5)]                  # list
{k: v*2 for k, v in d.items()}           # dict
{w for w in words if len(w) > 3}         # set
(x*x for x in range(5))                  # generator expression — lazy
```

---

## 9. Lambda

`lambda arguments: expression` — anonymous single-expression function. Use for short throwaway functions passed to `map()`, `filter()`, `sorted(key=...)`; anything non-trivial deserves a named `def`.

```py
sorted(users, key=lambda u: u.age)
list(map(lambda x: x*2, [1,2,3]))        # [2,4,6]
list(filter(lambda x: x > 1, [1,2,3]))   # [2,3]
```

---

## 10. `*args` vs `**kwargs`

| | `*args` | `**kwargs` |
|---|---|---|
| Collects | Extra **positional** arguments | Extra **keyword** arguments |
| Captured as | `tuple` | `dict` |
| Iteration order | Positional order | No semantic ordering by meaning (dict preserves insertion order in 3.7+) |

```py
def example(a, b, *args, **kwargs):
    print(a, b)      # 1 2
    print(args)      # (3, 4, 5)
    print(kwargs)    # {'name': 'Alice', 'age': 30}

example(1, 2, 3, 4, 5, name="Alice", age=30)
```

Parameter order rule: `def f(a, b, *args, kw_only=..., **kwargs)`.

---

## 11. Generics & Duck Typing

- **Generics:** `typing.Generic`/`TypeVar` support added in **Python 3.5** (PEP 484). Python has no traditional compile-time generics — it gets flexibility through **duck typing** ("if it walks like a duck...").
- Type hints are **not enforced at runtime** by default; they're consumed by `mypy`, IDEs, and runtime validators like Pydantic.

```py
from typing import TypeVar, Generic, List
T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: List[T] = []
    def push(self, item: T) -> None:
        self._items.append(item)
```

---

## 12. Generators & Iterators

**First response:** *"A generator is a lazy iterator — `yield` produces one value at a time while preserving function state between calls, so memory stays O(1) regardless of sequence size."*

### Key characteristics

- **Lazy evaluation** — values produced on demand, not stored upfront → works on unbounded/large datasets.
- **State retention** — the function frame pauses at `yield` and resumes exactly there on the next `next()`.
- **Memory efficient** — one item in flight vs a fully materialized list.
- On exhaustion, `next()` raises **`StopIteration`**; `for` loops handle it automatically.

### Function vs Generator vs Iterator

| | Normal function | Generator function | Iterator |
|---|---|---|---|
| Returns | Full collection, computed upfront | `yield`s one value at a time, lazily | Object implementing `__iter__` + `__next__` |
| Memory | O(n) | O(1) | O(1) |
| State between calls | None | Saved at each `yield` | Tracked by the object itself |
| Use when | Single result / small data | Large/unknown-length sequences, pipelines | Custom iteration protocol needed |

```py
# Generator — stream a large file without loading it
def read_lines(filename):
    with open(filename) as f:
        for line in f:
            yield line.strip()

for line in read_lines('large_file.txt'):
    print(line)

# Custom iterator — the protocol generators implement for free
class NumberIterator:
    def __init__(self, start, end):
        self.current, self.end = start, end
    def __iter__(self):
        return self
    def __next__(self):
        if self.current > self.end:
            raise StopIteration
        self.current += 1
        return self.current - 1
```

**When to use generators:** large datasets (file/log streams), **data pipelines** (chained generators — each stage lazy), and any time you want on-demand computation.

---

## 13. Exceptions & Error Handling

- **Errors** (compile time) — syntax failures caught before execution. **Exceptions** — runtime failures.
- Structure: `try` (risky code) → `except` (handle) → **`else`** (runs only if *no* exception) → **`finally`** (always runs — cleanup).
- `raise` to throw custom/forced exceptions; `assert` for condition checks; custom exceptions subclass `Exception`.

```py
try:
    result = risky()
except SpecificError as e:          # catch specific types first
    handle(e)
else:
    use(result)                     # only if no exception
finally:
    cleanup()                       # always runs — close files, release locks
```

```text
BaseException
 ├─ SystemExit, KeyboardInterrupt, GeneratorExit   (don't catch these)
 └─ Exception                                      (catch from here down)
     ├─ ArithmeticError → ZeroDivisionError, OverflowError
     ├─ LookupError → KeyError, IndexError
     ├─ TypeError, ValueError, AttributeError, NameError
     ├─ OSError → FileNotFoundError, PermissionError, TimeoutError
     ├─ RuntimeError → RecursionError, NotImplementedError
     └─ StopIteration, StopAsyncIteration
```

- **Exception chaining:** `raise NewError(...) from e` sets `__cause__` explicitly; inside an `except` block an unhandled `raise` sets `__context__` implicitly.
- `except Exception` never catches `KeyboardInterrupt`/`SystemExit` — `except BaseException` does (almost never what you want).

**Staff nuance:** prefer catching specific exception types; `finally`/context managers for deterministic cleanup; never swallow exceptions silently; custom exceptions subclass `Exception`, never `BaseException`.

---

## 14. Python 2 vs 3

| Area | Python 2 | Python 3 |
|---|---|---|
| Division | `5/2 → 2` (int) | `5/2 → 2.5`, `//` for floor |
| print | `print x` statement | `print(x)` function |
| Strings | ASCII `str` + `unicode` type | `str` is Unicode by default; `bytes` separate |
| Range | `range` eager list, `xrange` lazy | `xrange` removed; `range` is lazy |
| Exceptions | `except E, e` | `except E as e` |
| Backport bridge | — | `__future__` imports (`from __future__ import print_function`) |

---

## 15. Pickling (Serialization)

- **`pickle.dump(obj, file)`** — serialize a Python object to a byte stream/file. **`pickle.load(file)`** — deserialize back.
- Tracks already-serialized objects (handles shared refs), portable across versions, compressible.
- **Security:** *never unpickle data from untrusted sources* — pickled payloads can execute arbitrary code on load. Prefer JSON/MessagePack for untrusted data.

---

## 16. Modules, Imports & the `__main__` Idiom

- **Module** — a `.py` file; `import` it in another file. **Package** — directory of modules with an **`__init__.py`** (can be empty or run init code); forms a hierarchical namespace (`pkg.sub.mod`).
- `import` executes the module **once**, caches it in `sys.modules` — later imports reuse the cached object (module-level singletons come free).
- `from x import name` binds `name` in the importing module's namespace — a **new reference** to the same object (why mocks must patch at the *consumer*).
- Circular imports → partially-initialized modules; fix via deferred/local imports or restructuring.

```py
if __name__ == "__main__":
    main()      # runs only when executed directly, not when imported
```

---

## 17. Function-Call Semantics

Staff-level argument-handling rules beyond `*args`/`**kwargs`:

- **Positional-only** — params before `/` can never be passed by keyword (PEP 570, 3.8+): `def f(a, b, /, c)` → `f(1, 2, c=3)` ok, `f(a=1)` fails.
- **Keyword-only** — params after bare `*` must be passed by name: `def f(a, *, timeout)` → `f(1, timeout=5)`.
- Full canonical signature: `def f(pos_only, /, normal, *args, kw_only, **kwargs)`.
- **Call-time unpacking:** `f(*items)` expands positional; `f(**d)` expands keywords — duplicate keys → `TypeError`.
- **Evaluation order:** defaults evaluated once at `def` time (the mutable-default trap — see Memory doc); argument *expressions* evaluated left-to-right at call time.

```py
def connect(host, /, port=5432, *, ssl=True, **opts): ...
connect("db", port=5433, ssl=False, pool=5)
```

---

## 18. Scoping, Closures & First-Class Functions

### LEGB resolution order

```text
Local → Enclosing → Global → Built-in     (first match wins)
```

- `global x` — write to module scope; `nonlocal x` — write to nearest enclosing function scope.
- **First-class functions:** functions are objects — assignable, passable, returnable, storable in data structures. Foundation for decorators/strategies.

### Closures

A closure captures variables from the enclosing scope — the function *remembers* them after the outer call returns.

```py
def counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = counter(); c(); c()   # 1, 2 — state persists via closure cell
```

**Late-binding trap (interview classic):**

```py
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]          # [2, 2, 2] — all bind to final i
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]          # [0, 1, 2] — default args bind at def time
```

---

## 19. Decorators

**First response:** *"A decorator is a callable that takes a function and returns a wrapped function — `@dec` is just `f = dec(f)` sugar. I always use `functools.wraps` to preserve name/docstring/signature."*

```py
import functools, time

def timed(fn):
    @functools.wraps(fn)            # preserves __name__, __doc__, signature
    def wrapper(*args, **kwargs):
        t = time.perf_counter()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__}: {time.perf_counter()-t:.3f}s")
        return result
    return wrapper

@timed
def work(): ...                    # work = timed(work)
```

**Parametrized decorator** — an extra layer: `def repeat(n): def dec(fn): ...` → `@repeat(3)` calls `repeat(3)` first, which returns the decorator.

```py
def repeat(n):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*a, **kw):
            return [fn(*a, **kw) for _ in range(n)]
        return wrapper
    return decorator
```

| Pattern | Shape |
|---|---|
| Simple | `@dec` → `f = dec(f)` |
| Parametrized | `@dec(arg)` → `f = dec(arg)(f)` |
| Stacked | `@a @b def f` → `f = a(b(f))` — bottom-up application, top-down at call time |
| Class decorator | Receives/returns a class — e.g., `@dataclass` |
| Stdlib examples | `@property`, `@staticmethod`, `@classmethod`, `@functools.lru_cache`, `@contextmanager` |

---

## 20. Context Managers (`with`)

`with` guarantees `__exit__` runs — deterministic cleanup for files, locks, sessions, connections.

```py
# Protocol
class Res:
    def __enter__(self):            # setup — return value bound to `as x`
        return self
    def __exit__(self, exc_type, exc, tb):
        self.close()
        return False                # truthy = suppress the exception

# Generator-based equivalent
from contextlib import contextmanager

@contextmanager
def session():
    s = open_session()              # code before yield = __enter__
    try:
        yield s
    finally:
        s.close()                   # code after yield = __exit__
```

| Tool | Use |
|---|---|
| `contextlib.contextmanager` | Generator-based CM — no class needed |
| `contextlib.suppress(E)` | Swallow specific exceptions cleanly |
| `contextlib.ExitStack` | Manage a dynamic number of contexts |
| `contextlib.closing` | Wrap objects with `close()` but no CM protocol |

`__exit__` runs even on exceptions — the deterministic alternative to `__del__` (see Memory doc §8).

---

## 21. Stdlib Power Toolkit

Interviewers probe `collections`/`itertools`/`functools` knowledge constantly.

| Tool | Use | Gotcha |
|---|---|---|
| `defaultdict(int)` | Auto-init missing keys | Creates key on access — watch for accidental inserts |
| `Counter` | Frequency counting; `most_common(n)` | Is a `dict` subclass |
| `deque` | O(1) append/pop **both ends**; `maxlen` for bounded | List pop(0) is O(n) — deque fixes that |
| `OrderedDict` | Explicit ordering + `move_to_end` | `dict` is ordered since 3.7 — OrderedDict adds reorder ops |
| `namedtuple` | Lightweight records | Immutable; prefer `@dataclass` when methods needed |
| `itertools.chain` | Flatten lazily | Lazy — single pass |
| `itertools.groupby` | Group consecutive equal keys | **Input must be sorted** by the key first |
| `itertools.islice` | Slice iterators/generators | Only lazy-sliceable way |
| `itertools.product`/`combinations`/`permutations`/`accumulate`/`pairwise` | Cartesian products, combinatorics, running totals | All lazy |
| `functools.lru_cache` / `@cache` | Memoization | Unbounded `@cache` can grow memory — bound it with `maxsize` |
| `functools.partial` | Freeze leading args | Creates new callable |
| `functools.reduce` | Fold to single value | Often a loop/comprehension reads better |
| `functools.singledispatch` | Function overloading by first-arg type | Register per type |
| `heapq` | Min-heap on a list — `heappush`/`heappop`/`nlargest` | Max-heap → push negated values |
| `bisect` | Binary search insertion point on sorted list | `bisect.insort` keeps it sorted |

```py
from collections import Counter, defaultdict, deque
Counter("mississippi").most_common(2)   # [('i', 4), ('s', 4)]
dd = defaultdict(list); dd["a"].append(1)  # no KeyError
```

---

## 22. Modern Syntax & Data Modeling

Staff interviews probe whether you write *current* Python.

### Structural pattern matching (`match`/`case`, 3.10+)

```py
match command.split():
    case [action]:                          # matches single-element list
        ...
    case [action, obj] if action == "go":   # guard with if
        ...
    case {"kind": "get", "key": k}:        # mapping pattern — binds k
        ...
    case Point(x=0, y=0):                   # class pattern — binds attrs
        ...
    case _:                                 # wildcard = default
        ...
```

- It's **structural** matching, not switch — patterns destructure sequences/mappings/classes and *bind* names.
- Bare names in patterns are **bindings**, not comparisons — use `case Color.RED:` (dotted) or guards for value checks.

### Walrus `:=` (3.8+) — assignment expressions

```py
if (m := re.match(r"\d+", s)):
    return m.group()
while (chunk := f.read(1024)):
    process(chunk)
[y for x in data if (y := f(x)) > 0]         # avoids calling f twice
```

### `@dataclass` — eliminate boilerplate

```py
from dataclasses import dataclass, field

@dataclass(order=True, frozen=True)          # eq+ordering generated; frozen = immutable
class Point:
    x: float
    y: float = 0.0
    tags: list = field(default_factory=list) # mutable defaults MUST use default_factory
```

| Option / helper | Effect |
|---|---|
| `frozen=True` | Immutable → hashable, can be dict keys |
| `order=True` | Generates `__lt__`/`__le__`/... from field order |
| `slots=True` (3.10+) | Adds `__slots__` — memory win |
| `field(default_factory=...)` | Required for mutable defaults |
| `field(compare=False)` | Exclude field from eq/order |
| `@dataclass` vs `namedtuple` vs `attrs` vs Pydantic | Mutable-class boilerplate vs immutable tuple vs full-featured lib vs validation-first |

### `Enum`

```py
from enum import Enum, IntEnum, StrEnum, Flag, auto

class Status(Enum):
    ACTIVE = auto()                          # auto-numbered
    CLOSED = auto()

Status.ACTIVE.name, Status.ACTIVE.value      # 'ACTIVE', 1
Status(1)                                    # lookup by value → Status.ACTIVE
```

`IntEnum`/`StrEnum` compare equal to their underlying values; `Flag`/`IntFlag` support bitwise combination — safer than magic ints/strings everywhere.

### f-strings worth knowing

```py
f"{n:,.2f}"       # 1,234.50 — formatting spec
f"{x=} "          # 'x=42' — self-documenting debug prints (3.8+)
f"{dt:%Y-%m-%d}"  # format codes work on any __format__
f"{'':*^{w}}"     # alignment: < > ^ with fill char
```

f-strings evaluate at runtime → embed any expression; `str.format` and `%` are legacy — prefer f-strings except in logging (lazy `%s` avoids eager interpolation).

---

## 23. Lifecycle View — Language Pitfalls in Production

| Stage | Concern | Concrete point |
|---|---|---|
| Design | Type safety | Type hints + `mypy` in CI; `dataclass`/`pydantic` for DTOs |
| Scale | Memory | Generators/streaming for large data; `array`/NumPy for numeric bulk |
| Secure | Deserialization | Never `pickle.load` untrusted bytes — arbitrary code execution |
| Fail | Error handling | Specific `except` types; `finally`/`with` for deterministic cleanup |
| Monitor | Perf hotspots | `cProfile`, `py-spy`; bytecode-level understanding helps reading profiles |
| Cost | Memory/CPU | Tuples/generators/`array` reduce footprint on hot paths |

---

## 24. Interview Sound Bites

- *"Python is compiled — to bytecode. The PVM interprets that; PyPy JIT-compiles it. 'Interpreted language' is shorthand for the CPython implementation."*
- *"Strongly typed + dynamically typed: no implicit coercion, but types are checked at runtime."*
- *"`dict` preserves insertion order guaranteed since 3.7 — an implementation detail in 3.6, a language spec after."*
- *"A generator is an iterator that remembers its frame — O(1) memory no matter how long the sequence."*
- *"Slicing always copies into a new object and never raises on out-of-range indices."*
- *"`*args` collects a tuple, `**kwargs` collects a dict — that's the entire difference."*
- *"Never unpickle untrusted data — it's code execution, not just deserialization."*
- *"Closures capture variables, not values — the late-binding `[lambda: i for i in ...]` trap is just that."*
- *"`@decorator` is `f = dec(f)` — nothing more. `functools.wraps` keeps the metadata honest."*
- *"`with` is deterministic cleanup; `__del__` is a suggestion."*
- *"LEGB: local, enclosing, global, built-in — and `nonlocal`/`global` exist to write outward."*
- *"Import caching in `sys.modules` makes every module a natural singleton."*
- *"`match` destructures and binds — a bare name in a pattern is a capture, not a comparison."*
- *"`@dataclass` writes my `__init__`/`__repr__`/`__eq__`; mutable defaults still need `field(default_factory=list)`."*
- *"f-strings everywhere except logging — `logger.info('%s', x)` stays lazy."*

---

## 25. Quick-Reference Table

| Question | Answer |
|---|---|
| Compiled or interpreted? | Implementation property; CPython = bytecode-compiled + interpreted by PVM |
| `.pyc` file | Cached bytecode — speeds up subsequent imports |
| Strongly or weakly typed? | Strongly — no implicit coercion |
| `dict` ordered? | Yes, insertion order — guaranteed 3.7+ |
| `array` vs `list` | Homogeneous numeric, memory-efficient vs general-purpose |
| `tuple` single element | `(1,)` — the comma is mandatory |
| Slice out of range | Returns what's available; never `IndexError` |
| Reverse a sequence | `seq[::-1]` |
| `*args` type | `tuple` |
| `**kwargs` type | `dict` |
| Positional-only params | `/` marker (3.8+); keyword-only via bare `*` |
| Generics added | Python 3.5 (`typing`, PEP 484) |
| Generator exhaustion | `StopIteration` |
| Scope lookup order | LEGB |
| Write to enclosing scope | `nonlocal`; module scope → `global` |
| Closure late-binding fix | Default arg `i=i` binds at def time |
| Preserve wrapped metadata | `functools.wraps` |
| Deterministic cleanup | `with` / `__enter__`/`__exit__` / `@contextmanager` |
| O(1) pops both ends | `collections.deque` |
| Count items | `collections.Counter.most_common` |
| Memoize a function | `functools.lru_cache` / `@cache` |
| Min-heap | `heapq` on a list |
| Module singleton | `sys.modules` caches first import |
| `else` in try/except | Runs only when no exception raised |
| Safe serialization of untrusted data | JSON/MessagePack — never `pickle` |
| Package marker file | `__init__.py` |
| Structural matching | `match`/`case` (3.10+) |
| Assign inside expression | Walrus `:=` (3.8+) |
| Boilerplate-free class | `@dataclass` (`frozen`/`order`/`slots`) |
| Named constants | `Enum`/`IntEnum`/`StrEnum`/`Flag` |
| Debug print values | `f"{var=}"` |
| Lazy logging interpolation | `logger.info("%s", x)` — not f-string |

---

## 26. Mental-Model Recap

```text
Source (.py)
   │ compile (lex → AST → bytecode)
   ▼
.pyc ──► PVM interprets bytecode  (CPython)  ──or──► JIT to machine code (PyPy)

Names ──► references ──► objects   (everything is an object; variables hold refs)

Mutability axis:  immutable (int,str,tuple,...)  vs  mutable (list,dict,set,...)
Laziness axis:    eager (list, return)           vs  lazy (generator, range, iterator)
```

Cross-references: mutability/copying traps → `Python-Memory-and-Object-Model.md`; class mechanics → `Python-OOP.md`; concurrency → `Python-Concurrency.md`; testing → `../Testing/Python-Testing-Flask-Asyncio.md`.
