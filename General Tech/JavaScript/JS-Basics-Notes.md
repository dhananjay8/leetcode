# JavaScript Basics — Staff/Principal Interview Deep Dive

---

## 1. Hoisting & Lexical Scope

### Lexical scope

- Scope is determined by the physical placement of variables/functions in the source code.
- Nested functions can access variables from their enclosing scopes.
- Block scopes are created by `{ }` (functions, `if`, loops, `try/catch`).

### Hoisting

- The JavaScript engine scans declarations during the compile phase and adds them to memory before execution.
- **Only declarations are hoisted, not initializations.**

```javascript
console.log(a); // undefined
var a = 10;     // declaration hoisted; assignment stays here
```

### Hoisting by declaration type

| Declaration | Hoisted? | Initialized? | Early access result |
|---|---|---|---|
| `var` | Yes | To `undefined` | `undefined` |
| `let` | Yes (temporal dead zone) | No | `ReferenceError` |
| `const` | Yes (temporal dead zone) | No | `ReferenceError` |
| `function` declaration | Yes | Fully | Callable before definition |
| `function` expression | No | — | `ReferenceError` or `TypeError` |
| `class` declaration | Yes | No | `ReferenceError` |
| `class` expression | No | — | `ReferenceError` |

```javascript
greet(); // Works
function greet() {
  console.log('Hello');
}

console.log(x); // ReferenceError
let x = 5;

const instance = new MyClass(); // ReferenceError
class MyClass {}
```

### Order of precedence

- Variable assignment takes precedence over function declaration.
- Function declarations take precedence over variable declarations.

### Strict mode

```javascript
'use strict';
```

- Prevents using variables before declaration.
- Eliminates silent errors by converting them to thrown errors.
- Helps engines optimize code.
- Prohibits some legacy syntax.

---

## 2. `var`, `let`, and `const`

| Feature | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function scope | Block scope | Block scope |
| Hoisting | Yes, initialized `undefined` | Yes, TDZ | Yes, TDZ |
| Reassignment | Allowed | Allowed | Not allowed |
| Re-declaration | Allowed in same scope | `SyntaxError` | `SyntaxError` |
| Global object property | Yes (browser `window`) | No | No |

### `const` immutability nuance

- The binding is read-only; the value cannot be reassigned.
- For objects/arrays, properties/elements can still be mutated.

```javascript
const arr = [1, 2];
arr.push(3);        // OK
arr = [1, 2, 3];    // TypeError

const obj = { a: 1 };
obj.a = 2;          // OK
obj = {};           // TypeError
```

### Temporal Dead Zone (TDZ)

- From the start of the block until the `let`/`const` declaration is reached.
- Accessing the variable inside the TDZ throws `ReferenceError`.

---

## 3. Closures

### Definition

A **closure** is a function that remembers and accesses variables from its lexical scope even when the function is executed outside that scope.

```javascript
function outer() {
  const outerVariable = 'Hello';

  function inner() {
    console.log(outerVariable);
  }

  return inner;
}

const closureFunc = outer();
closureFunc(); // Hello
```

### Key properties

- Closures have access to their own scope, the outer function's scope, and the global scope.
- Closures store **references** to outer variables, not copies.
- The inner function retains access after the outer function has returned.

### Practical uses

- Private variables and functions.
- Partial function application.
- Preserving state in asynchronous code.
- Factory functions.

```javascript
function makeCounter() {
  let count = 0;
  return () => console.log(++count);
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
```

```javascript
function add(x) {
  return function (y) {
    return x + y;
  };
}

const add5 = add(5);
console.log(add5(3)); // 8
```

---

## 4. `this`, `call`, `apply`, and `bind`

### What `this` is

- `this` refers to the **execution context** — the object that is invoking the function.
- Its value depends on how a function is called, not where it is defined (except arrow functions).

### `this` rules

| Context | `this` refers to |
|---|---|
| Method call (`obj.method()`) | The object (`obj`) |
| Regular function (non-strict) | Global object (`window`/`global`) |
| Regular function (strict mode) | `undefined` |
| Event handler | The DOM element that received the event |
| Arrow function | Lexical `this` from surrounding scope |
| Constructor (`new`) | The new instance |
| `call`/`apply`/`bind` | Explicitly provided object |

