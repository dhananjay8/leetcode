# Node.js Advanced Async & Internals — Staff/Principal Interview Deep Dive

---

## 1. Worker Threads

Worker threads let Node.js run JavaScript in parallel. They are designed for **CPU-bound** tasks, not I/O-bound work, because Node's built-in async I/O is already efficient.

Each worker has its own V8 isolate and event loop. They do not share variables with the main thread, but `SharedArrayBuffer` can be used for shared memory.

### Creating a worker

```javascript
const { Worker } = require('worker_threads');

const worker = new Worker('./worker-script.js');
```

### Main thread communication

```javascript
const { Worker } = require('worker_threads');

const worker = new Worker('./worker-script.js');

worker.on('message', (message) => {
  console.log('Received from worker:', message);
});

worker.on('error', (err) => console.error(err));
worker.on('exit', (code) => {
  if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
});

worker.postMessage('Hello from main thread!');
```

### Worker thread script

```javascript
const { parentPort } = require('worker_threads');

parentPort.on('message', (message) => {
  const result = performCalculation(message);
  parentPort.postMessage(result);
});

function performCalculation(input) {
  // CPU-intensive work
  return input * 2;
}
```

### Terminating a worker

```javascript
worker.terminate(); // force stop
```

Staff point: **Use worker threads for CPU-bound work. For I/O-bound tasks, prefer native async APIs and the event loop.**

---

## 2. EventEmitters

`EventEmitter` is the core building block of Node.js streams, HTTP, and many APIs. It implements the Observer pattern.

### Common methods

| Method | Purpose |
|---|---|
| `on(event, listener)` | Subscribe to an event |
| `once(event, listener)` | Subscribe once, then remove |
| `emit(event, ...args)` | Emit an event with optional data |
| `removeListener(event, listener)` | Remove a specific listener |
| `off(event, listener)` | Alias for `removeListener` |

### Example

```javascript
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

myEmitter.on('greet', (name) => {
  console.log(`Hello, ${name}!`);
});

myEmitter.emit('greet', 'Alice'); // Hello, Alice!
```

### Error events

```javascript
myEmitter.on('error', (err) => {
  console.error('Emitter error:', err);
});
```

If an `'error'` event is emitted without a listener, Node.js throws and may terminate the process.

---

## 3. Streams

Streams process data in chunks rather than buffering everything in memory. Types:

| Type | Direction | Example |
|---|---|---|
| **Readable** | Read | `fs.createReadStream`, `process.stdin` |
| **Writable** | Write | `fs.createWriteStream`, `process.stdout` |
| **Duplex** | Both | TCP socket |
| **Transform** | Read + write with transformation | `zlib.createGzip()` |

### Pipe example

```javascript
const fs = require('fs');
const zlib = require('zlib');

const input = fs.createReadStream('input.txt');
const gzip = zlib.createGzip();
const output = fs.createWriteStream('output.txt.gz');

input.pipe(gzip).pipe(output);
```

---

## 4. Backpressure

Backpressure occurs when a readable stream produces data faster than the writable stream can consume it. The writable stream signals pause/resume automatically.

| Signal | Meaning |
|---|---|
| `writable.write(chunk)` returns `false` | Buffer is full; slow down |
| `'drain'` event | Writable is ready for more data |
| `readable.pause()` / `readable.resume()` | Manual flow control |

Staff point: **Always handle backpressure when piping large amounts of data; ignoring it can exhaust memory.**

---

## 5. Child Processes: `spawn` vs `fork`

Both are from `child_process`. Choose based on communication needs.

| Method | Purpose | Communication | Overhead |
|---|---|---|---|
| `spawn` | Run external commands / non-Node processes | stdio streams | Low |
| `fork` | Spawn a separate Node.js module | IPC messages | Higher (due to IPC) |

### spawn example

```javascript
const { spawn } = require('child_process');

const ls = spawn('ls', ['-l', '-a']);

ls.stdout.on('data', (data) => console.log(`stdout: ${data}`));
ls.stderr.on('data', (data) => console.error(`stderr: ${data}`));
ls.on('close', (code) => console.log(`Child exited with ${code}`));
```

