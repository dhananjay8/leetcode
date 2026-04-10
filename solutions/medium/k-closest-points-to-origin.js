/**
 * Problem: K Closest Points to Origin
 * Link: https://leetcode.com/problems/k-closest-points-to-origin/
 * Difficulty: Medium
 *
 * Return the k closest points to the origin (0, 0).
 *
 * Time Complexity: O(n log k) with heap, O(n) average with quickselect
 * Space Complexity: O(k)
 */

// JavaScript Solution - Sort (simplest)
function kClosest(points, k) {
  // Sort by distance (no need for sqrt, compare squared distances)
  return points
    .sort((a, b) => (a[0]*a[0] + a[1]*a[1]) - (b[0]*b[0] + b[1]*b[1]))
    .slice(0, k);
}

module.exports = kClosest;

/* Python Solution:

import heapq

def kClosest(points, k):
    # Use max-heap of size k (negate distance for max-heap)
    heap = []
    for x, y in points:
        dist = x*x + y*y
        if len(heap) < k:
            heapq.heappush(heap, (-dist, [x, y]))
        elif -dist > heap[0][0]:
            heapq.heapreplace(heap, (-dist, [x, y]))
    
    return [point for _, point in heap]

# Simpler: use nsmallest
def kClosest_simple(points, k):
    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)

*/
