# Build a Dashboard with Charts & Filters

## Requirements
- Display KPI cards, charts (line, bar, pie)
- Filters: date range, category, search
- Responsive grid layout, loading states
- Data fetching with caching

## Architecture
```
App
├── FilterBar (date picker, dropdown, search)
├── KPICards (total sales, users, revenue, conversion)
├── ChartsGrid
│   ├── LineChart (revenue over time)
│   ├── BarChart (sales by category)
│   └── PieChart (traffic sources)
└── DataTable (paginated details)
```

## Core Implementation
```javascript
function Dashboard() {
  const [filters, setFilters] = useState({ dateRange: 'last7d', category: 'all' });
  const { data, loading } = useFetch(`/api/dashboard?${new URLSearchParams(filters)}`);

  if (loading) return <Skeleton />;
  return (
    <div className="grid grid-cols-4 gap-4">
      <FilterBar filters={filters} onChange={setFilters} />
      {data.kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      <div className="col-span-2"><LineChart data={data.revenue} /></div>
      <div className="col-span-2"><BarChart data={data.sales} /></div>
    </div>
  );
}

function KPICard({ label, value, change }) {
  return (
    <div className="card">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <span className={change > 0 ? 'green' : 'red'}>{change}%</span>
    </div>
  );
}
```

## Key Patterns
- **Filter state** drives data fetching (filters as URL params)
- **Debounce** search input before API call
- **Chart library**: Recharts, Chart.js, or D3 for rendering
- **Responsive grid**: CSS Grid or Tailwind grid classes
- **Skeleton loading** for better UX than spinners

## Interview Tips
- Start with layout + mock data, add real fetching later
- Mention data transformation between API response and chart format
- Discuss caching (React Query / SWR) for repeated filter changes
