/**
 * Problem: Kth Largest Element in a Stream
 * Link: https://leetcode.com/problems/kth-largest-element-in-a-stream/
 * Difficulty: Easy
 *
 * Design a class to find the kth largest element in a stream.
 *
 * Time Complexity: O(n log k) init, O(log k) per add
 * Space Complexity: O(k)
 */

// JavaScript Solution - Min Heap of size k
class KthLargest {
  constructor(k, nums) {
    this.k = k;
    this.heap = []; // min-heap
    for (const num of nums) this.add(num);
  }

  add(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
    
    // Keep only k largest elements
    if (this.heap.length > this.k) {
      this.heap[0] = this.heap.pop();
      this._sinkDown(0);
    }
    
    return this.heap[0]; // min of k largest = kth largest
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent] <= this.heap[i]) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

module.exports = KthLargest;

/* Python Solution:

import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = []  # min-heap of size k
        for num in nums:
            self.add(num)
    
    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)  # remove smallest
        return self.heap[0]  # kth largest

*/
