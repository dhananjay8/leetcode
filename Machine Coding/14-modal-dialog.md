# Build a Modal / Dialog System

## Requirements
- Reusable modal: open/close, title, body, footer with actions
- Backdrop click to close, Escape key to close
- Focus trap inside modal, prevent body scroll
- Support stacked modals, confirmation dialogs

## Implementation
```javascript
function Modal({ isOpen, onClose, title, children, footer }) {
  const modalRef = useRef();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden'; // prevent scroll
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    modalRef.current?.focus(); // focus trap
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handleEsc); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div className="modal" ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true"
           onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

// Confirmation dialog helper
function useConfirm() {
  const [state, setState] = useState({ isOpen: false, message: '', resolve: null });
  const confirm = (message) => new Promise(resolve => setState({ isOpen: true, message, resolve }));
  const handleClose = (result) => { state.resolve(result); setState({ ...state, isOpen: false }); };
  return { confirm, ConfirmDialog: () => (
    <Modal isOpen={state.isOpen} onClose={() => handleClose(false)} title="Confirm">
      <p>{state.message}</p>
      <button onClick={() => handleClose(true)}>Yes</button>
      <button onClick={() => handleClose(false)}>No</button>
    </Modal>
  )};
}
```

## Key Patterns
- **Portal** (`createPortal`): render modal outside component tree, at document.body
- **Focus trap**: keep Tab cycling within modal (use `focus-trap-react` in production)
- **Escape key** + backdrop click to close
- **Prevent scroll**: `body.style.overflow = 'hidden'`
- **Accessible**: `role="dialog"`, `aria-modal="true"`, `aria-label`
