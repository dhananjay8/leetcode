# Python OOP & Design — Staff-Level Interview Notes

Covers: classes/objects, the four pillars, `self`/`cls`/`__init__`/`__new__`, encapsulation & name mangling, inheritance & `super`, dunder methods, properties, method types, composition/aggregation/association, coupling/cohesion, SOLID, mixins, design patterns.

---

## 1. Core Vocabulary

- **Class** — blueprint for creating objects. **Object** — an instance of a class.
- **Attributes** — variables bound to a class (`class` attributes shared; `instance` attributes per-object).
- **Methods** — functions defined inside a class.

```py
class MyClass:
    def __init__(self, name):          # constructor — initializes instance state
        self.name = name               # instance attribute
    def greet(self):
        return f"Hello, {self.name}!"

obj = MyClass("Alice")                 # object instantiation → __init__ runs
obj.greet()                            # "Hello, Alice!"
```

```py
class Person:
    species = "Human"                  # class attribute — shared by all instances
    def __init__(self, name):
        self.name = name               # instance attribute — per-object
```

### `__init__` semantics

- Called **automatically** on instantiation; sets up initial object state.
- It is technically an **initializer** — the object already exists (created by `__new__`).

### `self` keyword

- **Not a reserved keyword — a convention.** Python implicitly passes the instance as the first argument to instance methods; `self` is just the conventional name.
- `self` binds attributes to the instance and gives methods access to instance state.

```py
class Person:
    def __init__(self, name, age):
        self.name = name; self.age = age
    def say_hello(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
```

### `self` vs `cls`

| | `self` | `cls` |
|---|---|---|
| Holds | Reference to the **current instance** | Reference to the **class** |
| Passed to | Instance methods (default) | `@classmethod` methods |
| Can access | Instance + class attributes | Class attributes only — **not instance data** |
| Renamable? | Yes — convention only | Yes — convention only |

```py
class MyClass:
    cvar = "class variable"
    def __init__(self):
        self.ivar = "instance variable"

    @classmethod
    def display_using_cls(cls):
        print(cls.cvar)
        # print(cls.ivar)   # AttributeError — cls can't see instance data

    def display_using_self(self):
        print(self.cvar)    # instance methods reach class attrs too
        print(self.ivar)

    def self_contains_cls(self):
        print(self.__class__)   # <class '__main__.MyClass'> — self contains cls; not vice versa
```

### JS `this` vs Python `self`/`__init__`

| | JavaScript `this` | Python `self` / `__init__` |
|---|---|---|
| Role | Current object reference inside functions/constructors | Instance reference; `__init__` is the initializer |
| Syntax | Keyword | Explicit first parameter, conventionally `self` |
| Invocation | `this` bound **dynamically at call time** — changes with call context (`new`, `call`, `apply`, arrow functions capture lexical `this`) | Bound automatically at instantiation; no dynamic rebinding |
| Constructor | Constructor functions use `this` to set properties | `__init__` sets attributes; called implicitly |

---

## 2. The Four Pillars

```text
Encapsulation ── hide internals, control access (_x, __x, @property)
Inheritance   ── derive new classes from existing ones
Polymorphism  ── same interface, different behavior per object
Abstraction   ── declare contracts, hide implementation (abc module)
```

### 2.1 Encapsulation

- Restrict access to methods/variables; private members via `_` (convention) or `__` (name mangling) prefixes.

```py
class Car:
    def __init__(self, brand):
        self.__brand = brand              # pseudo-private
    def get_brand(self):                  # getter
        return self.__brand
    def set_brand(self, brand):           # setter
        self.__brand = brand
```

**Name mangling:** attributes starting with `__` are rewritten to `_ClassName__attr` — discourages accidental external access and avoids subclass name collisions. **Not true privacy.**

```py
class MyClass:
    def __init__(self):
        self.__private_attr = 42

obj = MyClass()
obj._MyClass__private_attr   # 42  — accessible via mangled name
obj.__private_attr           # AttributeError
```

### 2.2 Inheritance

Derive a new class from an existing one; child gets parent's attributes/methods and can override.

```py
class Animal:
    def speak(self): return "I make a sound"

class Dog(Animal):                       # inherits Animal
    def speak(self): return "Bark!"      # override

Dog().speak()                            # "Bark!"
```

### 2.3 Polymorphism

