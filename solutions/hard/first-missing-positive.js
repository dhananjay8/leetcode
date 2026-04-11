/**
 * Problem: First Missing Positive
 * Link: https://leetcode.com/problems/first-missing-positive/
 * Difficulty: Hard
 *
 * Find the smallest missing positive integer. Must run in O(n) time and O(1) extra space.
 * Example: [3,4,-1,1] => 2
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Cyclic sort: place each number at its correct index
function firstMissingPositive(nums) {
  const n = nums.length;

  // Place each number i at index i-1 (so nums[i-1] = i)
  for (let i = 0; i < n; i++) {
    while (nums[i] > 0 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      // Swap nums[i] to its correct position
      const target = nums[i] - 1;
      [nums[i], nums[target]] = [nums[target], nums[i]];
    }
  }

  // First index where nums[i] !== i+1 is the answer
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }

  return n + 1; // all 1..n are present
}

module.exports = firstMissingPositive;

/* Python Solution:

def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        while 0 < nums[i] <= n and nums[nums[i]-1] != nums[i]:
            nums[nums[i]-1], nums[i] = nums[i], nums[nums[i]-1]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1

*/
