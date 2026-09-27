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
|---|---|---|---|
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
| ES2018 | 2018 | Async iteration, rest/spread props, `Promise.finally`, `Object.fromEntries` |
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
| `setTimeout(fn, 0)` | Macrotask queue (minimum delay ~1-20ms) |
| `setImmediate` (Node) | Check phase after I/O |

Order of execution: `process.nextTick` → microtasks → `setTimeout(0)` → `setImmediate`.

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

---

## 21. Programming Problems

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
abc(); // TypeError: abc is not a function (let TDZ is over at this point but value is an arrow function expression)
def(); // works: var declaration hoisted

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

## 22. Staff-Level Sound Bites

- "`var` is function-scoped and hoisted to `undefined`; `let` and `const` are block-scoped and subject to the temporal dead zone."
- "Closures let a function retain access to its lexical scope even after the outer function returns."
- "`this` is determined by how a function is called, except arrow functions which inherit `this` lexically."
- "JavaScript passes primitives by value and object references by value."
- "A shallow copy shares nested objects; a deep copy creates independent nested objects."
- "Use `for...of` for iterables, `for...in` only for object keys with a `hasOwnProperty` guard."
- "Microtasks (`Promise.then`, `queueMicrotask`) always run before the next macrotask."

---

## 23. Quick Reference Tables

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
