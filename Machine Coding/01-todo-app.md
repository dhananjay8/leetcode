# Build a Todo / Task Management App

## Requirements
- Add, edit, delete tasks
- Mark tasks complete/incomplete
- Filter: All / Active / Completed
- Persist data (localStorage)
- Bonus: drag-and-drop reorder, due dates, priorities

## Architecture

```
App
├── Header (title, input)
├── TodoList
│   └── TodoItem (checkbox, text, edit, delete)
├── Footer (count, filters, clear completed)
└── State Management (useState / useReducer / Redux)
```

## Key Data Structure
```javascript
const todo = {
  id: crypto.randomUUID(),     // unique ID
  text: "Buy groceries",
  completed: false,
  createdAt: Date.now(),
  priority: "medium"           // low | medium | high
};
```

## Core Implementation (React)

```javascript
// State: array of todos
const [todos, setTodos] = useState([]);
const [filter, setFilter] = useState('all'); // all | active | completed

// Add todo
const addTodo = (text) => {
  setTodos([...todos, { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }]);
};

// Toggle complete
const toggleTodo = (id) => {
  setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
};

// Delete todo
const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

// Filter logic
const filteredTodos = todos.filter(t => {
  if (filter === 'active') return !t.completed;
  if (filter === 'completed') return t.completed;
  return true;
});

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('todos', JSON.stringify(todos));
}, [todos]);
```

## Optimizations
- **Debounce** edits to reduce re-renders
- **Virtual list** (react-window) for large lists
- **Memoization**: `React.memo` for TodoItem, `useMemo` for filtered list
- **Keyboard shortcuts**: Enter to add, Escape to cancel edit

## Interview Tips
- Start with data model, then component tree
- Show clean state management (useReducer for complex state)
- Handle edge cases: empty input, duplicate prevention
- CSS: Show you can style responsively
- Time: Aim for working MVP in 45 min
