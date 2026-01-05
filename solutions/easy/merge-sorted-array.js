/**
 * Problem: Merge Sorted Array
 * Link: https://leetcode.com/problems/merge-sorted-array/
 * Difficulty: Easy
 *
 * You are given two integer arrays nums1 and nums2, sorted in non-decreasing order,
 * and two integers m and n, representing the number of elements in nums1 and nums2.
 * Merge nums2 into nums1 as one sorted array. The final sorted array should be stored inside nums1.
 *
 * Example:
 * Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
 * Output: [1,2,2,3,5,6]
 *
 * Time Complexity: O(m + n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Three Pointers (Backwards)
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function (nums1, m, nums2, n) {
  let lastNums1Ind = m - 1;
  let lastNums2Ind = n - 1;
  let lastPossibleNum1Ind = m + n - 1;
  while (lastNums1Ind >= 0 && lastNums2Ind >= 0) {
    if (nums1[lastNums1Ind] > nums2[lastNums2Ind]) {
      nums1[lastPossibleNum1Ind] = nums1[lastNums1Ind];
      lastNums1Ind -= 1;
    } else {
      nums1[lastPossibleNum1Ind] = nums2[lastNums2Ind];
      lastNums2Ind -= 1;
    }
    lastPossibleNum1Ind -= 1;
  }
  while (lastNums2Ind >= 0) {
    nums1[lastPossibleNum1Ind] = nums2[lastNums2Ind];
    lastNums2Ind -= 1;
    lastPossibleNum1Ind -= 1;
  }
};

// Test cases
let nums1 = [1, 2, 3, 0, 0, 0];
merge(nums1, 3, [2, 5, 6], 3);
console.log(nums1); // [1,2,2,3,5,6]

nums1 = [1];
merge(nums1, 1, [], 0);
console.log(nums1); // [1]

nums1 = [0];
merge(nums1, 0, [1], 1);
console.log(nums1); // [1]

module.exports = merge;

/* Python Solution (commented):

def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    """
    Merge two sorted arrays in-place
    
    Args:
        nums1: First sorted array with extra space
        m: Number of elements in nums1
        nums2: Second sorted array
        n: Number of elements in nums2
    
    Returns:
        None - modifies nums1 in-place
    
    Time Complexity: O(m + n)
    Space Complexity: O(1)
    """
    p1 = m - 1  # Pointer for nums1
    p2 = n - 1  # Pointer for nums2
    p = m + n - 1  # Pointer for merged position
    
    # Merge from back to front
    while p2 >= 0:
        if p1 >= 0 and nums1[p1] > nums2[p2]:
            nums1[p] = nums1[p1]
            p1 -= 1
        else:
            nums1[p] = nums2[p2]
            p2 -= 1
        p -= 1

# Test cases
nums1 = [1,2,3,0,0,0]
merge(nums1, 3, [2,5,6], 3)
print(nums1)  # [1,2,2,3,5,6]

nums1 = [1]
merge(nums1, 1, [], 0)
print(nums1)  # [1]

nums1 = [0]
merge(nums1, 0, [1], 1)
print(nums1)  # [1]

*/
