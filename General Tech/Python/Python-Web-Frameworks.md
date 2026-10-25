# Python Web Frameworks — Staff-Level Interview Notes

Covers: FastAPI & asyncio, WSGI vs ASGI, dependency injection, background tasks, lifespan, Uvicorn; Flask + SQLAlchemy (engine/session/model, lazy vs eager loading, transactions, connection pooling); Celery; the FastAPI vs Django vs Flask decision framework.

---

## 1. FastAPI — What It Is

**First response:** *"FastAPI is an ASGI framework built on Starlette (routing/ASGI) + Pydantic (validation) + asyncio — designed for async from the ground up, unlike Flask which is WSGI."*

Built on:
- **Starlette** — routing + ASGI handling
- **Pydantic** — request validation via type hints
- **Python asyncio** — async I/O concurrency

## 2. WSGI vs ASGI — the core difference

```text
WSGI (Flask)                          ASGI (FastAPI)

Client                                Request
  │                                     │
Request                             Event Loop
  │                                     │
Flask                               Coroutine
  │                                     │
One thread/process per request      DB call starts
  │                                     │
Response                            Loop switches to another request
                                        │
If DB takes 2s:                       DB returns
Thread → waiting...waiting...           │
      → thread is BLOCKED             Resume coroutine

Each request occupies a worker until done.
                                      No thread stays blocked while waiting.
```

| | WSGI (Flask) | ASGI (FastAPI) |
|---|---|---|
| Concurrency | One worker blocked per request | Event loop multiplexes coroutines |
| Idle threads during I/O | Yes — worker waits | No — loop serves other requests |
| Best at | Simple sync CRUD | High-concurrency I/O-bound APIs |

## 3. asyncio mechanics in FastAPI context

- **Event loop:** one thread + one loop + many coroutines; suspends a coroutine at `await`, runs another meanwhile.
- **Coroutine:** `async def` — calling it returns a coroutine object; runs only under `await` / `asyncio.run`.
- **`await` = cooperative yield** — coroutine pauses at I/O, loop runs other work, resumes when ready.

```text
await db.query():
  coroutine starts → query sent → PAUSE → loop runs other coroutine → DB returns → RESUME
```

Why async wins: **waiting time gets utilized**, not execution sped up. 10 requests × (2s DB wait + 20ms CPU):

```text
Flask:   10 workers each blocked 2s
FastAPI: one worker juggles hundreds of waiting requests
```

**The trap:**

```py
async def test():
    time.sleep(5)              # freezes the WHOLE event loop

async def test():
    await asyncio.sleep(5)     # correct
```

```py
await asyncio.gather(api1(), api2(), api3())   # 2+2+2s sequential → ≈2s concurrent
task = asyncio.create_task(fetch())            # starts now, await later
```

Async DB calls need async drivers:

```py
# WRONG — sync session blocks the loop
async def get(): users = session.query(User).all()
# Correct
await session.execute(...)     # SQLAlchemy Async / asyncpg etc.
```

## 4. FastAPI building blocks

### Dependency injection (`Depends`)

```py
def get_db():
    yield session                          # teardown after response

@app.get("/")
def users(db = Depends(get_db)): ...
```

Benefits: **testability** (override deps in tests), **resource cleanup** (`yield` teardown), **reusability**.

### BackgroundTasks

```py
@app.post("/")
async def send(background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email)
```

Good for: email, logging, cache updates — **short-lived in-process work**. Not for long/reliable jobs → **Celery**.

### Lifespan events

```py
@app.on_event("startup") / @app.on_event("shutdown")
```

Common uses: DB connection pool, Redis, Kafka consumer, ML model loading.

### Uvicorn — the ASGI server

```text
Client → Uvicorn → FastAPI → Event Loop
```

## 5. Flask + SQLAlchemy

### Architecture

```text
Client → Gunicorn → Flask → SQLAlchemy → Postgres
```

**Why SQLAlchemy:** ORM — `User.query.all()` instead of `SELECT * FROM users`.

### ORM components

| Component | Role |
|---|---|
| **Engine** | Database connection |
| **Session** | Tracks changes — `session.add(user)` / `session.commit()`; acts as transaction manager |
| **Model** | `class User(Base)` — maps Python objects to tables |

