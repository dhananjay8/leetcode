# Build a Notification / Toast System

## Requirements
- Show toast notifications (success, error, warning, info)
- Auto-dismiss after timeout, manual dismiss with X
- Stack multiple toasts, animate in/out
- Accessible (aria-live region)

## Implementation

```javascript
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timerId = timers.current.get(id);
    if (timerId) clearTimeout(timerId);
    timers.current.delete(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    const timerId = setTimeout(() => removeToast(id), duration);
    timers.current.set(id, timerId);
    return id;
  }, [removeToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach(timerId => clearTimeout(timerId));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} role="status" className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Usage in any component
function SomeComponent() {
  const { addToast } = useContext(ToastContext);
  return <button onClick={() => addToast('Saved!', 'success')}>Save</button>;
}
```

## CSS (with animations)
```css
.toast-container { position: fixed; top: 16px; right: 16px; z-index: 9999; }
.toast { padding: 12px 16px; margin-bottom: 8px; border-radius: 8px;
         animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 8px; }
.toast-success { background: #10b981; color: white; }
.toast-error { background: #ef4444; color: white; }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
```

## Key Patterns
- **Context API** for global access to `addToast`
- **Auto-dismiss** with setTimeout
- **Stacking**: CSS flex column, newest at bottom
- **Animations**: CSS keyframes for enter/exit
- **Cleanup**: clear timers on manual dismiss and unmount

## Interview Tips
- Use Context + Provider pattern for global access
- Mention aria-live="polite" for accessibility
- Handle edge case: rapid toast creation (queue/limit)
- Cleanup: clear timeout on manual dismiss