Same method name, different behavior per object type — duck typing in action.

```py
class Cat:
    def speak(self): return "Meow!"

for animal in [Dog(), Cat()]:
    print(animal.speak())                # Bark! Meow!
```

### 2.4 Abstraction

- Abstract methods are declared, not implemented; enforced via `abc.ABC` + `@abstractmethod`.
- ABCs **cannot be instantiated** — they exist as interface contracts for subclasses.

```py
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self): ...

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width, self.height = width, height
    def area(self):
        return self.width * self.height
```

---

## 3. Inheritance Deep Dive — `super()` and MRO

```py
class Animal:
    def __init__(self, species):
        self.species = species
    def make_sound(self): return "Generic animal sound"

class Dog(Animal):
    def __init__(self, breed, species):
        super().__init__(species)        # call parent initializer
        self.breed = breed
    def make_sound(self): return "Woof!" # override
```

| | Python `super()` | JavaScript `super` |
|---|---|---|
| Use context | Any method — calls parent class methods; enables cooperative multiple inheritance | Primarily constructors/method overrides in ES6 classes |
| Invocation | `super()` → next class in **MRO**; classic form `super(SubClass, self)` | `super(...)` — no arguments |
| Multiple inheritance | Yes — resolved via MRO (C3 linearization) | No — single prototype chain |

**MRO:** `ClassName.__mro__` shows the linearized lookup order — critical when designing multiple-inheritance/mixin hierarchies.

---

## 4. Method Types — Instance vs Class vs Static

```py
class MyClass:
    class_attr = 10                              # shared across instances

    def instance_method(self):                   # gets self — instance state
        return self.value

    @classmethod
    def class_method(cls):                       # gets cls — class-level ops
        cls.class_attr = 20                      # CAN modify class state
        return cls.class_attr

    @staticmethod
    def static_method():                         # no implicit first arg
        return MyClass.class_attr                # must name the class explicitly
```

| | Instance method | `@classmethod` | `@staticmethod` |
|---|---|---|---|
| First arg | `self` (instance) | `cls` (class) | none |
| Decorator | none | `@classmethod` | `@staticmethod` |
| Class-attr access | via `self` | via `cls` — can mutate class state | only via explicit class name |
| Inheritance behavior | normal override | **receives the subclass as `cls`** — polymorphic | override works but gets **no class ref** — hardcoded class names stay fixed |
| Typical use | Per-object behavior | **Alternative constructors** (`from_diameter`), class-level factories/registries | Utility functions namespaced under a class |

```py
class Parent:
    class_attr = 10
    @classmethod
    def class_method(cls): return cls.class_attr
    @staticmethod
    def static_method():   return Parent.class_attr   # hardcoded — stays 10

class Child(Parent):
    class_attr = 20

Child.class_method()     # 20 — cls binds to Child
Child.static_method()    # 10 — no cls; Parent.class_attr is fixed

import math
class Circle:
    def __init__(self, radius): self.radius = radius
    @classmethod
    def from_diameter(cls, diameter):            # alternative constructor
        return cls(diameter / 2)
    @staticmethod
    def circumference(radius):                   # namespaced utility
        return 2 * math.pi * radius
```

---

## 5. Dunder / Special Methods Reference

Dunders define behavior for built-in operations — operator overloading, protocols, construction.

| Method | Trigger | Purpose |
|---|---|---|
| `__new__(cls, *args, **kwargs)` | Before `__init__` — instance creation | Custom object creation; immutable types, singletons, metaclasses |
| `__init__(self, *args, **kwargs)` | After `__new__` | Initialize instance attributes |
| `__repr__(self)` | `repr()`, REPL echo | Unambiguous dev-facing string (aim: `eval`-able) |
| `__str__(self)` | `str()`, `print()` | Human-readable string |
| `__getattr__(self, name)` | Missing attribute access | Custom fallback for unknown attributes |
| `__setattr__(self, name, value)` | Any attribute assignment | Intercept/validate attribute writes |
| `__delattr__(self, name)` | `del obj.attr` | Custom attribute deletion |
| `__getitem__(self, key)` | `obj[key]` | Container-style access |
| `__setitem__(self, key, value)` | `obj[key] = v` | Container-style assignment |
| `__delitem__(self, key)` | `del obj[key]` | Container-style deletion |
| `__len__(self)` | `len(obj)` | Custom length |
| `__call__(self, *args, **kwargs)` | `obj()` | Make instances callable like functions |
| `__add__`, `__eq__`, `__lt__`, ... | `+`, `==`, `<`, ... | Operator overloading |
| `__enter__`/`__exit__` | `with` statement | Context-manager protocol |
| `__iter__`/`__next__` | `for`, `next()` | Iterator protocol |

