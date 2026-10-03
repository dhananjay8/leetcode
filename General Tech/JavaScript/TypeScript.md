# TypeScript — Staff/Principal Interview Deep Dive

---

## 1. What TypeScript Actually Is (Compiler Mental Model)

```text
.ts / .tsx source
        │
        ▼
     Scanner/Parser  ──>  AST
        │
        ▼
   Binder (builds symbol table, scopes)
        │
        ▼
   Type Checker (structural type system, inference, narrowing)
        │
        ├── Errors? -> reported, but...
        │
        ▼
   Emitter (strips types) ──> plain JavaScript (+ optional .d.ts, .map)
```

- TypeScript is a **structurally-typed superset of JavaScript**: every valid `.js` file is (almost) valid `.ts`.
- Type checking and emit are **separate phases**. By default `tsc` still emits JavaScript **even if type errors exist** (unless `noEmitOnError` is set) — types are a design-time safety net, not a runtime guard.
- At runtime, **all types are erased**. `interface`, `type`, generics, and type-only syntax leave zero trace in the output JS. A few constructs are *not* purely type-level and do emit real JS: `enum` (unless `const enum` is inlined), `namespace`/`module` with values, parameter properties (`constructor(private x: number)`), and legacy decorators.
- Staff point: **"TypeScript gives you compile-time guarantees, not runtime guarantees — an `any` cast or a bad JSON payload from an API can still blow past every type you wrote."**

### Interview answer

> TypeScript is JavaScript plus a structural, erasable type system. The compiler parses to an AST, builds a symbol table, runs the type checker for inference and narrowing, then strips all type-only syntax during emit. Because types don't exist at runtime, TypeScript can't protect you from bad data crossing a trust boundary (network, `JSON.parse`, `any`) — that's what runtime validation libraries like `zod` are for.

---

## 2. Structural Typing (Duck Typing)

- TypeScript compares types by their **shape** (members and signatures), not by name or declared ancestry — unlike Java/C#'s **nominal typing**.

```typescript
interface Point { x: number; y: number }

function logPoint(p: Point) { console.log(p.x, p.y); }

const vector = { x: 1, y: 2, z: 3 };
logPoint(vector); // OK — vector is a structural superset of Point
```

### Excess property checks (the one place structural typing gets stricter)

```typescript
logPoint({ x: 1, y: 2, z: 3 });
// Error: Object literal may only specify known properties, and 'z' does not exist in type 'Point'.
```

- Excess property checks **only fire on fresh object literals** assigned directly. Assigning via a variable (as above with `vector`) bypasses the check — this surprises a lot of engineers and is a frequent interview trick question.

### Weak type detection

```typescript
interface Options { timeout?: number; retries?: number }
function configure(o: Options) {}

configure({ timeuot: 5000 });
// Error: Object literal may only specify known properties, but 'timeuot' does not exist...
// Did you mean to write 'timeout'?
```

- When every property on a target type is optional, TypeScript adds a special **"weak type" check**: the object literal must share **at least one** property with the target, catching typos that excess-property-checking alone would miss.

---

## 3. Type Inference & Narrowing

### Contextual typing

TypeScript infers parameter/return types from the surrounding context (callback signatures, assignment targets) without annotations:

```typescript
const nums = [1, 2, 3];
nums.map(n => n * 2); // `n` inferred as number from Array<number>.map's signature
```

### Control-flow narrowing

The type checker tracks types **per code path**, narrowing a union at each branch:

```typescript
function format(value: string | number | Date) {
  if (typeof value === 'string') return value.toUpperCase();   // string
  if (typeof value === 'number') return value.toFixed(2);      // number
  return value.toISOString();                                  // Date (by elimination)
}
```

### Narrowing techniques

| Technique | Example |
|---|---|
| `typeof` | `typeof value === 'string'` |
| `instanceof` | `value instanceof Error` |
| `in` operator | `'bark' in animal` |
| Discriminant property | `shape.kind === 'circle'` |
| Truthiness | `if (value)` |
| Equality narrowing | `if (a === b)` narrows both to the intersection |
| Array/tuple `.length` | narrows tuple-like arrays |
| User-defined type guard | `function isDog(a: Animal): a is Dog` |
| Assertion function | `function assertIsString(v: unknown): asserts v is string` |

### User-defined type guards and assertion functions

```typescript
interface Dog { bark(): void }
interface Cat { meow(): void }

function isDog(animal: Dog | Cat): animal is Dog {
  return (animal as Dog).bark !== undefined;
}

function assertIsDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v === null || v === undefined) throw new Error('Expected value to be defined');
}

function use(animal: Dog | Cat, maybeUser: User | undefined) {
  if (isDog(animal)) animal.bark();      // narrowed to Dog
  assertIsDefined(maybeUser);
  maybeUser.id;                          // narrowed to User, no longer possibly undefined
}
```

