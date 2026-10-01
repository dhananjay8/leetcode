# JavaScript/TypeScript Testing Frameworks — Staff/Principal Interview Deep Dive

---

## 1. Testing Pyramid & Test Types

```text
        /\
       /  \   E2E tests      (full user journeys, slow, few)
      /    \
     /------\ Integration tests (modules + real I/O, medium speed)
    /        \
   /----------\ Unit tests   (isolated functions, fast, many)
```

| Type | Scope | Speed | Isolation | When to use |
|---|---|---|---|---|
| **Unit** | Function / class / module | Fast | High | Pure logic, business rules, algorithms |
| **Integration** | Multiple modules + DB/queue/network | Medium | Partial | Service boundaries, repository layer, API contracts |
| **End-to-End (E2E)** | Full application from user perspective | Slow | Low | Critical user paths, smoke tests, regression |

Staff point: **Write many fast unit tests, fewer integration tests, and very few E2E tests.** Speed of feedback is the deciding factor.

### Arrange-Act-Assert (AAA) structure

Use this pattern in every test to keep intent obvious:

```javascript
test('calculates total price', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 15 }];

  // Act
  const total = getTotal(items);

  // Assert
  expect(total).toBe(25);
});
```

---

## 2. Core Tools

### Mocha

- Test framework that organizes tests into **suites** (`describe`) and **cases** (`it`).
- Provides lifecycle hooks: `before`, `after`, `beforeEach`, `afterEach`.
- Does **not** ship with assertions or mocking; pairs with **Chai** + **Sinon**.
- Good when you want a modular stack.

```javascript
// mocha + chai example
const { expect } = require('chai');

describe('Calculator', () => {
  it('adds two numbers', () => {
    expect(add(2, 3)).to.equal(5);
  });
});
```

### Chai

- Standalone assertion library with three styles:

| Style | Example | Notes |
|---|---|---|
| **expect** | `expect(foo).to.equal('bar')` | BDD, chainable, works in all environments |
| **assert** | `assert.equal(foo, 'bar')` | TDD style, throws AssertionError |
| **should** | `foo.should.equal('bar')` | Extends `Object.prototype`; less favored in modern code |

- Rich matchers: `.deep.equal`, `.be.a('string')`, `.have.lengthOf(3)`, `.be.rejected`.

### Sinon

- Creates **test doubles**: spies, stubs, mocks.
- Use when you need to isolate code from real dependencies (DB, HTTP, timers).

### Jest

- All-in-one test runner by Meta.
- Built-in assertions (`expect`), mocking (`jest.fn`, `jest.mock`), code coverage, snapshot testing.
- Zero-config for Node.js; fast parallel runner.

```javascript
// jest async test
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1 });
});
```

### Supertest

- Asserts against HTTP endpoints without starting a real server on a port.
- Common for testing Express / NestJS route handlers.

```javascript
const request = require('supertest');
const app = require('./app');

test('GET /api returns 200', async () => {
  const res = await request(app).get('/api');
  expect(res.status).toBe(200);
});
```

### @nestjs/testing

- Builds a NestJS `TestingModule` so services can be unit-tested with mocked providers.
- Uses the real dependency-injection container.

---

## 3. Test Doubles: Spy, Stub, Mock, Fixture

| Double | Purpose | Verifies behavior? | Controls output? |
|---|---|---|---|
| **Spy** | Records how a function was called | Yes | No |
| **Stub** | Replaces a function with a canned return | No | Yes |
| **Mock** | Pre-programmed expectations + canned behavior | Yes | Yes |
| **Fixture** | Static input data for consistent tests | — | — |

### `clear` vs `reset` vs `restore` (Jest)

| API | Clears call history | Clears implementation | Restores original function |
|---|---|---|---|
| `jest.clearAllMocks()` | Yes | No | No |
| `jest.resetAllMocks()` | Yes | Yes (resets to default mock) | No |
| `jest.restoreAllMocks()` | Yes | Yes | Yes (`spyOn` only) |

