# Python Concurrency — Staff-Level Interview Notes

Covers: the GIL end-to-end, threading, multiprocessing, subprocess, asyncio mechanics, synchronization primitives, deadlock, thread safety, and the full decision matrix.

---

## 1. The GIL (Global Interpreter Lock)

**First response:** *"The GIL is a mutex in CPython allowing only one thread to execute Python bytecode at a time. It exists to make reference counting thread-safe. It doesn't help CPU-bound threads — but I/O-bound threads release it while waiting, so threading still works well for I/O."*

### Why it exists — memory management

CPython manages object lifetimes via **reference counting**; the count updates must be atomic.

```py
x = [1, 2, 3]
y = x            # refcount = 2
```

```text
Object [1,2,3]    refcount = 2
   x ──┐
   y ──┘
```

**Without the GIL — the race:**

```text
Thread A: read refcount=5 → decrement → write 4
Thread B: read refcount=5 → decrement → write 4   (read stale 5 before A's write)

Correct: 5 → 4 → 3.   Actual: 5 → 4.   One decrement lost → memory corruption/crash.
```

The GIL serializes bytecode execution so refcount updates can't race.

### How it works

```text
       GIL
        │
────────┼────────   Only ONE thread runs Python bytecode at a time
        │

Time →
Thread 1  ███
Thread 2      ███
Thread 3          ███          ← threads take turns holding the GIL
```

- **Automatic switching:** CPython periodically releases the GIL so another thread can run (fairness/responsiveness).
- On a 16-core CPU, two CPU-bound Python threads still interleave on effectively one core's worth of bytecode execution.

```py
import threading
def work():
    for _ in range(10_000_000):
        pass
t1 = threading.Thread(target=work); t2 = threading.Thread(target=work)
t1.start(); t2.start()           # both compete for the GIL — no speedup
```

### When the GIL is released

During **blocking I/O**: file I/O, socket communication, database queries, network requests, `time.sleep()`.

```text
Thread A: requests.get(...) → waiting for server → GIL released → Thread B executes
```

That's why multithreading **does** work for I/O-bound programs.

### CPU-bound vs I/O-bound under the GIL

```text
CPU-bound:   Thread A  CPU work → still CPU work → still CPU work
             Thread B cannot run Python bytecode; GIL stays hot.
             More threads = no gain + context-switch overhead.

IO-bound:    Thread A  send request → waiting → GIL released
             Thread B  runs → waiting → Thread C runs
             Waiting time overlaps → throughput improves.
```

### Why doesn't Python remove the GIL?

- Most CPython internals assume it exists.
- Many C extensions (NumPy, pandas) were written around it.
- Removing it without redesign would significantly **slow down single-threaded** programs — CPython historically optimized for single-thread speed + compatibility.
- (Context: PEP 703 made the GIL *optional* — **free-threaded CPython 3.13** ships as an experimental build, refined in 3.14. Default builds keep the GIL; C-extension ecosystem is still catching up. Design for the GIL build.)

### Escaping the GIL

```text
multiprocessing:  Process 1 [own interpreter + own GIL] on Core 1
                  Process 2 [own interpreter + own GIL] on Core 2   → true parallelism

NumPy/numba:      Python → NumPy C code → GIL released → native threads on many cores
```

### GIL ≠ thread safety

```py
balance = 100
def withdraw():
    global balance
    balance -= 10        # load → compute → store — NOT atomic
```

A thread switch can land mid-operation → lost updates. You still need `threading.Lock`.

### GIL interview table

| Question | Answer |
|---|---|
| What is the GIL? | Mutex allowing one thread to execute Python bytecode at a time per CPython process |
| Why does it exist? | Makes reference counting thread-safe; simplifies memory management |
| Does it make Python single-threaded? | No — many threads exist; only one runs bytecode at once |
| Is multithreading useless? | No — excellent for I/O-bound work; GIL released on blocking I/O |
| Good for CPU-bound? | No — use `multiprocessing` or C extensions that release the GIL |
| Does it make code thread-safe? | No — shared mutable state still needs locks |

---

## 2. The Four Concurrency Models

| Model | Mechanism | Best for | GIL impact |
|---|---|---|---|
| **Threading** | Multiple threads in one process, shared memory | I/O-bound (network, files, user input) | Serialized bytecode; released on I/O |
| **Multiprocessing** | Multiple processes, separate memory + interpreter | CPU-bound (compute, data processing) | Each process has its own GIL → true parallelism |
| **Subprocess** | Spawn/manage external programs | Running external commands/executables | Independent processes entirely |
| **asyncio** | Single-threaded event loop, coroutines | High-concurrency I/O (network ops) | One thread; cooperative multitasking |