### `call` vs `apply` vs `bind`

| Method | Invocation | Arguments |
|---|---|---|
| `call(thisArg, arg1, arg2, ...)` | Immediate | Comma-separated |
| `apply(thisArg, [arg1, arg2, ...])` | Immediate | Array |
| `bind(thisArg, arg1, arg2, ...)` | Returns a new function | Comma-separated |

```javascript
function greet(message) {
  console.log(`${message}, ${this.name}`);
}

const person = { name: 'John' };

greet.call(person, 'Hello');     // Hello, John
greet.apply(person, ['Hello']);    // Hello, John

const greetPerson = greet.bind(person);
greetPerson('Hello');            // Hello, John
```

### Use cases for `bind`

- Event handlers where `this` must be the component instance.
- Setting context for callbacks.
- Partial application of arguments.

---

## 5. Pass by Value vs Pass by Reference

JavaScript is **always pass-by-value**. For objects, the value passed is a **reference** (memory address).

| Data type | What is passed | Mutating inside function | Reassigning inside function |
|---|---|---|---|
| Primitives (`number`, `string`, `boolean`, etc.) | Copy of the value | No effect on caller | No effect on caller |
| Objects/arrays | Copy of the reference | Affects the original object | No effect on caller |

```javascript
function modify(x, obj) {
  x = 99;          // only local x changes
  obj.a = 99;      // caller sees this
  obj = { b: 2 };  // only local obj changes
}

let num = 1;
let o = { a: 1 };
modify(num, o);
console.log(num); // 1
console.log(o);   // { a: 99 }
```

---

## 6. Shallow Copy vs Deep Copy

### Shallow copy

- Copies only the top-level properties.
- Nested objects are still shared by reference.

```javascript
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = Object.assign({}, obj1);
// or const obj2 = { ...obj1 };

obj2.b.c = 3;
console.log(obj1.b.c); // 3
```

### Deep copy

- Recursively copies all nested objects.

```javascript
// JSON hack (no functions, undefined, Dates, circular refs)
const obj2 = JSON.parse(JSON.stringify(obj1));

// Recursive function
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}

// Library
const _ = require('lodash');
const obj3 = _.cloneDeep(obj1);
```

### Comparison

| Feature | Shallow Copy | Deep Copy |
|---|---|---|
| Nested objects | Shared reference | Independent copies |
| Modification effect | Affects original | Does not affect original |
| Speed | Faster | Slower |
| Methods | `Object.assign`, spread, `Array.from` | `JSON.parse/stringify`, recursion, `_.cloneDeep` |

---

## 7. Useful Object Methods

| Method | Behavior |
|---|---|
| `Object.assign(target, ...sources)` | Shallow merge/copy |
| `Object.keys(obj)` | Array of own enumerable keys |
| `Object.values(obj)` | Array of own enumerable values |
| `Object.entries(obj)` | Array of `[key, value]` pairs |
| `Object.fromEntries(entries)` | Build object from entries |
| `Object.freeze(obj)` | Make object immutable (no add/delete/modify) |
| `Object.seal(obj)` | Prevent add/delete; allow modifying existing properties |
| `Object.defineProperty(obj, prop, descriptor)` | Fine-grained property control |

```javascript
const obj = { a: 1 };
Object.freeze(obj);
obj.a = 2; // silently fails in non-strict, TypeError in strict
```

---

## 8. Rest and Spread Operators

```javascript
// Rest: gather remaining arguments
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// Spread: unpack
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// Destructuring with rest
const [first, ...rest] = [1, 2, 3, 4];
const { a, ...others } = { a: 1, b: 2, c: 3 };
```

---

## 9. Array Methods: `map`, `filter`, `reduce`, `find`, `forEach`

```javascript
const numbers = [1, 2, 3, 4];

const doubled = numbers.map(n => n * 2);      // [2, 4, 6, 8]
const evens   = numbers.filter(n => n % 2 === 0); // [2, 4]
const sum     = numbers.reduce((acc, n) => acc + n, 0); // 10
const firstEven = numbers.find(n => n % 2 === 0); // 2

numbers.forEach(n => console.log(n)); // side effects only
```

