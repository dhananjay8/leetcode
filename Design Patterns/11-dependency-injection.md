# Dependency Injection (DI)

**Intent:** Supply dependencies from the outside instead of creating them inside a class.

**When to use:** Improve testability, loose coupling, and modular architecture.

---

## JavaScript
```javascript
class EmailService {
  send(to, message) {
    console.log(`Email to ${to}: ${message}`);
  }
}

class UserNotifier {
  constructor(mailer) {
    this.mailer = mailer; // injected dependency
  }

  notify(user, message) {
    this.mailer.send(user.email, message);
  }
}

const notifier = new UserNotifier(new EmailService());
notifier.notify({ email: "alice@example.com" }, "Welcome!");
```

## Python
```python
from typing import Protocol

class Mailer(Protocol):
    def send(self, to: str, message: str) -> None: ...

class ConsoleMailer:
    def send(self, to: str, message: str) -> None:
        print(f"Sending to {to}: {message}")

class UserNotifier:
    def __init__(self, mailer: Mailer) -> None:
        self.mailer = mailer

    def notify(self, email: str, message: str) -> None:
        self.mailer.send(email, message)
```

## Java
```java
interface Mailer {
    void send(String to, String message);
}

class EmailService implements Mailer {
    public void send(String to, String message) {
        System.out.println("Email to " + to + ": " + message);
    }
}

class UserNotifier {
    private final Mailer mailer;
    UserNotifier(Mailer mailer) { this.mailer = mailer; } // constructor injection
    void notify(String to, String message) { mailer.send(to, message); }
}
```

## Interview Talking Points
- Core for clean architecture and testability (easy mocking/stubbing).
- Constructor injection is usually preferred for required dependencies.
- Framework examples: Spring, Guice, FastAPI dependency system, NestJS providers.
- DI reduces tight coupling and makes refactoring safer.
