# JavaScript & TypeScript — Complete Staff Interview Question Bank & Coding Playbook

---

## 1. JSON & Object Manipulation (Questions 1–12)

### Q1. Convert a JS value to a JSON string (`JSON.stringify` behavior & polyfill)

- **Key runtime rules** (the example is deliberately a subset, not a
  drop-in polyfill for `JSON.stringify`):
  - In **Objects**: keys with `undefined`, `Function`, or `Symbol` values are **omitted**; `Symbol` keys are ignored.
  - In **Arrays**: `undefined`, `Function`, or `Symbol` elements serialize as **`null`** to preserve indices.
  - `NaN`, `Infinity`, and `-Infinity` serialize as **`null`**.
  - `Date` calls `.toISOString()` via `Date.prototype.toJSON()`; `BigInt` throws `TypeError`; circular references throw `TypeError`.

```javascript
function jsonStringify(value, seen = new WeakSet()) {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'number' && !Number.isFinite(value)) return 'null';
    return String(value);
  }
  if (typeof value === 'bigint') throw new TypeError('Do not know how to serialize a BigInt');
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
    return undefined;
  }
  if (typeof value.toJSON === 'function') return jsonStringify(value.toJSON(), seen);
  if (seen.has(value)) throw new TypeError('Converting circular structure to JSON');
  seen.add(value);

  if (Array.isArray(value)) {
    const items = value.map((el) => {
      const res = jsonStringify(el, seen);
      return res === undefined ? 'null' : res;
    });
    seen.delete(value);
    return `[${items.join(',')}]`;
  }

  const pairs = [];
  for (const key of Object.keys(value)) {
    const valStr = jsonStringify(value[key], seen);
    if (valStr !== undefined) pairs.push(`${jsonStringify(key)}:${valStr}`);
  }
  seen.delete(value);
  return `{${pairs.join(',')}}`;
}
```

Using the built-in for string escaping keeps the exercise focused on
traversal; a complete replacement must also implement control-character
escaping, `replacer`, `space`, boxed primitives, enumerable getters, and
custom `toJSON` behavior. Use native `JSON.stringify` in real applications.

### Q2. Perform a deep copy of a value, handling circular references

- In modern runtimes, native **`structuredClone(value)`** handles circular
  refs, `Date`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, and typed arrays
  (throws on functions/DOM nodes). Below is a **limited illustration**:

```javascript
function deepClone(value, hash = new WeakMap()) {
  if (Object(value) !== value || typeof value === 'function') return value; // primitives & functions
  if (hash.has(value)) return hash.get(value); // circular reference resolution

  if (value instanceof Date) {
    const result = new Date(value.getTime());
    hash.set(value, result);
    return result;
  }
  if (value instanceof RegExp) {
    const result = new RegExp(value.source, value.flags);
    result.lastIndex = value.lastIndex;
    hash.set(value, result);
    return result;
  }
  if (value instanceof Map) {
    const result = new Map();
    hash.set(value, result);
    value.forEach((v, k) => result.set(deepClone(k, hash), deepClone(v, hash)));
    return result;
  }
  if (value instanceof Set) {
    const result = new Set();
    hash.set(value, result);
    value.forEach((v) => result.add(deepClone(v, hash)));
    return result;
  }

  const clone = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));
  hash.set(value, clone);

  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, hash);
    }
    Object.defineProperty(clone, key, descriptor);
  }
  return clone;
}
```

This does not implement every built-in type (`ArrayBuffer`, typed arrays,
`Error`, `WeakMap`) or private-field semantics; prefer `structuredClone`
when its supported types match the contract.

### Q3. Convert a JSON string back to a JS value (`JSON.parse` + reviver)

```javascript
// Native JSON.parse with a reviver to restore ISO Dates automatically:
const parsed = JSON.parse(rawJson, (key, value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
});
```

### Q4. Merge two objects, deeply combining properties (Prototype-Pollution Safe)

```javascript
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

function deepMerge(target, source) {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue; // guard prototype pollution
    if (isPlainObject(source[key]) && isPlainObject(target?.[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else if (Array.isArray(source[key]) && Array.isArray(target?.[key])) {
      output[key] = [...target[key], ...source[key]];
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
```

### Q5. Deep freeze an object, preventing any changes

```javascript
function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return obj;
  seen.add(obj);
  for (const key of Reflect.ownKeys(obj)) {
    deepFreeze(obj[key], seen);
  }
  return Object.freeze(obj);
}
```

### Q6. Write a polyfill/helper for `typeof` to return the exact runtime type

- Native `typeof null === 'object'` (legacy V8/spec bug from 1995 type tag `000`) and `typeof [] === 'object'`. Use `Object.prototype.toString`:

```javascript
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  // getType(null) -> 'null', getType([]) -> 'array', getType(new Date()) -> 'date', getType(/a/) -> 'regexp'
}
```

### Q7 & Q8. Convert a JS object into a query string & parse a query string back

```javascript
function toQueryString(params) {
  const parts = [];
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    const values = Array.isArray(val) ? val : [val];
    for (const item of values) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
    }
  }
  return parts.join('&');
}

function parseQueryString(query) {
  const clean = query.replace(/^\?/, '');
  if (!clean) return Object.create(null);
  return clean.split('&').reduce((acc, pair) => {
    const separator = pair.indexOf('=');
    const key = decodeURIComponent(
      (separator < 0 ? pair : pair.slice(0, separator)).replace(/\+/g, ' '),
    );
    const val = decodeURIComponent(
      (separator < 0 ? '' : pair.slice(separator + 1)).replace(/\+/g, ' '),
    );
    if (Object.hasOwn(acc, key)) {
      acc[key] = Array.isArray(acc[key]) ? [...acc[key], val] : [acc[key], val];
    } else {
      acc[key] = val;
    }
    return acc;
  }, Object.create(null));
}
```

For URL form encoding, prefer `URLSearchParams` in application code;
the helper above returns a null-prototype object so keys such as
`__proto__` cannot mutate the result's prototype.

### Q9. Return the longest word in a string

```javascript
function longestWord(str) {
  return (str.match(/[\p{L}\p{N}_-]+/gu) ?? []).reduce(
    (longest, word) => (word.length > longest.length ? word : longest),
    '',
  );
}
```

### Q10 & Q42. Compare two objects/values for deep equality (`isEqual`)

```javascript
function deepEqual(a, b, seen = new WeakMap(), reverse = new WeakMap()) {
  if (Object.is(a, b)) return true; // handles +0 vs -0 and NaN === NaN
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  if (a instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp) return a.source === b.source && a.flags === b.flags;

  // Enforce the same aliasing on both sides of a cyclic object graph.
  if (seen.has(a)) return seen.get(a) === b;
  if (reverse.has(b)) return false;
  seen.set(a, b);
  reverse.set(b, a);

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) {
      if (!b.has(k) || !deepEqual(v, b.get(k), seen, reverse)) return false;
    }
    return true;
  }
  if (a instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    Object.prototype.hasOwnProperty.call(b, key) &&
    deepEqual(a[key], b[key], seen, reverse),
  );
}
```

For `Map`/`Set`, keys and elements above follow native identity semantics,
not structural matching; this is an interview subset, not a universal
replacement for an equality library. Compare `ArrayBuffer`/typed arrays,
descriptors, and class-specific state separately when required.

### Q11. Flatten a deeply nested object into dot-notation paths

```javascript
function flattenObject(obj, prefix = '', res = {}) {
  for (const [key, val] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !(val instanceof Date) && Object.keys(val).length > 0) {
      flattenObject(val, nextKey, res);
    } else {
      res[nextKey] = val;
    }
  }
  return res;
}
```

### Q12. Rename keys in an object based on a mapping

```javascript
function renameKeys(obj, keyMap) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [keyMap[key] ?? key, value]),
  );
}
```

---

## 2. Asynchronous Programming & Promise Combinators (Questions 13–22)

### Q13 & Q14. Implement `Promise.any`, `Promise.allSettled`, and `Promise.all`

