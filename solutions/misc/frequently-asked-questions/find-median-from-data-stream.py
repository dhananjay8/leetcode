"""
Find Median from Data Stream (LC 295) — Hard
Pattern: Two Heaps

Insight: max-heap (lo) holds lower half, min-heap (hi) holds upper half.
         Python heapq is min-heap; negate for max-heap.

Time: O(log n) addNum, O(1) findMedian
Space: O(n)
"""

import heapq


class MedianFinder:
    def __init__(self):
        # lo is a max-heap (simulated by negating values) — holds lower half of numbers
        self.lo = []
        # hi is a min-heap — holds upper half of numbers
        self.hi = []

    def addNum(self, num: int) -> None:
        # Push to lo (max-heap via negation)
        heapq.heappush(self.lo, -num)
        # Move largest element from lo to hi (ensures all in lo <= all in hi)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        # Rebalance: lo can have at most 1 extra element (handles odd total count)
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self) -> float:
        # If odd total count, median is the middle element (top of lo)
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        # If even total count, median is average of two middle elements
        return (-self.lo[0] + self.hi[0]) / 2.0


# ── Tests ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mf = MedianFinder()
    mf.addNum(1); mf.addNum(2)
    print(mf.findMedian())   # 1.5
    mf.addNum(3)
    print(mf.findMedian())   # 2.0
    mf.addNum(4); mf.addNum(5)
    print(mf.findMedian())   # 3.0