```py
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

p3 = Point(1, 2) + Point(3, 4)     # uses __add__
```

### `__new__` — Singleton

```py
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

Singleton() is Singleton()          # True
```

`__new__` is uncommon in day-to-day code — reserve it for singletons, immutable-object construction, and metaclasses; prefer `__init__` for ordinary initialization.

---

## 6. Properties

`@property` exposes method logic behind attribute syntax — validation/computation without changing the call site.

```py
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):                      # getter
        return self._radius

    @radius.setter
    def radius(self, value):               # setter with validation
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value
```

---

## 7. Composition vs Aggregation vs Association

| | Association | Aggregation | Composition |
|---|---|---|---|
| Coupling | Loosest — mere relationship | Weak "has-a" | Strong "has-a" (owns the part) |
| Ownership / lifecycle | None — both independent | Container references parts; parts **outlive** container | Container **owns** parts; destroying container destroys parts |
| Multiplicity | 1:1, 1:N, N:N | typically 1:N (can be any) | typically 1:1 or 1:N |
| Example | `Book ↔ Author` | `Department → Employee` (employee survives dept) | `Car → Engine` (engine dies with car) |

```py
# Association — no ownership
author1 = Author("John Doe")
book1 = Book("Python Programming", author1)     # Book merely references Author

# Aggregation — parts exist independently, can be shared
dept = Department("IT")
emp1 = Employee("John Doe", dept)               # employees outlive the department
emp2 = Employee("Jane Smith", dept)

# Composition — part lifecycle owned by container
class Car:
    def __init__(self):
        self.engine = Engine()                  # created & owned inside Car
    def start_car(self):
        self.engine.start()
```

**Rule of thumb:** prefer **composition over inheritance** — favor assembling behavior from owned parts over deep class hierarchies.

---

## 8. Coupling & Cohesion

**Coupling** — degree of *interdependence between modules*. **Cohesion** — degree to which elements *inside a module* belong together. Goal: **low coupling, high cohesion.**

### Coupling levels

| Level | Verdict | Description |
|---|---|---|
| Low | Good | Modules know nothing of each other; communication via well-defined interfaces |
| Medium | Moderate | Interact through abstractions; some knowledge of internals |
| High | Bad | Direct knowledge of each other's internals — change ripples everywhere |

### Cohesion levels (best → worst)

| Level | Verdict | Description |
|---|---|---|
| Functional | Good | All elements serve one well-defined purpose |
| Sequential | Moderate | Elements related by execution order |
| Communicational | Moderate | Elements operate on the same data, different operations |
| Procedural | Weak | Grouped by sequence but do unrelated tasks |
| Temporal | Weak | Grouped because they run at the same time (e.g., "startup stuff") |
| Logical | Weakest | Related only by a common theme — unrelated tasks bundled |

---

## 9. SOLID Principles — Python Examples

| Principle | Meaning |
|---|---|
| **S — SRP** | One class → one responsibility → one reason to change |
| **O — OCP** | Open for extension, closed for modification — extend via new classes, don't edit tested code |
| **L — LSP** | A subclass must be substitutable for its parent without breaking correctness |
| **I — ISP** | Many small interfaces over one fat interface — don't force unused methods |
| **D — DIP** | Depend on abstractions; inject dependencies rather than constructing them |

### SRP — Single Responsibility

```py
# BAD — three responsibilities in one class
class ReportGenerator:
    def generate_report(self): ...
    def save_to_database(self): ...
    def send_email(self): ...

# GOOD — one responsibility each
class ReportGenerator:
    def generate_report(self): ...
class ReportRepository:
    def save(self, report): ...
class EmailService:
    def send(self, report): ...
```

### OCP — Open/Closed

