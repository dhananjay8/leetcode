# Build an Accordion Component

## Requirements
- Render multiple expandable sections
- Support single-open and multi-open modes
- Toggle section by click and keyboard
- Keep content accessible to screen readers

## Data Model
```javascript
const items = [
  { id: 'shipping', title: 'Shipping', content: 'Ships in 2-3 days' },
  { id: 'returns', title: 'Returns', content: '30 day return policy' }
];
```

## Implementation
```javascript
import { useState } from 'react';

function Accordion({ items, allowMultiple = false, defaultOpenIds = [] }) {
  const [openIds, setOpenIds] = useState(new Set(defaultOpenIds));

  const toggle = (id) => {
    setOpenIds(prev => {
      const next = allowMultiple ? new Set(prev) : new Set();
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {items.map(item => {
        const isOpen = openIds.has(item.id);
        const panelId = `accordion-panel-${item.id}`;
        const buttonId = `accordion-button-${item.id}`;

        return (
          <section key={item.id}>
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              {item.title}
            </button>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

## Key Patterns
- **State shape**: `Set` makes open/close checks O(1)
- **Modes**: single-open resets state before adding the new section
- **Accessibility**: `aria-expanded`, `aria-controls`, `hidden`
- **Scalability**: render content lazily if panels are heavy

## Interview Tips
- Clarify single-open vs multi-open behavior first
- Handle duplicate IDs before rendering
- Mention animation separately from core behavior
