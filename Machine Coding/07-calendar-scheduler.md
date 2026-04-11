# Build a Calendar / Scheduler Application

## Requirements
- Monthly/weekly/daily views
- Create, edit, delete events
- Events display on correct date/time slots
- Drag to create/resize events, overlap handling

## Data Model
```javascript
const event = {
  id: 'e1', title: 'Team Meeting', start: '2024-01-15T10:00', end: '2024-01-15T11:00',
  color: '#3b82f6', description: 'Sprint planning'
};
```

## Core: Monthly View Grid
```javascript
function MonthView({ year, month, events }) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(42).fill(null).map((_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayEvents = events.filter(e => e.start.startsWith(dateStr));
    return { day, events: dayEvents };
  });
  
  return (
    <div className="grid grid-cols-7">
      {cells.map((cell, i) => (
        <div key={i} className="cell">
          {cell && <><span>{cell.day}</span>
            {cell.events.map(e => <div key={e.id} className="event">{e.title}</div>)}
          </>}
        </div>
      ))}
    </div>
  );
}
```

## Key Patterns
- **Grid layout**: 7 columns for days, rows for weeks
- **Date math**: `new Date()` for first day of month, days in month
- **Event positioning** (weekly view): calculate top/height from start/end times
- **Overlap detection**: sort events by start time, check if intervals overlap, offset horizontally

## Interview Tips
- Start with data model + monthly grid, add complexity
- Mention date libraries (date-fns, dayjs) for production
- Discuss timezone handling
