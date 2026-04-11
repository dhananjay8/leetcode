# Build a Search with Autocomplete & Debouncing

## Requirements
- Search input with dropdown suggestions
- Debounce API calls (300ms)
- Highlight matching text in results
- Keyboard navigation (arrow keys, Enter, Escape)
- Cache previous results

## Core Implementation

```javascript
import { useState, useEffect, useRef, useCallback } from 'react';

function AutocompleteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const cache = useRef({});  // cache previous searches

  // Debounce function
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Fetch suggestions (debounced)
  const fetchSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) { setResults([]); return; }

      // Check cache first
      if (cache.current[searchTerm]) {
        setResults(cache.current[searchTerm]);
        return;
      }

      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      cache.current[searchTerm] = data;  // cache results
      setResults(data);
      setShowDropdown(true);
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
    fetchSuggestions(e.target.value);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    if (e.key === 'ArrowUp') setActiveIndex(prev => Math.max(prev - 1, 0));
    if (e.key === 'Enter' && activeIndex >= 0) selectResult(results[activeIndex]);
    if (e.key === 'Escape') setShowDropdown(false);
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0,idx)}<strong>{text.slice(idx, idx+query.length)}</strong>{text.slice(idx+query.length)}</>;
  };

  return (
    <div>
      <input value={query} onChange={handleChange} onKeyDown={handleKeyDown}
             onFocus={() => results.length && setShowDropdown(true)}
             onBlur={() => setTimeout(() => setShowDropdown(false), 200)} />
      {showDropdown && (
        <ul>{results.map((item, i) => (
          <li key={item.id} className={i === activeIndex ? 'active' : ''}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectResult(item)}>
            {highlightMatch(item.name, query)}
          </li>
        ))}</ul>
      )}
    </div>
  );
}
```

## Key Patterns
- **Debounce**: Prevents API call on every keystroke
- **Caching**: useRef-based cache for repeated queries
- **Keyboard nav**: Arrow keys + Enter + Escape
- **Highlight**: Bold the matching substring
- **Accessibility**: aria-roles, aria-activedescendant

## Interview Tips
- Implement debounce from scratch (shows understanding)
- Mention AbortController to cancel stale requests
- Discuss race conditions (response for query A arrives after query B)
- Mention accessibility (WCAG, screen readers)
