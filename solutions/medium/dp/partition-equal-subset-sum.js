/**
 * Problem: Partition Equal Subset Sum
 * Link: https://leetcode.com/problems/partition-equal-subset-sum/
 * Difficulty: Medium
 *
 * Determine if array can be partitioned into two subsets with equal sum.
 *
 * Time Complexity: O(n * target)
 * Space Complexity: O(target)
 */

// JavaScript Solution - DP (0/1 Knapsack variant)
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false; // odd sum can't be split equally

  const target = total / 2;
  const dp = new Array(target + 1).fill(false);
  dp[0] = true; // sum of 0 is always achievable

  for (const num of nums) {
    // Iterate backwards to avoid using same element twice
    for (let s = target; s >= num; s--) {
      dp[s] = dp[s] || dp[s - num];
    }
  }

  return dp[target];
}

module.exports = canPartition;

/* Python Solution:

def canPartition(nums):
    total = sum(nums)
    if total % 2 != 0: return False
    
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    
    for num in nums:
        for s in range(target, num - 1, -1):
            dp[s] = dp[s] or dp[s - num]
    
    return dp[target]

*/
