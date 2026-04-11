# Build a Feature Flag / Toggle System

## Requirements
- Enable/disable features without deploying code
- Support: boolean flags, percentage rollouts, user targeting
- Admin UI to manage flags, SDK for client-side consumption
- Real-time flag updates

## Data Model
```javascript
const featureFlag = {
  key: 'new-checkout',
  enabled: true,
  rolloutPercent: 50, // serve to 50% of users
  targetUsers: ['user-123'], // explicit user targeting
  description: 'New checkout flow experiment'
};
```

## Client SDK
```javascript
class FeatureFlagClient {
  constructor(userId) {
    this.userId = userId;
    this.flags = {};
    this.fetchFlags();
  }

  async fetchFlags() {
    const res = await fetch('/api/flags');
    this.flags = await res.json();
  }

  isEnabled(flagKey) {
    const flag = this.flags[flagKey];
    if (!flag || !flag.enabled) return false;
    if (flag.targetUsers?.includes(this.userId)) return true;
    // Consistent hashing for percentage rollout (same user always gets same result)
    const hash = this.hashUser(this.userId + flagKey);
    return (hash % 100) < flag.rolloutPercent;
  }

  hashUser(str) { // Simple deterministic hash
    let hash = 0;
    for (const ch of str) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
    return Math.abs(hash);
  }
}

// Usage
const flags = new FeatureFlagClient('user-456');
if (flags.isEnabled('new-checkout')) { renderNewCheckout(); }
else { renderOldCheckout(); }
```

## Key Patterns
- **Consistent hashing** for percentage rollout (deterministic per user)
- **React context** to provide flag values across app
- **Polling or WebSocket** for real-time flag updates
- **Local cache** with TTL to minimize API calls

## Interview Tips
- Discuss consistent hashing so same user always sees same variant
- Mention A/B testing integration (track which variant each user sees)
- Graceful degradation: if flag service is down, use cached defaults
