# Build a Notification / Toast System

## Requirements
- Show toast notifications (success, error, warning, info)
- Auto-dismiss after timeout, manual dismiss with X
- Stack multiple toasts, animate in/out
- Accessible (aria-live region)

## Implementation

```javascript
// Toast Context (global state)
const ToastContext = createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    // Auto-dismiss
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>×</button>
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

## Interview Tips
- Use Context + Provider pattern for global access
- Mention aria-live="polite" for accessibility
- Handle edge case: rapid toast creation (queue/limit)
- Cleanup: clear timeout on manual dismiss
