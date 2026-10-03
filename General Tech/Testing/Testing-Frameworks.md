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

### Staff/Principal-Level Questions

**Q21. How is stress testing different from load testing and performance testing?**
A:
- **Load testing** validates behavior at an *expected* traffic level (does the system meet SLAs at normal/peak load?).
- **Stress testing** pushes traffic *beyond* expected limits to find the breaking point and observe failure mode (does it degrade gracefully or crash hard?).
- **Performance testing** is the umbrella term/measurement discipline (latency, throughput, resource usage) that load, stress, soak, and spike tests all fall under.

**Q22. What is soak (endurance) testing and what bugs does it uniquely catch?**
A: Soak testing runs sustained moderate load for an extended period (hours/days) to catch slow memory leaks, connection-pool exhaustion, unbounded cache growth, log-disk fill-up, and clock-drift/rotation bugs that short load tests never trigger.

**Q23. What is spike testing?**
A: Suddenly jump traffic from baseline to a very high value (e.g., flash-sale, breaking-news event) and back down, to validate auto-scaling reaction time, queue backpressure, and recovery behavior rather than just the steady-state ceiling.

**Q24. What is chaos engineering and how does it differ from traditional testing?**
A: Traditional tests verify the system behaves correctly under *expected* conditions. Chaos engineering deliberately injects real failures (kill a pod, add network latency, drop a dependency, exhaust disk) into a running system — often in production — to verify resilience assumptions (retries, circuit breakers, failover) actually hold, not just that the code compiles against them.

**Q25. What's the difference between smoke testing, sanity testing, and regression testing?**
A:
- **Smoke**: a small, fast suite run right after a deploy/build to confirm the system isn't fundamentally broken ("is it even worth testing further?").
- **Sanity**: a focused, shallow check on a specific area after a small change/fix, confirming that change behaves sanely before deeper regression runs.
- **Regression**: re-running previously-passing tests after a change to confirm nothing that used to work has broken.

**Q26. What is contract testing and when do unit/integration tests fail to catch what it catches?**
A: Contract tests verify that a producer's API/event schema matches what a consumer expects, independent of both being deployed together. Unit tests only check code in isolation; integration tests usually run against a *real but single* version of a dependency. Neither catches a producer shipping a breaking change that only a *different team's* consumer would notice — contract tests (e.g., Pact) close that gap in a microservices org without needing a full staging environment with every service deployed.

**Q27. When would you choose TDD over writing tests after the implementation?**
A: For complex business/domain logic, bug fixes (write the failing regression test first), and public API design where the test acts as the first consumer of the interface. I don't force TDD on throwaway spikes, pure UI/visual work, or exploratory prototypes where the design itself is still unknown.

**Q28. How do you decide how much of each test type to write for a new service?**
A: Start from risk and change frequency, not a fixed ratio: heavy unit coverage on business logic that changes often, integration tests on every real I/O boundary (DB, queue, third-party API), and E2E/contract tests only on the handful of journeys that are both business-critical and cross multiple services.

**Q29. How would you test a payment/checkout flow at a staff level?**
A: Layer defenses: property-based tests for the pricing/tax math invariants, contract tests against the payment provider's API schema, integration tests for idempotency-key handling and retry/duplicate-charge prevention, and a small number of E2E tests for the critical happy-path and one or two failure paths (declined card, timeout). Add a reconciliation job as a production-side test that compares expected vs actual charged amounts.

**Q30. What's the difference between A/B testing and the testing types discussed so far?**
A: Unit/integration/E2E/performance tests validate that code *behaves correctly*. A/B testing is a statistical experiment on *already-correct* code to measure which variant performs better against a business metric (conversion, engagement) — it's a product-analytics technique, not a correctness check, though it still needs solid test coverage underneath it to trust the results.

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

## 9. Full Testing Taxonomy & Comparison Matrix

A staff-level answer to "what kinds of testing are there?" should group types by **what question they answer**, not just list names.

### By correctness / functional scope

| Type | Answers | Scope | Speed | Typical owner |
|---|---|---|---|---|
| **Unit** | "Does this function/class do what it should, in isolation?" | Single function/module | Fast | Dev |
| **Integration** | "Do these modules + a real boundary (DB/queue/HTTP) work together?" | Few modules + 1 real dependency | Medium | Dev |
| **Contract** | "Does the producer's API/event schema still match what the consumer expects?" | Producer/consumer schema | Fast | Dev (both sides) |
| **E2E** | "Does the full user journey work through the real system?" | Whole app/stack | Slow | Dev/QA |
| **Smoke** | "Is the build even alive after deploy?" | Critical paths only | Very fast | CI/CD |
| **Sanity** | "Did this specific small fix behave sanely?" | One narrow area | Fast | Dev |
| **Regression** | "Did this change break something that used to work?" | Previously-passing suite | Varies | CI |
| **Acceptance (UAT)** | "Does this meet the business requirement/spec?" | Business scenario | Slow | QA/Product |

### By non-functional / quality-attribute scope

