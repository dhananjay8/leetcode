# MVC vs MVVM

**Intent:** Separate concerns between data, business logic, and UI to keep code maintainable.

---

## MVC (Model-View-Controller)
- **Model:** Data + business rules.
- **View:** UI rendering.
- **Controller:** Handles input/events and coordinates Model + View.

### Typical flow
1. User interacts with View.
2. Controller processes action.
3. Controller updates Model.
4. View re-renders from Model state.

---

## MVVM (Model-View-ViewModel)
- **Model:** Domain data and business rules.
- **View:** UI layer.
- **ViewModel:** Presentation logic and state exposed for data binding.

### Typical flow
1. View binds to ViewModel properties.
2. User action calls ViewModel command.
3. ViewModel updates state/model.
4. Binding updates View automatically.

---

## JavaScript (MVVM-style example)
```javascript
class CounterViewModel {
  constructor() {
    this.count = 0;
    this.listeners = [];
  }

  increment() {
    this.count += 1;
    this.listeners.forEach((cb) => cb(this.count));
  }

  subscribe(cb) {
    this.listeners.push(cb);
  }
}

const vm = new CounterViewModel();
vm.subscribe((value) => console.log("render count:", value));
vm.increment();
```

## Interview Talking Points
- MVC is straightforward and common in backend web frameworks.
- MVVM shines in frontend apps with rich state and bindings.
- Modern frontend stacks often blend ideas (e.g., React components + state management resemble MVVM concepts).
- Main benefit: clearer boundaries and better testability.
