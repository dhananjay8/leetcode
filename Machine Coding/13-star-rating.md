# Build a Star Rating Component

## Requirements
- Display 5 stars (configurable)
- Click to set rating, hover to preview
- Support half-stars (optional), read-only mode
- Accessible (keyboard navigable)

## Implementation

```javascript
function StarRating({ maxStars = 5, value = 0, onChange, readOnly = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readOnly && onChange) onChange(rating);
  };

  return (
    <div role="radiogroup" aria-label="Rating" style={{ display: 'flex', cursor: readOnly ? 'default' : 'pointer' }}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hoverValue || value);
        return (
          <span key={i}
            role="radio" aria-checked={starValue === value} tabIndex={0}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(starValue)}
            style={{ fontSize: '24px', color: filled ? '#fbbf24' : '#d1d5db', transition: 'color 0.15s' }}>
            ★
          </span>
        );
      })}
    </div>
  );
}

// Usage
function App() {
  const [rating, setRating] = useState(0);
  return (
    <div>
      <StarRating value={rating} onChange={setRating} />
      <p>You rated: {rating} / 5</p>
    </div>
  );
}
```

## Key Patterns
- **Controlled component**: value + onChange props
- **Hover preview**: separate hoverValue state
- **Accessibility**: role="radiogroup", keyboard Enter to select, aria-checked
- **Reusable**: maxStars, readOnly, onChange as props

## Interview Tips
- Simple but tests component design skills
- Discuss controlled vs uncontrolled components
- Accessibility is a differentiator
- Bonus: half-star support (track mouse position within star)
