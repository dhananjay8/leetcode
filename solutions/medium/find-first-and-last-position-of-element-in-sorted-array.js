/**
 * Problem: Find First and Last Position of Element in Sorted Array
 * Link: https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/
 * Difficulty: Medium
 *
 * Given sorted array, find starting and ending position of a target value. O(log n).
 *
 * Example: nums = [5,7,7,8,8,10], target = 8 => [3,4]
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Binary Searches
function searchRange(nums, target) {
  return [findFirst(nums, target), findLast(nums, target)];
}

function findFirst(nums, target) {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      result = mid;
      hi = mid - 1; // keep searching left for first occurrence
    } else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

function findLast(nums, target) {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) {
      result = mid;
      lo = mid + 1; // keep searching right for last occurrence
    } else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return result;
}

module.exports = searchRange;

/* Python Solution:

def searchRange(nums, target):
    def find_first():
        lo, hi, result = 0, len(nums) - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                result = mid
                hi = mid - 1  # search left
            elif nums[mid] < target: lo = mid + 1
            else: hi = mid - 1
        return result
    
    def find_last():
        lo, hi, result = 0, len(nums) - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                result = mid
                lo = mid + 1  # search right
            elif nums[mid] < target: lo = mid + 1
            else: hi = mid - 1
        return result
    
    return [find_first(), find_last()]

*/