- `asserts` functions let you centralize a guard clause and have the narrowing **persist after the call**, unlike a plain `boolean`-returning guard which only narrows inside the `if` branch where it's called.

---

## 4. Union, Intersection & Discriminated Unions

```typescript
type Id = string | number;                 // union — "one of"
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;                 // intersection — "all of"
```

### Discriminated unions + exhaustiveness checking

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':    return Math.PI * shape.radius ** 2;
    case 'square':    return shape.side ** 2;
    case 'rectangle': return shape.width * shape.height;
    default:
      const _exhaustive: never = shape; // compile error if a case is added and unhandled
      throw new Error(`Unhandled shape: ${JSON.stringify(shape)}`);
  }
}
```

- Staff point: **the `never` exhaustiveness check is the single highest-leverage TypeScript idiom for domain modeling** — add a new variant to the union, and every unhandled `switch` lights up as a compile error instead of a silent runtime bug.

---

## 5. Literal Types, `as const`, and `satisfies`

```typescript
let a = 'hello';        // type: string (widened)
const b = 'hello';      // type: 'hello' (literal, since const bindings can't be reassigned)

const config = { env: 'prod', retries: 3 };
// inferred: { env: string; retries: number } — widened, loses literal-ness

const configLiteral = { env: 'prod', retries: 3 } as const;
// inferred: { readonly env: 'prod'; readonly retries: 3 } — deeply readonly + literal
```

### `satisfies` (TS 4.9+) — validate without widening or casting

```typescript
type Theme = Record<'primary' | 'secondary', string>;

const theme = {
  primary: '#000',
  secondary: '#fff',
} satisfies Theme;

theme.primary.toUpperCase(); // still typed as the literal '#000', not widened to `string`
```

| Approach | Type-checks shape? | Keeps literal/narrow type? |
|---|---|---|
| `: Theme` annotation | Yes | No — widens to the annotated type |
| `as Theme` assertion | **No** (bypasses checking) | No |
| `satisfies Theme` | Yes | **Yes** — keeps the most specific inferred type |

- `satisfies` is the staff-level answer to "how do I get both validation and precise inference" — it replaced a lot of `as const` + manual annotation gymnastics.

---

## 6. `interface` vs `type` — The Real Differences

| | `interface` | `type` |
|---|---|---|
| Object shapes | Yes | Yes |
| Unions / intersections | No (can `extends` but not union) | Yes |
| Mapped / conditional types | No | Yes |
| Declaration merging | **Yes** — repeated `interface X` merges | No — duplicate `type X` is an error |
| Implements by classes | Idiomatic (`class C implements I`) | Also works, less idiomatic |
| Error messages on large unions | Usually clearer | Can get noisy on deep conditional types |

```typescript
interface Animal { name: string }
interface Animal { legs: number }  // merges — Animal now has both name and legs

// Module augmentation relies on this: extending a third-party library's types.
declare global {
  interface Window { myApp: AppInstance }
}
```

- Staff guidance: **default to `interface` for public object/API shapes** (so consumers can augment them), and **use `type` whenever you need unions, mapped types, conditional types, or tuples** — `interface` simply cannot express those.

---

## 7. Generics — Constraints, Defaults, and Variance

```typescript
function identity<T>(value: T): T { return value; }

function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

class Repository<T, K = string> {
  private store = new Map<K, T>();
  get(key: K): T | undefined { return this.store.get(key); }
  set(key: K, value: T): void { this.store.set(key, value); }
}
```

- `extends` on a type parameter is a **constraint**, not inheritance — it bounds what `T` is allowed to be.
- Default type parameters (`K = string`) let callers omit generics they don't care about.

### Variance intuition (where TypeScript is intentionally unsound)

```typescript
class Animal {}
class Dog extends Animal { bark() {} }

let animals: Animal[] = [];
let dogs: Dog[] = [new Dog()];
animals = dogs; // OK — arrays are covariant in TS (unsound: animals.push(new Animal()) now corrupts `dogs`)

type Handler<T> = (arg: T) => void;
let handleAnimal: Handler<Animal> = (a) => {};
let handleDog: Handler<Dog> = handleAnimal; // OK — a handler that accepts any Animal can stand in for Dog (contravariant, sound)