```javascript
function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    if (promises.length === 0) return reject(new AggregateError([], 'All promises were rejected'));
    const errors = new Array(promises.length);
    let rejectedCount = 0;

    promises.forEach((p, idx) => {
      Promise.resolve(p).then(resolve, (err) => {
        errors[idx] = err;
        if (++rejectedCount === promises.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}

function promiseAllSettled(iterable) {
  const promises = Array.from(iterable);
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
    ),
  );
}

function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const promises = Array.from(iterable);
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let completed = 0;
    promises.forEach((p, idx) => {
      Promise.resolve(p).then((val) => {
        results[idx] = val;
        if (++completed === promises.length) resolve(results);
      }, reject);
    });
  });
}
```

### Q15, Q16, Q17 & Q22. Run N Async Tasks in Series, Concurrently (Parallel), and Race

```javascript
// Q15: Series (sequential execution)
async function runSeries(tasks) {
  const results = [];
  for (const task of tasks) results.push(await task());
  return results;
}

// Q16 & Q22: Concurrently / Parallel
const runParallel = (tasks) => Promise.all(tasks.map((task) => task()));

// Q17: Race polyfill
function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    for (const p of iterable) Promise.resolve(p).then(resolve, reject);
  });
}
```

### Q18. Throttle Promises (Bounded Concurrency Worker Pool)

```javascript
async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await mapper(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
```

### Q19. Cache Identical API Requests (Single-Flight + TTL Cache)

```javascript
function createDedupedFetcher(fetcher, ttlMs = 30_000) {
  const cache = new Map(); // key -> { promise, expiresAt }

  return function (key, ...args) {
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expiresAt > now) return hit.promise;

    const promise = Promise.resolve().then(() => fetcher(key, ...args)).catch((err) => {
      if (cache.get(key)?.promise === promise) cache.delete(key);
      throw err;
    });
    cache.set(key, { promise, expiresAt: now + ttlMs });
    return promise;
  };
}
```

This single-flights identical calls while the entry is valid, but
expiry is measured from request start, not completion. Use a bounded
cache and include every argument affecting the response in the key;
canceling one caller must not cancel shared work for all callers.

### Q20 & Q21. Retry a Promise with Backoff + Jitter & Promise Timeout without Timer Leaks

```javascript
async function retryWithBackoff(fn, { retries = 3, baseMs = 200 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      const jitter = Math.random() * baseMs;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** attempt + jitter));
    }
  }
}

function withTimeout(promise, ms) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}
```

---

## 3. Event Handling, Callbacks & `this` Polyfills (Questions 23–30)

### Q23, Q28 & Q29. EventEmitter / Pub-Sub with `on`, `off`, `once`, `emit`

```javascript
class EventEmitter {
  #events = new Map();

  on(event, listener) {
    if (!this.#events.has(event)) this.#events.set(event, new Set());
    this.#events.get(event).add(listener);
    return () => this.off(event, listener); // unsubscribe handle
  }

  off(event, listener) {
    const set = this.#events.get(event);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) this.#events.delete(event);
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event);
    if (!listeners) return false;
    for (const fn of [...listeners]) fn.apply(this, args); // snapshot avoids mutation bugs during emit
    return true;
  }
}
```

### Q24 & Q25. `debounce` and `throttle` with `.cancel()`

```javascript
function debounce(fn, wait) {
  let timerId = null;
  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args);
    }, wait);
  }
  debounced.cancel = () => {
    clearTimeout(timerId);
    timerId = null;
  };
  return debounced;
}

function throttle(fn, wait) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;

  function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      clearTimeout(timerId);
      timerId = null;
      lastCallTime = now;
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    } else if (!timerId) {
      timerId = setTimeout(() => {
        lastCallTime = Date.now();
        timerId = null;
        fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }, remaining);
    }
  }
  throttled.cancel = () => {
    clearTimeout(timerId);
    timerId = lastArgs = lastThis = null;
    lastCallTime = 0;
  };
  return throttled;
}
```

### Q26 & Q27. Polyfills for `call`, `apply`, and `bind` (Supporting `new`)

```javascript
Function.prototype.myCall = function (context, ...args) {
  const ctx = context === null || context === undefined ? globalThis : Object(context);
  const fnSymbol = Symbol('fn');
  ctx[fnSymbol] = this;
  try {
    return ctx[fnSymbol](...args);
  } finally {
    delete ctx[fnSymbol];
  }
};

Function.prototype.myApply = function (context, argsArray = []) {
  return this.myCall(context, ...argsArray);
};

Function.prototype.myBind = function (context, ...boundArgs) {
  const targetFn = this;
  function boundFunction(...callArgs) {
    const isNew = this instanceof boundFunction; // preserve `new BoundFn()` constructor behavior!
    return targetFn.apply(isNew ? this : context, [...boundArgs, ...callArgs]);
  }
  if (targetFn.prototype) {
    boundFunction.prototype = Object.create(targetFn.prototype);
  }
  return boundFunction;
};
```

### Q30. Event Delegation in DOM

```javascript
function delegate(container, eventType, selector, handler) {
  container.addEventListener(eventType, (event) => {
    const matched = event.target.closest(selector);
    if (matched && container.contains(matched)) {
      handler.call(matched, event, matched);
    }
  });
}
```

---

## 4. Functional Programming (Questions 31–41)

### Q31 & Q35. Single-Arg `memoize` & Lodash `_.memoize(fn, resolver)`

```javascript
function memoize(fn, resolver = (...args) => args[0]) {
  const cache = new Map();
  function memoized(...args) {
    const key = resolver.apply(this, args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }
  memoized.cache = cache;
  return memoized;
}
```

### Q32 & Q39. `pipe` (Left-to-Right) and `compose` (Right-to-Left)

```javascript
const pipe = (...fns) => (initial) => fns.reduce((val, fn) => fn(val), initial);
const compose = (...fns) => (initial) => fns.reduceRight((val, fn) => fn(val), initial);
```

### Q33. Curried Function Supporting Placeholders (`_`)

```javascript
function curry(fn) {
  return function curried(...args) {
    const complete =
      args.length >= fn.length && !args.slice(0, fn.length).includes(curry.placeholder);
    if (complete) return fn.apply(this, args);

    return function (...nextArgs) {
      const merged = args.map((arg) =>
        arg === curry.placeholder && nextArgs.length ? nextArgs.shift() : arg,
      );
      return curried.apply(this, [...merged, ...nextArgs]);
    };
  };
}
curry.placeholder = Symbol('_');
```

### Q34. Polyfill for `Object.assign`

```javascript
function objectAssign(target, ...sources) {
  if (target === null || target === undefined) throw new TypeError('Cannot convert undefined or null to object');
  const to = Object(target);
  for (const src of sources) {
    if (src === null || src === undefined) continue;
    for (const key of Reflect.ownKeys(Object(src))) {
      if (Object.prototype.propertyIsEnumerable.call(src, key)) {
        to[key] = src[key];
      }
    }
  }
  return to;
}
```

### Q36, Q37, Q38, Q40 & Q41. Factorial, Fibonacci, `_.chunk`, Lazy Evaluation & Reduce Flatten

```javascript
// Q36: Factorial
const factorial = (n, acc = 1) => (n <= 1 ? acc : factorial(n - 1, n * acc));

// Q37: Fibonacci up to N terms
function fibonacci(n) {
  const seq = [0, 1];
  for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
  return seq.slice(0, n);
}

// Q38: Lodash _.chunk
function chunk(arr, size = 1) {
  if (size <= 0) return [];
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

// Q40: Lazy evaluation chain using Generators (evaluates only as many items as .take(n) requests!)
class LazyChain {
  constructor(iterable) { this.iterable = iterable; }
  static from(iterable) { return new LazyChain(iterable); }
  map(fn) {
    const prev = this.iterable;
    return new LazyChain((function* () { for (const x of prev) yield fn(x); })());
  }
  filter(pred) {
    const prev = this.iterable;
    return new LazyChain((function* () { for (const x of prev) if (pred(x)) yield x; })());
  }
  take(n) {
    const prev = this.iterable;
    return new LazyChain((function* () {
      let i = 0;
      for (const x of prev) { if (i++ >= n) break; yield x; }
    })());
  }
  value() { return [...this.iterable]; }
}

// Q41 & Q43: Flatten an array recursively using reduce
const flattenReduce = (arr, depth = Infinity) =>
  depth > 0
    ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flattenReduce(val, depth - 1) : val), [])
    : arr.slice();
```