```py
import threading        # I/O-bound
import multiprocessing  # CPU-bound — multiple cores
import asyncio          # non-blocking I/O via event loop
import subprocess       # external programs
```

### Threading — pros/cons

| Advantages | Disadvantages |
|---|---|
| Ideal for I/O-bound work — reduces waiting time | GIL caps CPU-bound gains |
| Shared memory → easy data sharing | Synchronization complexity → races, deadlocks |

When threads touch shared resources, use synchronization primitives (below) to avoid races/inconsistency.

### Choosing between them

- **Threading** — bottleneck is *waiting* on external resources; GIL isn't the concern.
- **Multiprocessing** — bottleneck is *computation*; needs real multi-core parallelism.
- **Subprocess** — run external commands or system processes.
- **asyncio** — massive I/O-bound concurrency without thread overhead.

### Process vs Thread

```text
Process:  own memory | own interpreter | heavyweight | own GIL
Thread:   shared memory | same process | lightweight | shared GIL
```

### Threading vs Multiprocessing

| Feature | Threading | Multiprocessing |
|---|---|---|
| Memory | Shared | Separate |
| GIL | Shared | Separate per process |
| CPU-bound | Poor | Excellent |
| I/O-bound | Excellent | Good but heavier |
| Startup cost | Low | Higher (spawn/fork + interpreter) |
| Communication | Easy (shared memory) | IPC required — pipes, queues, shared memory |

---

## 3. Synchronization Primitives

| Primitive | Semantics | Use |
|---|---|---|
| **`Lock`** | Binary — one holder at a time | Exclusive critical-section access |
| **`RLock`** | Reentrant — same thread may acquire multiple times | Nested locking within one thread |
| **`Semaphore`** | Counter — up to N concurrent holders | Bounded resources (pool size 10) |
| **`Event`** | Flag — `set()`/`wait()` | One thread signals another |
| **`Condition`** | Wait until a predicate is true | Producer-consumer patterns |
| **`queue.Queue`** | Thread-safe put/get | **Safest** way to communicate between threads |
| **`ThreadPoolExecutor`** | Managed thread pool | Production standard vs manual threads |

### Mutex (Lock) vs Semaphore

| | Lock | Semaphore |
|---|---|---|
| Capacity | Exactly 1 holder | Up to N permit holders |
| Nature | Binary: locked/unlocked | Counting: permits acquired/released |
| Use | Protect one critical section | Connection pools, bounded buffers, producer-consumer |
| Risk | Deadlock if mishandled | More versatile, needs careful permit accounting |

```py
lock = threading.Lock()
with lock:                    # or lock.acquire() / lock.release()
    critical_section()

from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=5) as ex:
    ex.submit(download)       # production-standard pattern
```

### Thread lifecycle & context switching

```text
Create → Start → Running → Blocked → Runnable → Finished

Context switch: CPU pauses thread → loads another.
Too many threads → high switching overhead → throughput drops.
```

### Race condition & deadlock

```text
counter += 1            # read-modify-write — NOT atomic → lost updates

Deadlock:   Thread A holds Lock1, waits for Lock2
            Thread B holds Lock2, waits for Lock1   → neither proceeds

Avoid: acquire locks in consistent order • hold them briefly • use timeouts
```

### Thread safety

Correct behavior under concurrent access. **Safe:** `queue.Queue`, `logging` module. **Unsafe:** unsynchronized mutation of global lists/dicts.

---

## 4. asyncio — Cooperative Concurrency

**Model:** one thread, one event loop, many coroutines. Concurrency without threads.

### Event loop

```text
Tasks: T1 T2 T3 T4
Loop:  waiting? → skip to next   |   finished I/O? → resume it
       continuously schedules coroutines
```

### Coroutine & await

```py
async def get_users(): ...

get_users()            # does NOT execute — returns a coroutine object
await get_users()      # schedules + runs it on the event loop
asyncio.run(main())    # entry point: runs the loop
```

```text
await db.query():
  coroutine starts → query sent → coroutine PAUSES
    → event loop runs another coroutine
    → DB returns → coroutine RESUMES
```

This is **cooperative multitasking** — coroutines yield control explicitly at `await` (vs preemptive thread scheduling).

### Why async is "faster"

Not faster execution — **waiting time is utilized**. 10 requests × (2s DB wait + 20ms CPU):

```text
Flask (WSGI):   each worker blocked 2s → 10 workers occupied
FastAPI (ASGI): event loop switches → one worker handles hundreds of waiting requests
```

### CPU-bound vs I/O-bound for asyncio

| Bound | Examples | Use |
|---|---|---|
| I/O-bound | API calls, DB, Redis, S3, Kafka, file reads | **asyncio** |
| CPU-bound | image processing, encryption, ML inference, video encoding | **multiprocessing** — asyncio gains ~nothing |