| Method | Returns | Use case |
|---|---|---|
| `map` | New array of same length | Transform each element |
| `filter` | New array, possibly shorter | Select matching elements |
| `reduce` | Single value | Aggregate / fold |
| `find` | First matching element or `undefined` | Search |
| `forEach` | `undefined` | Side effects (logging, mutation) |

---

## 10. Currying

Currying transforms a function with multiple arguments into a sequence of functions each taking one argument.

```javascript
function add(x) {
  return function (y) {
    return function (z) {
      return x + y + z;
    };
  };
}

console.log(add(1)(2)(3)); // 6

const arrowAdd = x => y => z => x + y + z;

// Practical logger
const logger = level => message => console.log(`[${level}]: ${message}`);
const infoLogger = logger('INFO');
infoLogger('Application started');
```

### Use cases

- Reusability and partial application.
- Function composition.
- Configurable utilities.
- Cleaner event handlers.

---

## 11. Polyfills

A polyfill provides modern functionality in older environments that do not natively support it.

### Polyfill for `Array.prototype.includes`

```javascript
if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement, fromIndex) {
    const start = fromIndex || 0;
    for (let i = start; i < this.length; i++) {
      if (this[i] === searchElement) return true;
    }
    return false;
  };
}

const numbers = [1, 2, 3, 4, 5];
console.log(numbers.includes(3)); // true
```

---

## 12. Higher-Order Functions

A higher-order function either takes a function as an argument or returns a function.

```javascript
// Function as argument
function operateOnNumbers(a, b, operation) {
  return operation(a, b);
}

const add = (x, y) => x + y;
const subtract = (x, y) => x - y;

console.log(operateOnNumbers(5, 3, add));      // 8
console.log(operateOnNumbers(5, 3, subtract)); // 2

// Function as result
function multiplier(factor) {
  return x => x * factor;
}

const double = multiplier(2);
console.log(double(4)); // 8
```

---

## 13. Functional Programming Concepts

| Concept | Definition |
|---|---|
| **First-class functions** | Functions can be assigned, passed, and returned like values |
| **Pure functions** | Same input → same output; no side effects |
| **Immutability** | Data is not modified; new data is created |
| **Referential transparency** | An expression can be replaced by its value without changing behavior |
| **Higher-order functions** | Functions that operate on other functions |
| **Recursion** | Function calls itself instead of using loops |
| **Function composition** | Combine small functions to build complex behavior |
| **Map/filter/reduce** | Declarative data transformation |
| **Currying** | Convert multi-argument functions into single-argument chains |
| **Monad** | Pattern for sequencing computations while managing effects |

---

## 14. ES Standards Overview

| Version | Year | Major features |
|---|---|---|
| ES1 | 1997 | Core language |
| ES2 | 1998 | Editorial changes |
| ES3 | 1999 | `try/catch`, regex, `switch` |
| ES4 | — | Abandoned |
| ES5 | 2009 | Strict mode, JSON, `Object.create`, `forEach`/`map`/`filter` |
| ES6 / ES2015 | 2015 | `let`/`const`, arrow functions, classes, promises, modules, template literals, destructuring, spread/rest, `Map`, `Set`, generators |
| ES2016 | 2016 | Exponentiation `**`, `Array.prototype.includes` |
| ES2017 | 2017 | `async/await`, `Object.entries`/`values`, `padStart`/`padEnd` |
| ES2018 | 2018 | Async iteration, rest/spread properties, `Promise.finally` |
| ES2019 | 2019 | `flat`/`flatMap`, `Object.fromEntries`, `trimStart`/`trimEnd` |
| ES2020 | 2020 | `BigInt`, dynamic `import`, nullish coalescing `??`, optional chaining `?.` |
| ES2021 | 2021 | `replaceAll`, `Promise.any`, logical assignment `||=`/`&&=`/`??=` |
| ES2022 | 2022 | Top-level `await`, class private fields/methods, `.at()` |

---

## 15. Equality Checks

| Operator | Behavior |
|---|---|
| `==` | Loose equality with type coercion (`1 == '1'` is `true`) |
| `===` | Strict equality; no type coercion (`1 === '1'` is `false`) |
| `Object.is(a, b)` | Same-value equality; treats `NaN` as equal to `NaN` and `+0`/`-0` as different |