---

## 5. Array & String Manipulation (Questions 42–50)

### Q44. Negative Indexing in Arrays Using `Proxy`

```javascript
function withNegativeIndex(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && /^-?\d+$/.test(prop)) {
        const idx = Number(prop);
        prop = String(idx < 0 ? target.length + idx : idx);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
```

### Q45. Custom Version of Lodash `_.get(obj, path, defaultValue)`

```javascript
function get(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path)
    ? path
    : String(path).replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (const key of keys) {
    if (cur === null || cur === undefined) return defaultValue;
    cur = cur[key];
  }
  return cur === undefined ? defaultValue : cur;
}
```

### Q46, Q47, Q48, Q49 & Q50. Intersection, Dedupe, Sort, GroupBy & Rotate Left by `k`

```javascript
// Q46: Intersection of two arrays — O(N + M)
const intersection = (a, b) => {
  const setB = new Set(b);
  return [...new Set(a)].filter((x) => setB.has(x));
};

// Q47: Remove duplicates
const unique = (arr) => [...new Set(arr)];

// Q48: Sort array of objects by property (non-mutating)
const sortByProp = (arr, key) =>
  [...arr].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0));

// Q49: Group array of objects by property
const groupByProp = (arr, key) =>
  arr.reduce((acc, item) => {
    (acc[item[key]] ??= []).push(item);
    return acc;
  }, {});

// Q50: Rotate array left by k positions
const rotateLeft = (arr, k) => {
  if (arr.length === 0) return [];
  const offset = ((k % arr.length) + arr.length) % arr.length;
  return [...arr.slice(offset), ...arr.slice(0, offset)];
};
```

---

## 6. Core JavaScript Language, Data Structures & Transport Checklist (`JS-TS` Matrix)