interface Comparer<T> { compare(a: T, b: T): number; } // method params are checked *bivariantly* (unsound, legacy compat)
```

- Staff point: **function parameters are contravariant in sound type theory, but TypeScript checks method-shorthand parameters bivariantly** for backward compatibility with older JS callback patterns. This is a known, intentional unsoundness — know it exists even if you rarely hit it.

---

## 8. Utility Types Deep Dive

| Utility | What it does |
|---|---|
| `Partial<T>` | All properties optional |
| `Required<T>` | All properties required (strips `?`) |
| `Readonly<T>` | All properties `readonly` |
| `Record<K, V>` | Object type with keys `K` and values `V` |
| `Pick<T, K>` | Subset of `T` with only keys `K` |
| `Omit<T, K>` | `T` minus keys `K` |
| `Exclude<T, U>` | Remove members of union `T` assignable to `U` |
| `Extract<T, U>` | Keep members of union `T` assignable to `U` |
| `NonNullable<T>` | Removes `null`/`undefined` from `T` |
| `ReturnType<F>` | Return type of function type `F` |
| `Parameters<F>` | Tuple of a function's parameter types |
| `ConstructorParameters<C>` | Tuple of a class constructor's parameter types |
| `InstanceType<C>` | Instance type produced by constructor `C` |
| `Awaited<T>` | Recursively unwraps `Promise<Promise<...T>>` to `T` |

```typescript
interface User { id: string; name: string; email: string; createdAt: Date }

type UserDraft = Partial<Omit<User, 'id' | 'createdAt'>>;
type UserSummary = Pick<User, 'id' | 'name'>;

async function fetchUser(): Promise<User> { /* ... */ return {} as User; }
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>; // User
```

---

## 9. Mapped Types & Key Remapping

```typescript
type Partial2<T> = { [K in keyof T]?: T[K] };
type Readonly2<T> = { [K in keyof T]: T[K] };

// Modifiers can ADD or REMOVE readonly / optional with +/-
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Concrete<T> = { [K in keyof T]-?: T[K] };

// Key remapping with `as` (TS 4.1+)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

### Recursive mapped + conditional types: `DeepPartial` / `DeepReadonly`

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

---

## 10. Conditional Types & `infer`

```typescript
type IsString<T> = T extends string ? true : false;

// Distributive: conditional types distribute over naked union type parameters
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[] (distributed), not (string | number)[]
```

### `infer` — extracting a type from within another type

```typescript
type ElementType<T> = T extends (infer U)[] ? U : T;
type A = ElementType<string[]>; // string

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type B = UnwrapPromise<Promise<number>>; // number

// Recursive infer — flatten nested arrays to their element type
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;
type C = Flatten<number[][][]>; // number
```

- `ReturnType<T>` and `Parameters<T>` in `lib.d.ts` are themselves just conditional types using `infer` — worth being able to write them from scratch in an interview:

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
```

---

## 11. Template Literal Types

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiRoute = `/api/${string}`;

type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'

// Parsing-style template literal type: split a route into typed params
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<'/users/:userId/orders/:orderId'>; // "userId" | "orderId"
```

- Intrinsic string manipulation types: `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>`.
- Staff-relevant use case: **typed routers, typed SQL builders, typed i18n keys** — template literal types let you model string *structure*, not just string *value*.

---

## 12. Enums vs Union Literals — The Staff-Level Trade-off

```typescript
enum Direction { Up, Down, Left, Right }          // numeric enum — reverse-mapped at runtime
enum Status { Active = 'ACTIVE', Done = 'DONE' }  // string enum — no reverse mapping

const enum Fast { A, B }  // const enum — fully inlined at call sites, no object emitted
```

