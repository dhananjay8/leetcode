# Build an OTP Input Component

## Requirements
- Render N single-character inputs
- Auto-focus next input after typing
- Support backspace, paste, and arrow navigation
- Expose final OTP through `onChange` / `onComplete`

## Implementation
```javascript
import { useRef, useState } from 'react';

function OtpInput({ length = 6, onChange, onComplete }) {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const refs = useRef([]);

  const updateDigits = (nextDigits) => {
    setDigits(nextDigits);
    const value = nextDigits.join('');
    onChange?.(value);
    if (value.length === length && !nextDigits.includes('')) onComplete?.(value);
  };

  const setDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextDigits = [...digits];
    nextDigits[index] = value;
    updateDigits(nextDigits);

    if (value && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const nextDigits = Array(length).fill('');
    for (let i = 0; i < pasted.length; i += 1) nextDigits[i] = pasted[i];
    updateDigits(nextDigits);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  return (
    <div role="group" aria-label="One time password">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={node => refs.current[index] = node}
          value={digit}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          onChange={event => setDigit(index, event.target.value)}
          onPaste={handlePaste}
          onKeyDown={event => handleKeyDown(event, index)}
        />
      ))}
    </div>
  );
}
```

## Key Patterns
- **Refs array**: direct focus control across inputs
- **Paste handling**: sanitize and distribute characters
- **Validation**: accept only numeric characters
- **Completion**: trigger only when all positions are filled

## Interview Tips
- Handle mobile keyboards with `inputMode="numeric"`
- Clarify numeric-only vs alphanumeric OTP
- Discuss masking and password-manager behavior
