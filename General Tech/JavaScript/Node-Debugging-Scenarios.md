# Node.js Production Debugging Scenarios — Staff/Principal Interview Playbook

---

## 1. The Universal Staff-Level Answer Pattern (Use This for Every Debugging Question)

Whenever an interviewer asks *"How would you debug X in Node.js?"*, structure your answer around this **6-part template**:

```text
1. TRIAGE & CLASSIFY     ──▶ Memory vs CPU vs External Dependency? Sudden vs Gradual? 1 Pod vs Fleet-wide?
2. WHERE TO DEBUG        ──▶ Exact runtime/OS metrics (rss, heapUsed, external, ELU, event-loop lag, GC pauses)
3. HOW TO DEBUG          ──▶ Concrete forensic capture (3-Heap-Snapshot diff & Retainer path / CPU Flamegraph)
4. POSSIBLE CAUSES       ──▶ Ranked root-cause taxonomy (V8 heap vs off-heap Buffer vs main-thread sync vs I/O pool)
5. HOW TO FIX & VALIDATE ──▶ Surgical code fix + staging load replay across multiple Major GC & TTL cycles
6. EXPERIENCE CHECK      ──▶ An incident you can substantiate (symptom → evidence → fix); otherwise label as hypothetical
```

The scenarios below are **illustrative interview exercises**, not verified
incidents from the reader's career. Substitute your own metrics, traces, and
outcomes only when you can explain how they were collected.

### Step 0 — How I Approach Any Production Resource Spike

- **Separate the symptom into three questions immediately**:
  1. Is this a **memory problem** (V8 heap retention, off-heap `Buffer`/`ArrayBuffer`, or native C++ RSS)?
  2. Is this a **CPU problem** (main-thread V8 execution blocking the event loop, or off-thread `libuv`/Worker/GC threads)?
  3. Is this an **application-level symptom triggered by an external dependency** (slow DB/downstream causing in-flight request queuing, retry storms, or cache miss stampedes)?
- **Establish blast radius & correlation**:
  - **Sudden vs Gradual** growth.
  - **Single instance vs All instances** (one hot pod/partition/WebSocket shard vs a bad deploy/config/shared traffic shift).
  - **Correlated with**: a deployment SHA, feature flag, traffic spike, payload size, specific endpoint, tenant, cron job, or Kafka/SQS queue lag.
- **Restarts vs evidence**: Protect availability first; mitigate or restart
  affected replicas when needed. If safe, take evidence from one replica
  before restarting it. Draining a pod from Service endpoints is different
  from cordoning a node; do not delay recovery for a heap snapshot.
- **End-to-End Sequence**:
  `Observe → Scope → Correlate → Classify → Capture Evidence → Isolate → Identify Root Cause → Reproduce in Staging → Fix → Validate Across GC Cycles → Prevent Recurrence`

---

## 2. Core Diagnostic Reference Matrices

### Memory Breakdown in `process.memoryUsage()` (Where the Bytes Actually Live)

| Metric | What It Measures | If This Grows While Others Stay Flat |
| --- | --- | --- |
| **`rss` (Resident Set Size)** | Total physical RAM mapped to the OS process (V8 Heap + Code + Stack + C++ Native + Off-heap Buffers) | Native C++ addon leak (`sharp`, `bcrypt`, `grpc`), glibc malloc arena fragmentation, or off-heap `Buffer`s |
| **`heapTotal`** | V8 heap capacity currently allocated, not total process memory or the heap limit | V8 expanded heap capacity after high allocation rate |
| **`heapUsed`** | Actual live JS objects inside V8's heap | **JS object retention leak** (closures, `Map`/caches, `EventEmitter` listeners, unresolved Promises) |
| **`external`** | Memory used by C++ objects bound to V8 JS objects | Native bindings, `Buffer`s, `TypedArray`s |
| **`arrayBuffers`** | Memory allocated for `ArrayBuffer` and `SharedArrayBuffer` (including Node `Buffer` instances) | Missing stream backpressure, unconsumed `Readable` streams, large file/S3/multipart uploads held in RAM |

