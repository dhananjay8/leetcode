/**
 * Problem: Find Median from Data Stream
 * Link: https://leetcode.com/problems/find-median-from-data-stream/
 * Difficulty: Hard
 *
 * Design a data structure that supports addNum and findMedian.
 *
 * Time Complexity: O(log n) addNum, O(1) findMedian
 * Space Complexity: O(n)
 */

// JavaScript Solution - Two Heaps (max-heap for lower half, min-heap for upper half)
class MedianFinder {
  constructor() {
    this.lo = []; // max-heap (store negatives) — smaller half
    this.hi = []; // min-heap — larger half
  }

  addNum(num) {
    // Add to max-heap (lo)
    heapPush(this.lo, -num);
    // Balance: move max of lo to hi
    heapPush(this.hi, -heapPop(this.lo));

    // Keep lo same size or 1 bigger than hi
    if (this.lo.length < this.hi.length) {
      heapPush(this.lo, -heapPop(this.hi));
    }
  }

  findMedian() {
    if (this.lo.length > this.hi.length) return -this.lo[0];
    return (-this.lo[0] + this.hi[0]) / 2;
  }
}

// Min-heap helpers
function heapPush(h, v) {
  h.push(v); let i = h.length - 1;
  while (i > 0) { const p = (i-1)>>1; if (h[p]<=h[i]) break; [h[p],h[i]]=[h[i],h[p]]; i=p; }
}
function heapPop(h) {
  const t = h[0]; h[0]=h[h.length-1]; h.pop(); let i=0;
  while (true) { let s=i,l=2*i+1,r=2*i+2;
    if(l<h.length&&h[l]<h[s])s=l; if(r<h.length&&h[r]<h[s])s=r;
    if(s===i)break; [h[s],h[i]]=[h[i],h[s]]; i=s; } return t;
}

module.exports = MedianFinder;

/* Python Solution:

import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (negated)
        self.hi = []  # min-heap
    
    def addNum(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        
        if len(self.lo) < len(self.hi):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))
    
    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2

*/
