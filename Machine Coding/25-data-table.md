# Build a Data Table with Sorting and Filtering

## Requirements
- Render rows and configurable columns
- Support sorting by column
- Support text filtering and pagination
- Keep derived rows memoized

## Data Model
```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true }
];
```

## Implementation
```javascript
import { useMemo, useState } from 'react';

function DataTable({ rows, columns, pageSize = 10 }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = normalizedQuery
      ? rows.filter(row => columns.some(column => String(row[column.key]).toLowerCase().includes(normalizedQuery)))
      : rows;

    const sorted = sort.key
      ? [...filtered].sort((a, b) => {
          const left = a[sort.key];
          const right = b[sort.key];
          const result = String(left).localeCompare(String(right), undefined, { numeric: true });
          return sort.direction === 'asc' ? result : -result;
        })
      : filtered;

    return sorted;
  }, [rows, columns, query, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (column) => {
    if (!column.sortable) return;
    setPage(1);
    setSort(prev => ({
      key: column.key,
      direction: prev.key === column.key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div>
      <input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search" />
      <table>
        <thead>
          <tr>{columns.map(column => (
            <th key={column.key}>
              <button onClick={() => toggleSort(column)} disabled={!column.sortable}>
                {column.label}
              </button>
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {pagedRows.map(row => (
            <tr key={row.id}>{columns.map(column => <td key={column.key}>{row[column.key]}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
      <span>{currentPage} / {pageCount}</span>
      <button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
    </div>
  );
}
```

## Key Patterns
- **Derived state**: filter, sort, paginate in order
- **Memoization**: compute visible rows with `useMemo`
- **Stable keys**: use row IDs, not indexes
- **Pagination reset**: reset page on filter/sort changes

## Interview Tips
- Clarify client-side vs server-side sorting
- Discuss large datasets and virtualization
- Handle empty state explicitly