> **Node.js V8 Heap OOM vs Container/OS OOM (`Exit Code 137`)**:
>
> - **V8 Heap OOM**: `heapUsed` hits `--max-old-space-size` → Node prints `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` and aborts (`SIGABRT` / exit `134`).
> - **Container/Linux cgroup OOM (`SIGKILL`, often exit `137`)**:
>   The cgroup memory limit accounts for process memory plus other charged
>   pages, not just V8 heap or one process's RSS. Check pod `lastState`,
>   cgroup `memory.current`/`memory.events`, and RSS. Set a measured V8
>   old-space limit below the container limit, leaving headroom for young
>   generation, Buffers, native libraries, and other processes; **75% is
>   not a universal safe setting**.

### Memory Leak vs Temporary Memory Allocation Spike

| Characteristic | **Gradual Memory Leak** | **Temporary Memory Allocation Spike** |
| --- | --- | --- |
| **Growth curve** | Sawtooth with a **continuously rising post-GC floor** | Sharp vertical jump during workload, then **returns to baseline** after Major GC |
| **V8 Old Generation** | Monotonically grows as surviving objects get promoted from NewSpace → OldSpace | Spikes temporarily (`LargeObjectSpace` or NewSpace), reclaimed on Mark-Sweep-Compact |
| **GC behavior** | Major GC frequency & pause duration climb steadily (`GC death spiral` before OOM) | Brief burst of Scavenge / Mark-Sweep during the spike |
| **Typical cause** | **Retained references** (`Map` without TTL/LRU, leaked listener, closure, timer) | **Large per-request allocation** (`JSON.parse` on 100MB payload, unpaginated `SELECT *`, batch load) |
| **Primary tool** | **3-Heap-Snapshot Comparison (`# Delta` & Retainer tree)** | Allocation timeline / `--heap-prof` + request payload/concurrency correlation |
| **Key question** | *"Why are these objects still reachable from a GC root?"* | *"Which endpoint, batch job, or payload allocated this all at once?"* |

### CPU Spike vs Memory Spike

| Signal | **CPU Spike** | **Memory Spike / Leak** |
| --- | --- | --- |
| **Primary metric** | Process CPU % (`top -H`, cgroup CPU usage) | `rss`, `heapUsed`, `external`, `arrayBuffers` |
| **Runtime health metric** | **Event-Loop Lag (`monitorEventLoopDelay`) & ELU (`performance.eventLoopUtilization()`)** | **V8 GC frequency, pause duration (`perf_hooks` GC observer), OldSpace utilization** |
| **Main diagnostic artifact** | **CPU Profile (`.cpuprofile` flamegraph)** | **Heap Snapshot (`.heapsnapshot` comparison diff)** |
| **Typical symptom** | All concurrent requests stall; health check probes time out | Latency degrades gradually as GC thrashing increases, ending in OOM crash |
| **Key evidence** | **Hot function self-time & call stack** in flamegraph | **Retaining reference path** back to GC Root (`Global`, `System / Context`) |

---

## 3. Scenario 1: Gradual Node.js Memory Leak (Post-GC Baseline Creep)

> **Interview Prompt**: *"Your Node.js service's memory grows steadily over 12–24 hours until pods crash with OOM. Restarting fixes it temporarily. How do you debug and fix it?"*

### 1. Where to Debug (Gradual Heap Leak)

- **Application / Runtime Metrics**: Compare `rss`, `heapUsed`, `heapTotal`, `external`, and `arrayBuffers` alongside **V8 Major GC pause duration & frequency** and **memory per request / per active connection**.
- **Confirming It Is a True Leak**: High memory alone is not a leak. A leak is confirmed when **traffic drops or Major GC runs, yet the post-GC `heapUsed` floor keeps ratcheting higher across multiple GC cycles** (objects survive 2+ Young-Generation Scavenges, get promoted to OldSpace, and are never collected).

### 2. How to Debug — The 3-Snapshot Diff Technique

Comparing snapshots across representative traffic can reveal retention. Use
three when safe; snapshot creation pauses JavaScript and can require substantial
additional memory.

```bash
# Start the service with the flag; then signal THAT running process.
node --heapsnapshot-signal=SIGUSR2 dist/server.js
kill -USR2 <pid>
```