| Concern | Numeric/string `enum` | Union of string literals |
|---|---|---|
| Runtime footprint | Emits a real JS object (except `const enum`) | Zero — fully erased |
| Reverse mapping | Numeric enums get `Direction[0] === 'Up'` (surprises people) | N/A |
| Cross-module safety | Nominal-ish: two enums with the same members still aren't interchangeable in some cases; numeric enums *are* too freely assignable from any `number` | Fully structural, exact matches only |
| Works with `isolatedModules`/single-file transpilers (`babel`, `esbuild`, `swc`) | `const enum` historically **breaks** single-file transpilers (can't inline without full-program knowledge) | Always safe |
| Tree-shaking | Harder (lives as a runtime object) | Trivial — it's just a type |

- Most staff-level style guides (and the TypeScript team itself) now lean towards `type Status = 'ACTIVE' | 'DONE'` with an optional `as const` object for the runtime value, specifically to avoid the `const enum` + bundler interop problems and numeric reverse-mapping surprises.
- Recent TypeScript added an `erasableSyntaxOnly` compiler flag to support running `.ts` files directly (e.g. via Node's built-in type-stripping): regular `enum`, `namespace` with runtime values, and parameter properties are **not erasable** and are rejected under that mode, while literal unions always are — another point in favor of literal unions for code that needs to run without a build step.

---

## 13. Nullability & Strictness Flags

```typescript
function greet(name: string | null) {
  // with strictNullChecks: must narrow before using `name` as a string
  return name ? `Hello, ${name}` : 'Hello, stranger';
}
```

| Flag | What it catches |
|---|---|
| `strict` | Umbrella flag enabling all strict flags below |
| `strictNullChecks` | `null`/`undefined` are not implicitly assignable to other types |
| `noImplicitAny` | Disallows parameters/variables silently inferred as `any` |
| `strictFunctionTypes` | Enforces contravariant checking of function parameters (closes part of the bivariance hole, except for methods) |
| `noUncheckedIndexedAccess` | `obj[key]` returns `T \| undefined`, not `T`, for index signatures |
| `exactOptionalPropertyTypes` | `{ a?: string }` means "may be absent," not "may be `undefined`" — `{ a: undefined }` becomes an error |
| `noImplicitOverride` | Requires explicit `override` keyword when overriding a base method |
| `useUnknownInCatchVariables` | `catch (e)` types `e` as `unknown` instead of `any` (default since TS 4.4) |

- Staff point: **`strict: true` is the floor for any serious codebase.** `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are the two flags most teams skip but that catch entire classes of "it worked in my test data" bugs around optional/dynamic keys.

---

## 14. Classes, Access Modifiers & `this` Typing

```typescript
class Account {
  readonly id: string;
  private balance: number;
  #secret: string; // true runtime-private field (JS-native, not just compile-time)

  constructor(id: string, initial: number, secret: string) {
    this.id = id;
    this.balance = initial;
    this.#secret = secret;
  }

  // Parameter properties — shorthand for declaring + assigning in one line
  static fromRecord(record: { id: string; balance: number }) {
    return new Account(record.id, record.balance, '');
  }

  deposit(amount: number): this {   // polymorphic `this` return type — subclasses return their own type
    this.balance += amount;
    return this;
  }
}

class SavingsAccount extends Account {
  addInterest(rate: number): this {
    return this.deposit(this.balanceSnapshot() * rate);
  }
  private balanceSnapshot() { return 0; }
}
```

| Modifier | Enforced at | Visible via `JSON.stringify`/reflection |
|---|---|---|
| `public` (default) | Compile-time only | Yes |
| `private` | Compile-time only — `(obj as any).secret` still reads it | Yes |
| `protected` | Compile-time only | Yes |
| `#field` (JS private) | **Runtime** — truly inaccessible outside the class | No |
| `readonly` | Compile-time only — object is still mutable via `as any` or `Object.assign` tricks | Yes |

- Staff point: **TypeScript's `private`/`protected`/`readonly` are erased at compile time and provide zero runtime protection.** If you need genuine encapsulation (e.g. not exposing a secret to `JSON.stringify` or a debugger), use native `#private` fields, not the `private` keyword.
- `this` as a return type lets a fluent/builder API stay correctly typed through subclasses without re-declaring every method.

---

## 15. Decorators

```typescript
// Legacy decorators (experimentalDecorators: true) — used by Angular, NestJS, TypeORM
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`, args);
    return original.apply(this, args);
  };
}

class Service {
  @Log
  process(id: string) { /* ... */ }
}
```

```typescript
// TC39 Stage-3 decorators (TypeScript 5.0+, no experimentalDecorators flag needed)
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext,
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)}`);
    return target.call(this, ...args);
  };
}

class Service2 {
  @logged
  process(id: string) { /* ... */ }
}
```

| | Legacy decorators | TC39 Stage-3 decorators |
|---|---|---|
| Flag | `experimentalDecorators: true` | Default in modern TS, no flag |
| Ecosystem | Angular, NestJS, TypeORM, Inversify | New code, Stage-3 spec-aligned |
| Metadata reflection | `emitDecoratorMetadata` + `reflect-metadata` for DI frameworks | Different metadata model, still evolving |
| Parameter decorators | Supported | Not part of the Stage-3 proposal |

- Staff point: **know which decorator model a framework uses before writing DI code** — mixing the two flag settings in one project is a classic source of "decorator X does nothing" bug reports.

---

## 16. Module Systems & Interop

```typescript
// CommonJS default-export interop
import express from 'express';          // needs esModuleInterop: true
import * as path from 'path';           // always safe, namespace-style import

// Type-only imports — guaranteed erased, never a runtime import
import type { User } from './types';
export type { User };

// Side-effect-only import of a type augmentation file
import './global-augmentations';
```

| Flag | Purpose |
|---|---|
| `esModuleInterop` | Allows `import express from 'express'` against CJS modules without a default export |
| `allowSyntheticDefaultImports` | Type-checking side of the above, without changing emit |
| `isolatedModules` | Errors on any construct that can't be compiled file-by-file (needed for Babel/esbuild/swc, which transpile one file at a time with no type info) |
| `verbatimModuleSyntax` | Keeps `import`/`export` syntax exactly as written (no silent elision), forces explicit `import type` for type-only imports |