```javascript
console.log(0 == '0');       // true
console.log(0 === '0');      // false
console.log(NaN === NaN);    // false
console.log(Object.is(NaN, NaN)); // true
```

---

## 16. Strict Mode vs Non-Strict Mode

| Behavior | Non-strict | Strict mode |
|---|---|---|
| Undeclared variables | Create global property | Throw `ReferenceError` |
| `this` in plain function | Global object | `undefined` |
| Duplicate parameter names | Allowed | `SyntaxError` |
| Assigning to non-writable property | Silent fail | `TypeError` |
| Octal literals | Allowed with `0` prefix | `SyntaxError` |
| `with` statement | Allowed | `SyntaxError` |

---

## 17. Loop Comparison

| Loop | Best for | Notes |
|---|---|---|
| `for (let i = 0; ...)` | Index-based iteration, break/continue | Most flexible |
| `forEach` | Execute side effect for each item | Cannot break/return out of loop |
| `for...in` | Object keys enumeration | Iterates inherited enumerable properties; use `hasOwnProperty` check |
| `for...of` | Iterables (arrays, strings, Maps, Sets, generators) | Clean, supports `break`/`continue` |
| `map` | Transform to new array | Do not use for side effects |
| `filter` | Select subset | Returns new array |
| `reduce` | Aggregate to single value | Can be unreadable if overused |

---

## 18. Object Type Checking

```javascript
// 1. Basic check (includes arrays; excludes null)
const isObject = value => typeof value === 'object' && value !== null;

// 2. Strict plain-object check
const isPlainObject = value =>
  Object.prototype.toString.call(value) === '[object Object]';

// 3. Exclude arrays, dates, etc.
const isPlainObject2 = value =>
  Object.getPrototypeOf(value) === Object.prototype ||
  Object.getPrototypeOf(value) === null;

// 4. Non-empty object
const isNonEmptyObject = obj =>
  isPlainObject(obj) && Object.keys(obj).length > 0;
```

| Method | Detects arrays | Detects `null` | Detects plain objects |
|---|---|---|---|
| `typeof` + `!== null` | Yes | No | Yes |
| `Object.prototype.toString` | No | No | Yes |
| `Object.getPrototypeOf` | No | No | Yes |

---

## 19. Common Pitfalls

- Using `var` inside a loop creates one shared binding; use `let` for per-iteration scope.
- `this` inside an arrow function inherits the surrounding lexical context.
- `setTimeout`/`setInterval` with `var` in a loop often needs `let` or an IIFE.
- `typeof null` returns `'object'` (historical bug).
- Comparing objects with `===` checks reference equality, not deep equality.

---

## 20. Additional Theory Topics

### Promises

A Promise represents a value that may not exist yet but will be resolved or rejected at some future time.

```javascript
const p = new Promise((resolve, reject) => {
  resolve('done');
});

p.then(console.log).catch(console.error);
```

### Promise static methods

| Method | Behavior |
|---|---|
| `Promise.all` | Resolves when all promises resolve; rejects on first rejection |
| `Promise.allSettled` | Waits for all; returns status/value for each |
| `Promise.race` | Settles as soon as any promise settles |
| `Promise.any` | Resolves on first success; rejects `AggregateError` if all fail |

### Async/await

Syntactic sugar over Promises; makes asynchronous code look synchronous.

```javascript
async function fetchUser(id) {
  try {
    const user = await getUser(id);
    return user;
  } catch (err) {
    throw err;
  }
}
```

### Callbacks vs Promises

| Pattern | Problem | Solution |
|---|---|---|
| Callbacks | Callback hell, inversion of control | Promises / async-await |
| Promises | Chain readability | async-await |

### Event Loop

The event loop coordinates the call stack, Web APIs, and callback queues:

1. Execute synchronous code on the call stack.
2. When async operations complete, their callbacks move to queues.
3. **Microtasks** (`Promise.then`, `queueMicrotask`) run before **macrotasks** (`setTimeout`, `setInterval`, I/O).
4. `process.nextTick` (Node.js) runs before microtasks.

