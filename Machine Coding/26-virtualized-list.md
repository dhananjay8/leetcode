# Build a Virtualized List

## Requirements
- Render only visible items from a large list
- Support fixed row height
- Keep scroll height equal to full list height
- Add overscan to avoid blank edges while scrolling

## Implementation
```javascript
import { useMemo, useState } from 'react';

function VirtualizedList({ items, rowHeight = 40, height = 400, overscan = 5, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * rowHeight;

  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(height / rowHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { start, end };
  }, [scrollTop, rowHeight, height, overscan, items.length]);

  const visibleItems = items.slice(range.start, range.end);

  return (
    <div
      style={{ height, overflow: 'auto', position: 'relative' }}
      onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = range.start + index;
          return (
            <div
              key={item.id ?? actualIndex}
              style={{
                position: 'absolute',
                top: actualIndex * rowHeight,
                height: rowHeight,
                width: '100%'
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Key Patterns
- **Windowing**: render `[start, end)` subset only
- **Spacer height**: preserve full scrollbar behavior
- **Absolute positioning**: place visible rows at computed offsets
- **Overscan**: render extra rows above and below viewport

## Interview Tips
- Fixed-height virtualization is the MVP
- Variable row height requires measurement cache
- Mention `react-window` for production usage
