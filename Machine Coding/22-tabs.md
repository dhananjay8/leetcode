# Build a Tabs Component

## Requirements
- Render tab labels and active tab panel
- Support controlled and uncontrolled usage
- Keyboard navigation with ArrowLeft, ArrowRight, Home, End
- Keep tab and panel semantics accessible

## Data Model
```javascript
const tabs = [
  { id: 'overview', label: 'Overview', content: <Overview /> },
  { id: 'settings', label: 'Settings', content: <Settings /> }
];
```

## Implementation
```javascript
import { useState } from 'react';

function Tabs({ tabs, value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.id);
  const activeValue = value ?? internalValue;
  const activeIndex = tabs.findIndex(tab => tab.id === activeValue);

  const selectTab = (id) => {
    if (value === undefined) setInternalValue(id);
    onChange?.(id);
  };

  const moveFocus = (nextIndex) => {
    const normalizedIndex = (nextIndex + tabs.length) % tabs.length;
    selectTab(tabs[normalizedIndex].id);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') moveFocus(activeIndex + 1);
    if (event.key === 'ArrowLeft') moveFocus(activeIndex - 1);
    if (event.key === 'Home') selectTab(tabs[0].id);
    if (event.key === 'End') selectTab(tabs[tabs.length - 1].id);
  };

  return (
    <div>
      <div role="tablist" aria-label="Tabs" onKeyDown={handleKeyDown}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={tab.id === activeValue}
            aria-controls={`panel-${tab.id}`}
            tabIndex={tab.id === activeValue ? 0 : -1}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(tab => (
        <div key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={tab.id !== activeValue}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## Key Patterns
- **Controlled support**: `value` + `onChange`
- **Uncontrolled support**: `defaultValue` + internal state
- **Accessibility**: `tablist`, `tab`, `tabpanel`
- **Keyboard UX**: wrap around at first and last tab

## Interview Tips
- Clarify whether inactive panels should unmount
- Mention URL-sync for deep-linkable tabs
- Keep tab state independent from panel data