### Timers (Node.js)

| API | Queues after |
|---|---|
| `process.nextTick` | Current operation, before microtasks |
| `queueMicrotask` | Microtask queue |
| `Promise.then` | Microtask queue |
| `setTimeout(fn, 0)` | Timers phase (effectively clamped by runtime/event-loop load) |
| `setImmediate` (Node) | Check phase (often after I/O callbacks) |

Ordering note:

- `process.nextTick` runs before Promise microtasks.
- Microtasks run before the event loop proceeds to the next phase.
- Between `setTimeout(0)` and `setImmediate`, ordering can vary by context; inside an I/O callback, `setImmediate` typically fires first.

### Generators

Functions that can pause and resume, yielding multiple values.

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
console.log(g.next().value); // 1
```

### Prototypal Inheritance

Objects inherit from other objects via the prototype chain.

```javascript
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { console.log(this.name); };

const dog = new Animal('Buddy');
dog.speak(); // Buddy
```

### IIFE (Immediately Invoked Function Expression)

```javascript
(function () {
  const privateVar = 'secret';
  console.log(privateVar);
})();
```

Used to create a private scope and avoid polluting the global namespace.

### CORS

Cross-Origin Resource Sharing. Browsers block requests from one origin to another unless the server includes appropriate `Access-Control-Allow-Origin` headers.

### Middlewares

Functions that sit between a request and a final handler, common in Express/NestJS. They can modify the request/response, end the request, or call `next()` to continue.

### `null` vs `undefined`

| Value | Meaning | Typical source |
|---|---|---|
| `undefined` | Value not assigned / missing | Uninitialized variables, missing function args, absent object keys |
| `null` | Explicitly empty value | Developer intentionally sets no value |

```javascript
let a;
const b = null;

console.log(a); // undefined
console.log(b); // null
console.log(typeof a); // 'undefined'
console.log(typeof b); // 'object' (legacy JS bug)
console.log(a == b);   // true
console.log(a === b);  // false
```

### `PUT` vs `PATCH` vs `POST`

| Method | Semantics | Idempotent? | Typical use |
|---|---|---|---|
| `POST` | Create subordinate resource / trigger action | Usually no | Create order, submit form, execute action |
| `PUT` | Replace resource representation fully | Yes | Replace `/users/123` with complete payload |
| `PATCH` | Partial update of resource | Usually yes (depends on patch ops) | Update a few fields |

Interview note: if the same request can be retried safely with the same effect, it's idempotent.

### `package.json` essentials

| Field | Purpose |
|---|---|
| `name`, `version` | Package identity |
| `scripts` | Standardized project commands (`test`, `build`, `start`) |
| `dependencies` | Runtime dependencies |
| `devDependencies` | Tooling/test/build dependencies |
| `engines` | Node/npm version constraints |
| `type` | Module mode (`commonjs` or `module`) |

Common npm flags (historical + current):

- `npm i -g <pkg>` installs globally.
- `npm i <pkg> --save-dev` adds to `devDependencies`.
- `npm i <pkg> --save` is legacy; modern npm saves to `dependencies` by default.

### Node.js process exit codes (interview quick view)

| Exit code | Meaning |
|---|---|
| `0` | Success |
| `1` | Uncaught fatal exception / generic failure |
| `128 + signal` | Process terminated by Unix signal (e.g., `SIGKILL` => `137`) |

```javascript
process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});
```

---

## 21. Additional Interview-Critical Topics

### Classes and class inheritance

```javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(this.name); }
}

class Dog extends Animal {
  speak() { console.log(`${this.name} barks`); }
}

const d = new Dog('Buddy');
d.speak(); // Buddy barks
```

Class declarations are hoisted but remain in the TDZ until evaluated, just like `let`/`const`.

### `Map`, `Set`, `WeakMap`, `WeakRef`

| Collection | Use when |
|---|---|
| `Map` | Frequent key insertions/deletions with any key type; preserves insertion order |
| `Set` | Unique values needed |
| `WeakMap` | Private data attached to objects without preventing GC |
| `WeakRef` | Non-strong reference to an object (allows GC) |

Use `Map` over plain objects when keys are not strings or when iteration order/size matters.

### Debounce and throttle

```javascript
function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