| Type | Answers | How it's run |
|---|---|---|
| **Load testing** | "Do we meet SLAs at expected/peak traffic?" | Ramp to known target RPS (k6, Locust, Gatling, Artillery) |
| **Stress testing** | "Where does it break, and how (graceful vs catastrophic)?" | Ramp past expected limits until failure |
| **Soak / endurance testing** | "Does it stay healthy under sustained load for hours/days?" | Long-duration moderate load; watches for leaks |
| **Spike testing** | "Can we survive a sudden traffic cliff/surge and recover?" | Sudden step-change in traffic, then back down |
| **Scalability testing** | "Does throughput scale linearly as we add resources/instances?" | Vary resource count, measure throughput/latency curve |
| **Performance/benchmark testing** | "What's the latency/throughput/resource profile right now?" | Microbenchmarks, profilers, APM traces |
| **Chaos engineering** | "Do our resilience mechanisms (retry, circuit breaker, failover) actually work when real failures happen?" | Inject real faults (kill pod, add latency, drop dependency) — often in production |
| **Security testing** | "Can this be exploited?" | SAST (static scan), DAST (running-app scan), dependency/SCA scan, pen testing |
| **Accessibility testing** | "Can users with disabilities use this?" | Automated (axe, Lighthouse) + manual screen-reader checks |
| **Visual regression testing** | "Did the UI unintentionally change pixel-for-pixel?" | Screenshot diffing (Percy, Chromatic, Playwright) |
| **Fuzz testing** | "What happens with malformed/random/adversarial input?" | Automated random/mutated input generators |
| **Mutation testing** | "Do our assertions actually catch real code changes?" | Tool mutates source, checks if tests fail (Stryker) |
| **Property-based testing** | "Does this invariant hold across many generated inputs, not just our hand-picked examples?" | Generators + invariant assertions (fast-check) |
| **Canary testing** | "Does the new version behave acceptably for a small slice of real production traffic before full rollout?" | Route % of traffic to new version, compare metrics |
| **A/B testing** | "Which already-correct variant performs better on a business metric?" | Statistical experiment, not a correctness check |

Staff point: **"Unit/integration/E2E answer 'is it correct'; load/stress/soak/spike answer 'is it fast and stable enough'; chaos answers 'does it fail safely'; security/accessibility answer 'is it safe to use' — they're different axes, not competing alternatives, and a mature system needs coverage on all of them proportional to risk."**

---

## 10. Deciding a Testing Strategy — Step-by-Step Framework

A testing **strategy** is the decision of *which* of the types above to invest in, *how much*, and *when* — tailored to the system, not copy-pasted from another team.

### Step-by-step approach

1. **Identify the failure cost.** What happens if this breaks in production — lost money, safety incident, bad UX, silent data corruption? Higher cost → more layers of defense, not just more tests of one type.
2. **Map the critical user/business journeys.** List the 5-10 flows that must never break (checkout, auth, data ingestion). These earn E2E/contract coverage; everything else usually doesn't need it.
3. **Classify the system shape**, since it changes the right pyramid:
   - Stateless API service → heavy unit + integration, light E2E.
   - UI-heavy frontend → unit for logic, component tests for UI, few E2E for critical flows, visual regression for design-sensitive screens.
   - Event-driven/microservices → contract tests + chaos engineering + synthetic monitoring become as important as unit tests.
   - Data pipeline/batch system → data-quality assertions, schema/contract tests, and replay/backfill tests matter more than UI-style E2E.
4. **Pick tools matched to the stack and team skill**, not the "best" tool in the abstract — consistency across the team beats a marginally-better tool nobody adopts.
5. **Define quality gates per pipeline stage**: what blocks a PR (unit + lint + type-check) vs what runs nightly (full E2E, load tests) vs what runs pre-release (soak, security scan).
6. **Decide environments per test type**: unit = no I/O; integration = ephemeral/testcontainers; E2E = staging; load/chaos = staging or production with guardrails.
7. **Assign ownership and a flaky-test policy.** Tests without an owner rot; quarantine + SLA + reintegration criteria (see Section 8) applies strategy-wide, not just to one suite.
8. **Instrument feedback from production back into the strategy.** Every incident/postmortem should answer "which test type should have caught this, and why didn't it?" and either add that test or add that *type* of test if it didn't exist yet.
9. **Revisit quarterly** as the system changes shape (new integrations, new scale, new compliance requirements) — a strategy frozen at launch silently rots.

### Decision table (symptom → what to prioritize)

| Situation | Prioritize |
|---|---|
| High change frequency, low blast radius | Heavy unit tests, fast feedback, light E2E |
| Payment/financial correctness | Property-based + contract + strong integration + production reconciliation |
| Microservices / distributed system | Contract tests + chaos engineering + synthetic monitoring over more E2E |
| Expected traffic spike (launch, sale) | Load + stress + spike testing before the event, not after |
| Long-running services (leaks, drift) | Soak/endurance testing |
| Regulatory/compliance requirement | Traceability matrix: requirement → test case → evidence, audit trail |
| Design-sensitive UI | Visual regression + accessibility testing |
| Legacy code with no tests | Characterization tests (pin current behavior) before refactoring, not TDD from scratch |