### Spy example (Jest)

```javascript
const calculator = { add: (a, b) => a + b };
const spy = jest.spyOn(calculator, 'add');
calculator.add(1, 2);
expect(spy).toHaveBeenCalled();
expect(spy).toHaveBeenCalledWith(1, 2);
```

### Stub example (Jest)

```javascript
const stub = jest.fn().mockReturnValue(42);
const result = stub();
expect(result).toBe(42);
expect(stub).toHaveBeenCalled();
```

### Mock example (mocking an HTTP client)

```javascript
const fetchData = jest.fn(() => Promise.resolve({ data: 'mock data' }));

test('fetch data', async () => {
  const response = await fetchData();
  expect(fetchData).toHaveBeenCalled();
  expect(response.data).toBe('mock data');
});
```

### Fixture example

```javascript
const userFixture = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
};

test('validates user data', () => {
  expect(userFixture.name).toBe('John Doe');
});
```

---

## 4. Interview Q&A

### Basic Questions

**Q1. What is a testing framework and why is it important in backend development?**
A: It provides structure to write, run, and report automated tests. It catches regressions early, documents expected behavior, and enables safe refactoring of backend services.

**Q2. What is Jest and why is it commonly used in Node.js?**
A: Jest is an all-in-one test runner with built-in assertions, mocking, coverage, and snapshot testing. It requires minimal configuration and runs tests in parallel.

**Q3. Explain the difference between unit, integration, and E2E testing.**
A:
- **Unit**: tests a single function/module in isolation.
- **Integration**: tests how modules work together, often with real DB/network calls.
- **E2E**: tests the complete application from the user perspective.

**Q4. What is a mock and why do we use it?**
A: A mock simulates a dependency to isolate the unit under test. It removes external side effects (database, network) and makes tests deterministic and fast.

**Q5. What is the difference between `describe` and `it` in Jest/Mocha?**
A: `describe` groups related test cases; `it` (or `test` in Jest) defines an individual assertion or scenario.

### Intermediate Questions

**Q6. How do you test asynchronous code in Jest?**
A: Use `async/await` and return the promise or use `await` inside the test. Jest waits for the returned promise.

```javascript
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1 });
});
```

**Q7. How can you mock a database call in a Node.js application?**
A: Use `jest.mock` to replace the module or inject a stubbed repository.

```javascript
jest.mock('./db', () => ({
  getUser: jest.fn().mockResolvedValue({ id: 1, name: 'John' }),
}));
```

**Q8. What is Supertest and how is it used?**
A: Supertest sends HTTP requests to an Express/NestJS app and asserts on the response. It is the standard tool for API integration tests.

```javascript
const request = require('supertest');
const app = require('./app');

test('GET /api', async () => {
  const response = await request(app).get('/api');
  expect(response.status).toBe(200);
});
```

**Q9. What are decorators in NestJS testing and how do they help?**
A: Decorators like `@Injectable()` and `@Controller()` define DI metadata and routes. In tests you can mock the decorated providers while still using Nest's real DI container.

**Q10. How do you test a service in NestJS?**
A: Instantiate the service with mocked dependencies, or use `Test.createTestingModule`.

```javascript
const service = new MyService(mockedDependency);
expect(service.myMethod()).toEqual(expectedResult);
```

### Advanced Questions

**Q11. How do you test middleware in a Node.js application?**
A: Invoke the middleware with mocked `req`, `res`, and `next`, then assert on `res` and `next`.

```javascript
const middleware = require('./middleware');

test('middleware adds header', () => {
  const req = {};
  const res = { headers: {} };
  const next = jest.fn();
  middleware(req, res, next);
  expect(res.headers).toHaveProperty('X-Test', 'value');
});
```

**Q12. What is `@nestjs/testing` and how is it used?**
A: It provides `Test.createTestingModule` to compile a testable Nest DI container.