```py
# BAD — must edit the class for every new payment type
class PaymentProcessor:
    def process(self, payment_type):
        if payment_type == "credit": ...
        elif payment_type == "paypal": ...

# GOOD — new method = new class; processor untouched
class PaymentMethod(ABC):
    @abstractmethod
    def pay(self): ...
class CreditCard(PaymentMethod):
    def pay(self): print("Credit Card")
class PayPal(PaymentMethod):
    def pay(self): print("PayPal")
class UPI(PaymentMethod):
    def pay(self): print("UPI")

class PaymentProcessor:
    def process(self, payment: PaymentMethod):
        payment.pay()
```

### LSP — Liskov Substitution

```py
# BAD — Penguin breaks the Bird contract
class Bird:
    def fly(self): print("Flying")
class Penguin(Bird):
    def fly(self): raise Exception("Penguins can't fly")

# GOOD — only flying birds inherit fly()
class Bird(ABC): ...
class FlyingBird(Bird):
    def fly(self): print("Flying")
class Sparrow(FlyingBird): ...
class Penguin(Bird):
    def swim(self): print("Swimming")
```

### ISP — Interface Segregation

```py
# BAD — BasicPrinter forced to implement scan()
class Machine(ABC):
    @abstractmethod
    def print(self): ...
    @abstractmethod
    def scan(self): ...
class BasicPrinter(Machine):
    def print(self): print("Printing")
    def scan(self):  raise Exception("Not Supported")

# GOOD — split into focused interfaces
class Printer(ABC):
    @abstractmethod
    def print(self): ...
class Scanner(ABC):
    @abstractmethod
    def scan(self): ...
class BasicPrinter(Printer):
    def print(self): print("Printing")
class MultiFunctionPrinter(Printer, Scanner):
    def print(self): print("Printing")
    def scan(self):  print("Scanning")
```

### DIP — Dependency Inversion

```py
# BAD — hardcoded dependency constructed inside
class ReportGenerator:
    def __init__(self):
        self.database = Database()               # tightly coupled

# GOOD — depend on abstraction; inject the implementation
class DataSource(ABC):
    @abstractmethod
    def fetch_data(self): ...
class Database(DataSource):
    def fetch_data(self): return "Database Data"
class API(DataSource):
    def fetch_data(self): return "API Data"

class ReportGenerator:
    def __init__(self, datasource: DataSource):  # injected
        self.datasource = datasource
    def generate(self):
        print(self.datasource.fetch_data())

report = ReportGenerator(Database())             # works with any DataSource
```

---

## 10. Mixins

- A **mixin** is a small class providing a focused, reusable behavior, intended to be composed via **multiple inheritance** — never instantiated alone.
- Promotes **composition over inheritance**; avoids deep hierarchies and the diamond problem.

```py
class LoggingMixin:
    def log(self, message):
        print(f"Log: {message}")

class SaveMixin:
    def save(self, data):
        print(f"Saving: {data}")

class User(LoggingMixin, SaveMixin):
    def __init__(self, name):
        self.name = name
    def display(self):
        print(f"User: {self.name}")
        self.log(f"Displaying {self.name}")
        self.save(f"{self.name}'s data")
```

### Characteristics & best practices

- **Single responsibility** — a logging mixin does only logging.
- **No core business logic or state** — mixins augment behavior; they don't own the domain model.
- **Mind the MRO** — method resolution order decides which mixin wins on name conflicts (`Cls.__mro__` to inspect); too many mixins → hard-to-debug chains.
- **Method-name conflicts** — two mixins defining the same method resolve by MRO; design to avoid collisions.

### When to use

- **Cross-cutting concerns** — logging, auth, validation, serialization across many classes.
- **Reusable but non-core behavior** shared by unrelated classes.
- Real-world: Django class-based-view mixins (`LoginRequiredMixin`), serialization mixins in DRF.

### Fixtures vs mocks vs mixins (common confusion)

| | Purpose | Context |
|---|---|---|
| **Fixture** | Reusable test state/setup | Testing (`@pytest.fixture`) |
| **Mock** | Simulates a dependency, asserts calls | Testing (`unittest.mock`) |
| **Mixin** | Adds reusable behavior to a class | Production code (OOP) |

Fixtures/mocks deep coverage → `../Testing/Python-Testing-Flask-Asyncio.md`.

---

## 11. Design Patterns — Interview Map

