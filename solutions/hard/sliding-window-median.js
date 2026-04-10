/**
 * Problem: Sliding Window Median
 * Link: https://leetcode.com/problems/sliding-window-median/
 * Difficulty: Hard
 *
 * Return median of each window of size k as it slides from left to right.
 *
 * Time Complexity: O(n * k) with sorted array approach
 * Space Complexity: O(k)
 */

// JavaScript Solution - Sorted Array (practical for interviews)
function medianSlidingWindow(nums, k) {
  const result = [];
  const window = []; // sorted window

  // Binary search insert position
  function bisectInsert(arr, val) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    arr.splice(lo, 0, val);
  }

  function bisectRemove(arr, val) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    arr.splice(lo, 1);
  }

  for (let i = 0; i < nums.length; i++) {
    bisectInsert(window, nums[i]);

    // Remove element leaving the window
    if (window.length > k) {
      bisectRemove(window, nums[i - k]);
    }

    // Window is full, compute median
    if (window.length === k) {
      const mid = Math.floor(k / 2);
      const median = k % 2 === 1 ? window[mid] : (window[mid - 1] + window[mid]) / 2;
      result.push(median);
    }
  }

  return result;
}

module.exports = medianSlidingWindow;

/* Python Solution:

import bisect

def medianSlidingWindow(nums, k):
    window = sorted(nums[:k])
    result = []
    
    def get_median():
        mid = k // 2
        return window[mid] if k % 2 else (window[mid-1] + window[mid]) / 2
    
    result.append(get_median())
    
    for i in range(k, len(nums)):
        # Remove outgoing element
        bisect.insort(window, nums[i])
        window.pop(bisect.bisect_left(window, nums[i - k]))
        result.append(get_median())
    
    return result

*/
