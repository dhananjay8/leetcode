# JavaScript Testing Frameworks — Staff/Principal Interview Deep Dive

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

## 8. Staff-Level Sound Bites

- "The goal of unit tests is to give fast feedback, not to prove the whole system works."
- "Use mocks to make tests deterministic; over-mocking hides real integration bugs."
- "Integration tests catch wiring problems that unit tests cannot."
- "E2E tests are expensive; reserve them for user-critical paths."
- "Jest's `jest.mock` is hoisted, so factories cannot reference top-level variables directly."
- "Coverage is a guardrail, not a target."

---

## 9. Quick Reference Table

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
