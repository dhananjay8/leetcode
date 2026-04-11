# Strategy Pattern

**Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable at runtime.

**When to use:** Payment processing, sorting strategies, validation rules, authentication methods, compression algorithms.

---

## JavaScript
```javascript
// Strategies
const strategies = {
  creditCard: (amount) => ({ method: "Credit Card", charged: amount, fee: amount * 0.03 }),
  paypal:     (amount) => ({ method: "PayPal", charged: amount, fee: amount * 0.04 }),
  crypto:     (amount) => ({ method: "Crypto", charged: amount, fee: 0 }),
};

// Context
class PaymentProcessor {
  constructor(strategy) { this.strategy = strategy; }
  setStrategy(strategy) { this.strategy = strategy; }
  pay(amount) { return this.strategy(amount); }
}

const processor = new PaymentProcessor(strategies.creditCard);
console.log(processor.pay(100)); // { method: "Credit Card", charged: 100, fee: 3 }

processor.setStrategy(strategies.crypto);
console.log(processor.pay(100)); // { method: "Crypto", charged: 100, fee: 0 }
```

## Python
```python
from abc import ABC, abstractmethod

class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount): pass

class CreditCard(PaymentStrategy):
    def pay(self, amount): return {"method": "Credit Card", "fee": amount * 0.03}

class PayPal(PaymentStrategy):
    def pay(self, amount): return {"method": "PayPal", "fee": amount * 0.04}

class PaymentProcessor:
    def __init__(self, strategy: PaymentStrategy):
        self.strategy = strategy

    def process(self, amount):
        return self.strategy.pay(amount)

p = PaymentProcessor(CreditCard())
print(p.process(100))  # {'method': 'Credit Card', 'fee': 3.0}

p.strategy = PayPal()
print(p.process(100))  # {'method': 'PayPal', 'fee': 4.0}
```

## Java
```java
interface PaymentStrategy { Map<String, Object> pay(double amount); }

class CreditCard implements PaymentStrategy {
    public Map<String, Object> pay(double amount) {
        return Map.of("method", "Credit Card", "fee", amount * 0.03);
    }
}

class PaymentProcessor {
    private PaymentStrategy strategy;
    public PaymentProcessor(PaymentStrategy s) { this.strategy = s; }
    public void setStrategy(PaymentStrategy s) { this.strategy = s; }
    public Map<String, Object> process(double amount) { return strategy.pay(amount); }
}
```

## Interview Talking Points
- Eliminates long `if/else` or `switch` blocks
- **Open/Closed Principle**: Add new strategies without modifying existing code
- In JS/Python, functions ARE strategies (first-class functions replace class-based approach)
- Real-world: `Array.sort(compareFn)`, Express middleware, authentication strategies (Passport.js)
