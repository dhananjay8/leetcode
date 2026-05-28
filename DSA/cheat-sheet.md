# DSA Interview Cheat Sheet — Ultimate Quick Reference

## 📦 Data Structure Operations Complexity

| Structure | Access | Search | Insert | Delete | Space |
|-----------|--------|--------|--------|--------|-------|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) |
| Stack | O(n) | O(n) | O(1) | O(1) | O(n) |
| Queue | O(n) | O(n) | O(1) | O(1) | O(n) |
| Singly Linked List | O(n) | O(n) | O(1) | O(1) | O(n) |
| Hash Table | — | O(1)* | O(1)* | O(1)* | O(n) |
| BST (balanced) | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| Min/Max Heap | O(1) top | O(n) | O(log n) | O(log n) | O(n) |
| Trie | — | O(m) | O(m) | O(m) | O(n×m) |

*\*average case, O(n) worst case for hash collisions*

---

## ⚡ 60-Second Pattern Identification

Before coding, answer 3 questions:
1. **Core DS?** — Array / LinkedList / Tree / Graph / Heap / Stack
2. **Core Op?** — Find / Optimize / Count / Generate / Detect
3. **Core Constraint?** — Sorted / Limited space / Real-time stream / Unknown length

The three answers map directly to one of the patterns below.

---

## 🏷️ Pattern Trigger Sections

### [1] Arrays and Hashing
- **Problems**: Two Sum, Product Except Self, Contains Duplicate, Majority Element, Sort Colors
- **Keywords**: hash map, frequency, prefix product, counting, in-place
- **Trigger**: question talks about counts, presence, or rearranging array values

### [2] Two Pointers
- **Problems**: 3Sum, Container With Most Water, Move Zeroes, Remove Duplicates, Valid Palindrome
- **Keywords**: left/right pointers, shrinking range, swapping, partitioning
- **Trigger**: sorted data + need pairs, ranges, or in-place cleanup

### [3] Sliding Window
- **Problems**: Longest Substring Without Repeating, Subarray Sum Equals K, Min Window Substring, Sliding Window Max, String Compression
- **Keywords**: window start/end, expand/shrink, running count, best window
- **Trigger**: best contiguous subarray/substring satisfying a condition

### [4] Binary Search on Sorted or Answer Space
- **Problems**: Search Rotated Array, Find First/Last Position, Median of Two Sorted, Find Peak, Koko Bananas
- **Keywords**: mid index, sorted property, search space, monotonic answer
- **Trigger**: sorted/monotonic input OR answer space is monotonic + tight time

### [5] Matrix and Grid Traversal
- **Problems**: Number of Islands, Rotting Oranges, Spiral Matrix, Rotate Image, Valid Sudoku
- **Keywords**: 2D grid, visited set, boundaries, 4 directions
- **Trigger**: board/grid — explore neighbors or process layers

### [6] Intervals and Timeline Scans
- **Problems**: Merge Intervals, Meeting Rooms II, Best Time to Buy/Sell Stock, Daily Temperatures
- **Keywords**: sort by start, sweep line, prefix max, monotonic structure
- **Trigger**: time ranges, bookings, or prices evolving over a timeline

---

## 🧩 14 Must-Know Patterns

### 1. Two Pointers
- **Use when**: Sorted arrays, pair finding, palindromes
- **Template**: `left = 0, right = n-1; while (left < right)`
- **Examples**: Two Sum II, 3Sum, Container With Most Water, Valid Palindrome

### 2. Sliding Window
- **Use when**: Contiguous subarray/substring with a condition
- **Template**: Expand `right`, shrink `left` when condition violated
- **Examples**: Max Subarray Sum of size K, Longest Substring Without Repeating, Minimum Window Substring

### 3. Binary Search
- **Use when**: Sorted array, search space with monotonic property
- **Template**: `lo, hi; while (lo <= hi) { mid = (lo+hi)/2; }`
- **Variants**: Find first/last occurrence, search in rotated array, search on answer

### 4. BFS (Breadth-First Search)
- **Use when**: Shortest path in unweighted graph, level-order traversal
- **Template**: Queue, visited set, process level by level
- **Examples**: Shortest path, Rotting Oranges, Word Ladder, Level Order Traversal

### 5. DFS (Depth-First Search)
- **Use when**: Explore all paths, connectivity, cycle detection
- **Template**: Recursive or stack, mark visited
- **Examples**: Number of Islands, Path Sum, Clone Graph, Flood Fill

### 6. Backtracking
- **Use when**: Generate all combinations/permutations, constraint satisfaction
- **Template**: Choose → Explore → Unchoose (backtrack)
- **Examples**: N-Queens, Subsets, Permutations, Combination Sum, Sudoku Solver