### Session lifecycle

```text
Open → Query → Modify → Commit → Close
```

**Always close the session** — leaks exhaust the connection pool.

### Lazy vs Eager loading

| | Lazy | Eager |
|---|---|---|
| Trigger | `user.orders` queries **when accessed** | `joinedload(User.orders)` — one JOIN upfront |
| Memory | Efficient | Heavier upfront |
| Risk | **N+1 query problem** | Avoids N+1 |

### Transactions & connection pool

```py
try:
    session.commit()
except:
    session.rollback()         # rollback preserves atomicity
```

**Connection pool:** keep reusable connections instead of create→destroy per request — large performance win.

## 6. Celery — distributed task queue

```text
Client → Flask → Celery → Redis/RabbitMQ (broker) → Worker → task executed
```

| Component | Role |
|---|---|
| Producer | Flask app queuing tasks |
| Broker | Redis / RabbitMQ — holds the queue |
| Worker | Executes tasks |
| Backend | Stores results |

**Why:** never make the user wait for email, reports, image resize, ML inference.

```text
HTTP request → task queued → immediate response → worker processes later
```

```py
@celery.task
def send_email(): ...
send_email.delay()                    # enqueue, return immediately

self.retry(countdown=10)              # retry on transient API/network failures
```

- **Scheduling:** Celery Beat — daily cleanup, hourly, per-minute jobs.
- **Worker scaling:** multiple workers; broker distributes tasks.
- **Idempotency (interview favorite):** if a task runs twice, outcome shouldn't change — *generate the invoice once, not twice.* Design tasks idempotent.

## 7. FastAPI vs Django vs Flask

**The wrong question:** "which is faster / more modern." **The right question:** *"How much infrastructure do you want the framework to provide, and does that align with the system you're building?"* — different philosophies for different applications.

| | FastAPI | Django | Flask |
|---|---|---|---|
| Philosophy | API-first, modern, async | **Batteries included** | **Minimalist** |
| Includes | Starlette + Pydantic + OpenAPI docs | ORM, auth, admin, migrations, forms, templates, conventions | Routing + request handling only |
| Async | Native | Async views, but **ORM stays largely sync** | Sync (WSGI) |
| Boilerplate | Minimal — type hints drive validation/serialization/docs | Conventions reduce decisions | Everything chosen manually |
| Best for | REST APIs, microservices, **AI/ML inference, LLM apps**, high-concurrency, event-driven | Rich business data, multi-role apps, admin dashboards, SaaS, internal tools, complex relational data | Small tools, lightweight services, prototypes, legacy migrations, specialized architectures |
| Missing | ORM, auth, admin, migrations — assemble yourself | Async throughput of FastAPI | Structure — teams rebuild Django conventions over time |
| Admin | None | **Auto admin panel** — weeks of dev saved | None |
| Pitfall | Not a Django replacement | ORM limits async gains | Flexibility becomes maintenance burden at scale |

### Decision factors that actually matter

1. **Team experience** — FastAPI assumes comfort with type hints, async, DI. Django's conventions smooth onboarding; Flask is easy to start but complex to scale.
2. **Async requirements** — *don't pick FastAPI because async sounds modern.* Async pays off only with substantial concurrent I/O (external APIs, multiple DB queries, queues, streaming). Classic CRUD gains little.
3. **Admin requirements** — internal users managing data → Django admin alone can justify the choice.
4. **AI/ML roadmap** — ML deployment tutorials, LLM frameworks, inference services all favor FastAPI; starting there avoids a later migration.

### Combining Django + FastAPI

```text
Django  → auth, admin, business data
FastAPI → high-perf APIs, ML inference, webhooks
        → separate services, shared DB or internal APIs
```

Practical when only part of the system needs async performance.

### Common mistakes

- Starting with Flask for "simplicity," then outgrowing it.
- Choosing Django for high-concurrency APIs, then hitting the sync ORM wall.
- Treating FastAPI as a drop-in Django replacement — missing conventions/infrastructure.
- Ignoring team turnover — heavily customized Flask confuses newcomers; Django's structure eases onboarding.

