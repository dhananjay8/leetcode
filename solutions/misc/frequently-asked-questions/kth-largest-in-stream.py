"""
Kth Largest Element in a Stream (LC 703) — Easy
Pattern: Min-Heap of size K

Time:  O(log K) per add
Space: O(K)
"""

import heapq
from typing import List


class KthLargest:
    def __init__(self, k: int, nums: List[int]):
        self.k = k
        self.heap: List[int] = []
        # Initialize heap with initial numbers using add() to maintain size constraint
        for n in nums:
            self.add(n)

    def add(self, val: int) -> int:
        # Add new value to min-heap
        heapq.heappush(self.heap, val)
        # If heap exceeds size k, remove the smallest element
        # This ensures heap always contains the K largest elements seen so far
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)  # remove smallest; keep top-K
        # The minimum element in the heap is the Kth largest overall
        return self.heap[0]


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    kl = KthLargest(3, [4, 5, 8, 2])
    print(kl.add(3))   # 4
    print(kl.add(5))   # 5
    print(kl.add(10))  # 5
    print(kl.add(9))   # 8
    print(kl.add(4))   # 8