| Category | Patterns | Python-flavored note |
|---|---|---|
| Creational | **Singleton**, Factory, Builder, Abstract Factory | Singleton via `__new__` or module-level instance; factories often just functions/classmethods |
| Structural | Adapter, Decorator, Facade, Proxy | First-class functions + `@decorator` syntax make Decorator nearly free |
| Behavioral | Observer, Strategy, Iterator, Template Method, Command | Iterators via `__iter__`/`__next__`; Strategy via passing functions |

**Staff framing:** Python's dynamic nature collapses several GoF patterns into language features — decorators, generators-as-iterators, functions-as-strategies, context managers. Know the *intent* and the Pythonic idiom, not just the UML.

---

## 12. Multiple Inheritance, MRO & the Diamond Problem

**First response:** *"Python resolves multiple inheritance with C3 linearization — `Cls.__mro__` shows the order, and cooperative `super()` calls each class exactly once."*

```py
class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B"
class C(A):
    def who(self): return "C"
class D(B, C): pass                    # diamond: B and C both inherit A

D.__mro__   # D → B → C → A → object   (C3: left-to-right, each class once)
D().who()   # "B" — first in MRO wins
```

```text
        A
       / \
      B   C
       \ /
        D        MRO: D → B → C → A → object
```

- **C3 rules:** children before parents; declared base order preserved left-to-right; each class appears once.
- **Cooperative `super()`:** in MI, `super()` doesn't mean "my parent" — it means *next class in the MRO*. Every class in a cooperative hierarchy must call `super().__init__(...)` and accept/pass `**kwargs` so each class is initialized exactly once.
- Inconsistent hierarchies raise `TypeError: Cannot create a consistent method resolution order`.

---

## 13. Type Inspection & Structural Typing

| Tool | Purpose | Interview note |
|---|---|---|
| `isinstance(obj, Cls)` | Checks instance **including subclasses** | Almost always the right check — honors inheritance |
| `issubclass(A, B)` | Class-level subclass check | Works with ABCs' virtual subclasses |
| `type(obj) is Cls` | Exact-class check — ignores subclasses | Use only when you truly need exact type |
| `type(obj) == Cls` | Same as above | Prefer `is` for class comparison |
| `duck typing` | Behavior over type — "has `.quack()`?" | No declaration needed |
| `typing.Protocol` (3.8+, PEP 544) | **Structural** typing — formalized duck typing | `isinstance` works with `@runtime_checkable` Protocols |

```py
from typing import Protocol, runtime_checkable

@runtime_checkable
class Speakable(Protocol):              # structural: any class with .speak() qualifies
    def speak(self) -> str: ...

isinstance(Dog(), Speakable)            # True — no inheritance needed
```

**ABC vs Protocol:** ABCs require explicit inheritance (nominal); Protocols match by structure (duck typing with tooling). ABCs can bundle implementation; Protocols define only the contract.

---

## 14. Descriptors & `__slots__` — How `property` Really Works

A **descriptor** is an object implementing `__get__`/`__set__`/`__delete__` — it controls attribute access at the *class* level. `property`, `staticmethod`, `classmethod`, and bound methods are all built on the descriptor protocol.

```py
class Positive:
    def __set_name__(self, owner, name):
        self.name = name                        # learns its attribute name at class creation
    def __get__(self, obj, owner=None):
        if obj is None: return self             # accessed via class → return descriptor
        return obj.__dict__[self.name]
    def __set__(self, obj, value):
        if value <= 0: raise ValueError("must be positive")
        obj.__dict__[self.name] = value

class Order:
    amount = Positive()                          # reusable validated attribute
    def __init__(self, amount): self.amount = amount
```

- **`__getattr__` vs `__getattribute__`:** `__getattribute__` fires on *every* access (careful — easy infinite recursion); `__getattr__` fires only on *misses*. Descriptors/`__getattribute__` are the low-level machinery; `__getattr__` is the fallback hook.
- **`__init_subclass__`** — hook that runs when a class is subclassed (registry/plugin patterns without a metaclass). **`__set_name__`** — tells a descriptor its attribute name.
- **`__slots__`** — fixes the attribute set, removes per-instance `__dict__` → major memory savings with many instances; no dynamic attribute assignment unless `'__dict__'` is slotted. Inheritance note: only the *leaf-most* `__slots__` matters unless each level declares its own.
- **Metaclass mini-recap:** `class` creation runs `metaclass.__call__` → `__new__` (build class) → `__init__`/`__init_subclass__`. Reach for `__init_subclass__` or decorators first; metaclasses are last resort.