```javascript
const module = await Test.createTestingModule({
  providers: [MyService],
}).compile();

const service = module.get(MyService);
```

**Q13. How do you perform E2E testing in NestJS?**
A: Build a real Nest application and use Supertest against its HTTP server.

```javascript
let app;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();
  await app.init();
});

it('E2E Test', () => {
  return request(app.getHttpServer())
    .get('/route')
    .expect(200)
    .expect({ key: 'value' });
});
```

**Q14. How do you handle dependency injection in NestJS tests?**
A: Override real providers with mocks using `useValue` or `useFactory` in the testing module.

```javascript
const module = await Test.createTestingModule({
  providers: [
    {
      provide: MyService,
      useValue: { getData: jest.fn().mockReturnValue('mockData') },
    },
  ],
}).compile();
```

**Q15. How do you test WebSocket or GraphQL APIs in NestJS?**
A: For WebSockets, use the `ws` library or Nest's platform-specific adapters. For GraphQL, use `supertest-graphql` or send GraphQL payloads via Supertest to the `/graphql` endpoint.

```javascript
test('GraphQL query', async () => {
  const query = `{ users { id name } }`;
  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({ query });
  expect(response.body.data.users).toBeDefined();
});
```

### Behavioral / Scenario-Based Questions

**Q16. Have you implemented CI/CD pipelines for testing Node.js/NestJS?**
A: Yes — GitHub Actions or Jenkins run lint, unit tests, integration tests, coverage thresholds, and build artifacts on every PR. Integration tests run against a containerized DB.

**Q17. How do you ensure test coverage for a large backend application?**
A: Use `jest --coverage`, enforce branch/line/function thresholds in CI, gate PRs on coverage, and require coverage for new code diffs.

**Q18. What would you do if your test suite runs slowly?**
A:
1. Profile with `--detectOpenHandles` and slow-test reporters.
2. Parallelize by shard or file.
3. Mock heavy external dependencies and DB calls.
4. Convert slow E2E tests to integration tests where possible.

**Q19. How do you keep tests up to date with application changes?**
A: Treat tests as production code. Review and refactor them in the same PR that changes the feature. Use contract/API tests to catch breaking changes early.

**Q20. How do you debug failing tests in NestJS?**
A: Use `jest --watch`, add focused `test.only`, insert `console.log` or breakpoints, and run with `--verbose` and `--detectOpenHandles` to find leaked async resources.

---

## 5. Framework Selection Guide

| Need | Recommended Stack |
|---|---|
| All-in-one, fast setup, snapshots | **Jest** |
| Modular stack (pick best-of-breed) | **Mocha + Chai + Sinon** |
| Advanced mocking / timers / fakes | **Sinon** or Jest mocks |
| Readable BDD assertions | **Chai expect** |
| API/HTTP integration tests | **Supertest** |
| NestJS unit/integration tests | **@nestjs/testing + Jest + Supertest** |

### Jest vs Mocha + Chai + Sinon

| Aspect | Jest | Mocha + Chai + Sinon |
|---|---|---|
| Configuration | Minimal / zero-config | More setup |
| Runner | Built-in | Mocha |
| Assertions | Built-in `expect` | Chai |
| Mocking | `jest.fn`, `jest.mock` | Sinon |
| Coverage | Built-in | istanbul/nyc add-on |
| Snapshots | Native | Requires plugins |
| Community | Larger for React/Node | Strong in older Node stacks |

---

## 6. Hard Gotchas

- **Jest mocks are hoisted** to the top of the file when using `jest.mock`. If you need to reference variables, use `jest.mock` with a factory function that captures variables, or use `jest.requireActual`.
- **Async tests must signal completion**: return the promise, use `async/await`, or call `done()` (deprecated pattern).
- **Mocked modules are shared across tests** unless you call `jest.resetModules()` or reset mocks in `beforeEach`.
- **Supertest with NestJS `app.init()`** requires `app.close()` in `afterAll` to release handles.
- **Snapshot tests** are brittle for rapidly changing UI/data; review diffs carefully in PRs.
- **Coverage thresholds can be gamed**: 100% coverage does not mean 100% correctness.

