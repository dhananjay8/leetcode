/**
 * Problem: Find Minimum in Rotated Sorted Array
 * Link: https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/
 * Difficulty: Medium
 *
 * Find the minimum element in a rotated sorted array (no duplicates).
 *
 * Example: nums = [3,4,5,1,2] => 1
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Binary Search
function findMin(nums) {
  let lo = 0, hi = nums.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] > nums[hi]) {
      // Minimum is in the right half (rotation point is there)
      lo = mid + 1;
    } else {
      // Minimum is in the left half (including mid)
      hi = mid;
    }
  }

  return nums[lo]; // lo === hi, pointing to the minimum
}

module.exports = findMin;

/* Python Solution:

def findMin(nums):
    lo, hi = 0, len(nums) - 1
    
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1  # min is in right half
        else:
            hi = mid       # min is in left half (including mid)
    
    return nums[lo]

*/
