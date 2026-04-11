/**
 * Problem: Next Permutation
 * Link: https://leetcode.com/problems/next-permutation/
 * Difficulty: Medium
 *
 * Rearrange numbers into the next lexicographically greater permutation. In-place.
 * Example: [1,2,3] => [1,3,2], [3,2,1] => [1,2,3]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution
function nextPermutation(nums) {
  const n = nums.length;

  // Step 1: Find the largest index i such that nums[i] < nums[i+1] (rightmost ascent)
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;

  if (i >= 0) {
    // Step 2: Find the largest j > i such that nums[j] > nums[i]
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;
    // Step 3: Swap nums[i] and nums[j]
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  // Step 4: Reverse the suffix from i+1 to end
  let left = i + 1, right = n - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++; right--;
  }
}

module.exports = nextPermutation;

/* Python Solution:

def nextPermutation(nums):
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i+1]: i -= 1
    if i >= 0:
        j = n - 1
        while nums[j] <= nums[i]: j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i+1:] = reversed(nums[i+1:])

*/
