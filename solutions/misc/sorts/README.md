# Sorting and Searching Quick Reference

## Sorting Algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble Sort | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | Yes |
| Selection Sort | `O(n^2)` | `O(n^2)` | `O(n^2)` | `O(1)` | No |
| Insertion Sort | `O(n)` | `O(n^2)` | `O(n^2)` | `O(1)` | Yes |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |
| Quick Sort | `O(n log n)` | `O(n log n)` | `O(n^2)` | `O(log n)` | No |
| Heap Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | No |
| Radix Sort | `O(nk)` | `O(nk)` | `O(nk)` | `O(n + k)` | Yes |
| Counting Sort | `O(n + k)` | `O(n + k)` | `O(n + k)` | `O(k)` | Yes |
| Bucket Sort | `O(n + k)` | `O(n + k)` | `O(n^2)` | `O(n + k)` | Usually |

Notes:
- `n` = number of input elements
- `k` = range/base-related factor for non-comparison sorts

## Searching Algorithms

| Algorithm | Best | Average | Worst | Space |
|---|---|---|---|---|
| Linear Search | `O(1)` | `O(n)` | `O(n)` | `O(1)` |
| Binary Search | `O(1)` | `O(log n)` | `O(log n)` | `O(1)` |
| Jump Search | `O(sqrt(n))` | `O(sqrt(n))` | `O(sqrt(n))` | `O(1)` |
| Interpolation Search | `O(1)` | `O(log log n)` | `O(n)` | `O(1)` |
| Exponential Search | `O(1)` | `O(log n)` | `O(log n)` | `O(1)` |

Notes:
- Binary Search requires a sorted array.
- Interpolation Search works best when values are uniformly distributed.

## Interview Use Cases

### Sorting
- Merge Sort: stable sorting and linked-list sorting.
- Quick Sort: in-memory average-case speed.
- Counting/Radix: integer keys with limited range.

### Searching
- Linear Search: small or unsorted collections.
- Binary Search: sorted arrays and monotonic answer space.
- Exponential Search: unknown/unbounded size scenarios.
