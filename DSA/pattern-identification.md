# 60-Second Pattern Identification Framework

Use this before writing any code.

## Step 1: Ask 3 questions
1. **Core data structure?** Array / Linked List / Tree / Graph / Heap / Stack
2. **Core operation?** Find / Optimize / Count / Generate / Detect
3. **Core constraint?** Sorted input / Limited memory / Stream / Unknown length

If you cannot name the pattern in 60 seconds, pause and reason from constraints.

---

## Pattern trigger map

### Sorted input
- Binary Search
- Two Pointers

### Generate all permutations/subsets/combinations
- Backtracking

### Tree problems
- DFS
- BFS / Level Order

### Graph problems
- DFS / BFS
- Topological Sort (if dependencies)
- Union-Find (if connectivity)

### Linked list operations
- Two pointers
- Fast/slow pointer

### Contiguous subarray/substring optimization
- Sliding Window
- Prefix Sum

### Top K / priority ordering
- Heap
- Quickselect

### Dependency/order constraints
- Topological Sort

### Need best possible value from subproblems
- Dynamic Programming

---

## Complexity guide from constraints

| Constraint (`n`) | Usually acceptable |
|---|---|
| `n <= 12` | `O(n!)` |
| `n <= 25` | `O(2^n)` |
| `n <= 500` | `O(n^3)` |
| `n <= 10^4` | `O(n^2)` |
| `n <= 10^6` | `O(n log n)` |
| `n <= 10^8` | `O(n)` |
| `n > 10^8` | `O(log n)` or `O(1)` |

---

## Fast pre-coding checklist
- Restate problem in one line.
- Define brute force first.
- Pick pattern and justify it from constraints.
- Write edge cases before code.
- Track time/space complexity while coding.
