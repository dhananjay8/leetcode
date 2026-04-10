/**
 * Problem: Search in Rotated Sorted Array
 * Link: https://leetcode.com/problems/search-in-rotated-sorted-array/
 * Difficulty: Medium
 *
 * Array is sorted then rotated. Search for target in O(log n).
 *
 * Example: nums = [4,5,6,7,0,1,2], target = 0 => 4
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Modified Binary Search
function search(nums, target) {
  let lo = 0, hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;

    // Determine which half is sorted
    if (nums[lo] <= nums[mid]) {
      // Left half is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1; // target in sorted left half
      } else {
        lo = mid + 1; // target in right half
      }
    } else {
      // Right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1; // target in sorted right half
      } else {
        hi = mid - 1; // target in left half
      }
    }
  }

  return -1;
}

module.exports = search;

/* Python Solution:

def search(nums, target):
    lo, hi = 0, len(nums) - 1
    
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target: return mid
        
        if nums[lo] <= nums[mid]:  # left half sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:  # right half sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    
    return -1

*/