- Staff point: **`isolatedModules` matters the moment your build pipeline uses a non-`tsc` transpiler** (Babel, esbuild, swc, Next.js's default compiler). Those tools strip types per-file with no cross-file knowledge, so `const enum`, ambiguous re-exports of types, and some legacy decorator metadata patterns silently break — `tsc --noEmit` is then run *only* for type-checking in CI, while the actual JS emit comes from the faster transpiler.

---

## 17. Project References, Build Performance & Tooling

```json
// tsconfig.json (root, monorepo)
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/api" }
  ]
}
```

```json
// packages/api/tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "incremental": true,
    "skipLibCheck": true
  },
  "references": [{ "path": "../core" }]
}
```

| Technique | Effect |
|---|---|
| `composite` + `references` | Split a monorepo into independently-buildable, dependency-ordered projects (`tsc --build`) |
| `incremental` | Caches build info (`.tsbuildinfo`) so unchanged files skip re-checking |
| `skipLibCheck` | Skips type-checking `.d.ts` files (huge win on cold builds with many `node_modules` type packages) |
| `tsc --build --watch` | Rebuilds only the changed project and its dependents, not the whole graph |
| Transpile-only tools (Babel/esbuild/swc) | 10-100x faster than `tsc` for emit, but do **zero** type checking — pair with a separate `tsc --noEmit` step in CI |

- Staff point: **"type-check" and "transpile" are different jobs with different speed/safety trade-offs** — the production-grade setup is almost always: fast transpiler for dev/build output, `tsc --noEmit` (optionally with project references for incrementality) as a separate, parallelizable CI gate.

---

## 18. Branded/Opaque Types — Faking Nominal Typing

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function toUserId(id: string): UserId { return id as UserId; }

function getUser(id: UserId) { /* ... */ }

const uid = toUserId('u-123');
getUser(uid);          // OK
getUser('u-123');      // Error — plain string isn't a UserId
getUser('o-456' as OrderId); // Error — brands don't match, even though both are strings underneath
```

- TypeScript's structural typing means two `string` aliases are freely interchangeable by default — this is exactly the kind of bug (`getUser(orderId)`) that's easy to ship. **Branding** adds a phantom property that only exists in the type system, forcing values through an explicit constructor function and making IDs, currencies, and units non-interchangeable at compile time for free.

---

## 19. Error-Handling Patterns: `Result<T, E>` vs Exceptions

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function parseConfig(raw: string): Promise<Result<Config, ConfigError>> {
  try {
    return { ok: true, value: JSON.parse(raw) as Config };
  } catch (e) {
    return { ok: false, error: new ConfigError('Invalid JSON', { cause: e }) };
  }
}

const result = await parseConfig(raw);
if (!result.ok) {
  // narrowed to { ok: false; error: ConfigError }
  return handleError(result.error);
}
result.value; // narrowed to Config — caller is *forced* to check `ok` before touching `value`
```

- A discriminated-union `Result` type makes failure a **value the type checker forces you to handle**, unlike a thrown exception, which the type system can't track at all (a function's signature never tells you what it might throw).
- Staff-level trade-off to voice in interviews: exceptions are better for truly exceptional, unrecoverable conditions and keep the "happy path" code clean; `Result` types are better for **expected, recoverable failures** (validation, network calls, parsing) where you want the compiler to guarantee every call site handles both branches.

---

## 20. Common Pitfalls & Intentional Unsoundness

- **Array covariance** — `Dog[]` is assignable to `Animal[]`, so a function can push an `Animal` into what the caller thinks is a `Dog[]`. Known, accepted unsoundness for JS compatibility.
- **Method bivariance** — method-shorthand parameters (`interface X { f(a: Dog): void }`) are checked bivariantly, weaker than the contravariant check `strictFunctionTypes` applies to standalone function types.
- **`any` poisons everything it touches** — once a value is `any`, every property access and operation on it (and anything derived from it) silently becomes `any` too, with no warnings. Prefer `unknown` at trust boundaries and narrow explicitly.
- **Numeric enum reverse mapping** — `enum E { A, B }` lets you write `E[0]` to get `"A"` back, and also means *any* `number` is structurally close enough to cause confusing assignability in some contexts.
- **`as` assertions bypass checking entirely** — `value as SomeType` tells the compiler "trust me" and performs zero validation; it's a type-system escape hatch, not a cast.
- **Optional property vs `| undefined`** — `{ a?: string }` and `{ a: string | undefined }` are *not* the same under `exactOptionalPropertyTypes`: the former means the key may be absent, the latter means the key must be present but can hold `undefined`.
- **Declaration-file (`.d.ts`) drift** — hand-written `.d.ts` files for a JS library can silently diverge from the actual implementation; nothing re-checks them against runtime behavior.

---

## 21. Practical Interview Problems (Type-Level Coding)