### Blocking inside async — the classic bug

```py
async def test():
    time.sleep(5)                  # WRONG — freezes the entire event loop

async def test():
    await asyncio.sleep(5)         # correct — yields to the loop
```

### Scheduling multiple coroutines

```py
# gather — run concurrently: 2+2+2s → ≈2s total
await asyncio.gather(api1(), api2(), api3())

# create_task — schedule background work, start immediately
task = asyncio.create_task(fetch())
...                                # do other work
await task                         # collect result later
```

### Async database access

```py
# WRONG — synchronous SQLAlchemy call inside coroutine blocks the loop
async def get():
    users = session.query(User).all()

# Correct — async driver / async session
await session.execute(...)
```

---

## 5. asyncio Advanced Primitives

| Primitive | Purpose | Note |
|---|---|---|
| `asyncio.Semaphore(n)` | Bound concurrent in-flight work | Prevents thundering-herd on APIs/DBs |
| `asyncio.Queue` | Producer/consumer handoff between coroutines | `maxsize` for backpressure |
| `asyncio.wait_for(coro, t)` | Timeout a coroutine | Raises `TimeoutError`; cancels the awaited task |
| `asyncio.shield(coro)` | Protect a task from outer cancellation | Task continues even if caller is cancelled |
| `asyncio.TaskGroup` (3.11+) | Structured concurrency — child tasks can't outlive the block | Replaces manual `gather`+cleanup; propagates `ExceptionGroup` |
| `asyncio.to_thread(fn)` (3.9+) | Run a blocking sync function in a thread | Bridge for non-async libraries |
| `loop.run_in_executor` | Offload to thread/process pool | Lower-level equivalent of `to_thread` |
| `asyncio.Event` / `Condition` / `Lock` | Async versions of sync primitives | `await`able acquire/wait |

```py
sem = asyncio.Semaphore(10)
async def fetch(url):
    async with sem:                          # at most 10 in flight
        return await client.get(url)

async with asyncio.TaskGroup() as tg:        # 3.11+ structured concurrency
    tg.create_task(job1())
    tg.create_task(job2())                   # block exits only when all finish
```

**Cancellation semantics:** `task.cancel()` injects `CancelledError` at the next `await` — always clean up in `finally`/context managers, and re-raise unless you intentionally swallow it.

**Graceful shutdown:** `asyncio.run()` already cancels pending tasks and closes the loop/executor on exit. In long-running apps: stop accepting work → `cancel()` tasks → `await asyncio.gather(*tasks, return_exceptions=True)` → close pools/clients. Signal handlers (`SIGTERM`) should set a shutdown flag — never `sys.exit` mid-coroutine.

---

## 6. Multiprocessing & Threading in Practice

```py
from concurrent.futures import ProcessPoolExecutor

if __name__ == "__main__":                    # REQUIRED on spawn (Windows/macOS default)
    with ProcessPoolExecutor(max_workers=4) as ex:
        results = list(ex.map(compute, data))
```

| Topic | Detail |
|---|---|
| Start methods | `fork` (fast, unsafe with threads; Linux default), `spawn` (fresh interpreter, safe, slower; **Windows/macOS default**), `forkserver` |
| `__main__` guard | Spawn re-imports the module in the child → unguarded code re-runs recursively |
| Payloads must pickle | Args/results cross process boundary via pickle — lambdas and nested functions **can't be sent** |
| Shared state | `mp.Value`, `mp.Array`, `Manager()` proxies, `mp.Queue` — all explicit; no free shared memory |
| Threading extras | `threading.local()` per-thread state; `daemon=True` threads die with the main thread |
| `GIL` release in C | NumPy/pandas heavy ops release it → threading can still parallelize native work |

**Failure modes to name in interviews:** fork-while-threaded deadlocks (macOS/HTTP libs), unpicklable task payloads, zombie processes without `join`/executor shutdown, oversubscribing cores in containers (`os.cpu_count()` reports host CPUs, not cgroup limits).

---

## 7. Interview Q&A Bank

**Q: Why doesn't asyncio replace multithreading?**
Asyncio is for cooperative I/O-bound concurrency on one thread. Threads remain useful for **blocking libraries** and integrating non-async-aware code; CPU-intensive work belongs in **separate processes**.

**Q: How does asyncio get concurrency without threads?**
An event loop suspends coroutines at `await` points and resumes other ready coroutines while their I/O is pending — many logical tasks multiplexed on one OS thread.

**Q: Why is threading effective for I/O despite the GIL?**
Blocking I/O calls release the GIL — while one thread waits on the kernel/network, another runs its bytecode. Waiting overlaps.

