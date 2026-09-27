# Python Testing for Flask & asyncio — Staff/Principal Interview Deep Dive

---

## 1. Testing Strategy Pyramid for Python Services

```text
        /\
       /  \   E2E tests (few, expensive, user-critical paths)
      /    \
     /------\ Integration tests (DB, cache, queue, HTTP boundaries)
    /        \
   /----------\ Unit tests (fast, isolated logic)
```

| Type | Scope | Speed | Typical tools |
|---|---|---|---|
| Unit | Function/class/module logic | Fast | `pytest`, `unittest.mock` |
| Integration | App + infra boundary | Medium | `pytest`, Flask test client, ephemeral DB |
| E2E | Full workflow | Slow | `pytest`, API clients, staging env |

Staff point: **For backend systems, fast deterministic unit + integration tests catch most regressions; E2E should stay focused and sparse.**

---

## 2. Core Tooling

| Tool | Purpose | Notes |
|---|---|---|
| `pytest` | Test runner + fixtures + plugins | De facto standard in Python ecosystem |
| `unittest.mock` | Mocking, patching, spying | Built into Python stdlib |
| `pytest-mock` | Cleaner wrapper around `unittest.mock` | `mocker` fixture |
| Flask test client | HTTP route testing without real network | Fast integration feedback |
| `pytest-asyncio` | Async coroutine test support | `@pytest.mark.asyncio` or strict mode |
| `coverage.py` / `pytest-cov` | Coverage reporting | Line + branch coverage |
| `responses` / `respx` | Mock outbound HTTP | Deterministic API dependency behavior |

---

## 3. Flask Testing Patterns

### App factory + test client fixture

```python
import pytest
from myapp import create_app

@pytest.fixture
def app():
    app = create_app({"TESTING": True})
    yield app

@pytest.fixture
def client(app):
    return app.test_client()
```

### Route test example

```python
def test_healthcheck(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json == {"status": "ok"}
```

### Common Flask test concerns

- Request context vs application context handling.
- DB setup/teardown per test (transaction rollback or temp DB).
- Auth headers/session simulation.
- JSON schema or contract validation.

---

## 4. Asyncio Testing Patterns

### Async test basics

```python
import pytest

@pytest.mark.asyncio
async def test_async_sum():
    result = await async_sum(2, 3)
    assert result == 5
```

### Timeout and cancellation behavior

```python
import asyncio
import pytest

@pytest.mark.asyncio
async def test_timeout_behavior():
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_call(), timeout=0.01)
```

### Staff-level async concerns

| Concern | Why it matters |
|---|---|
| Cancellation safety | Prevent leaked tasks and inconsistent state |
| Bounded concurrency | Avoid event loop starvation and resource exhaustion |
| Deterministic timing | Avoid flaky tests caused by real sleeps and race timing |
| Proper cleanup | Ensure tasks, sockets, and clients are closed |

---

## 5. Mocking, Patching, and Fakes

### Patch where symbol is used

```python
from unittest.mock import patch

@patch("myservice.payment_client.charge")
def test_charge_flow(mock_charge):
    mock_charge.return_value = {"id": "txn_1", "status": "ok"}
    result = run_checkout()
    assert result["status"] == "ok"
```

Rule: patch import path in the **consumer module**, not where the function was originally defined.

### Useful doubles

| Double | Usage |
|---|---|
| Stub | Return fixed values from dependency |
| Mock | Assert calls + arguments |
| Fake | Lightweight in-memory implementation |
| Fixture | Reusable test input/state |

---

## 6. DB and Integration Testing

### Recommended approaches

- Use ephemeral DB per test session or per test class.
- Wrap each test in transaction + rollback for isolation.
- Seed minimal deterministic data.
- Keep migration checks in CI.

### Contract and boundary testing

- Validate external API payloads (schema checks).
- Keep consumer-driven contract tests for critical integrations.
- Test retry/idempotency behavior around transient failures.

---

## 7. CI Quality Gates (Python)

| Gate | Recommended baseline |
|---|---|
| Unit + integration pass rate | 100% |
| Branch coverage | >= 80% (team-calibrated) |
| Type checking | `mypy` mandatory on changed modules |
| Linting | `ruff` / `flake8` required |
| Flaky tests in main | 0 tolerated |

Example CI flow:

1. Install dependencies with lockfile.
2. Lint + type-check.
3. Unit tests with coverage.
4. Integration tests with ephemeral dependencies.
5. Publish test + coverage reports.

---

## 8. Interview First-Response Openers (1-2 lines)

| Concept | First statement to say in interview |
|---|---|
| `pytest` | "I use `pytest` for its fixture model and rich plugin ecosystem to keep tests expressive and maintainable." |
| Flask testing | "Flask's test client gives fast API verification without running a real server, which improves feedback speed." |
| Async testing | "For `asyncio`, I focus on deterministic coroutine tests, cancellation semantics, and timeout behavior." |
| Mocking | "I patch dependencies at the usage site and reserve mocks for unstable boundaries, not core business logic." |
| Integration tests | "Integration tests should validate real wiring (DB/cache/http contracts), because that's where many production bugs hide." |
| Coverage | "Coverage is useful as a guardrail; risk-based branch coverage matters more than chasing a vanity percentage." |

---

## 9. Frequent Staff-Level Follow-Ups

- **Flaky-test policy:** quarantine + owner + fix SLA; do not normalize retries as permanent strategy.
- **Incident-driven testing:** every Sev issue should leave behind a regression test.
- **Idempotency testing:** verify duplicate request handling for payment/order style operations.
- **Observability assertions:** validate logs/metrics/traces for critical failure paths, not just status codes.
- **Performance-sensitive tests:** include bounded-load smoke tests for hot async paths.

---

## 10. Quick Reference Table

| Task | Tool / Pattern |
|---|---|
| Flask route integration | Flask `test_client()` |
| Async coroutine test | `pytest.mark.asyncio` |
| Mock dependency call | `unittest.mock.patch` |
| HTTP dependency fake | `responses` / `respx` |
| DB isolation | Transaction rollback fixture |
| Verify exceptions | `pytest.raises` |
| Measure coverage | `pytest --cov` |
| Type checks in CI | `mypy` |
| Lint checks in CI | `ruff` / `flake8` |