### 1. Implement `DeepPartial<T>`

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
```

### 2. Implement `UnionToIntersection<T>`

```typescript
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;
```

### 3. Implement an exhaustiveness helper

```typescript
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

### 4. Implement a type-safe event emitter

```typescript
type EventMap = {
  login: { userId: string };
  logout: undefined;
  error: { message: string; code: number };
};

class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Array<(payload: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, cb: (payload: Events[K]) => void) {
    (this.listeners[event] ??= []).push(cb);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach(cb => cb(payload));
  }
}

const emitter = new TypedEmitter<EventMap>();
emitter.on('login', (p) => console.log(p.userId)); // payload typed as { userId: string }
emitter.emit('login', { userId: '123' });
emitter.emit('login', { userId: 123 as any }); // only an `any` escape bypasses the check
```

### 5. Implement `MyAwaited<T>` from scratch

```typescript
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;
```

---

## 22. Interview Q&A Bank

### Basic Questions

**Q1. What is TypeScript and why would you choose it over plain JavaScript?**
A: TypeScript is a structurally-typed superset of JavaScript that adds static types, interfaces, generics, and modern syntax support, all erased at compile time. It's chosen for earlier error detection, better IDE autocomplete/refactoring, and self-documenting function/data shapes on larger codebases or teams.

**Q2. What's the difference between `.ts` and `.d.ts` files?**
A: `.ts` contains real implementation code that gets compiled to JS. `.d.ts` contains **only type declarations** with no implementation — it describes the shape of existing JS code (your own build output or a third-party library) for the type checker, and is never emitted as runtime JS itself.

**Q3. What does `tsconfig.json` control, and what are a few options you always set deliberately?**
A: It controls compiler behavior — target ECMAScript version, module system, strictness flags, output paths, and type-checking scope. I always set `strict: true`, `target`/`module` matched to the runtime (Node vs browser vs bundler), and `skipLibCheck` for build speed.

**Q4. What is the `any` type and when, if ever, should you use it?**
A: `any` disables type checking entirely for a value. Legitimate uses are narrow: incrementally migrating a JS file, or a genuinely dynamic third-party payload you're about to validate at runtime — even then, prefer `unknown` and narrow explicitly rather than reaching for `any` by default.

**Q5. What's the difference between `interface` and `type` at a basic level?**
A: Both can describe object shapes. `interface` supports declaration merging and reads more idiomatically for class contracts; `type` is required for unions, tuples, and mapped/conditional types that `interface` cannot express.

### Intermediate Questions

**Q6. What are `never` and `unknown`, and how do they differ from each other and from `any`?**
A: `never` is the type of a value that provably cannot occur (a function that always throws or loops forever) — it's the bottom type and is what a correct exhaustiveness check narrows down to. `unknown` is the type-safe counterpart of `any`: you can assign anything to it, but you must narrow it before using it. `any` skips checking altogether, which is what makes it dangerous.

**Q7. Explain type guards with an example.**
A: A type guard is a runtime check the compiler recognizes for narrowing, either a built-in operator (`typeof`, `instanceof`, `in`) or a user-defined predicate function returning `arg is Type`:
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

