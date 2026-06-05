# Build a Countdown Timer

## Requirements
- Start, pause, resume, and reset countdown
- Display remaining time in `mm:ss`
- Avoid interval drift
- Fire `onComplete` once when timer reaches zero

## Implementation
```javascript
import { useEffect, useRef, useState } from 'react';

function CountdownTimer({ initialSeconds = 60, onComplete }) {
  const [remainingMs, setRemainingMs] = useState(initialSeconds * 1000);
  const [running, setRunning] = useState(false);
  const endTimeRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!running) return;

    endTimeRef.current = Date.now() + remainingMs;
    const intervalId = setInterval(() => {
      const nextRemainingMs = Math.max(0, endTimeRef.current - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        setRunning(false);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setRemainingMs(initialSeconds * 1000);
    completedRef.current = false;
  };

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div>
      <div aria-live="polite">{display}</div>
      <button onClick={() => setRunning(true)} disabled={running || remainingMs === 0}>Start</button>
      <button onClick={() => setRunning(false)} disabled={!running}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Key Patterns
- **Drift control**: compute remaining time from target end time
- **Cleanup**: clear interval on pause and unmount
- **Completion guard**: prevent duplicate `onComplete`
- **Formatting**: derive display from milliseconds

## Interview Tips
- Avoid decrementing seconds blindly every interval
- Discuss background-tab timer throttling
- Clarify whether reset should restart automatically
