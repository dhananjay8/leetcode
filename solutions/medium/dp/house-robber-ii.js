/**
 * Problem: House Robber II
 * Link: https://leetcode.com/problems/house-robber-ii/
 * Difficulty: Medium
 *
 * Houses in a circle. Can't rob two adjacent houses. Maximize total.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Run House Robber I twice (skip first or last)
function rob(nums) {
  if (nums.length === 1) return nums[0];

  // Rob houses 0..n-2 OR houses 1..n-1
  return Math.max(robLinear(nums, 0, nums.length - 2), robLinear(nums, 1, nums.length - 1));
}

function robLinear(nums, start, end) {
  let prev2 = 0, prev1 = 0;
  for (let i = start; i <= end; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

module.exports = rob;

/* Python Solution:

def rob(nums):
    if len(nums) == 1: return nums[0]
    
    def rob_linear(start, end):
        prev2, prev1 = 0, 0
        for i in range(start, end + 1):
            prev2, prev1 = prev1, max(prev1, prev2 + nums[i])
        return prev1
    
    return max(rob_linear(0, len(nums)-2), rob_linear(1, len(nums)-1))

*/
