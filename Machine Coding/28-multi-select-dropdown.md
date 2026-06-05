# Build a Multi-select Dropdown

## Requirements
- Select multiple options from a dropdown
- Search/filter options
- Show selected values as chips
- Support keyboard navigation and outside-click close

## Implementation
```javascript
import { useMemo, useState } from 'react';

function MultiSelectDropdown({ options, value = [], onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return options.filter(option => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  const toggleOption = (optionValue) => {
    const next = new Set(selectedSet);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange?.([...next]);
  };

  const removeOption = (optionValue) => {
    onChange?.(value.filter(item => item !== optionValue));
  };

  return (
    <div>
      <div>
        {value.map(optionValue => {
          const option = options.find(item => item.value === optionValue);
          return (
            <button key={optionValue} onClick={() => removeOption(optionValue)}>
              {option?.label ?? optionValue} ×
            </button>
          );
        })}
      </div>
      <input
        role="combobox"
        aria-expanded={open}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => event.key === 'Escape' && setOpen(false)}
      />
      {open && (
        <ul role="listbox" aria-multiselectable="true">
          {filteredOptions.map(option => (
            <li key={option.value} role="option" aria-selected={selectedSet.has(option.value)}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedSet.has(option.value)}
                  onChange={() => toggleOption(option.value)}
                />
                {option.label}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Key Patterns
- **Controlled state**: selected values come from `value`
- **Efficient lookup**: `Set` for selected checks
- **Search**: derive filtered options with `useMemo`
- **Chips**: expose quick removal for selected options

## Interview Tips
- Clarify max selection count and async loading
- Mention outside-click handling with document listener
- Discuss virtualization for thousands of options