Alternatively call `v8.writeHeapSnapshot()` **inside the target process** from
a secured diagnostic control path. `node -e` snapshots a different process.
Never expose a snapshot endpoint publicly; dumps contain sensitive data.

1. **Snapshot 1 (Baseline)**: Capture after pod warm-up and initial GC.
2. **Snapshot 2 (After Workload)**: Drive representative traffic for 10–15 minutes, then capture.
3. **Snapshot 3 (After More Workload + GC)**: Drive another 15 minutes of traffic, then capture.
4. **Analyze in Chrome DevTools (`Memory` tab)**:
   - Load all 3 snapshots → Select **Snapshot 3** → Switch view from `Summary` to **`Comparison` (against Snapshot 1 or 2)**, or use **"Objects allocated between Snapshot 1 and Snapshot 2"** still alive in Snapshot 3.
   - Sort by **`# Delta`** (object count growth) and **`Retained Size Delta`** (memory freed if this object were GC'd — **not** `Shallow Size`!).
   - Expand the bottom **`Retainers` pane** to trace the exact reference chain (`object → closure context → Map / EventEmitter → GC Root`) keeping the object reachable.
   - *Constrained containers*: Snapshot memory/time overhead depends on heap
     size. Take one on a drained replica with headroom or use allocation
     sampling (`--heap-prof` / `HeapProfiler.startSampling`) and measure its
     overhead in your workload.

### 3. Possible Causes — Common Node.js Leak Vectors

1. **Unbounded In-Memory Caches**: Module-scoped `Map`, `{}` dictionary, or misconfigured LRU cache without `max` entries / TTL eviction.
2. **Global Variables**: Accidental attachment to `globalThis` or module-level arrays accumulating entries.
3. **EventEmitter Listener Leaks**: Calling `emitter.on('data', ...)` per request on a long-lived singleton (`redisClient`, `process`, message bus) without `.off()` / `.once()` (`MaxListenersExceededWarning` at `>10` listeners).
4. **Un-cleared Timers**: `setInterval` or long `setTimeout` callbacks whose closures capture request state.
5. **Closures Retaining Large Scopes**: A tiny inner callback retained in a queue/cache shares a V8 `Context` with a 10MB variable declared in the outer function.
6. **Pending asynchronous work**: Pending Promises are not roots by
   themselves; retaining callbacks, timers, queues, or in-flight operations
   referencing them can keep request state alive. A losing `Promise.race`
   operation keeps running unless it is explicitly canceled.
7. **Request Context Retention**: Storing `req`/`res` objects (which reference the entire `Socket`, parser, and headers) inside a singleton logger, telemetry buffer, or `AsyncLocalStorage` misuse.
8. **Unbounded In-Memory Queues**: Pushing jobs into an in-memory array faster than downstream workers drain them.
9. **Streams Missing Backpressure**: Using `readable.on('data', chunk => writable.write(chunk))` without checking `writable.write()`'s `false` return value or using `stream.pipeline()`.
10. **WebSocket Connection State**: Not calling
    `connectionMap.delete(socketId)` on `close` / `error` events.
11. **Worker Threads**: Spawning `new Worker()` without calling `worker.terminate()` or accumulating unconsumed `postMessage` buffers.
12. **Third-Party SDKs / ORM Metadata**: Re-instantiating Prisma/TypeORM/AWS SDK clients per request instead of reusing a singleton pool.
13. **Asynchronous Logging Buffers**: Passing huge `req`/`err` objects to async loggers when transport egress is backed up.
14. **Batch Processing**: Loading 500k DB rows into an array via `.findAll()` instead of cursor streaming.

### 4. How to Fix & Validate (Gradual Heap Leak)

- **Fix**: Bound caches by size and/or TTL (e.g., an LRU); use `WeakMap`
  only when object-key lifetime is the desired eviction mechanism. Pair
  `emitter.on()` with `emitter.off()` in cleanup, or use the async iterator
  `events.on(emitter, 'msg', { signal })` where appropriate. Avoid capturing
  entire request objects in long-lived callbacks.
- **Validate**: Replay the workload in staging across **multiple Major GC cycles and cache TTL windows**. The fix is only proven when the post-GC `heapUsed` floor flattens into a horizontal line over hours.

### 5. Illustrative Production Scenario (Per-Tenant Closure Leak)

- **Symptom to investigate**: An API's post-GC heap grows after a
  per-tenant validator cache is introduced.
- **Evidence to seek**: Compare snapshots across load cycles and trace
  retained request objects back to a cache key or callback closure.
- **Potential fix and proof**: Cache by bounded tenant key, pass only
  required values to the validator, and verify a stable post-GC baseline
  under representative load. Do not present this as a personal incident
  unless you actually observed it.

---

## 4. Scenario 2: Sudden Memory Spike & Container `OOMKilled (137)` (Off-Heap / Buffer / Large Allocation)

> **Interview Prompt**: *"Your Node.js containers suddenly spike in memory and get killed by Kubernetes (`OOMKilled`), sometimes within 30 seconds, even though V8 `heapUsed` only shows 250MB out of a 1GB limit. How do you debug this?"*

### 1. Where to Debug (Sudden Memory Spike)

- Check **`rss` vs `heapUsed` vs `external` + `arrayBuffers`** and correlate with **request payload sizes (`Content-Length`), concurrent downloads/uploads, batch cron schedules, and database row counts**.
- Check Kubernetes `kubectl describe pod` → `Last State: Terminated (Reason: OOMKilled, Exit Code: 137)` + cgroup `container_memory_working_set_bytes`.

### 2. How to Debug (Sudden Memory Spike)

```javascript
// Structured memory telemetry middleware / sampler for spike correlation
setInterval(() => {
  const m = process.memoryUsage();
  logger.info({
    rssMB: Math.round(m.rss / 1e6),
    heapUsedMB: Math.round(m.heapUsed / 1e6),
    externalMB: Math.round(m.external / 1e6),
    arrayBuffersMB: Math.round(m.arrayBuffers / 1e6),
  }, 'mem_sample');
}, 5000).unref();
```

- Compare whether **one pod** spiked (indicates a single large request, tenant export, or poison Kafka message landed on that pod) vs **all pods** spiked simultaneously (indicates a cron job, cache stampede, or bad deploy).

### 3. Possible Causes (Sudden Memory Spike)

1. **Buffering Entire Files / S3 Objects / Multipart Uploads in RAM**: Using `await s3Response.Body.transformToByteArray()` or `fs.promises.readFile()` on a 300MB CSV/archive instead of streaming.
2. **Missing Stream Backpressure**: A fast producer writing to a slow
   HTTP response via `.on('data', d => res.write(d))` without pausing when
   `write()` returns `false` can queue far beyond `highWaterMark`;
   `highWaterMark` is a threshold, not a hard memory cap.
3. **Massive `JSON.parse` / `JSON.stringify`**: Parsing or serializing a 100MB JSON string allocates the raw string + `Buffer` + resulting V8 object graph simultaneously (**3–5× multiplier** of the raw payload size).
4. **Unbounded Database Queries**: `SELECT *` without `LIMIT` or cursor pagination when a power-tenant has 2M rows.
5. **Native Addon Memory (`sharp` image processing / `zlib`)**: High concurrency of image resizes or `zlib` decompression allocating C++ memory outside V8's heap (`rss` spikes while `heapUsed` stays small) + Linux `glibc` `malloc` arena retention.

### 4. How to Fix & Validate (Sudden Memory Spike)

- **Use `stream.pipeline()` for all I/O**: Automatically propagates backpressure (`pause()`/`resume()`) and destroys all streams if either side errors or the client disconnects early:

```javascript
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

// Stream without materializing the entire response; memory depends on
// stream buffering, concurrency, and transform implementation.
await pipeline(s3ReadableStream, createGzip(), res);
```

- Enforce strict body-size limits (`express.json({ limit: '1mb' })`), paginate all DB queries, cap concurrent native operations with a semaphore (`p-limit`), and set `MALLOC_ARENA_MAX=2` (or use `jemalloc`) if native C++ fragmentation keeps `rss` inflated.

### 5. Illustrative Production Scenario (Export Backpressure)

- **Symptom to investigate**: Memory spikes during concurrent CSV exports
  while JS heap usage remains comparatively flat.
- **Evidence to seek**: Correlate request size and concurrency with RSS
  and `arrayBuffers`; the latter is already included in `external`, so do
  not add them together.
- **Potential fix and proof**: Use a bounded DB cursor and
  `pipeline(source, transform, response)`; verify memory plateaus and
  canceled clients release resources under slow-network load.

---

## 5. Scenario 3: Sudden 100% CPU Spike + High Event-Loop Lag (Main Thread Blocked)

> **Interview Prompt**: *"Your Node.js service suddenly hits 100% CPU on one core, p99 latency jumps from 20ms to 15 seconds, and health checks start failing. How do you debug and resolve it?"*

### 1. Where to Debug (Main-Thread CPU Spike)

- **Primary Signals**: Process CPU at `100%` (1 full vCPU core) **AND** **Event-Loop Lag (`perf_hooks.monitorEventLoopDelay`) spiking (`>500ms`)** **AND** **Event-Loop Utilization (`ELU`) approaching `1.0` (`100%`)**.
- **Key Distinction**: When **both CPU and Event-Loop Lag spike together**, the **single JavaScript main thread** is executing synchronous CPU-bound code and starving all I/O callbacks, timers, and `/healthz` probes!

### 2. How to Debug — Capturing & Diffing CPU Flamegraphs

Capture a **30-second V8 CPU Profile (`.cpuprofile`)** while the spike is actively happening, and compare it against a healthy baseline profile:

```javascript
// On-demand programmatic CPU profiler (safe to trigger on a live pod for 15–30s)
import inspector from 'node:inspector/promises';
import fs from 'node:fs/promises';

async function captureCpuProfile(durationMs = 15_000) {
  const session = new inspector.Session();
  session.connect();
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  await new Promise((r) => setTimeout(r, durationMs));
  const { profile } = await session.post('Profiler.stop');
  await fs.writeFile(`/tmp/cpu-${Date.now()}.cpuprofile`, JSON.stringify(profile));
  session.disconnect();
}
```

- Open the `.cpuprofile` in **Chrome DevTools (`Performance` / `JavaScript Profiler`)**, **Speedscope**, or run **`0x` / `clinic flame`**.
- Look for **wide flat plateaus at the top of the flamegraph** (high **Self Time** = the exact function burning CPU cycles, vs **Total Time** = wrapper functions waiting on children).

### 3. Possible Causes — Common Node.js CPU Spike Vectors

1. **Catastrophic Regular Expression Backtracking (ReDoS)**: Evil nested quantifiers like `/^([a-zA-Z0-9]+)+$/` or `/(\w+\s?)*$/` evaluated against a crafted 50-character non-matching input takes O(2^N) steps and locks the event loop for minutes!
2. **Accidentally Quadratic O(N²) Algorithms**: `items.map(x => otherArray.find(y => y.id === x.id))` inside a loop when array size grows from `50` in dev to `25,000` in prod (6.25 × 10⁸ iterations!).
3. **Massive Synchronous `JSON.parse` / `JSON.stringify`**: Serializing/cloning multi-megabyte objects on every request.
4. **Large In-Memory Sorting**: `.sort()` with expensive string/date comparisons on tens of thousands of objects.
5. **Chained Array Allocations**: `arr.filter(...).map(...).reduce(...)` over 500k elements creating multiple intermediate arrays and triggering GC storms.
6. **Synchronous Filesystem / Crypto / Zlib APIs**: `fs.readFileSync`, `crypto.pbkdf2Sync`, `bcrypt.hashSync`, `zlib.deflateSync` called inside request handlers instead of their async `libuv` equivalents.
7. **Excessive Synchronous Logging / Error Stack Generation**: `new Error().stack` capture or `JSON.stringify` of huge context objects inside a tight loop.
8. **Infinite `while` Loops or Synchronous Recursion**: Edge-case pagination cursor that returns the same page token endlessly without yielding.
9. **Hot Retry Loops (Missing Backoff)**: A failed downstream dependency retried immediately in a `while` loop without `await sleep(backoff)`.
10. **Cache Miss Stampede (Thundering Herd)**: Hot cache key expires → 500 concurrent requests recompute the same expensive aggregation simultaneously.
11. **Runaway Kafka / Queue Consumer Loop**: Consumer pulling and deserializing huge message batches without concurrency throttling.

### 4. How to Fix & Validate (Main-Thread CPU Spike)

- **ReDoS**: Audit regexes with `safe-regex` / ESLint `eslint-plugin-security`, rewrite nested quantifiers into linear patterns, cap input `.length` before regex matching, or use **`re2`** (Google's linear-time O(N) regex binding for Node.js).
- **O(N²) Loops**: Pre-index the lookup array into a `Map` or `Set` (O(N) total instead of O(N²)).
- **Heavy CPU Tasks (PDFs, Crypto, AST/Data Crunching)**: Offload to a bounded **Worker Thread pool (`piscina`)** or partition long synchronous loops across ticks using `setImmediate()` so I/O and health checks can interleave.

### 5. Illustrative Production Scenario (ReDoS Event-Loop Freeze)

- **Symptom to investigate**: Event-loop delay and CPU rise for a
  particular malformed input while request rate is unchanged.
- **Evidence to seek**: A bounded CPU profile attributes time to the
  problematic regular expression; reproduce safely with length-limited
  inputs outside production.
- **Potential fix and proof**: Bound input length and replace ambiguous
  nested quantifiers with a linear-time expression/engine. Load-test the
  worst-case input and measure event-loop latency.

---

## 6. Scenario 4: High CPU Utilization with LOW Event-Loop Lag (Off-Thread CPU Saturation)

> **Interview Prompt**: *"Container CPU is at 350% (on a 4-vCPU pod), but Node.js event-loop lag is under 5ms. What is consuming the CPU and how do you find it?"*

### 1. Where to Debug & Why Event-Loop Lag Is Low

- A Node.js process is **not** single-threaded at the OS level! Alongside the 1 main JS Event-Loop thread, a Node process runs:
  - **4 `libuv` Threadpool threads** (`UV_THREADPOOL_SIZE`, up to 1024) executing async C++ crypto (`pbkdf2`, `scrypt`), `zlib` compression, `fs.*` calls, and `dns.lookup()`.
  - **V8 Background GC & JIT Compiler threads** (concurrent marking, sweeping, TurboFan optimization).
  - **Worker Threads (`node:worker_threads`)** or native C++ addon threads (`sharp`/`libvips`, `grpc`).
- Because that work happens **off the main event-loop thread**, `monitorEventLoopDelay()` stays near `0ms` while OS/container CPU hits `300–400%`!

### 2. How to Debug (Off-Thread CPU Saturation)

```bash
# View per-thread CPU usage inside the Node process on Linux:
top -H -p <node_pid>
# Or inspect thread names (V8 WorkerThread, libuv-worker, ChildThread):
ps -T -p <node_pid> -o pid,spid,comm,%cpu
# Native + JS stack profiling across all OS threads:
perf record -F 99 -p <node_pid> -g -- sleep 15 && perf script
```

### 3. Possible Causes & Fixes (Off-Thread CPU Saturation)

1. **V8 GC Thrashing (Concurrent Marking Storm)**: Heap is 90% full (`heapUsed` near `--max-old-space-size`), causing V8 background GC threads to spin continuously trying to reclaim memory → Check GC metrics; fix the underlying allocation/retention or raise heap headroom.
2. **High-Concurrency Async Crypto / Zlib on `libuv` Threadpool**: Thousands of concurrent `zlib.gzip()` or `crypto.pbkdf2()` calls saturating all `libuv` worker threads → Cache compressed payloads at CDN/reverse-proxy (Nginx/Envoy) or bound concurrency.
3. **Runaway `worker_threads` Pool**: A worker thread stuck in a loop → Attach inspector or profile individual `Worker` instances.

---

## 7. Scenario 5: High Latency / Hanging Requests with LOW CPU and Normal Memory (Starvation & Deadlocks)

> **Interview Prompt**: *"Your Node.js API's p99 latency spikes to 30 seconds and requests time out, yet CPU is at 8% and memory is flat at 30%. How do you debug this?"*

### 1. Where to Debug (Low-CPU Latency Spike)

- **External I/O & Pool Metrics**: DB connection pool (`waitingCount`,
  `activeCount`, `max`), HTTP outbound `Agent` socket queues (`agent.requests`,
  `agent.sockets`), and downstream latencies (OpenTelemetry spans).
  Node does not expose a stable built-in libuv queue-depth metric; use
  instrumented wait times or diagnostic tools.

### 2. How to Debug (Low-CPU Latency Spike)

- Inspect **Distributed Traces (OpenTelemetry)** to see which span (`db.query`, `http.client`, `dns.lookup`) accounts for the 30s wall-clock gap.
- Dump active handles and requests holding the event loop open (`process._getActiveHandles()`, `process._getActiveRequests()`, or `wtfnode`).

### 3. Possible Causes & Fixes (Low-CPU Latency Spike)

1. **Database Connection Pool Leaked / Exhausted**: A code path acquired a client (`const client = await pool.connect()`) for a transaction, threw an error, and **forgot `client.release()` in a `finally` block**! Once all 20 connections leak, the entire service hangs at `0%` CPU waiting for a connection.
   - *Fix*: Wrap `pool.connect()` in `try { ... } finally {
     client.release(); }` and set acquisition/query timeouts. Use
     `await using` only if the client actually implements
     `Symbol.asyncDispose`.
2. **`dns.lookup()` Starving the 4-Thread `libuv` Threadpool**: By default, `fetch`/`http.request` calls `dns.lookup()` (which runs synchronously on the **4-thread `libuv` pool** via OS `getaddrinfo`). If 4 slow `fs` or `crypto` tasks occupy the pool (or NSS/CoreDNS stalls), **every outbound HTTP call queues behind `dns.lookup()`**!
   - *Fix*: Reuse connections with an appropriate agent/pool; first
     measure threadpool contention. Consider a larger
     `UV_THREADPOOL_SIZE` before startup only if it helps under load.
     `dns.resolve4()` uses c-ares but is **not a transparent drop-in**
     replacement for `dns.lookup()` (OS hosts/NSS resolution differs).
3. **Un-awaited / Dangling Promise Deadlock**: `new Promise()` wrapper around a callback API that doesn't handle the `error` event, leaving the `await` hanging forever until the load balancer returns `504`.
   - *Fix*: Bound each outbound call with a timeout and pass an
     `AbortSignal` when the library supports cancellation; racing a
     Promise against a timer alone does not stop the underlying work.

### 4. Illustrative Production Scenario (DNS Lookup Starvation)

- **Symptom to investigate**: Outbound requests are slow despite low
  main-thread CPU and healthy upstream response times.
- **Evidence to seek**: Client timing separates DNS/acquisition from
  connect and response; compare pool wait with async crypto/fs activity
  and lookups. A trace span alone may not expose the DNS subphase.
- **Potential fix and proof**: Bound concurrent threadpool work and
  reuse outbound connections; test threadpool tuning under representative
  load before changing its size.

---

## 8. Scenario 6: Gradual CPU Creep + GC Thrashing ("The V8 GC Death Spiral") & `process.report`

> **Interview Prompt**: *"Your Node.js pods run fine for the first 6 hours after deploy, then CPU gradually climbs from 25% to 95% and p99 latency triples even though request rate hasn't changed. How do you debug and fix it?"*

### 1. Where to Debug (Gradual CPU Creep)

- Correlate GC duration **by kind** (for example via `perf_hooks`
  `PerformanceObserver`), post-GC heap used, RSS, and event-loop delay.
- **Why a memory leak can look like a CPU problem**: Retained objects
  reduce free old-space capacity, increasing collection frequency and
  work. There is no universal utilization threshold or CPU percentage
  at which a "GC death spiral" begins; profile before attributing CPU
  to GC.

### 2. How to Debug (Lightweight Production Forensics with `process.report`)

When a pod is already thrashing at 90% heap/CPU, taking a full `.heapsnapshot` can immediately OOM-kill it. Use **Node.js Built-in Diagnostic Reports (`process.report`)** and **Heap Allocation Sampling (`--heap-prof`)** first:

```bash
# Configure reports at startup; the signal produces a diagnostic report.
node --report-on-fatalerror --report-on-signal --report-signal=SIGUSR2 dist/server.js
```

- `kill -USR2 <pid>` writes a report for a process started with these
  flags. `process.report.getReport()` instead returns a JS object in
  the running process; `process.report.writeReport()` writes a file.
  Reports can pause execution and contain sensitive paths/data. They
  include:
  1. **JavaScript + Native C++ stack traces** at the moment of the signal/crash.
  2. **V8 Heap Spaces breakdown** (`new_space`, `old_space`, `code_space`, `large_object_space`).
  3. **All active `libuv` handles** (open sockets, timers, file descriptors, child processes).
  4. **OS resource usage & `ulimit`s** (RSS, page faults, CPU user/sys time).

### 3. Possible Causes & Fixes (Gradual CPU Creep)

1. **GC Thrashing from OldSpace Promotion**: Fix underlying retention
   (Scenario 1) and size old space using measured container headroom.
2. **Linear Scan over Growing In-Memory State**: An array/list (`activeSessions`, `eventHistory`, or `EventEmitter` listeners) that grows over hours and is scanned O(N) on every request → Replace with a `Map`/`Set` (O(1) lookup) + TTL eviction.
3. **V8 Hidden Class Deoptimization (`Megamorphic` Inline Caches)**: Dynamically adding/deleting keys (`delete obj.prop`) or attaching thousands of unique dynamic keys to an object forces V8 into slow dictionary-mode property lookups → Keep object shapes stable (initialize keys to `null`/`undefined`) and use `Map` for dynamic key-value dictionaries.

---

## 9. Staff-Level Production Observability Checklist & Verbal Sound Bites

### Production Node.js Signals to Prioritize

| Category | Required Metrics (Prometheus / OpenTelemetry) |
| --- | --- |
| **Memory (5)** | `rss`, `heapUsed`, `heapTotal`, `external`, `arrayBuffers` |
| **Garbage Collection (3)** | Minor GC (Scavenge) rate, Major GC (Mark-Sweep-Compact) rate, **GC pause duration histogram** |
| **Event Loop & CPU (3)** | **Event-Loop Lag p99 (`nodejs_eventloop_lag_p99_seconds`)**, **Event-Loop Utilization (`ELU`)**, Process CPU (`user` + `system`) |
| **Golden Signals (3)** | Request rate (RPS), Request duration histogram (p50/p95/p99), Error rate (`4xx`/`5xx`) |
| **Saturation & Pools (3)** | Active HTTP/WS connections, DB/HTTP connection pool (`active`/`idle`/`waiting`), Kafka consumer lag & internal cache hit/miss + size |

### Verbal Sound Bites for Staff Interviews (Memorize These)

- *"I don't start by bumping `--max-old-space-size` or restarting the fleet — availability first; if it's safe, I capture evidence from one replica before restarting it."*
- *"High memory isn't automatically a leak. The signal I look for is a **post-Major-GC `heapUsed` floor that keeps rising** across multiple GC cycles after traffic normalizes."*
- *"Before snapshotting, I check `process.memoryUsage()` to see **which** bucket grows — `heapUsed` suggests V8 object retention, `external`/`arrayBuffers` suggests off-heap `Buffer`s or missing backpressure, `rss` alone suggests native allocations or arena fragmentation. That narrows the search, not proves the cause."*
- *"A single snapshot is mostly noise. I compare snapshots across workload intervals, sort by `Retained Size Delta`, and follow the **Retainer tree** to a GC root — allocation shows what was created; retention shows why it couldn't be freed."*
- *"For CPU I compare **CPU % with event-loop lag and ELU**: both high points to main-thread synchronous work; high CPU with low lag points to off-thread work in libuv, GC, or worker threads."*
- *"For a leak fix, **time is part of the test** — staging load must stay flat across multiple Major GC cycles and TTL expiration windows before I call it fixed."*