- **Debounce** waits for a pause in events; useful for search input.
- **Throttle** limits execution to a fixed interval; useful for scroll/resize handlers.

### `AbortController`

```javascript
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal })
  .then((res) => res.json())
  .catch((err) => {
    if (err.name === 'AbortError') console.log('Request aborted');
  });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

`AbortController` lets you cancel `fetch`, streams, and other async operations that accept a signal.

### Event delegation

Attach one listener to a parent and use `event.target` to identify which child was clicked.

```javascript
document.getElementById('list').addEventListener('click', (e) => {
  if (e.target.matches('li.item')) console.log(e.target.textContent);
});
```

Benefits: fewer listeners, automatic handling of dynamically added children.

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
```

Staff note: memoization trades memory for CPU; be cautious with unbounded caches and non-serializable arguments.

### Type coercion and falsy values

| Expression | Result | Why |
|---|---|---|
| `0 == '0'` | `true` | String converted to number |
| `0 === '0'` | `false` | Strict equality, no coercion |
| `[] == false` | `true` | Array to primitive to number `0` |
| `null == undefined` | `true` | Special coercion rule |
| `NaN == NaN` | `false` | `NaN` is never equal to itself |

Falsy values: `false`, `0`, `-0`, `''`, `null`, `undefined`, `NaN`, `document.all`.
Prefer `===` and explicit conversions in production code.

### `for await...of` and async iterators

```javascript
async function* asyncRange(n) {
  for (let i = 0; i < n; i++) {
    await new Promise((r) => setTimeout(r, 10));
    yield i;
  }
}

(async () => {
  for await (const x of asyncRange(3)) {
    console.log(x);
  }
})();
```

Async iterators let you consume asynchronous data sources with the same mental model as synchronous loops.

### Browser rendering, `requestAnimationFrame`, and the Scheduler API

```javascript
function animate() {
  // Runs before the next paint
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

| Mechanism | Purpose |
|---|---|
| `requestAnimationFrame` | Schedule work before the next browser paint (60fps target) |
| `scheduler.yield()` | Yield to higher-priority work without dropping to the end of the task queue |
| `scheduler.postTask()` | Priority-aware scheduling (`user-blocking`, `user-visible`, `background`) |

Staff note: long microtask queues block rendering. Chunk work with `requestAnimationFrame` or `scheduler.yield()` to keep Interaction to Next Paint (INP) healthy.

### Core Web Vitals: INP and TBT

| Metric | What it measures | Staff angle |
|---|---|---|
| **INP** (Interaction to Next Paint) | Latency of the worst user interaction | Long JavaScript tasks and microtask starvation block the main thread and inflate INP |
| **TBT** (Total Blocking Time) | Sum of long tasks between First Contentful Paint and Time to Interactive | Reduce by breaking work into chunks and moving heavy logic off main thread |

### WebAssembly (Wasm)

WebAssembly is a low-level, portable binary format that runs in the browser and Node.js alongside JavaScript.

Use when:

- CPU-intensive computation (image/video/audio processing, codecs).
- Existing C/C++/Rust codebases need to run on the web.
- Predictable near-native performance matters more than dynamic flexibility.

JavaScript remains the orchestrator; Wasm handles the hot compute modules.

### `BigInt` and `Symbol` reminders

```javascript
const huge = 9007199254740991n + 1n; // BigInt
const key = Symbol('private');       // unique, non-string object key
```

- `BigInt` supports arbitrarily large integers; cannot be mixed with `Number` directly.
- `Symbol` creates unique property keys useful for non-colliding metadata.

---

## 22. Programming Problems

### 1. Reverse a string

```javascript
function reverseString(str) {
  return str.split('').reverse().join('');
}
// or without built-ins:
function reverseString2(str) {
  let result = '';
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}
```

### 2. Sort an array and return unique elements without `.sort()` or `.includes()`

```javascript
function sortAndUnique(arr) {
  // selection sort
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    [arr[i], arr[min]] = [arr[min], arr[i]];
  }
  const unique = [];
  for (const n of arr) {
    if (unique[unique.length - 1] !== n) unique.push(n);
  }
  return unique;
}
```

### 3. Insert element at index

```javascript
function insertAt(arr, index, value) {
  const result = [...arr];
  for (let i = result.length; i > index; i--) {
    result[i] = result[i - 1];
  }
  result[index] = value;
  return result;
}
```

### 4. Search element in array without `.includes()`

```javascript
function includes(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) return true;
  }
  return false;
}
```

### 5. Word count from string

```javascript
function wordCount(str) {
  const words = str.toLowerCase().match(/\b\w+\b/g) || [];
  const count = {};
  for (const word of words) {
    count[word] = (count[word] || 0) + 1;
  }
  return count;
}

