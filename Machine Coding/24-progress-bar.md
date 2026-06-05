# Build a Progress Bar / Step Progress Component

## Requirements
- Render progress from 0 to 100
- Support determinate and indeterminate states
- Show optional label or percentage
- Animate progress updates smoothly

## Implementation
```javascript
function ProgressBar({ value = 0, max = 100, label, indeterminate = false }) {
  const safeValue = Math.min(Math.max(value, 0), max);
  const percent = Math.round((safeValue / max) * 100);

  return (
    <div>
      {label && <div id="progress-label">{label}</div>}
      <div
        role="progressbar"
        aria-labelledby={label ? 'progress-label' : undefined}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : max}
        aria-valuenow={indeterminate ? undefined : safeValue}
        className={indeterminate ? 'progress indeterminate' : 'progress'}
      >
        <div className="progress-fill" style={{ width: indeterminate ? undefined : `${percent}%` }} />
      </div>
      {!indeterminate && <span>{percent}%</span>}
    </div>
  );
}
```

## CSS
```css
.progress { height: 8px; overflow: hidden; background: #e5e7eb; border-radius: 999px; }
.progress-fill { height: 100%; background: #2563eb; transition: width 200ms ease; }
.indeterminate .progress-fill { width: 40%; animation: loading 1s infinite linear; }
@keyframes loading { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
```

## Key Patterns
- **Clamping**: protect against invalid values
- **ARIA**: `progressbar` with `aria-valuenow`
- **Animation**: CSS transition for determinate progress
- **Indeterminate**: omit exact `aria-valuenow`

## Interview Tips
- Clarify whether progress is server-driven or simulated
- Mention reduced-motion support for animations
- Avoid interval-based fake progress unless requested
