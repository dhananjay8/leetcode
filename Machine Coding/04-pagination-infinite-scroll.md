# Build Pagination / Infinite Scroll System

## Requirements
- Option A: Page-based pagination with prev/next buttons
- Option B: Infinite scroll (load more on scroll to bottom)
- Loading states, error handling
- Deduplication of results

## Pagination Implementation

```javascript
function PaginatedList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/items?page=${page}&limit=20`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setLoading(false);
    };
    fetchData();
  }, [page]);

  return (
    <div>
      {loading ? <Spinner /> : items.map(item => <ItemCard key={item.id} item={item} />)}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
```

## Infinite Scroll Implementation

```javascript
function InfiniteScrollList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();

  // Intersection Observer for detecting scroll to bottom
  const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(`/api/items?page=${page}&limit=20`);
      const data = await res.json();
      setItems(prev => [...prev, ...data.items]);  // append to existing
      setHasMore(data.items.length === 20);
      setLoading(false);
    };
    fetchData();
  }, [page]);

  return (
    <div>
      {items.map((item, i) => (
        <div key={item.id} ref={i === items.length - 1 ? lastItemRef : null}>
          <ItemCard item={item} />
        </div>
      ))}
      {loading && <Spinner />}
    </div>
  );
}
```

## Key Concepts
- **Intersection Observer** is the modern, performant way vs scroll event listeners
- **Cursor-based pagination** (better for real-time data): `?cursor=abc&limit=20`
- **Virtualization**: Only render visible items (react-window/react-virtualized) for large lists

## Interview Tips
- Infinite scroll: mention Intersection Observer API
- Discuss trade-offs: pagination (SEO-friendly) vs infinite scroll (UX)
- Handle loading, error, and empty states
- Mention virtualization for performance with 10K+ items