**Q: What happens if you call `time.sleep()` in an async endpoint?**
It **blocks the whole event loop** — every coroutine stalls. Use `await asyncio.sleep()` or offload blocking work via `loop.run_in_executor` / `asyncio.to_thread`.

**Q: Why can't a SQLAlchemy `Session` be shared across threads?**
It holds mutable state — identity map + transaction state — and is not thread-safe. One session per request/unit of work. (Details → `Python-Web-Frameworks.md`.)

---

## 8. Lifecycle View — Concurrency in Production

| Stage | Concern | Concrete point |
|---|---|---|
| Design | Model selection | I/O → asyncio/threads; CPU → processes; external → subprocess |
| Scale | Throughput | `ThreadPoolExecutor`/`ProcessPoolExecutor`; asyncio for 10k+ concurrent conns |
| Secure | Shared state | GIL isn't safety — lock shared mutable state; prefer `queue.Queue` handoff |
| Fail | Deadlock/leaks | Consistent lock order, timeouts; unbounded executor queues = memory growth |
| Monitor | Saturation | Thread-pool utilization, event-loop lag, context-switch rate |
| Cost | Overhead | Thread stacks (~MBs each) vs coroutines (~KBs); process spawn cost on hot paths |

---

## 9. Interview Sound Bites

- *"The GIL serializes bytecode, not programs — threads still help whenever the bottleneck is waiting, not computing."*
- *"GIL exists because refcounting isn't atomic; remove the lock and you must redesign memory management."*
- *"CPU-bound → processes; I/O-bound → asyncio or threads; that's the whole decision."*
- *"A blocking call inside a coroutine doesn't block a thread — it blocks every coroutine."*
- *"`gather` for fan-out-and-join, `create_task` for fire-and-later."*
- *"Lock = one permit; semaphore = N permits; event = a flag; condition = wait-for-predicate; queue = safest handoff."*
- *"The GIL gives you thread convenience, not thread safety — `balance -= 10` still races."*
- *"`TaskGroup` gives you structured concurrency — no leaked children, failures propagate as one `ExceptionGroup`."*
- *"On `spawn`, children re-import your module — forget the `__main__` guard and you fork-bomb yourself."*
- *"A `Semaphore` around outbound calls is the difference between concurrency and self-inflicted DoS."*
- *"Free-threaded CPython exists since 3.13 — but it's opt-in; the GIL build is still what production runs."*

---

## 10. Quick-Reference Table

| Question | Answer |
|---|---|
| GIL purpose | Thread-safe reference counting |
| GIL released on | Blocking I/O — files, sockets, DB, network, `sleep` |
| CPU-bound choice | `multiprocessing` / native extensions |
| I/O-bound choice | `asyncio` or `threading` |
| External command | `subprocess` |
| Exclusive section | `Lock` (or `RLock` for re-entrant) |
| N-way access | `Semaphore(N)` |
| Thread-safe handoff | `queue.Queue` |
| Managed pool | `concurrent.futures.ThreadPoolExecutor` |
| Coroutine starts when | `await` / `asyncio.run` / `create_task` — NOT on call |
| Fan-out | `asyncio.gather` |
| Background coroutine | `asyncio.create_task` |
| Blocking in async | Never — use `asyncio.to_thread` / executors |
| Deadlock prevention | Lock ordering, short hold, timeouts |
| Bound async concurrency | `asyncio.Semaphore` / `Queue(maxsize)` |
| Coroutine timeout | `asyncio.wait_for` |
| Survive cancellation | `asyncio.shield` |
| Structured task scope | `asyncio.TaskGroup` (3.11+) |
| Safe process start | `spawn` + `__main__` guard; payloads must pickle |
| Per-thread state | `threading.local()` |
| Kill with main thread | `daemon=True` |
| No-GIL CPython | Free-threaded build — 3.13+ experimental (PEP 703), opt-in |
| Clean async shutdown | cancel tasks → `gather(return_exceptions=True)` → close clients |

---

## 11. Mental-Model Recap

```text
One process, one GIL ──► only one thread runs bytecode at a time
                         BUT GIL drops during I/O → threads still overlap waiting

asyncio = 1 thread × 1 event loop × N coroutines
          coroutine pauses at await → loop runs another → I/O done → resume

Choose:   CPU ──► multiprocessing (own interpreter + own GIL, true cores)
          I/O ──► asyncio (huge fan-out) or threading (blocking libs)
          ext ──► subprocess
```

Cross-references: shared-state hazards & object model → `Python-Memory-and-Object-Model.md`; generators/laziness → `Python-Core-Language.md`; WSGI vs ASGI, `Depends`, Celery → `Python-Web-Frameworks.md`; async test patterns → `../Testing/Python-Testing-Flask-Asyncio.md`.
