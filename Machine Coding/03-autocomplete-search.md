# Build a Search with Autocomplete & Debouncing

## Requirements
- Search input with dropdown suggestions
- Debounce API calls (300ms)
- Highlight matching text in results
- Keyboard navigation (arrow keys, Enter, Escape)
- Cache previous results

## Core Implementation

```javascript
import { useEffect, useRef, useState } from 'react';

function AutocompleteSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());
  const abortRef = useRef(null);

  useEffect(() => {
    const searchTerm = query.trim();

    const timerId = setTimeout(async () => {
      if (!searchTerm) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      if (cache.current.has(searchTerm)) {
        setResults(cache.current.get(searchTerm));
        setShowDropdown(true);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal
        });
        const data = await res.json();
        cache.current.set(searchTerm, data);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        if (error.name !== 'AbortError') setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  };

  const selectResult = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    if (e.key === 'ArrowUp') setActiveIndex(prev => Math.max(prev - 1, 0));
    if (e.key === 'Enter' && activeIndex >= 0) selectResult(results[activeIndex]);
  };

  const highlightMatch = (text) => {
    const searchTerm = query.trim();
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<strong>{text.slice(idx, idx + searchTerm.length)}</strong>{text.slice(idx + searchTerm.length)}</>;
  };

  return (
    <div>
      <input
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="search-results"
        aria-activedescendant={activeIndex >= 0 ? `result-${results[activeIndex].id}` : undefined}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {loading && <span>Loading...</span>}
      {showDropdown && (
        <ul id="search-results" role="listbox">
          {results.map((item, i) => (
            <li
              key={item.id}
              id={`result-${item.id}`}
              role="option"
              aria-selected={i === activeIndex}
              className={i === activeIndex ? 'active' : ''}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={() => selectResult(item)}
            >
              {highlightMatch(item.name)}
            </li>
          ))}
        </ul>
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
- **Race safety**: AbortController cancels stale requests

## Interview Tips
- Implement debounce from scratch (shows understanding)
- Mention AbortController to cancel stale requests
- Discuss race conditions (response for query A arrives after query B)
- Mention accessibility (WCAG, screen readers)
