# CI/CD Pipelines

## Core Concepts

**CI (Continuous Integration)**: Automatically build + test on every commit.
**CD (Continuous Delivery)**: Automatically deploy to staging; manual approval for production.
**CD (Continuous Deployment)**: Automatically deploy to production (no manual gate).

```
Developer pushes code → Build → Unit Tests → Integration Tests → Build Artifact
                        → Deploy to Staging → Smoke Tests → Deploy to Production
```

## GitHub Actions — Example Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build-and-push:
    needs: test              # runs only if test passes
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production   # requires manual approval
    steps:
      - run: |
          kubectl set image deployment/myapp \
            myapp=ghcr.io/${{ github.repository }}:${{ github.sha }}
```

## Pipeline Best Practices

| Practice | Why |
|----------|-----|
| **Fail fast** | Run linting/unit tests before expensive steps |
| **Cache dependencies** | `actions/cache`, Docker layer caching |
| **Pin versions** | `node:20.11.0` not `node:latest` |
| **Use secrets** | Never hardcode credentials; use GitHub Secrets / Vault |
| **Separate stages** | Build → Test → Deploy (clear boundaries) |
| **Artifact versioning** | Tag images with git SHA, not `latest` |
| **Branch protection** | Require PR reviews + passing CI before merge |
| **Parallel jobs** | Run independent tests in parallel |

## Deployment Strategies

### Rolling Update (Default in K8s)
- Replace pods one at a time
- Zero downtime, gradual rollout
- Rollback by rolling back to previous ReplicaSet

### Blue-Green
- Two identical environments (Blue = current, Green = new)
- Switch traffic from Blue to Green at once
- Instant rollback: switch back to Blue

### Canary
- Route small % of traffic to new version (e.g., 5%)
- Monitor error rates, latency
- Gradually increase if healthy (5% → 25% → 50% → 100%)

### Feature Flags
- Deploy code with features disabled
- Enable for specific users/groups via feature flag service
- Independent of deployment cycle

## Interview Questions

**Q: What's the difference between CI and CD?**
CI = build + test on every commit. CD = automatically deliver to staging/production. CI ensures code works; CD ensures it reaches users.

**Q: How do you handle secrets in CI/CD?**
- Store in pipeline's secret manager (GitHub Secrets, Jenkins Credentials)
- Never commit to repo, never echo in logs
- Use short-lived tokens where possible
- Rotate secrets regularly

**Q: How do you rollback a failed deployment?**
1. K8s: `kubectl rollout undo deployment/myapp`
2. Blue-Green: Switch LB back to blue environment
3. Canary: Reduce traffic to 0% for canary, investigate
4. Git: Revert commit, trigger pipeline

**Q: What makes a good CI pipeline?**
Fast (<10 min), reliable (no flaky tests), secure (no secrets leaked), cached (don't rebuild unchanged layers), gives clear feedback on failure.
