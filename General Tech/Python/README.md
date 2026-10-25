# Python Interview Notes

Staff-level Python notes refined from `supporting-docs` — complete coverage, interview-ready.

## Documents

- [Python Core Language](./Python-Core-Language.md) — interpreter/bytecode model, type system, collections, slicing, comprehensions, lambdas, `*args`/`**kwargs`, call semantics (`/` and `*`), generics, generators, exceptions + hierarchy, pickling, modules/`__main__`, Py2 vs 3, LEGB/closures, decorators, context managers, stdlib toolkit, `match`/`case`, walrus, dataclasses, `Enum`, f-strings
- [Python Memory & Object Model](./Python-Memory-and-Object-Model.md) — pass-by-object-reference, mutable vs immutable, `is` vs `==`, interning, copy semantics, mutable-default trap, refcounting, cyclic GC (generations + thresholds), pymalloc internals, leaks, `weakref`, `__del__`, `__slots__`, memory probing tools
- [Python OOP & Design](./Python-OOP.md) — four pillars, `self`/`cls`/`__init__`/`__new__`, name mangling, `super`/MRO + diamond problem, method types, dunders, descriptors/`__slots__`, `isinstance`/Protocol structural typing, properties, composition/aggregation/association, coupling/cohesion, SOLID, mixins, design patterns
- [Python Concurrency](./Python-Concurrency.md) — GIL deep dive + free-threaded CPython (PEP 703), threading vs multiprocessing vs subprocess vs asyncio, sync primitives, deadlock, event loop/coroutines/`await`/`gather`/`create_task`, asyncio primitives (Semaphore/Queue/wait_for/shield/TaskGroup), graceful shutdown, multiprocessing start methods & production gotchas
- [Python Web Frameworks](./Python-Web-Frameworks.md) — FastAPI, WSGI vs ASGI, `def` vs `async def` endpoints, DI/`Depends`, BackgroundTasks vs Celery, lifespan, Uvicorn + gunicorn deployment, Flask + SQLAlchemy (sessions, lazy/eager/`selectinload`, pooling, scoped sessions), Celery, production API concerns (auth, pagination, rate limiting, versioning, health checks), FastAPI vs Django vs Flask decision framework

## Related

- [Python Testing for Flask & asyncio](../Testing/Python-Testing-Flask-Asyncio.md) — pytest, fixtures, mocks, async test patterns, CI gates

## How to Use

- Read the **Mental-Model Recap** section of each doc first for the big picture.
- Drill the **Quick-Reference Table** the morning of the interview.
- Practice delivering the **Sound Bites** out loud — they're written as speakable first responses.
