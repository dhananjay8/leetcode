/**
 * Problem: Last Stone Weight
 * Link: https://leetcode.com/problems/last-stone-weight/
 * Difficulty: Easy
 *
 * Smash two heaviest stones. If unequal, difference remains. Return last stone weight.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Max Heap (simulated with negative min-heap)
function lastStoneWeight(stones) {
  // Use negative values for max-heap behavior with min-heap
  const heap = stones.map(s => -s);
  buildHeap(heap);

  while (heap.length > 1) {
    const first = -heapPop(heap);  // largest
    const second = -heapPop(heap); // second largest

    if (first !== second) {
      heapPush(heap, -(first - second)); // push difference
    }
  }

  return heap.length ? -heap[0] : 0;
}

function buildHeap(arr) {
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) sinkDown(arr, i);
}

function heapPush(arr, val) {
  arr.push(val);
  let i = arr.length - 1;
  while (i > 0) {
    const p = Math.floor((i - 1) / 2);
    if (arr[p] <= arr[i]) break;
    [arr[p], arr[i]] = [arr[i], arr[p]];
    i = p;
  }
}

function heapPop(arr) {
  const top = arr[0];
  arr[0] = arr[arr.length - 1];
  arr.pop();
  sinkDown(arr, 0);
  return top;
}

function sinkDown(arr, i) {
  const n = arr.length;
  while (true) {
    let s = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[l] < arr[s]) s = l;
    if (r < n && arr[r] < arr[s]) s = r;
    if (s === i) break;
    [arr[s], arr[i]] = [arr[i], arr[s]];
    i = s;
  }
}

module.exports = lastStoneWeight;

/* Python Solution:

import heapq

def lastStoneWeight(stones):
    heap = [-s for s in stones]  # max-heap via negation
    heapq.heapify(heap)
    
    while len(heap) > 1:
        first = -heapq.heappop(heap)
        second = -heapq.heappop(heap)
        if first != second:
            heapq.heappush(heap, -(first - second))
    
    return -heap[0] if heap else 0

*/
