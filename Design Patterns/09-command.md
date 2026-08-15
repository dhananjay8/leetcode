# Command Pattern

**Intent:** Encapsulate a request as an object, allowing parameterization, queuing, logging, and undo/redo.

**When to use:** Actions need to be decoupled from the invoker (e.g., toolbar buttons, job schedulers, event buses).

---

## JavaScript
```javascript
class Light {
  on() { console.log("Light ON"); }
  off() { console.log("Light OFF"); }
}

class LightOnCommand {
  constructor(light) { this.light = light; }
  execute() { this.light.on(); }
}

class LightOffCommand {
  constructor(light) { this.light = light; }
  execute() { this.light.off(); }
}

class Remote {
  setCommand(slot, command) { this[slot] = command; }
  press(slot) { this[slot]?.execute(); }
}

const light = new Light();
const remote = new Remote();
remote.setCommand("on", new LightOnCommand(light));
remote.setCommand("off", new LightOffCommand(light));
remote.press("on");
remote.press("off");
```

## Python
```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None:
        pass

class TextEditor:
    def __init__(self) -> None:
        self.content = ""

    def write(self, text: str) -> None:
        self.content += text

class WriteCommand(Command):
    def __init__(self, editor: TextEditor, text: str) -> None:
        self.editor = editor
        self.text = text

    def execute(self) -> None:
        self.editor.write(self.text)

editor = TextEditor()
commands = [WriteCommand(editor, "Hello "), WriteCommand(editor, "World")]
for cmd in commands:
    cmd.execute()
print(editor.content)
```

## Java
```java
interface Command {
    void execute();
}

class Receiver {
    void action() { System.out.println("Action executed"); }
}

class ConcreteCommand implements Command {
    private final Receiver receiver;
    ConcreteCommand(Receiver receiver) { this.receiver = receiver; }
    public void execute() { receiver.action(); }
}

class Invoker {
    private Command command;
    void setCommand(Command command) { this.command = command; }
    void run() { if (command != null) command.execute(); }
}
```

## Interview Talking Points
- Promotes **Open/Closed Principle** by adding new commands without changing invoker.
- Enables **undo/redo** by storing command history.
- Often used with queues and retries in distributed systems.
- Diff vs Strategy: Strategy picks an algorithm; Command represents an action/request.