| Topic | Staff-Level Interview Answer |
| --- | --- |
| **Internal vs External JS** | Internal `<script>` blocks HTML parsing inline; External `<script src="..." defer>` downloads in parallel, caches across pages, allows strict CSP (`script-src 'self'` without `'unsafe-inline'`), and executes in order before `DOMContentLoaded`. |
| **`=` vs `==` vs `===` vs `Object.is`** | `=` assigns; `==` coerces operands (`0 == ''` is `true`, `null == undefined` is `true`); `===` checks value + type without coercion; `Object.is` matches `===` except `Object.is(NaN, NaN) === true` and `Object.is(+0, -0) === false`. |
| **`getElementById` vs `querySelector` / `All`** | `getElementById` is a fast hash lookup; `getElementsByClassName`/`TagName` return **live `HTMLCollection`s** (auto-mutate on DOM changes); `querySelectorAll` returns a **static `NodeList`** snapshot matching any CSS selector. |
| **Anonymous vs Lambda (Arrow) vs Declaration** | **Function Declarations** are fully hoisted; **Function Expressions** (named or anonymous) are not callable before assignment; **Lambda / Arrow functions** have **no own `this`, `arguments`, `super`, or `new.target`** (they capture lexical `this` and cannot be used with `new`). |
| **Generator Functions (`function*`)** | Return an `Iterator`/`Generator` object whose execution pauses at each `yield` and resumes on `.next(val)` — ideal for lazy infinite streams, custom iterables (`[Symbol.iterator]`), and cooperative coroutines. |
| **Execution Context** | Every function call pushes an Execution Context onto the Call Stack with two phases: **Creation Phase** (builds Lexical Environment, binds `this`, hoists `function` and sets `var` to `undefined`, places `let`/`const` in TDZ) and **Execution Phase** (runs statements line-by-line). |
| **Array Mutating vs Non-Mutating Methods** | **Mutating (9)**: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`. **Non-mutating ES2023 equivalents**: `toSorted()`, `toReversed()`, `toSpliced()`, `with(idx, val)`, plus `map`, `filter`, `reduce`, `slice`, `concat`. |
| **Iterating Object vs Array** | Arrays/Iterables use `for...of` (invokes `[Symbol.iterator]()`); Plain Objects use `Object.keys/values/entries(obj)` or `for...in` guarded by `Object.hasOwn(obj, key)` (since `for...in` walks inherited enumerable prototype properties). |
| **ES6+ Operators (`??`, `?.`, `in`, Numeric sep)** | `a ?? b` falls back **only on `null` or `undefined`** (unlike logical-OR `\|\|` which clobbers `0`, `''`, `false`); `user?.car?.model` short-circuits to `undefined`; `'age' in user` checks own + prototype chain (`Object.hasOwn(user, 'age')` checks own only); `1_000_000` improves numeric readability; `document.designMode = 'on'` makes the entire webpage directly editable for live UI prototyping. |
| **Ternary (`cond ? a : b`)** | Inline if-else expression returning a value (unlike `if` statements); chain carefully — nested ternaries hurt readability and are banned by many lint configs in favor of early returns. |
| **`null` vs `undefined`** | `undefined` = declared but never assigned (also missing object props, no-return functions, `void`); `null` = an **intentional** "no value" the programmer set. `typeof null === 'object'` (historical bug); `null == undefined` is `true`, `null === undefined` is `false`; `JSON.stringify` drops `undefined` but keeps `null`. |
| **`var` vs `let` vs `const`** | `var` = function-scoped, hoisted as `undefined`, re-declarable, leaks out of `if`/`for` blocks and creates the classic loop-closure bug (fix: `let` per-iteration binding or IIFE). `let`/`const` = block-scoped, TDZ until declaration; `const` prevents **rebinding** only — object/array contents stay mutable (use `Object.freeze` for shallow immutability). |
| **Strict Mode (`'use strict'`)** | Opt-in per file/function that turns silent errors into throws: implicit globals (`x = 1` → ReferenceError), duplicate params, `with`/`eval` scope leaks, `this` is `undefined` (not `window`) in plain function calls, and `delete` on undeletable props throws. ES modules and classes are **always strict** implicitly. |
| **Pure Function** | Same inputs → same output + **no observable side effects** (no mutation of args/globals, no I/O). Enables memoization, safe parallelism, time-travel debugging, and trivial unit tests — the basis of Redux reducers and React render purity. |
| **`import` vs `export` (ES Modules)** | `export default x` → `import x from` (one per module, name chosen by importer); `export { a, b }` named → `import { a } from` / `import * as ns`; `export { a as b }` alias; `import('m')` dynamic import returns a Promise for code-splitting. ESM is statically analyzable (tree-shaking), strict-mode, and async — unlike CJS `require`/`module.exports` (synchronous, copied bindings vs ESM live bindings). |
| **Styling `console.log`** | `%c` format specifier applies CSS: `console.log('%c Hello', 'color:red;font-size:20px')` — handy for branded debug banners; Node.js supports ANSI codes (`\x1b[31m`) instead. |
| **Callback Hell** | Deeply nested async callbacks (`fs.readFile(a, () => { db.query(b, () => { ... }) })`) causing the "pyramid of doom" — unreadable, error-handling scattered, no `return`/`await`. Fixed by **Promises** (flat `.then` chains), **`async`/`await`**, named functions, or splitting into pipeline steps. |
| **AJAX → `fetch` vs `XMLHttpRequest`** | AJAX = async browser↔server exchange without page reload (originally `XMLHttpRequest`, today `fetch`/`axios`). `fetch` returns a Promise, **does not reject on HTTP errors** (only network failure — check `res.ok` manually), streams bodies, and needs explicit `{ credentials: 'include' }` for cross-origin cookies. `axios` auto-parses JSON, rejects on non-2xx, supports interceptors and request cancellation. |
| **HTTP Methods & CORS** | Verbs: `GET` (read, idempotent, cacheable), `POST` (create, non-idempotent), `PUT` (full replace, idempotent), `PATCH` (partial update), `DELETE`, `OPTIONS` (preflight). **CORS**: browsers enforce same-origin policy; cross-origin non-simple requests trigger an `OPTIONS` preflight and require server `Access-Control-Allow-Origin` (+`-Methods`/`-Headers`, `Allow-Credentials` with `SameSite=None; Secure` cookies). |
| **Hash Table / `Map` Internals in JS** | `Map` preserves **insertion order**, accepts any key type (objects/functions, not just strings), has `size`, `get`/`set`/`has`/`delete`/`clear`/`forEach`/`entries`, and is optimized for frequent add/remove (objects historically suffered shape transitions); `WeakMap` holds keys weakly (GC-able, non-iterable) — ideal for per-object private metadata that must not leak. |
| **SOLID in JS/TS** | **S**ingle-responsibility (one reason to change per module), **O**pen/closed (extend via composition/plugins, don't edit working code), **L**iskov (subtypes honor the base contract — no throwing overrides), **I**nterface-segregation (many small interfaces over one fat one), **D**ependency-inversion (depend on abstractions — the foundation of NestJS/Angular DI). |
| **Object Shorthand & `replaceAll`** | `{ name, age }` shorthand builds `{ name: name, age: age }`; `str.replaceAll('a', 'b')` replaces all occurrences (plain string arg — no regex needed, unlike `replace(/a/g)` which requires escaping regex metacharacters). |
| **Libraries: jQuery/Lodash/Moment & Modern Replacements** | jQuery unified pre-ES5 DOM APIs (mostly obsolete vs `querySelector`/fetch); Lodash/Underscore utility belt (partially obsolete — `?.`, `??`, spread, `Array` methods — keep `debounce`/`deepClone`/`groupBy`); **Moment.js is legacy/heavy** — replace with `dayjs`/`date-fns`/native `Intl.DateTimeFormat`/`Temporal` (stage 3); RxJS for reactive streams. |
| **Tooling: npm vs npx vs nvm vs Yarn/pnpm + Lint/Format** | `npm` installs deps; **`npx`** executes a package binary without global install (`npx tsc --init`); **`nvm`**/`volta`/`fnm` switches Node versions per project; Yarn/pnpm add workspaces + deterministic installs (pnpm uses a content-addressable store). `ESLint` finds code errors, `Prettier` formats, `Babel`/`swc`/`esbuild` transpiles new syntax for old targets, `tsup`/`vite` bundles. |
| **Local vs Global Scope & Global Pollution** | Variables live in function/block scope chains; anything assigned without `let/const/var` (non-strict) or attached to `window`/`globalThis` becomes global — risks **name collisions, hidden coupling, and leaks**. Keep modules encapsulated (ESM scope, IIFE, closures); the Module/Revealing-Module pattern exists precisely to avoid global namespace pollution. |
| **Point-Free Style (Tacit Programming)** | Writing `users.map(getName)` instead of `users.map(u => getName(u))` — functions composed without naming their arguments; pairs with currying (`const getName = prop('name')`) for readable pipelines, but can obscure arity/`this` when overused. |
| **String Methods Checklist** | `slice`/`substring`/`substr`(deprecated), `indexOf`/`includes`/`startsWith`/`endsWith`, `split`/`join`, `replace`/`replaceAll`/`replace(regex, fn)`, `toUpperCase`/`toLowerCase`, `trim`/`padStart`/`padEnd`, `repeat`, `at(-1)`, template literals `` `Hi ${name}` ``, `match`/`matchAll` for regex extraction. |
| **JS Debugging Toolkit** | `debugger` statement + Chrome DevTools breakpoints (conditional/logpoints), `console.table`/`console.time`/`console.trace`/`console.group`, `--inspect` + Node inspector protocol for server-side, `Error().stack` capture, coverage via `node --test --experimental-test-coverage`, `0x`/`clinic` flamegraphs for CPU. |
| **NFRs (Non-Functional Requirements)** | Quality attributes that constrain *how* the system works vs *what* it does: **Performance** (Core Web Vitals budgets), **Security** (OWASP), **Accessibility** (WCAG AA), **Localization/i18n** (`Intl` APIs, RTL), **SEO**, **Analytics/observability**, **Capacity/scalability**, **Reliability** (SLOs), **Maintainability**. Staff answer: NFRs belong in the definition of done and get measurable budgets, not vibes. |
| **Removing Event Listeners** | `el.removeEventListener('click', handler)` requires the **exact same function reference** — `el.addEventListener('click', () => f())` can never be removed (anonymous wrapper). Modern pattern: `const ac = new AbortController(); el.addEventListener('click', fn, { signal: ac.signal }); ac.abort();` — removes the listener cleanly (also works for `setTimeout` via `{ signal }` on `fetch`). |

### Polling vs Long-Polling vs Server-Sent Events (SSE) vs WebSockets

| Transport | Direction | Protocol | Best Use Case & Trade-off |
| --- | --- | --- | --- |
| **Short Polling** | Client → Server (periodic) | HTTP | Simple low-frequency status checks; wastes headers/connections when data rarely changes |
| **Long Polling** | Client → Server (held open until event) | HTTP | Legacy fallback when WebSockets/SSE are blocked; server holds request until data arrives |
| **Server-Sent Events (SSE)** | **Unidirectional** (Server → Client) | Standard HTTP (`text/event-stream`) | LLM token streaming, live feeds, notifications; native auto-reconnect, works over HTTP/2 |
| **WebSockets** | **Full-Duplex Bidirectional** | `ws://` / `wss://` (TCP upgrade) | Multiplayer games, collaborative editors, low-latency bidirectional chat; stateful LB sticky-session/pubsub required |

### Web Workers vs Service Workers vs Worklets

| Worker Type | Purpose | Lifecycle & Access |
| --- | --- | --- |
| **Web Worker** | Offload heavy CPU work (crypto, parsing, canvas math) off the main UI thread | Tied to tab; communicates via `postMessage` / `SharedArrayBuffer`; no DOM access |
| **Service Worker** | Programmable network proxy between browser, cache, and network (PWA offline, push notifications) | Independent of tab lifecycle; event-driven (`install`, `activate`, `fetch`); HTTPS required |
| **Worklet** | Lightweight, low-level hooks into browser rendering/audio pipelines (`PaintWorklet`, `AudioWorklet`, `AnimationWorklet`) | Runs on rendering/audio threads with strict real-time constraints |

### Promises vs RxJS Observables

| Dimension | **Promise** | **Observable (RxJS)** |
| --- | --- | --- |
| **Values emitted** | Single value (resolves or rejects once) | **0, 1, or infinite stream** of values over time |
| **Execution** | **Eager** — starts executing the moment `new Promise()` is constructed | **Lazy** — cold observables do nothing until `.subscribe()` is called |
| **Cancellation** | Not natively cancellable (requires external `AbortController`) | Built-in `subscription.unsubscribe()` tears down timers/sockets cleanly |
| **Operators** | `.then()`, `.catch()`, `.finally()` | Rich declarative pipeline (`map`, `filter`, `debounceTime`, `switchMap`, `retry`) |

---

## 7. Complete Software Design Patterns Catalog in JS/TS (All 5 Categories)

### 1. Creational Design Patterns (Object Creation Mechanisms)

| Pattern | Core Idea & JS/TS Use Case |
| --- | --- |
| **Factory** | Function/method returning different object shapes/subclasses based on input without exposing `new ConcreteClass()` |
| **Abstract Factory** | Factory of factories producing families of related objects (e.g., `AwsCloudFactory` vs `AzureCloudFactory` creating `{ storage, queue, compute }`) |
| **Singleton** | Restricts a class/module to a single shared instance (in ES Modules, exporting a module-scoped instance is a natural Singleton) |
| **Builder** | Step-by-step fluent construction (`new QueryBuilder().select('*').where('id = 1').build()`) avoiding telescoping constructors |
| **Prototype** | Creating new objects by cloning an existing prototype (`Object.create(proto)`) |
| **Mixin** | Composing behaviors onto a class without deep inheritance hierarchies (`Object.assign(Target.prototype, CanFlyMixin)`) |
| **Module / Revealing Module** | Uses an **IIFE** + **Closure** to encapsulate private state and return only the public API object (precursor to ES Modules) |

### 2. Structural Design Patterns (Object Relationships & Composition)

| Pattern | Core Idea & JS/TS Use Case |
| --- | --- |
| **Adapter** | Wraps an incompatible interface so it matches what the caller expects (e.g., wrapping `axios` or `fetch` behind a unified `HttpClient` interface) |
| **Bridge** | Decouples an abstraction from its implementation so both can vary independently (e.g., `Notification` abstraction × `EmailSender`/`SlackSender` implementation) |
| **Composite** | Treats individual leaf objects and recursive trees uniformly (e.g., DOM nodes, React component trees, file/folder hierarchies) |
| **Decorator** | Wraps an object/function dynamically to add cross-cutting behavior (`withLogging(withRetry(fetchUser))` or TS `@Log` decorators) |
| **Facade** | Provides a simple unified interface over a complex subsystem (e.g., a single `CheckoutFacade.placeOrder()` coordinating inventory, payment, and email) |
| **Flyweight** | Shares immutable intrinsic state across thousands of fine-grained instances to save RAM (e.g., character glyph objects in a text editor) |
| **Proxy** | Intercepts access to a target object (`new Proxy(target, handler)`) for validation, access control, Vue 3 reactivity, or lazy loading |

### 3. Behavioral Design Patterns (Communication Between Objects)

| Pattern | Core Idea & JS/TS Use Case |
| --- | --- |
| **Chain of Responsibility** | Passes a request along a chain of handlers where each decides to process or call `next()` (Express middleware, DOM event bubbling) |
| **Command** | Encapsulates an action + parameters as an object (`Command`, `Client`, `Invoker`, `Receiver`) supporting undo/redo, queuing, and audit logs |
| **Iterator** | Traverses a collection sequentially without exposing its internal representation (`[Symbol.iterator]()` + `next()`) |
| **Mediator** | Centralizes complex many-to-many communication through a single coordinator (e.g., chatroom hub, air-traffic controller) |
| **Memento** | Captures and restores an object's internal state snapshot without violating encapsulation (state time-travel / undo stack) |
| **Observer** | One-to-many dependency where a Subject notifies subscribed Observers on state change (`EventEmitter`, RxJS `Subject`) |
| **State** | Alters an object's behavior when its internal state changes (e.g., `CircuitBreaker` switching between `ClosedState`, `OpenState`, `HalfOpenState`) |
| **Strategy** | Defines a family of interchangeable algorithms injected at runtime (e.g., Passport auth strategies, compression strategies) |
| **Template Method** | Base class defines the skeleton of an algorithm and defers specific steps to hooks/subclasses |
| **Visitor** | Separates an algorithm from the object structure it operates on (e.g., Babel/ESLint AST visitors traversing AST nodes) |

### 4. Concurrency & 5. Architectural Design Patterns + Anti-Patterns

- **Concurrency Patterns**:
  - **Active Object**: Decouples method invocation from execution by queuing calls onto a dedicated Worker thread and returning a `Promise`/Future.
  - **Nuclear Reaction**: Splits a task into parallel independent subtasks and aggregates results (`Promise.all` fan-out / fan-in).
  - **Scheduler**: Controls when and in what priority order queued tasks execute on the event loop / worker pool (e.g., React Fiber Scheduler, `p-limit`).
  - **Lazy Loading / Lazy Initialization**: Defers heavy object creation or bundle fetching (`import('./HeavyChart')`) until first needed.
- **Architectural Patterns (MVC vs MVP vs MVVM)**:

| Pattern | View Role | Controller / Presenter / ViewModel Role | Examples |
| --- | --- | --- | --- |
| **MVC** | Renders Model; may observe Model directly | Receives user input, updates Model, selects View | Express/Rails server apps |
| **MVP** | Passive interface (`IView`); zero Model knowledge | **Presenter** fetches from Model and imperatively updates View via interface | Legacy Android / WinForms |
| **MVVM** | Declaratively binds to ViewModel properties | **ViewModel** exposes reactive state/commands; two-way/reactive binding updates View automatically | Vue, Angular, Knockout, React + Signals/Zustand |

- **Anti-Patterns**: Modifying built-in prototypes (`Object.prototype.foo = ...` — breaks `for...in` and collides with future TC39 specs), polluting `window` global scope, and mutating objects you don't own.

---

## 8. Frontend Testing, Engineering Practices & Web Security (OWASP)

### Frontend Testing Pyramid & Ecosystem

| Test Layer | Scope & Goal | Standard JS/TS Tools |
| --- | --- | --- |
| **Unit Testing** | Pure functions, hooks, classes in isolation (fast, deterministic, mocks external I/O) | **Vitest**, **Jest**, Mocha, Jasmine, AVA, Karma |
| **Integration Testing** | Multiple components/modules interacting together (e.g., form submission + state + mocked API via MSW) | **React Testing Library**, Vitest/Jest + Supertest |
| **End-to-End (E2E)** | Full user journeys in a real headless/headed browser against a running backend | **Playwright**, **Cypress**, Puppeteer, Nightwatch |
| **Accessibility (A11y)** | Automated WCAG violation detection (contrast, ARIA roles, keyboard focus, labels) | **`axe-core` (`jest-axe`)**, Lighthouse, `pa11y`, AccessLint |
| **Visual Regression** | Pixel/DOM-snapshot diffing across commits and viewports | **Percy**, **Applitools**, Playwright `toHaveScreenshot()`, Chromatic |
| **Performance Testing** | Core Web Vitals (LCP, INP, CLS), bundle size, TTFB, waterfall analysis | **Lighthouse CI**, WebPageTest, PageSpeed Insights |

- **Smoke Testing vs Mocking**: **Smoke testing** is a fast sanity suite verifying critical paths boot and respond after deploy; **Mocking** replaces real collaborators (DB, payment gateway) with controlled test doubles to isolate the unit under test.
- **Feature Detection vs Feature Inference vs UA Sniffing**:
  - **Feature Detection (Best Practice)**: Check for the exact API before using it (`if ('IntersectionObserver' in window)`).
  - **Feature Inference (Bad)**: Assuming if feature A exists, feature B must also exist.
  - **User-Agent (UA) String Sniffing (Worst)**: Parsing `navigator.userAgent` — brittle, spoofable, and breaks on new browser versions.

### Web Security — OWASP Top Frontend/API Threats & Defenses

| Vulnerability | Attack Mechanism | Concrete Defense Checklist |
| --- | --- | --- |
| **1. Cross-Site Scripting (XSS)** | Attacker injects malicious JS executed in victim's browser: **Stored XSS** (saved in DB, e.g., comment), **Reflected XSS** (echoed from URL/query), **DOM-based XSS** (client sink like `element.innerHTML = location.hash`) | Never pass untrusted data to `innerHTML`, `outerHTML`, `document.write`, `eval`, `new Function`, or `setTimeout(string)`; use `textContent`; sanitize rich HTML with **DOMPurify**; set `HttpOnly` on session cookies; enforce strict **Content-Security-Policy (CSP)** (`script-src 'self' 'nonce-...'`). |
| **2. Cross-Site Request Forgery (CSRF / XSRF)** | Malicious site tricks an authenticated user's browser into sending a state-changing request (`POST /transfer`) using automatically attached cookies | Set cookies to `SameSite=Strict` or `SameSite=Lax`; require anti-CSRF tokens (Synchronizer Token or Double-Submit Cookie) or custom `Authorization: Bearer` headers; require re-authentication/MFA/OTP for critical actions. |
| **3. Unvalidated Inputs & Injection** | Trusting client-side validation or passing raw user input into SQL, NoSQL (`{ "$gt": "" }`), OS commands, or dynamic property paths (`__proto__`) | Enforce runtime schema validation (`Zod` / `Joi` / `class-validator` with `whitelist: true`); parameterized queries; block `eval`/`new Function`. |
| **4. Libraries with Known Vulnerabilities** | Transitive `node_modules` packages containing known CVEs or supply-chain malware | Commit lockfiles (`package-lock.json`/`pnpm-lock.yaml`), run `npm audit` / Snyk / Dependabot / Retire.js in CI, pin versions, enable `ignore-scripts` where possible. |
| **5. Clickjacking / Frame Attacks** | Attacker embeds your app in a transparent `<iframe>` to trick users into clicking hidden buttons | Send `Content-Security-Policy: frame-ancestors 'none'` (or `'self'`) and `X-Frame-Options: DENY`; when embedding third-party iframes, restrict with `<iframe sandbox="allow-scripts">`. |

---

## 9. Backend & Distributed Systems Trap Questions (Java / Spring / Node.js / Kafka / Redis / DB)

Staff-level production trap questions — each answer gives the **exact runtime mechanism**, **how to prove/fix it**, and the **Java/Spring + Node.js/NestJS parallel**.

**1. Your pool has core size 10, max 50 and an unbounded queue. Traffic goes up 10×. How many threads run?**

- **Answer**: Up to **10 workers** under sustained load with the
  default core-thread behavior and an unbounded queue. An idle pool
  may have fewer; core-thread timeout/configuration affects the count.
- **Why (`ThreadPoolExecutor` / Spring `ThreadPoolTaskExecutor` rules)**:
  1. If active threads `< corePoolSize` (`10`), spawn a new core thread.
  2. Once `10` core threads are busy, new tasks are offered to the **`BlockingQueue` (`workQueue.offer(task)`)**.
  3. Additional threads up to `maxPoolSize` (`50`) are created **ONLY if `workQueue.offer()` returns `false` (i.e., the queue is full!)**.
  4. With an unbounded `LinkedBlockingQueue()`, `offer()` never returns `false` until the JVM dies with `OutOfMemoryError: Java heap space` while latency climbs to infinity.
- **Fix**: Size a bounded queue and choose an explicit rejection
  strategy (`CallerRunsPolicy` for upstream backpressure or
  `AbortPolicy` for load shedding) after measuring latency and capacity.
  Node.js worker pools likewise need bounded pending work.

**2. Two transfers, A to B and B to A, hang forever. How do you prove what happened from a thread dump?**

- **Answer**: Classic **AB-BA Lock-Ordering Deadlock** (either JVM monitor/lock deadlock or database row-lock deadlock).
- **How to Prove It**:
  - **In a JVM Thread Dump (`jstack <pid>` or `kill -3 <pid>`)**: Look at the bottom `Found one Java-level deadlock:` block, or trace `Thread-1` (`java.lang.Thread.State: BLOCKED (on object monitor) - waiting to lock <0x000000076ab00020> (Account B) - locked <0x000000076ab00010> (Account A)`) while `Thread-2` holds `<0x...20>` and waits for `<0x...10>`.
  - **If hanging inside JDBC (`RUNNABLE` in `SocketInputStream.socketRead0`)**: It's a **database row lock (`SELECT ... FOR UPDATE`) deadlock** between two open transactions — verify in Postgres via `pg_blocking_pids(pid)` / `pg_stat_activity`.
- **Fix**: Enforce **deterministic global lock ordering** — always acquire locks sorted by ID (`Long first = Math.min(fromId, toId); Long second = Math.max(fromId, toId);` or `ORDER BY account_id ASC FOR UPDATE`) so a cycle is mathematically impossible.

**3. A `@Transactional` method catches the exception and logs it. The half-finished writes still commit. Why?**

- **Answer**: Spring's `@Transactional` works via an **AOP Proxy (`TransactionInterceptor`)** wrapping the method outside its boundary.
- **Mechanism**: The proxy starts the transaction and triggers rollback
  if a rollback-eligible exception crosses its boundary, or if the
  transaction has been marked rollback-only. Swallowing the exception
  and returning normally may commit partial work unless the persistence
  provider has already marked the transaction rollback-only.
- **Fix**: Either **rethrow** the exception (`throw e;`) or explicitly mark the transaction for rollback inside the `catch` block via `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`. *(Other classic `@Transactional` bypasses: calling a `@Transactional` method via `this.helper()` **self-invocation** within the same class, or marking the method `private`/`final`.)*
- **Node.js / NestJS / Prisma / TypeORM Parallel**: Catching and swallowing an error inside `dataSource.transaction(async (manager) => { try { ... } catch (e) {} })` or `prisma.$transaction(async (tx) => { ... })` resolves the callback Promise normally, causing the wrapper to issue `COMMIT` on half-written state!

**4. A `@Transactional` method throws a checked exception. Does it roll back?**

- **Answer**: Under Spring's default rollback rules, a checked
  exception alone does not trigger rollback; a transaction can also
  have been marked rollback-only by another component.
- **Why**: By default, Spring's `DefaultTransactionAttribute.rollbackOn(Throwable ex)` returns `true` **only for unchecked exceptions (`ex instanceof RuntimeException || ex instanceof Error`)**, following an old EJB convention that checked exceptions represent recoverable business conditions. If your method throws a checked `IOException` or custom `InsufficientFundsException extends Exception`, Spring commits the transaction!
- **Fix**: Add `rollbackFor` for the checked exception types that should
  abort the unit of work (or configure an appropriate global policy).

**5. You scale from 5 pods to 20 and Postgres starts refusing connections. Why?**

- **Answer**: **Connection multiplication across pods** (`Total DB Connections = Pods × Pool Size × Services`).
- **The Math**: With a **configured** pool maximum of 20, five pods
  can open up to 100 connections and 20 pods up to 400, plus other
  clients. HikariCP's default `maximumPoolSize` is **10**, not 20.
  Check actual pool metrics, reserved slots, and the DB limit.
- **Fix**:
  1. Right-size each pool against a fleet-wide connection budget
     including deploy surge and maintenance connections.
  2. Consider PgBouncer transaction pooling or RDS Proxy; transaction
     pooling can affect session features. Measure wait times and DB
     saturation rather than assume a fixed multiplexing ratio.

**6. You add partitions to a Kafka topic and per-customer ordering breaks. Why?**

- **Answer**: Kafka only guarantees ordering **within a single partition**, and default key routing uses **`murmur2(key) % numPartitions`**.
- **Mechanism**:
  1. When `numPartitions` changes from `6` to `12`, `murmur2("cust-42") % 6` (say partition `2`) changes to `murmur2("cust-42") % 12` (say partition `8`).
  2. Unconsumed older messages for `"cust-42"` are still sitting in partition `2` (assigned to Consumer A), while newly produced messages for `"cust-42"` land in partition `8` (assigned to Consumer B) and get processed concurrently out of order!
- **Fix**: Over-partition keyed topics upfront. If partitions must grow,
  drain old producers and consumer lag before switching or cut over
  to a new topic with a migration plan. Use a per-key monotonic
  sequence/version if consumers must detect out-of-order events;
  timestamps alone do not guarantee order.

**7. Redis hits its memory limit and writes start failing. Which setting decides that?**

- **Answer**: **`maxmemory-policy`** (specifically the default **`noeviction`** policy when `maxmemory` is reached).
- **Mechanism**:
  - `noeviction` (often the default): Returns OOM for commands that
    allocate additional memory when the configured limit is reached;
    read and deletion operations can generally continue.
  - **Cache workloads** should use **`allkeys-lru`** or **`allkeys-lfu`** (evicts least-recently/frequently used keys across all keys) or **`volatile-lru` / `volatile-ttl`** (evicts only keys with an expire `TTL` set).
  - **Job queues (`BullMQ`) / Distributed Locks / Rate Limiters** *must* keep `noeviction` (silently evicting a lock or job corrupts state) and stay on a separate Redis instance from volatile caches!

**8. A user logs out, but their JWT keeps working for 30 more minutes. Why, and what do you change?**

- **Answer**: A standard JWT is **stateless and self-contained** — API gateways/guards verify the cryptographic signature (`RS256`/`ES256`) and `exp` claim locally in memory without querying a database. Deleting the token on the client does not invalidate a copy already captured in memory or network logs until `exp` passes.
- **How to Fix It (Hybrid Stateless + Revocation Architecture)**:
  1. **Short-lived Access Token (`5–15 min` TTL)** + **Long-lived Refresh Token (`7–30 days`, `HttpOnly Secure SameSite` cookie)** stored/hashed server-side with **Refresh Token Rotation**.
  2. **Redis Denylist (`jti` Blocklist) on Logout**: On `/logout`, write `SET blacklist:jti:<token_jti> 1 EX <remaining_ttl_seconds>` in Redis (`O(1)` sub-millisecond check in your Auth Guard). Because the `EX` matches the remaining `5–15 min` Access Token lifetime, the Redis denylist stays tiny and auto-cleans itself!
  3. **User-Level Global Logout ("Sign out all devices")**: Maintain `user:tokens_valid_after:<userId>` timestamp in Redis/cache and reject any JWT whose `iat < valid_after`.

**9. Your Spring Boot app takes 90 seconds to start and Kubernetes keeps restarting it. What's wrong?**

- **Answer**: **`livenessProbe` is firing before the application finishes booting**, causing `kubelet` to `SIGKILL` the container in an endless `CrashLoopBackOff` loop!
- **Why**: A liveness probe configured with `initialDelaySeconds: 30`,
  `periodSeconds: 10`, and `failureThreshold: 3` can restart a 90-second
  startup before readiness. Probe scheduling is not an exact
  `30 + 3 × 10` deadline; inspect events for the actual failure.
- **Fix**:
  1. Configure a Kubernetes **`startupProbe`** (`periodSeconds: 5, failureThreshold: 30` → allows up to `150s` only during boot; once `startupProbe` succeeds *once*, `livenessProbe` takes over with a tight `10s` check for deadlocks).
  2. Speed up JVM startup on K8s: ensure **CPU `limits` are not throttling boot** (or omit CPU limits / boost startup CPU via in-place vertical resize), enable **Spring Boot CDS (Class Data Sharing) / Spring AOT**, and run DB migrations in an `initContainer` or Helm PreSync Job.

**10. `CompletableFuture.supplyAsync()` with no executor. Which threads run your task?**

- **Answer**: **`ForkJoinPool.commonPool()`** (unless parallelism `< 2`, where it falls back to `ThreadPerTaskExecutor`).
- **Why This Is a Production Disaster for I/O**:
  1. `ForkJoinPool.commonPool()` is sized to **`Runtime.getRuntime().availableProcessors() - 1`** ( built for **CPU-bound** non-blocking work).
  2. Inside a Kubernetes container with `limits.cpu: 1` or `2`, `availableProcessors()` is `1` or `2` → **`commonPool` has ONLY `1` worker thread**!
  3. If you run blocking HTTP/DB/S3 calls inside `CompletableFuture.supplyAsync(fn)` without passing a custom `Executor`, you instantly starve the global `commonPool` shared across the entire JVM (including `parallelStream()`).
- **Fix**: **Always pass an explicit `Executor`** (`CompletableFuture.supplyAsync(fn, ioThreadPoolExecutor)` or `Executors.newVirtualThreadPerTaskExecutor()` on Java 21+).

**11. A shared `static SimpleDateFormat` starts returning wrong dates under load. Why?**

- **Answer**: **`SimpleDateFormat` is NOT thread-safe!**
- **Internal Mechanism**: `SimpleDateFormat` stores intermediate parsed/formatted date fields in a single mutable **instance field `protected Calendar calendar`**. When Thread A and Thread B call `SDF.format()` or `SDF.parse()` concurrently, both threads overwrite `calendar.setTime(date)` mid-execution — silently returning **another user's date, scrambled years (`20262026`), or throwing `NumberFormatException` / `ArrayIndexOutOfBoundsException`**.
- **Fix**: Replace with immutable, thread-safe **`java.time.format.DateTimeFormatter`** (`Instant`, `LocalDate`, `ZonedDateTime`), or wrap legacy `SimpleDateFormat` in `ThreadLocal.withInitial(() -> new SimpleDateFormat(...))`.

**12. You switch to `Stream.toList()` and a later `list.add()` throws. Why?**

- **Answer**: Java 16+ `Stream.toList()` returns an **unmodifiable**
  list; do not rely on a particular implementation class.
- **Contrast with `Collectors.toList()`**:
  - `Collectors.toList()` makes no mutability/implementation
    guarantee; `Collectors.toCollection(ArrayList::new)` explicitly
    requests a mutable `ArrayList`.
  - `Stream.toList()` can contain `null` (unlike `List.of()`).
    Benchmark before claiming a performance benefit.

**13. Two `Long` ids compare equal with `==` in tests and not in production. Why?**

- **Answer**: **Wrapper Reference Comparison (`==`) + JVM `Long.LongCache` (`-128` to `+127`)!**
- **Mechanism**:
  - In Java, `Long` is an object wrapper (`java.lang.Long`), so `id1 == id2` compares **object memory references**, not numeric values!
  - `Long.valueOf(long l)` caches boxed `Long` instances only in the range **`-128` to `127`**.
  - In unit tests, **two separately boxed copies of the same
    small value**, e.g., `Long.valueOf(42L)` twice, can reference
    the cached object, making `==` accidentally `true`.
  - Two separately boxed IDs outside the cache can have different
    references; the result depends on *how* the values were obtained.
- **Fix**: Always use **`Objects.equals(id1, id2)`** or `id1.equals(id2)` (or primitive `long`).
- **JavaScript / TypeScript Parallel (The 64-bit `BigInt` JSON ID Trap)**: In JS, `Number.MAX_SAFE_INTEGER` is 2⁵³ − 1 (`9,007,199,254,740,991`). In tests, small DB/Snowflake IDs fit in `Number`, but in production 64-bit Snowflake IDs exceed 2⁵³ − 1 and round to the **same** IEEE-754 float (`9007199254740992 === 9007199254740993` is `true`!). Always serialize 64-bit IDs as `string` in JSON or parse to `BigInt`.

**14. After a Spring Boot upgrade, startup fails on a circular dependency that worked before. What changed?**

- **Answer**: **Spring Boot 2.6+ prohibited circular bean references by default** (`spring.main.allow-circular-references=false`), throwing `BeanCurrentlyInCreationException` on startup.
- **Why & How to Fix Properly**:
  - Previously, Spring resolved setter/field-injected singletons via its 3-level singleton cache (`singletonFactories` early exposure), which hid architectural coupling and broke subtly when AOP proxies (`@Async`, `@Transactional`) wrapped one of the beans.
  - **Proper Fixes (in order of preference)**:
    1. **Extract a 3rd shared service** (`ServiceA` and `ServiceB` both depend on `ServiceC`) or publish domain events (`ApplicationEventPublisher`).
    2. Use **`@Lazy` on one constructor parameter** (`public ServiceA(@Lazy ServiceB b)`) so Spring injects a lazy proxy breaking the eager instantiation loop.
    3. *(Emergency temporary workaround only)*: `spring.main.allow-circular-references=true` (Note: constructor-injected cycles `A(B)` + `B(A)` can *never* be resolved by `allow-circular-references` without `@Lazy`!).
  - **NestJS Parallel**: NestJS also fails on circular dependencies unless wrapped with `forwardRef(() => ModuleOrProvider)` — and just like Spring, extracting a 3rd shared service or using `@nestjs/event-emitter` is always cleaner than `forwardRef`.

**15. Your `@Value` field is `null` inside the constructor. Why?**

- **Answer**: **Bean Lifecycle Ordering** — the Java constructor executes **BEFORE** Spring can inject `@Value` or `@Autowired` fields onto the instance!
- **Exact Spring Bean Creation Sequence**:
  1. **Constructor execution (`new MyService()`)** ← *Field `@Value` is still `null` here!*
  2. **Populate Properties (`AutowiredAnnotationBeanPostProcessor`)** ← *Field `@Value` and `@Autowired` fields are injected via reflection here.*
  3. **`@PostConstruct` / `InitializingBean.afterPropertiesSet()`** ← *Field `@Value` is now populated.*
- **Fix**: Inject `@Value` **directly as a Constructor Parameter** (`public MyService(@Value("${app.region}") String region) { this.region = region; }`), which also lets the field be `private final` and trivially testable without Spring! *(Same rule in NestJS/TypeScript: property `@Inject()` is `undefined` inside `constructor()`; always use constructor parameter injection `@Inject(CONFIG) private readonly cfg: Config` or `onModuleInit()`.)*

**16. `list.remove()` inside a `for-each` loop throws `ConcurrentModificationException` on one thread. How?**

- **Answer**: `ConcurrentModificationException` is a **fail-fast iterator invariant violation**, not a multi-threading exception!
- **Internal Mechanism (`ArrayList`)**:
  - `ArrayList` maintains an internal structural modification counter **`modCount`**.
  - A `for (var item : list)` loop compiles to `Iterator<E> it = list.iterator()`, which snapshots **`expectedModCount = modCount`** when created.
  - On every iteration, `it.next()` calls `checkForComodification()`: `if (modCount != expectedModCount) throw new ConcurrentModificationException();`.
  - Calling **`list.remove(item)` directly** increments `list.modCount++` *without* updating the iterator's `expectedModCount`, so the very next `it.next()` throws `ConcurrentModificationException` on the **exact same single thread**!
- **Fix**: Use **`list.removeIf(item -> predicate(item))`** (cleanest, O(N) single pass), or explicitly use `Iterator<E> it = list.iterator()` and call **`it.remove()`** (which syncs `expectedModCount = modCount`).

**17. In `try-with-resources`, the body throws and `close()` throws too. Which exception do you get?**

- **Answer**: The caller receives the **exception thrown inside the `try` body**, and the exception thrown by `close()` is **attached to it as a Suppressed Exception** (`primaryEx.addSuppressed(closeEx)`, retrievable via **`e.getSuppressed()`**).
- **Why This Matters**:
  - In pre-Java-7 manual `try { work(); } finally { resource.close(); }`, if `work()` threw `SQLException` (root cause: network drop) and `close()` also threw `IOException` (socket already closed), the **`finally` exception completely swallowed and overwrote the original `try` exception**!
  - `try-with-resources` preserves the true root cause (`try` body) while keeping `close()` failures visible in stack traces under `Suppressed: ...`.
- **TypeScript 5.2+ / ES Explicit Resource Management (`using` / `await using`) Parallel**: If both the block body and `[Symbol.dispose]()` throw, JavaScript wraps both into a **`SuppressedError(error, suppressed)`** (`err.error` is the disposal error and `err.suppressed` is the original body error).

**18. `saveAll()` on 10,000 entities sends 10,000 separate `INSERT`s. Why?**

- **Answer**: Two classic Hibernate/JPA traps disable JDBC batching even when using `saveAll()`:
  1. **`@GeneratedValue(strategy = GenerationType.IDENTITY)`**: When an entity uses `IDENTITY` (auto-increment column), Hibernate **transparently disables JDBC batch inserts** because it must execute each `INSERT` immediately to fetch the DB-generated primary key into the Persistence Context!
  2. **JDBC Batching Not Enabled / Not Rewritten**: `spring.jpa.properties.hibernate.jdbc.batch_size` defaults to unset/`0`.
- **Complete Fix (`10,000` round-trips → `20` round-trips)**:
  1. Switch PK generation to **`GenerationType.SEQUENCE`** with a pooled hi/lo allocation (`@SequenceGenerator(name = "seq", allocationSize = 50)`).
  2. Configure Hibernate batching & ordering:
     `hibernate.jdbc.batch_size: 500`, `hibernate.order_inserts: true`, `hibernate.order_updates: true`.
  3. For PostgreSQL/MySQL JDBC drivers, enable multi-row rewrite (`reWriteBatchedInserts=true` for Postgres / `rewriteBatchedStatements=true` for MySQL), and periodically `entityManager.flush(); entityManager.clear();` every 500 rows so the L1 Persistence Context doesn't bloat heap memory.
  - **TypeORM / Prisma Parallel**: In TypeORM, `repo.save(tenThousandEntities)` queries existing rows and inserts in chunks; for raw bulk insert speed, use `repo.insert(entities)` or `createQueryBuilder().insert().values(chunk).execute()` (`prisma.user.createMany({ data })`).

**19. You turn off `open-in-view` and get `LazyInitializationException`. Why, and what's the fix?**

- **Answer**:
  - **Why**: With OSIV enabled, the persistence context can stay
    open through view serialization even after a service transaction
    ends; this can hide lazy loads/N+1 queries (a JDBC connection is
    not necessarily held continuously). With OSIV off, the context
    opened for a transactional service method usually closes when
    that boundary exits. Accessing an uninitialized lazy association
    afterward can throw `LazyInitializationException`.
- **The Right Fix (Keep `open-in-view=false`!)**:
  1. **Return DTOs / Projections from the Service layer** (never return raw JPA entities from Controllers!).
  2. Explicitly fetch required associations inside the query using **`JOIN FETCH`** (`SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id`), **`@EntityGraph(attributePaths = {"items"})`**, or direct **JPQL DTO constructor expressions / Spring Data Interface Projections**.

**20. One Redis Cluster node sits at 100% CPU while the others are idle. What's going on?**

- **Answer**: **Hot Key**, **Big Key**, or **Hash-Tag (`{...}`) Slot Skew** pinning traffic onto a single Redis shard!
- **Why**:
  - Redis Cluster partitions keys across `16,384` hash slots (`CRC16(key) % 16384`), and each Redis primary node is **single-threaded for command execution**.
  - **3 Root Causes of Single-Shard 100% CPU**:
    1. **Hot Key**: A single viral key (`product:flashsale`, global config, or global lock key) receives 100k RPS — all landing on the single shard owning that key's hash slot.
    2. **Overly Broad Hash Tag (`{tenantId}` or `{global}`)**: Redis hashes *only* the substring inside `{...}` so multi-key operations share a slot. If a developer names keys `cache:{user}:<id>` (literal `{user}`) or one giant enterprise `{tenantA}` has 80% of keys, **millions of keys collapse into a single hash slot on one node**!
    3. **Big Key + O(N) Commands**: A single Hash/Set/ZSet with 2 million elements queried via `HGETALL`, `SMEMBERS`, or `KEYS *` blocks that shard's event loop.
- **How to Diagnose & Fix**:
  - **Diagnose**: Run `redis-cli --hotkeys` (requires `allkeys-lfu`/`volatile-lfu`), `redis-cli --bigkeys`, `SLOWLOG GET 20`, and check slot/key distribution per node (`CLUSTER SLOTS` / `INFO keyspace`).
  - **Fix**:
    1. **Local In-Memory L1 Cache (`Caffeine` / `lru-cache` with 2–5s TTL)** or **Redis Client-Side Caching (`CLIENT TRACKING`)** in the app pods for hot read keys.
    2. **Key Salting / Read Sharding**: Replicate a hot read key across K salted keys (`hot_key:1` .. `hot_key:10`) so reads spread across all cluster nodes, or enable `READONLY` replica reads.
    3. Fix broken `{...}` hash tags and replace `HGETALL`/`SMEMBERS`/`DEL` on large collections with `HSCAN`/`SSCAN`/`UNLINK` (async non-blocking free).

---

## 10. Recall — Interview Sound Bites

- "TypeScript types are erased — compile-time safety, never runtime validation."
- "Unbounded queue = `maxPoolSize` is dead config."
- "`@Transactional` rolls back on what the proxy sees leave the method."
- "Scaling pods multiplies per-pod resources — connections, threads, memory."
- "JWT revocation is the stateless trade-off you always pay somewhere."
- "Kafka ordering ends at the partition boundary."
- "Same image ≠ same environment — diff the node, zone, config, egress."