console.log(wordCount('Hi. Hi Good Morning'));
// { hi: 2, good: 1, morning: 1 }
```

### 6. Separate negative and positive numbers

```javascript
function separate(arr) {
  const negatives = [];
  const positives = [];
  for (const n of arr) {
    if (n < 0) negatives.push(n);
    else positives.push(n);
  }
  return [...negatives, ...positives];
}
```

### 7. Find missing number in a sorted array

```javascript
function findMissing(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== i + 1) return i + 1;
  }
  return arr.length + 1;
}
```

### 8. `typeof` quiz

```javascript
console.log(typeof []);        // 'object'
console.log(typeof {});        // 'object'
console.log(typeof null);        // 'object' (bug)
console.log(typeof undefined);   // 'undefined'
```

### 9. `var`/`let` hoisting quiz

```javascript
abc(); // ReferenceError: Cannot access 'abc' before initialization
def(); // TypeError: def is not a function (var is hoisted as undefined)

let abc = () => console.log('a');
var def = () => console.log('b');
```

### 10. `filter` vs `map`

```javascript
const a = [1, 2, 3, 4, 5];
const b = a.filter(e => { if (e > 2) return e; }); // [3, 4, 5]
const c = a.map(e => { if (e > 2) return e; });      // [undefined, undefined, 3, 4, 5]
```

`filter` removes non-truthy returns; `map` keeps every slot.

---

## 23. Staff-Level Sound Bites

- "`var` is function-scoped and hoisted to `undefined`; `let` and `const` are block-scoped and subject to the temporal dead zone."
- "Closures let a function retain access to its lexical scope even after the outer function returns."
- "`this` is determined by how a function is called, except arrow functions which inherit `this` lexically."
- "JavaScript passes primitives by value and object references by value."
- "A shallow copy shares nested objects; a deep copy creates independent nested objects."
- "Use `for...of` for iterables, `for...in` only for object keys with a `hasOwnProperty` guard."
- "Microtasks (`Promise.then`, `queueMicrotask`) always run before the next macrotask."

---

## 24. Quick Reference Tables

### Variable declarations

| | scope | hoisted | reassign | global object |
|---|---|---|---|---|
| `var` | function | yes (`undefined`) | yes | yes |
| `let` | block | yes (TDZ) | yes | no |
| `const` | block | yes (TDZ) | no | no |

### `this` binding

| Call site | `this` |
|---|---|
| `obj.method()` | `obj` |
| Plain function strict | `undefined` |
| Plain function non-strict | global |
| Arrow function | lexical |
| `new Constructor()` | new instance |
| `call`/`apply`/`bind` | explicit argument |

### Array method cheat sheet

| Method | Returns | Mutates original |
|---|---|---|
| `map` | new array | no |
| `filter` | new array | no |
| `reduce` | single value | no |
| `find` | element or `undefined` | no |
| `forEach` | `undefined` | no (unless callback mutates) |
| `sort` | sorted array | yes |
| `splice` | removed elements | yes |
| `slice` | new array | no |

### Copy methods

| Need | Method |
|---|---|
| Shallow copy object | `{ ...obj }`, `Object.assign({}, obj)` |
| Shallow copy array | `[...arr]`, `arr.slice()` |
| Deep copy (JSON-safe) | `JSON.parse(JSON.stringify(obj))` |
| Deep copy (robust) | `_.cloneDeep(obj)` or recursive function |

---

## 25. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| Hoisting | "JavaScript hoists declarations during compile phase; only function declarations are fully initialized, while `let`/`const` stay in TDZ until execution reaches them." |
| Scope | "JavaScript uses lexical scope, so variable visibility is based on where code is written, not where a function is called." |
| `var` vs `let` vs `const` | "`var` is function-scoped and re-declarable; `let`/`const` are block-scoped with TDZ, and `const` freezes the binding, not nested object data." |
| Closures | "A closure is a function that retains access to its lexical environment after the outer function has returned, enabling private state and factories." |
| `this` binding | "`this` is call-site driven for regular functions, while arrow functions capture lexical `this` from the surrounding scope." |
| `call` / `apply` / `bind` | "All three control `this`; `call` and `apply` invoke immediately, while `bind` returns a new pre-bound function." |
| Pass-by-value model | "JavaScript is always pass-by-value; for objects, the value being copied is the reference, so mutation is visible but reassignment is local." |
| Shallow vs deep copy | "Shallow copy clones only first level; deep copy duplicates nested references, which matters for immutable state management." |
| Array methods | "Use `map` to transform, `filter` to select, `reduce` to aggregate, `find` to locate first match, and `forEach` for side effects only." |
| Currying | "Currying converts multi-arg functions into unary chains so partial application and composition become straightforward." |
| Equality | "Prefer `===` for predictable comparisons; `Object.is` is useful for edge cases like `NaN` and signed zero." |
| Event loop | "JavaScript runs one call stack; microtasks (`Promise.then`) always drain before the next macrotask phase." |
| Promises / async-await | "`async/await` is syntax over Promises; it improves control flow readability without changing concurrency semantics." |
| `null` vs `undefined` | "`undefined` means missing/uninitialized value; `null` means intentionally empty." |
| HTTP update verbs | "`PUT` replaces the full resource and is idempotent; `PATCH` partially updates; `POST` is generally non-idempotent create/action." |

| Classes / inheritance | "Classes are syntactic sugar over constructor functions and prototype chains; declarations are hoisted but stay in the TDZ until evaluation." |
| `Map`/`Set`/`WeakMap` | "Use `Map` for non-string keys and ordered iteration, `Set` for uniqueness, and `WeakMap`/`WeakRef` when you want metadata that does not extend object lifetime." |
| Debounce / throttle | "Debounce waits for a pause in events, throttle caps the rate; both are common ways to avoid expensive work on high-frequency events." |
| `AbortController` | "`AbortController` gives us a standard way to cancel `fetch`, streams, and other signal-aware async operations without leaking resources." |
| Event delegation | "Event delegation attaches one listener to a parent and uses `event.target`, reducing memory and handling dynamically added children." |
| Memoization | "Memoization caches function results to trade memory for CPU; guard against unbounded growth and non-serializable keys." |
| Type coercion | "JavaScript coerces operands in loose equality; I prefer `===` and explicit conversions to avoid surprising rules." |
| Async iterators | "`for await...of` consumes async iterables with the same readability as synchronous loops, useful for streaming data." |
| Browser rendering | "Long tasks and microtask starvation block the main thread; I use `requestAnimationFrame`, `scheduler.yield()`, and chunking to protect INP and TBT." |
| WebAssembly | "WebAssembly lets me move CPU-bound modules written in C++/Rust into the browser or Node while JavaScript orchestrates them." |
| Core Web Vitals | "INP measures interaction latency; TBT measures main-thread blocking — both are key signals for a responsive user experience." |

---

## 26. Frequent Staff-Level Follow-Ups

- **Collection choice:** pick `Map`/`Set` over plain objects when key types, iteration order, or object-identity semantics matter.
- **Cancelable async operations:** pass `AbortSignal` through service boundaries and respect it in fetch/stream cleanup.
- **Event-delegation memory model:** prefer delegation for large or dynamic lists; attach close to the common ancestor to avoid deep propagation.
- **Immutability at scale:** be explicit on where shallow copy is safe vs where structural sharing libraries are needed.
- **Event-loop safety:** identify blocking hotspots (JSON parse, sync crypto, regex backtracking) and move heavy paths off main thread.
- **API semantics:** tie method idempotency to retries, backoff policies, and exactly-once illusions.
- **Defensive JavaScript:** enforce strict mode, lint rules, and runtime guards (`zod`/`joi`) at service boundaries.