**Q8. What are utility types, and name four you use regularly.**
A: Built-in generic types in `lib.d.ts` that transform other types. I regularly reach for `Partial<T>` (make all optional), `Pick<T, K>`/`Omit<T, K>` (subset/remove keys), and `ReturnType<T>` (capture a function's return type without repeating it).

**Q9. What is structural typing and how can it surprise you?**
A: Types are compared by shape, not declared name, so two unrelated interfaces with the same members are interchangeable. It surprises people with excess-property checks (fresh literals are checked stricter than variables) and with two `string`-based IDs being freely interchangeable unless explicitly branded.

**Q10. How does TypeScript handle nullability, and what flag turns it on?**
A: With `strictNullChecks` enabled, `null` and `undefined` are not implicitly part of every type — a `string` really only holds strings, and you must explicitly write `string | null` and narrow before use. Without that flag, `null`/`undefined` silently satisfy any type, defeating most of the safety TypeScript offers.

### Advanced Questions

**Q11. What are conditional types, and how does `infer` extend them?**
A: Conditional types (`T extends U ? X : Y`) branch on a type relationship at the type level. `infer` lets you capture a type from within that relationship instead of just branching on it — it's how `ReturnType<T>`, `Parameters<T>`, and `Awaited<T>` are implemented in `lib.d.ts`.

**Q12. What is a discriminated union, and how do you enforce exhaustiveness?**
A: A union of object types sharing a literal "tag" field (`kind`, `type`, `status`) that TypeScript narrows on in a `switch`/`if`. Exhaustiveness is enforced by assigning the `default`/`else` branch to a `never`-typed variable — if a new union member is added and left unhandled, that assignment becomes a compile error.

**Q13. What does the `satisfies` operator do that a type annotation or `as` doesn't?**
A: `satisfies` checks a value against a type (catching typos/missing keys like an annotation would) **without widening the inferred type** the way an annotation does, and without bypassing checks entirely the way `as` does — you keep both validation and the most specific/literal inferred type.

**Q14. Explain variance in TypeScript generics with a concrete unsound example.**
A: Arrays are covariant: `Dog[]` is assignable to `Animal[]`, so code that receives what it thinks is `Animal[]` can push a plain `Animal` into storage the caller believes is `Dog[]`-only — accepted unsoundness for JS array compatibility. Separately, method-shorthand parameters are checked bivariantly rather than contravariantly, a different, also-accepted hole.

**Q15. How would you implement `DeepPartial<T>` from scratch?**
A:
```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;
```
It recurses through object properties, applying `Partial`-like optionality at every nesting level, bottoming out once `T` is no longer an object (primitives, functions).

### Scenario / Staff-Level Questions

**Q16. You inherit a large JS codebase and need to introduce TypeScript. What's your migration plan?**
A: Enable `allowJs` + `checkJs` with a loose `tsconfig.json` first, rename files to `.ts` incrementally starting from leaf modules with few dependencies, add `strict` flags one at a time (`noImplicitAny` first, `strictNullChecks` next) rather than all at once, and gate new/changed code at stricter settings than legacy code via per-directory `tsconfig` overrides if needed.

**Q17. Your bundler is esbuild/swc, not `tsc`. What changes about how you use TypeScript?**
A: Those transpile file-by-file with no cross-file type information, so you must enable `isolatedModules` to catch constructs that can't compile standalone (ambiguous re-exports, some `const enum` usage), use explicit `import type` for type-only imports, and run `tsc --noEmit` as a **separate** CI step since the transpiler itself performs zero type checking.

**Q18. A teammate asks why their `private` class field is visible in a debugger/`JSON.stringify`. What do you tell them?**
A: TypeScript's `private`/`protected`/`readonly` are compile-time-only annotations erased on emit — at runtime the property is a completely ordinary, enumerable JS property. For genuine runtime privacy, they need native `#field` syntax instead, which the JS engine itself enforces.

**Q19. How do you model a function that can fail, so every call site is forced to handle the failure?**
A: Return a discriminated-union `Result<T, E>` (`{ ok: true, value } | { ok: false, error }`) instead of throwing — the caller must narrow on `ok` before accessing `value`, so the compiler, not convention, enforces error handling. Reserve thrown exceptions for truly unexpected, unrecoverable conditions.

**Q20. How would you prevent an `OrderId` from accidentally being passed where a `UserId` is expected, given both are strings?**
A: Brand them with a phantom intersection type (`string & { readonly __brand: 'OrderId' }`) and only construct each through an explicit factory function — structural typing then rejects a raw `string` or the other brand at every call site, at zero runtime cost.

---

## 23. Staff-Level Sound Bites

- "TypeScript's type system is structural and fully erased at runtime — it buys compile-time safety, never runtime safety."
- "`satisfies` validates a value against a type without widening or casting away precision — it's almost always better than `as` and often better than a direct annotation."
- "The `never` exhaustiveness check in a discriminated-union `switch` is the cheapest regression test you'll ever write."
- "Prefer `unknown` over `any` at trust boundaries; `any` silently poisons every downstream type."
- "`interface` for shapes you expect to be augmented or implemented; `type` for unions, mapped, and conditional types `interface` can't express."
- "TypeScript's `private`/`protected`/`readonly` are compile-time only — use native `#fields` when you need real runtime encapsulation."
- "Type-checking and transpiling are different jobs; most production builds use a fast transpiler for emit and `tsc --noEmit` as a separate CI gate."

---

## 24. Quick Reference Tables

### Strictness flags

| Flag | Catches |
|---|---|
| `strictNullChecks` | Implicit `null`/`undefined` assignment |
| `noImplicitAny` | Silent `any` inference |
| `strictFunctionTypes` | Unsound function-parameter assignment (not methods) |
| `noUncheckedIndexedAccess` | Assuming index access can't be `undefined` |
| `exactOptionalPropertyTypes` | Conflating "absent key" with "`undefined` value" |
| `noImplicitOverride` | Accidental method overriding without `override` |

### Utility type cheat sheet

| Need | Utility |
|---|---|
| Make everything optional | `Partial<T>` |
| Make everything required | `Required<T>` |
| Make everything readonly | `Readonly<T>` |
| Dictionary type | `Record<K, V>` |
| Subset of keys | `Pick<T, K>` |
| Remove keys | `Omit<T, K>` |
| Filter a union | `Extract<T, U>` / `Exclude<T, U>` |
| Function's return type | `ReturnType<F>` |
| Function's argument tuple | `Parameters<F>` |
| Unwrap nested Promises | `Awaited<T>` |

### `interface` vs `type` decision table

| Need | Use |
|---|---|
| Public API object shape, may be augmented | `interface` |
| Union of variants | `type` |
| Mapped/conditional/template-literal type | `type` |
| Class `implements` contract | `interface` (idiomatic) |
| Tuple type | `type` |

---

## 25. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| What TypeScript is | "TypeScript adds a structural, erasable type system on top of JavaScript — all types disappear at compile time, so it's a design-time safety net, not a runtime guard." |
| Structural typing | "TypeScript compares types by shape, not by declared name, so any object with the right members satisfies an interface — that's different from nominal typing in Java or C#." |
| `interface` vs `type` | "I default to `interface` for shapes that might need augmentation or merging, and `type` whenever I need unions, mapped types, or conditional types that `interface` can't express." |
| Generics | "Generics let a function or class stay type-safe while being reusable across input types; `extends` on a type parameter constrains it, it doesn't mean inheritance." |
| Discriminated unions | "I model domain variants as a discriminated union with a literal `kind` field, then use a `never`-typed exhaustiveness check in the `switch` so adding a variant breaks the build until every case handles it." |
| `satisfies` | "`satisfies` checks a value against a type without widening or losing literal precision, which is usually better than both a direct annotation and an `as` cast." |
| `unknown` vs `any` | "`any` disables type checking and poisons everything it touches; `unknown` forces an explicit narrowing step before use, which is what I reach for at any untrusted boundary." |
| Conditional types / `infer` | "Conditional types let you branch on a type relationship, and `infer` lets you pull a type out of a generic position — that's literally how `ReturnType` and `Awaited` are implemented in `lib.d.ts`." |
| Enums vs literal unions | "I lean towards string-literal unions over enums for anything that crosses a module/bundler boundary — `const enum` breaks single-file transpilers, and numeric enums have a confusing reverse-mapping behavior." |
| Runtime privacy | "TypeScript's `private` keyword is erased at compile time and gives zero runtime protection; if I need genuine encapsulation I use native `#private` fields." |
| Type-check vs transpile | "Type-checking and transpiling are separate concerns — in most production setups a fast transpiler like esbuild or swc handles the JS output, and `tsc --noEmit` runs separately in CI as the actual type gate." |
| Branded types | "Since TypeScript is structural, two `string` type aliases are freely interchangeable by default; I brand IDs with a phantom property when I need the compiler to stop me from passing an `OrderId` where a `UserId` belongs." |
| Mapped types | "Mapped types let me derive a new object type by iterating `keyof T`, adding or stripping `readonly`/optional modifiers, and optionally remapping keys with `as` — that's how `Partial`, `Readonly`, and custom getter-generator types are built." |
| Template literal types | "Template literal types model string *structure* at the type level, which is how I type things like route parameters or event names instead of falling back to a plain `string`." |
| Decorators | "Before adding a decorator, I confirm whether the codebase is on legacy `experimentalDecorators` or the newer TC39 Stage-3 model, because the two are not interchangeable and mixing them silently breaks DI metadata." |
| Project references | "In a monorepo I use `composite`/`references`/`incremental` so `tsc --build` only rechecks the packages that actually changed, instead of the whole graph on every build." |
| Migrating JS to TS | "I migrate incrementally with `allowJs`/`checkJs`, starting from leaf modules, and tighten `strict` flags one at a time rather than flipping everything on at once and drowning in errors." |

---

## 26. Frequent Staff-Level Follow-Ups

- **Build pipeline design:** justify the split between a fast transpiler (Babel/esbuild/swc) for emit and `tsc --noEmit` (optionally with project references) as an independent, cacheable CI type-check gate.
- **Monorepo scaling:** use `composite`/`references`/`incremental` so `tsc --build` only re-checks changed packages and their dependents, not the whole graph.
- **Runtime vs compile-time safety:** be explicit that TypeScript doesn't validate data crossing a trust boundary — pair it with `zod`/`io-ts`-style runtime validation at API/IO edges.
- **Migrating a JS codebase:** describe an incremental `allowJs` + `checkJs` + per-file `// @ts-check` rollout rather than a big-bang rewrite, tightening `strict` flags gradually.
- **Domain modeling:** prefer discriminated unions and exhaustiveness checks over boolean flags/optional fields for representing mutually exclusive states.
- **Library authoring:** explain `.d.ts` generation (`declaration: true`), `skipLibCheck` for consumers, and why `isolatedModules` matters if downstream consumers use non-`tsc` transpilers.
- **Decorator interop:** confirm which decorator model (`experimentalDecorators` legacy vs TC39 Stage-3) a framework expects before adding DI-style decorators to a new service.