### fork example

```javascript
const { fork } = require('child_process');

const child = fork('child.js');

child.on('message', (message) => {
  console.log('Message from child:', message);
});

child.send({ hello: 'world' });
```

---

## 6. Error Handling in Node.js

### Synchronous errors

```javascript
try {
  const result = JSON.parse('invalidJSON');
} catch (error) {
  console.error('Parse error:', error.message);
}
```

### Asynchronous errors: callbacks

```javascript
fs.readFile('file.txt', (error, data) => {
  if (error) {
    console.error(error.message);
    return;
  }
  console.log(data.toString());
});
```

### Asynchronous errors: Promises

```javascript
const fs = require('fs/promises');

fs.readFile('file.txt')
  .then((data) => console.log(data.toString()))
  .catch((error) => console.error(error.message));
```

### Custom error classes

```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  throw new ValidationError('Invalid input');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  }
}
```

### Global error events

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // application.exit(1); // recommended for production safety
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Best practice: log, then restart the process
  process.exit(1);
});
```

Staff point: **In production, `uncaughtException` should be a last-resort safety net that logs and restarts; not a recovery mechanism.**

### Express error-handling middleware

```javascript
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send('Internal Server Error');
});
```

---

## 7. CommonJS (`require`) vs ES Modules (`import`)

| Aspect | CommonJS (`require`) | ES Modules (`import`) |
|---|---|---|
| Syntax | `const x = require('x')` | `import x from 'x'` |
| Loading | Synchronous, runtime | Static parse, asynchronous loading possible |
| Top-level `await` | No | Yes |
| Tree-shaking | Limited | Better |
| Native in Node | Default | Set `"type": "module"` or use `.mjs` |
| `__dirname` | Available | Not available; use `import.meta.url` |

```javascript
// CommonJS
const fs = require('fs');
module.exports = { foo };

// ES Module
import fs from 'fs';
export function foo() {}
```

---

## 8. NPM Essentials

| Command | Effect |
|---|---|
| `npm install <pkg>` | Add to `dependencies` |
| `npm install --save-dev <pkg>` | Add to `devDependencies` |
| `npm install -g <pkg>` | Install globally |
| `npm ci` | Clean install from `package-lock.json` (CI) |
| `npm outdated` | Show outdated packages |
| `npm audit` | Scan for known vulnerabilities |

### Semantic versioning

| Range | Meaning |
|---|---|
| `1.2.3` | Exact version |
| `^1.2.3` | Compatible with minor/patch updates |
| `~1.2.3` | Patch updates only |
| `*` | Latest version |

`package-lock.json` locks the dependency tree for reproducible installs.

---

## 9. Safer Stream Pipelines with `stream.pipeline`

`stream.pipeline` automatically cleans up streams on error and avoids resource leaks compared to manual `.pipe()` chains.

```javascript
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) console.error('Pipeline failed:', err);
    else console.log('Pipeline succeeded');
  }
);
```

For promise-based code:

```javascript
const { pipeline } = require('stream/promises');

await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz')
);
```

---

## 10. `AbortController` and Cancelable Async Operations

```javascript
const controller = new AbortController();
const { signal } = controller;

fetch('https://api.example.com/data', { signal })
  .then((res) => res.json())
  .catch((err) => {
    if (err.name === 'AbortError') console.log('Request canceled');
  });

setTimeout(() => controller.abort(), 5000);
```

Use `AbortSignal` for:

- Canceling outgoing HTTP requests.
- Stopping streams that support signals.
- Forwarding cancellation through multiple async boundaries.

---

## 11. `AsyncLocalStorage` for Request Context Propagation

```javascript
const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
  const id = asyncLocalStorage.getStore();
  console.log(`${id !== undefined ? id : 'unknown'}: ${msg}`);
}