---

## 11. TDD, BDD, and Test-Last — Pros, Cons, and When to Use Each

### Test-Driven Development (TDD): red → green → refactor

| Pros | Cons |
|---|---|
| Tight feedback loop; design emerges from usage, not guesswork | Overhead/learning curve for teams new to it |
| Forces testable, decoupled interfaces (hard-to-test code gets redesigned early) | Can over-couple tests to implementation details if done mechanically |
| Built-in regression suite as a side effect of development | Slower for exploratory/spike/prototype work where the design itself is unknown |
| Prevents speculative over-engineering (write only enough code to pass) | Not a natural fit for visual/UI-heavy or highly exploratory ML work |
| Each bug fix starts with a reproducing failing test, which becomes permanent regression coverage | Risk of "testing theater" — chasing coverage numbers instead of meaningful assertions |

### Behavior-Driven Development (BDD): Given/When/Then

| Pros | Cons |
|---|---|
| Shared language between business, QA, and engineering; specs are readable by non-engineers | Feature files add maintenance overhead and can duplicate unit tests if misused |
| Executable specification doubles as living documentation | Step-definition glue code can become its own hard-to-maintain codebase |
| Good for acceptance-level/cross-functional clarity on business rules | Not a substitute for fast, fine-grained unit tests |

### Test-last (write code, then tests)

| Pros | Cons |
|---|---|
| Faster initial prototyping when exploring an unknown design | Tests shaped by whatever the implementation happened to do — bias toward "tests that pass," not "tests that prove correctness" |
| Fine for throwaway spikes/prototypes | Coverage gaps are easy to miss; regression debt accumulates silently |

### Staff-level guidance

- **TDD is a tool, not a mandate.** Apply it where it earns its cost: complex business/domain logic, bug fixes (failing test first), and public API design. Skip it for throwaway spikes and pure visual/UI exploration.
- **BDD earns its keep at the acceptance-test layer** for cross-functional clarity on business rules — it is not a replacement for the unit-test layer underneath it.
- **Legacy code gets characterization tests first** (pin current behavior, even if "wrong"), then TDD-style tests once you're safely refactoring under that net.
- The real signal of a healthy strategy is not "do we do TDD" but "do regressions keep coming back, and does the team trust the suite enough to refactor without fear?"

---

## 12. Staff-Level Sound Bites


- "The goal of unit tests is to give fast feedback, not to prove the whole system works."
- "Use mocks to make tests deterministic; over-mocking hides real integration bugs."
- "Integration tests catch wiring problems that unit tests cannot."
- "E2E tests are expensive; reserve them for user-critical paths."
- "Jest's `jest.mock` is hoisted, so factories cannot reference top-level variables directly."
- "Coverage is a guardrail, not a target."
- "Load testing proves we meet SLAs at expected traffic; stress testing proves we fail gracefully beyond it — they answer different questions."
- "Chaos engineering tests whether our resilience mechanisms actually work, not whether the code compiles against them."
- "TDD is a design tool I reach for on complex business logic and bug fixes, not a blanket mandate for every line of code."

---

## 13. Quick Reference Table

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
| Load/stress/spike test a Node API | k6, Artillery, Gatling |
| Inject real failures (chaos) | Chaos Mesh, Gremlin, AWS Fault Injection Service |
| Screenshot/visual diff | Percy, Chromatic, Playwright snapshots |
| Automated accessibility scan | `axe-core`, Lighthouse CI |
| Pin legacy behavior before refactor | Characterization tests |

---

## 14. TypeScript-Specific Testing Notes

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

## 15. Interview First-Response Openers (1-2 lines)

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
| Load vs stress testing | "Load testing confirms we meet SLAs at expected traffic; stress testing finds where we break and whether we degrade gracefully beyond that." |
| Chaos engineering | "Chaos engineering injects real failures to prove resilience mechanisms work in practice, not just on paper." |
| TDD | "I use TDD selectively — complex business logic and bug fixes benefit most; I don't force it on throwaway spikes or pure UI exploration." |
| Testing strategy | "I size each test type to the failure cost and change frequency of the code it covers, not a fixed ratio applied uniformly." |

---

## 16. Frequent Staff-Level Follow-Ups

- **Flaky-test governance:** quarantine policy + owner + SLA; flaky tests in `main` should be treated as incidents.
- **Deterministic async tests:** freeze time (`jest.useFakeTimers()`), avoid real sleeps, and assert with bounded waits.
- **Integration realism:** run critical integration tests with ephemeral dependencies (e.g., test containers) instead of over-mocking.
- **Regression strategy:** add a failing test first for production bugs, then keep it as permanent regression coverage.
- **Risk-based testing:** prioritize auth, money movement, retries/idempotency, and data integrity paths over equal coverage everywhere.
- **Pre-launch performance gates:** require load + stress + spike test sign-off before any traffic-sensitive launch (sale, marketing push).
- **Resilience verification:** schedule recurring chaos experiments on critical services rather than treating resilience as a one-time design exercise.
- **Strategy review cadence:** revisit the testing strategy every quarter or after every major incident postmortem, not just at project kickoff.
