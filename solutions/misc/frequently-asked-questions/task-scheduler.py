"""
Task Scheduler (LC 621) — Medium
Pattern: Greedy + Max-Heap + Cooldown Queue

Time:  O(N log 26) ≈ O(N)
Space: O(26) = O(1)

Also: O(1) formula — max(N, (maxFreq-1)*(n+1) + countOfMaxFreq)
"""

import heapq
from collections import Counter, deque
from typing import List


def least_interval(tasks: List[str], n: int) -> int:
    """Simulation with max-heap (negated) + cooldown deque."""
    # Count frequency of each task type
    freq = Counter(tasks)
    # Build max-heap using negated values (Python heapq is min-heap only)
    max_heap = [-cnt for cnt in freq.values()]
    heapq.heapify(max_heap)

    time = 0
    # Queue stores (remaining_count, time_when_available) for tasks in cooldown
    queue: deque = deque()

    while max_heap or queue:
        time += 1

        if max_heap:
            # Execute the most frequent task (pop from max-heap)
            remaining = heapq.heappop(max_heap) + 1  # +1 since values are negated
            if remaining < 0:  # If task still has remaining occurrences, put in cooldown
                queue.append((remaining, time + n))
        # else: idle cycle (no task available, time still increments)

        # Restore tasks whose cooldown has expired back to the heap
        if queue and queue[0][1] == time:
            heapq.heappush(max_heap, queue.popleft()[0])

    return time


def least_interval_formula(tasks: List[str], n: int) -> int:
    """O(1) math formula.
    Key insight: The schedule consists of (max_freq - 1) full cycles of (n + 1) slots each,
    plus the final partial cycle containing all tasks with max_freq.
    """
    freq = Counter(tasks)
    max_freq = max(freq.values())
    # Count how many task types have the maximum frequency
    count_of_max = sum(1 for v in freq.values() if v == max_freq)
    # Answer is max of total tasks (no idle needed) or formula-based calculation
    return max(len(tasks), (max_freq - 1) * (n + 1) + count_of_max)


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(least_interval(list("AAABBB"), 2))               # 8
    print(least_interval(list("AAABBB"), 0))               # 6
    print(least_interval(list("AAAAAABCDEFG"), 2))         # 16

    print(least_interval_formula(list("AAABBB"), 2))       # 8