---

## 15. Lifecycle View — OOP in Production

| Stage | Concern | Concrete point |
|---|---|---|
| Design | Hierarchy shape | Composition over inheritance; small interfaces (ISP); DI for testability |
| Scale | Object churn | `__slots__` to cut per-instance `__dict__` memory on hot paths |
| Secure | Access control | `__name` is *not* security — name mangling is collision-avoidance, not privacy |
| Fail | Inheritance fragility | LSP violations surface as runtime `raise`/special-casing — prefer composition |
| Monitor | Complexity | Deep hierarchies/many mixins → hard stack traces; keep MRO shallow |
| Cost | Maintenance | High coupling = every change ripples; low-cohesion modules resist ownership |

---

## 16. Interview Sound Bites

- *"`self` and `cls` are conventions, not keywords — Python passes the instance/class explicitly as the first argument."*
- *"`__new__` builds the object, `__init__` initializes it — singletons and immutables hook `__new__`."*
- *"Double underscore is name mangling, not privacy — `_ClassName__attr` still reaches it."*
- *"A classmethod receives the actual subclass as `cls` — that's why `from_diameter` works polymorphically; a staticmethod gets nothing."*
- *"Composition is 'owned has-a'; aggregation is 'shared has-a'; association is just 'knows-a'."*
- *"LSP failures look like subclasses that raise or need special-casing — the Penguin-can't-fly smell."*
- *"Mixins are scoped behaviors joined by MRO, not standalone classes."*
- *"Low coupling, high cohesion — every SOLID principle is a tactic toward that strategy."*
- *"`super()` doesn't call 'my parent' — it calls the next class in the MRO. That's what makes cooperative MI work."*
- *"`property` is a descriptor — `__get__`/`__set__`/`__delete__` is the protocol underneath every attribute hook."*
- *"`isinstance` respects inheritance; `type() is` doesn't. Structural checks belong to `Protocol`."*
- *"In Python, several GoF patterns collapse into language features — decorators, generators, first-class functions."*

---

## 17. Quick-Reference Table

| Question | Answer |
|---|---|
| True private attributes? | No — `__x` → `_ClassName__x` (name mangling) |
| `self` required? | Convention only; must be first param of instance methods |
| `cls` can see instance attrs? | No — only class-level data |
| `self` can see class attrs? | Yes — `self.attr` falls back to class lookup; `self.__class__` gives the class |
| Singleton mechanism | `__new__` returning cached instance |
| Alternative constructor | `@classmethod` (`from_diameter`) |
| Operator overloading | `__add__`, `__eq__`, `__lt__`, ... |
| Attribute validation | `@property` + setter |
| Strongest relationship | Composition (owns lifecycle) |
| Weakest relationship | Association (no ownership) |
| Best cohesion | Functional |
| Worst cohesion | Logical |
| MRO inspection | `Cls.__mro__` (C3 linearization) |
| Diamond problem | Resolved by MRO — each class visited once |
| Cooperative MI | All classes call `super()` + pass `**kwargs` |
| Subclass-aware check | `isinstance` — not `type() is` |
| Structural typing | `typing.Protocol` + `@runtime_checkable` |
| Attribute access hook | Descriptors (`__get__`/`__set__`/`__delete__`); `property` is built on it |
| Every-access hook | `__getattribute__`; miss-only → `__getattr__` |
| Subclass hook (no metaclass) | `__init_subclass__` |
| Python's interface | `abc.ABC` + `@abstractmethod` |

---

## 18. Mental-Model Recap

```text
Object = state (instance attrs) + behavior (methods) + identity
Class  = shared attrs + method table + MRO for lookup

Method resolution:  instance dict → class dict → MRO chain (C3)
Access control:     __x → _Cls__x  (mangling, not privacy)
Relationships:      association → aggregation → composition   (weakest → strongest)
Design compass:     LOW coupling + HIGH cohesion  (SOLID are tactics toward this)
```

Cross-references: mutability & copying → `Python-Memory-and-Object-Model.md`; `pytest` fixtures/mocks → `../Testing/Python-Testing-Flask-Asyncio.md`; FastAPI dependency injection (`Depends`) → `Python-Web-Frameworks.md`.