### Flaky test mitigation checklist

- Freeze time with fake timers (`jest.useFakeTimers()`) for timer-driven logic.
- Avoid shared mutable state across tests; create fresh fixtures per test.
- Randomize test order periodically to detect hidden coupling.
- Replace arbitrary sleeps with deterministic waits/assertions.
- Use retries only as a temporary containment mechanism, not a permanent fix.

### Contract testing (service boundaries)

- Unit tests validate local logic.
- Integration tests validate internal wiring.
- **Contract tests** validate producer-consumer schema compatibility across microservices.

Good options: Pact or OpenAPI schema validation in CI.

---

## 7. CI Quality Gates (Recommended Defaults)

| Gate | Recommended baseline |
|---|---|
| Unit test pass rate | 100% |
| Branch coverage | >= 80% (team-specific) |
| Critical-path integration tests | Mandatory on PR |
| Lint + type checks | Mandatory on PR |
| Flaky test budget | 0 accepted in `main` |

Example pipeline shape:

1. Install + cache dependencies.
2. Lint + type-check.
3. Unit tests + coverage.
4. Integration tests with ephemeral DB/container.
5. Build artifact.
6. Optional E2E smoke on merge.

---

## 8. Advanced Testing Patterns

### Mock Service Worker (MSW) vs module mocking

| Approach | Mechanism | Best for |
|---|---|---|
| `jest.mock('axios')` | Replaces module implementation | Single-file unit tests with simple stubs |
| MSW | Intercepts network calls at the request layer | Component/integration tests where real client code should run |

MSW keeps the application code path identical to production while still controlling the server response.

```typescript
// msw/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', () => HttpResponse.json({ id: 1, name: 'Alice' })),
];
```

### E2E tools: Playwright vs Cypress

| Concern | Playwright | Cypress |
|---|---|---|
| Browser support | Chromium, Firefox, WebKit | Chromium, Firefox, Edge |
| Cross-origin/tabs | Native multi-tab, multi-origin | Requires `cy.origin()` wrapper, single tab at a time |
| Test runner | Separate process per browser | Runs inside browser |
| Best fit | Complex multi-page flows, cross-browser | Single-origin rich component/interaction tests |

### Mutation testing

Mutation testing verifies that your assertions actually catch code changes. Tools:

- JavaScript/TypeScript: Stryker
- Python: MutPy

High mutation score indicates tests assert meaningful behavior, not just line coverage.

### Property-based testing

Instead of example-based tests, generate random inputs and verify invariants.

```javascript
// fast-check example
const { assert, property, integer } = require('fast-check');

assert(
  property(integer(), integer(), (a, b) => a + b === b + a)
);
```

Use for parsers, validators, state machines, and algorithms with clear invariants.

### Snapshot testing — when to use and avoid

| Good use | Bad use |
|---|---|
| Serialized error messages, CLI output, AST dumps | Large UI component trees that change frequently |
| Stable configuration objects | Database responses with timestamps/IDs |

Treat snapshots as intentional assertions; review diffs in PRs and avoid auto-updating without inspection.

### Flaky-test policy template

1. **Detect**: CI marks test as flaky after N inconsistent runs.
2. **Quarantine**: move out of blocking pipeline but keep running on a schedule.
3. **Owner**: assign to a team/individual with SLA.
4. **Fix root cause**: deterministic waits, isolation, fake time, stable data.
5. **Reintegrate**: only after passing 100 consecutive runs.

### Test Impact Analysis (TIA)

Run only tests affected by changed files to keep PR feedback fast.

- Map source files to dependent tests.
- Use coverage/dependency graphs or tools like Jest `--changedSince`.
- Combine with remote build cache for monorepos.

---

## 9. Staff-Level Sound Bites