### 7. Dynamic Programming
- **Use when**: Optimal substructure + overlapping subproblems
- **Approach**: Top-down (memoization) or Bottom-up (tabulation)
- **Common patterns**: 0/1 Knapsack, LCS, LIS, Grid paths, String DP
- **Examples**: Coin Change, House Robber, Edit Distance, Longest Common Subsequence

### 8. Greedy
- **Use when**: Local optimal choice leads to global optimal
- **Key**: Prove greedy choice property before using
- **Examples**: Jump Game, Gas Station, Activity Selection, Huffman Coding

### 9. Monotonic Stack
- **Use when**: Next greater/smaller element, histogram problems
- **Template**: Stack maintains increasing/decreasing order
- **Examples**: Daily Temperatures, Largest Rectangle in Histogram, Trapping Rain Water

### 10. Union-Find (Disjoint Set)
- **Use when**: Connected components, cycle detection in undirected graphs
- **Template**: `find(x)` with path compression, `union(x,y)` with rank
- **Examples**: Redundant Connection, Number of Connected Components, Accounts Merge

### 11. Topological Sort
- **Use when**: Ordering with dependencies, DAG processing
- **Template**: Kahn's (BFS + in-degree) or DFS with post-order
- **Examples**: Course Schedule, Alien Dictionary, Task Scheduling

### 12. Trie (Prefix Tree)
- **Use when**: Prefix matching, autocomplete, word search
- **Template**: Node with children map + isEnd flag
- **Examples**: Implement Trie, Word Search II, Autocomplete

### 13. Heap / Priority Queue
- **Use when**: Top K, median, merge K sorted, scheduling
- **Template**: Min-heap or max-heap (negate for max in min-heap)
- **Examples**: Kth Largest, Merge K Lists, Find Median, Task Scheduler

### 14. Bit Manipulation
- **Use when**: XOR tricks, power of 2, count bits, single number
- **Key formulas**: `x & (x-1)` removes lowest set bit, `x ^ x = 0`, `x ^ 0 = x`
- **Examples**: Single Number, Counting Bits, Reverse Bits

---

## 🔑 Common Code Templates

### Sliding Window (Variable Size)
```
left = 0
for right in range(n):
    # expand: add arr[right] to window
    while window_invalid:
        # shrink: remove arr[left] from window
        left += 1
    # update answer
```

### BFS Template
```
queue = [start]
visited = {start}
while queue:
    node = queue.pop(0)
    for neighbor in graph[node]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
```

### DFS Template
```
def dfs(node, visited):
    if node in visited: return
    visited.add(node)
    for neighbor in graph[node]:
        dfs(neighbor, visited)
```

### Backtracking Template
```
def backtrack(candidates, start, current, result):
    if goal_reached:
        result.append(current[:])
        return
    for i in range(start, len(candidates)):
        current.append(candidates[i])
        backtrack(candidates, i + 1, current, result)  # or i for reuse
        current.pop()  # undo choice
```

### Binary Search Template
```
lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if condition(mid):
        answer = mid
        hi = mid - 1    # or lo = mid + 1
    else:
        lo = mid + 1    # or hi = mid - 1
```

### Union-Find Template
```
parent = list(range(n))
rank = [0] * n

def find(x):
    if parent[x] != x: parent[x] = find(parent[x])  # path compression
    return parent[x]

def union(x, y):
    px, py = find(x), find(y)
    if px == py: return False
    if rank[px] < rank[py]: parent[px] = py
    elif rank[px] > rank[py]: parent[py] = px
    else: parent[py] = px; rank[px] += 1
    return True
```

---

## 🧮 Math Formulas for Interviews

| Formula | Value |
|---------|-------|
| Sum 1 to n | n × (n+1) / 2 |
| Sum of squares | n(n+1)(2n+1) / 6 |
| Power of 2 check | `n & (n-1) == 0` |
| GCD (Euclidean) | `gcd(a, b) = gcd(b, a % b)` |
| Catalan number | C(n) = C(2n, n) / (n+1) |
| Permutations | n! / (n-r)! |
| Combinations | n! / (r! × (n-r)!) |
| Number of binary trees with n nodes | Catalan(n) |

---

## ⏱️ How to Estimate Time Limit

| Constraint on n | Max Acceptable Complexity |
|-----------------|--------------------------|
| n ≤ 12 | O(n!) — brute force/backtracking |
| n ≤ 25 | O(2ⁿ) — bitmask DP |
| n ≤ 500 | O(n³) — Floyd-Warshall |
| n ≤ 10⁴ | O(n²) — nested loops |
| n ≤ 10⁶ | O(n log n) — sorting |
| n ≤ 10⁸ | O(n) — linear scan |
| n > 10⁸ | O(log n) or O(1) — binary search, math |