asyncLocalStorage.run(123, () => {
  logWithId('start'); // 123: start
  setImmediate(() => logWithId('finish')); // 123: finish
});
```

Staff use cases:

- Request correlation IDs through async call chains.
- Per-request telemetry / tracing without manual propagation.
- User/tenant context in deeply nested service calls.

---

## 12. Promisified File System APIs (`fs/promises`)

```javascript
const fs = require('fs/promises');

async function readConfig(path) {
  const data = await fs.readFile(path, 'utf8');
  return JSON.parse(data);
}
```

Prefer `fs/promises` over callback or sync APIs in request handlers. The sync APIs block the event loop; the callback API can create deeply nested error handling.

---

## 13. Staff-Level Sound Bites

- "Worker threads add parallelism for CPU-bound JavaScript; they do not replace non-blocking I/O."
- "EventEmitters are the glue of Node.js streams, HTTP, and process events."
- "Streams prevent memory blowups by processing data in chunks; backpressure prevents overloading the consumer."
- "Use `spawn` for external commands; use `fork` when you need IPC between Node processes."
- "`uncaughtException` is a safety net, not a recovery strategy — restart the process."
- "ES modules enable static analysis and tree-shaking; CommonJS remains the default legacy module system."

---

## 14. Quick Reference Table

| Need | Right tool |
|---|---|
| Parallel CPU work inside Node | `worker_threads` |
| Run shell command | `child_process.spawn` |
| Separate Node process with messaging | `child_process.fork` |
| Process large files without loading memory | `fs.createReadStream` + pipes |
| Compress data on the fly | `zlib.createGzip()` Transform stream |
| Decouple components via events | `EventEmitter` |
| Catch unhandled promise rejections | `process.on('unhandledRejection')` |
| Reproducible CI install | `npm ci` |
| Enable ES modules in a package | `"type": "module"` in `package.json` |
| Safely chain streams | `stream.pipeline()` or `stream/promises` |
| Cancel async work | `AbortController` + `AbortSignal` |
| Request-scoped context | `AsyncLocalStorage` |
| Non-blocking file I/O | `fs/promises` |

---

## 15. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| Worker threads | "Worker threads provide real CPU parallelism for JavaScript compute paths; they are not a replacement for async I/O." |
| EventEmitter | "EventEmitter is Node's observer backbone: producers emit events, consumers subscribe, and APIs like streams/HTTP build on it." |
| Streams | "Streams handle large data efficiently in chunks, which avoids memory spikes from full buffering." |
| Backpressure | "Backpressure is flow control: when `write()` returns false, producer must slow down until `drain` fires." |
| `spawn` vs `fork` | "Use `spawn` for external binaries/commands and `fork` for Node child processes that need IPC messaging." |
| Error handling | "Handle errors at local boundaries first, then use process-level handlers only as a crash-and-restart safety net." |
| CJS vs ESM | "CommonJS is runtime `require`; ESM is statically analyzable `import` with better tooling and tree-shaking." |
| npm + lockfiles | "`npm ci` with lockfiles gives deterministic installs, which is mandatory for reproducible CI/CD pipelines." |
| `stream.pipeline` | "`stream.pipeline` safely wires streams together and cleans up on failure, avoiding leaks from manual `.pipe()` chains." |
| `AsyncLocalStorage` | "`AsyncLocalStorage` propagates request-scoped context through asynchronous callbacks without explicit parameter passing." |
| `fs/promises` | "I use `fs/promises` to keep file I/O non-blocking and avoid callback nesting or accidental sync calls in request handlers." |

---

## 16. Frequent Staff-Level Follow-Ups

- **Context propagation:** use `AsyncLocalStorage` for request correlation IDs and per-request telemetry.
- **Cancellation discipline:** support `AbortController` and end-to-end timeouts to avoid hanging async work.
- **Unhandled rejection policy:** decide fail-fast vs tolerate-and-report explicitly; avoid undefined runtime behavior.
- **Dependency governance:** enforce `npm audit` policy, SBOM generation, and regular transitive dependency reviews.