- "The goal of unit tests is to give fast feedback, not to prove the whole system works."
- "Use mocks to make tests deterministic; over-mocking hides real integration bugs."
- "Integration tests catch wiring problems that unit tests cannot."
- "E2E tests are expensive; reserve them for user-critical paths."
- "Jest's `jest.mock` is hoisted, so factories cannot reference top-level variables directly."
- "Coverage is a guardrail, not a target."

---

## 10. Quick Reference Table

| Task | Tool / Pattern |
|---|---|
| Mock a function | `jest.fn()` / `sinon.stub()` |
| Mock a module | `jest.mock('./module')` |
| Assert a promise rejects | `await expect(promise).rejects.toThrow()` |
| Run a single test | `test.only` / `it.only` |
| Skip a test | `test.skip` / `it.skip` |
| Reset mocks between tests | `jest.resetAllMocks()` in `beforeEach` |
| Test HTTP API | `supertest(app).get('/api')` |
| Test NestJS service | `Test.createTestingModule` + `module.get(Service)` |
| Measure coverage | `jest --coverage` |
| Intercept HTTP in tests | MSW handlers |
| Cross-browser E2E | Playwright |
| Measure test quality | Mutation testing (Stryker) |
| Generate test inputs | Property-based testing (fast-check) |
| Reduce PR test time | Test Impact Analysis (`jest --changedSince`) |
| Stable flaky-test process | Quarantine + owner + reintegration criteria |

---

## 11. TypeScript-Specific Testing Notes

| Topic | Staff-level guidance |
|---|---|
| Type-aware test execution | Use `ts-jest` or transpile with `swc`/`esbuild` before Jest runtime |
| Strict mocks | Use typed mocks (`jest.Mocked<T>`) to avoid runtime mismatch and incorrect assumptions |
| API contract types | Keep shared DTO/schema packages versioned to reduce producer/consumer drift |
| Source maps | Enable source maps so stack traces point to `.ts` lines in CI failures |

```typescript
type UserRepo = { findById(id: string): Promise<{ id: string } | null> };

const repo: jest.Mocked<UserRepo> = {
  findById: jest.fn(),
};
```

---

## 12. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| Test pyramid | "I optimize for fast feedback: many unit tests, fewer integration tests, and minimal critical-path E2E tests." |
| Unit vs integration | "Unit tests isolate logic; integration tests verify module wiring and real boundaries like DB or HTTP." |
| Mocks and stubs | "I mock to remove nondeterminism and cost, but keep enough integration coverage so real wiring bugs still surface." |
| Async testing | "Every async test must deterministically signal completion and avoid hidden open handles." |
| Coverage | "Coverage is a confidence signal, not correctness proof; branch-risk areas matter more than raw percentages." |
| CI gates | "Quality gates should block merges on failing tests, type/lint errors, and critical-path regression checks." |
| MSW | "MSW intercepts real network calls, so tests exercise the actual client path instead of coupling to a specific HTTP library implementation." |
| E2E tools | "I choose Playwright when flows span tabs or origins; Cypress is strong for single-origin rich interactions, but tabs and cross-origin flows need extra care." |
| Mutation/property testing | "Beyond coverage, mutation testing and property-based tests validate that assertions are meaningful and invariants hold across many inputs." |
| Flaky tests | "Flaky tests erode trust; I quarantine, assign an owner, and require a deterministic fix before reintegration." |

---

## 13. Frequent Staff-Level Follow-Ups

- **Flaky-test governance:** quarantine policy + owner + SLA; flaky tests in `main` should be treated as incidents.
- **Deterministic async tests:** freeze time (`jest.useFakeTimers()`), avoid real sleeps, and assert with bounded waits.
- **Integration realism:** run critical integration tests with ephemeral dependencies (e.g., test containers) instead of over-mocking.
- **Regression strategy:** add a failing test first for production bugs, then keep it as permanent regression coverage.
- **Risk-based testing:** prioritize auth, money movement, retries/idempotency, and data integrity paths over equal coverage everywhere.