**Final word:** no universally best framework — requirements, team expertise, long-term maintenance, scalability decide. Source: [Procedure — FastAPI vs Django vs Flask](https://procedure.tech/blogs/fastapi-vs-django-vs-flask/).

## 8. Interview Q&A Bank

**Q: FastAPI `BackgroundTasks` vs Celery?**
BackgroundTasks = short-lived, in-process, lost on restart. Celery = long-running, **reliable, retryable, distributed** tasks.

**Q: Why can't a SQLAlchemy `Session` be shared across threads?**
It holds mutable state — identity map + transaction state — not thread-safe. One session per request/unit of work.

**Q: What breaks if you `time.sleep()` in an async endpoint?**
The **event loop** freezes — every coroutine stalls. Use `asyncio.sleep` or offload to a thread/process.

**Q: Why doesn't asyncio replace threads?**
Threads still cover **blocking, non-async libraries**; CPU work needs processes. Asyncio is for cooperative I/O in one thread.

---

## 9. Production Semantics & Deployment

### `def` vs `async def` endpoints — the subtle bit

| Handler | FastAPI behavior |
|---|---|
| `async def route()` | Runs **on the event loop** — any blocking call inside stalls all requests |
| `def route()` | Runs in a **threadpool** (external worker pool) — safe for blocking/sync libs |

- If the handler must call sync code (e.g., sync SQLAlchemy, `requests`), a plain `def` endpoint is the safe choice — FastAPI offloads it. `async def` + blocking call = worst of both worlds.
- Pydantic models (`BaseModel`) give request validation, serialization, and the auto-generated **OpenAPI/Swagger docs**; **Pydantic v2** moved the core to Rust (`pydantic-core`) — significantly faster validation.
- **Middleware/CORS:** request/response pipeline hooks (`app.add_middleware`) — auth, logging, `CORSMiddleware` for cross-origin.
- ASGI also supports **WebSockets** and long-lived streaming responses — beyond WSGI's request/response scope.

### Production topology

```text
Client → nginx/ALB → gunicorn (process manager)
                       └─ N × UvicornWorker (ASGI event loops, one per core)
                              → FastAPI app

WSGI equivalent:  Client → nginx → gunicorn → N × sync Flask workers
```

- Uvicorn alone works, but **Gunicorn managing `UvicornWorker`s** adds process management/restarts; common rule of thumb: `workers ≈ CPU cores` (+1).
- One worker = one event loop = one thread of bytecode — scale by **processes**, not threads.

### SQLAlchemy — beyond basics

| Concern | Detail |
|---|---|
| `joinedload` vs `selectinload` | `joinedload` = one query with JOIN (can explode rows on 1:N); `selectinload` = second `IN` query, usually better for collections |
| `sessionmaker` / `Session` | Factory for sessions; scope a session per request/unit-of-work |
| `scoped_session` | Thread-local session registry — one session per thread |
| Async | `async_sessionmaker`/`AsyncSession` + async driver (`asyncpg`) — sessions tracked per-task via contextvars |
| N+1 symptom | Loop accessing `user.orders` per user → one query each; fix with eager loading |

### Production API concerns staff interviewers raise

| Concern | Idiomatic answer |
|---|---|
| Auth | `Depends(get_current_user)` + OAuth2/JWT bearer; `SecurityScopes` for RBAC |
| Pagination | `?limit=&offset=` query params; cursor-based for large/unstable sets |
| Rate limiting | Middleware or API-gateway layer (nginx/Envoy); per-user token bucket |
| API versioning | URL prefix `/v1/` routers, or header-based |
| Health/readiness | `/healthz` (process alive) vs `/readyz` (deps reachable — DB, cache) |
| Timeouts/retries | Client-side timeouts + bounded retries with backoff + jitter |
| Caching | Response cache (Redis) + `Cache-Control`/`ETag` headers |
| Observability | Structured logging + request-id middleware; OpenTelemetry tracing; Prometheus metrics |
| Config/secrets | Env vars (`pydantic-settings`), never in code |

---

## 10. Lifecycle View — Web Service in Production

| Stage | Concern | Concrete point |
|---|---|---|
| Design | Framework fit | API-first+async → FastAPI; business app+admin → Django; lean custom → Flask |
| Scale | Concurrency | Uvicorn workers + event loop; Celery workers scale task throughput |
| Secure | Validation | Pydantic request validation; DI centralizes auth dependencies |
| Fail | Task reliability | Celery retry/idempotency; BackgroundTasks are fire-and-forget |
| Monitor | Saturation | Event-loop lag, DB pool utilization, Celery queue depth |
| Cost | Infra | Async = fewer workers for same I/O throughput; sync needs more workers |

---

## 11. Interview Sound Bites

- *"WSGI blocks a worker per request; ASGI lets one worker interleave hundreds of waiting coroutines."*
- *"Async isn't faster execution — it's utilized waiting time."*
- *"`Depends` gives me testability and cleanup for free — `yield` in the dependency is the teardown."*
- *"Lazy loading hides N+1; `joinedload` pays one JOIN upfront."*
- *"BackgroundTasks is convenient but not durable — anything that must survive restarts goes to Celery."*
- *"Design Celery tasks idempotent — retries and at-least-once delivery mean they will run twice."*
- *"Django's admin alone can justify the framework; FastAPI's async only matters under real I/O concurrency."*
- *"In FastAPI, `async def` endpoints run on the loop — `def` endpoints go to a threadpool. Mixing them up is the classic footgun."*
- *"ASGI scales by worker processes, each with its own event loop — gunicorn managing uvicorn workers is the standard shape."*
- *"`joinedload` is one fat JOIN; `selectinload` is a second `IN` query — for collections the second usually wins."*
- *"`Depends` composes auth, pagination, and DB sessions into the signature — testable by overriding the dependency map."*
- *"Health checks split into liveness (process up) vs readiness (deps reachable) — k8s probes need both."*

---

## 12. Quick-Reference Table

| Question | Answer |
|---|---|
| FastAPI stack | Starlette + Pydantic + asyncio |
| WSGI vs ASGI | Worker-per-request vs event-loop coroutines |
| Event loop | One thread scheduling many coroutines |
| Concurrent coroutines | `asyncio.gather` |
| Deferred coroutine | `asyncio.create_task` |
| FastAPI DI | `Depends(get_db)` — `yield` for cleanup |
| Light background work | `BackgroundTasks` (not durable) |
| Reliable distributed tasks | Celery + Redis/RabbitMQ |
| Scheduled jobs | Celery Beat |
| ORM transaction manager | `Session` — add/commit/rollback |
| Avoid N+1 | `joinedload` (eager) |
| DB connection reuse | Connection pool |
| Flask server | Gunicorn (WSGI) |
| FastAPI server | Uvicorn (ASGI) |
| Business app + admin | Django |
| Async API / ML serving | FastAPI |
| Lean custom service | Flask |
| Blocking code in endpoint | `def` handler (threadpool), never inside `async def` |
| Scale ASGI | gunicorn + `UvicornWorker`, ~1 worker/core |
| Validate + document requests | Pydantic models → auto OpenAPI docs |
| Avoid N+1 on collections | `selectinload`; single JOIN → `joinedload` |
| Session per thread | `scoped_session`; per-task → `async_sessionmaker` |
| Long-lived connections | WebSockets — ASGI only, not WSGI |
| Auth in FastAPI | `Depends` + OAuth2/JWT; scopes for RBAC |
| Large result sets | Cursor pagination over offset |
| Abuse control | Rate-limit middleware or gateway |
| k8s probes | `/healthz` liveness vs `/readyz` readiness |
| Config/secrets | `pydantic-settings` env vars |

---

## 13. Mental-Model Recap

```text
Sync world:   request → worker → blocked until response      (Flask/WSGI)
Async world:  request → coroutine → await I/O → loop serves others → resume   (FastAPI/ASGI)

Framework choice = how much built-in infra you want (least → most):
  Flask (minimalist) → FastAPI (API-focused, assemble the rest) → Django (all included)

Offload:      quick fire-and-forget → BackgroundTasks
              durable / retryable / distributed → Celery
```

Cross-references: asyncio mechanics & GIL → `Python-Concurrency.md`; DI/SOLID design → `Python-OOP.md`; Flask/asyncio testing → `../Testing/Python-Testing-Flask-Asyncio.md`.
