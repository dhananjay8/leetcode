/**
 * Problem: Min Cost Climbing Stairs
 * Link: https://leetcode.com/problems/min-cost-climbing-stairs/
 * Difficulty: Medium
 *
 * Each step has a cost. You can start from step 0 or 1. Each time climb 1 or 2 steps.
 * Find minimum cost to reach the top.
 *
 * Example: cost = [10,15,20] => 15 (start at index 1, pay 15, climb 2 steps)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - DP with constant space
function minCostClimbingStairs(cost) {
  let prev2 = 0; // cost to reach 2 steps back
  let prev1 = 0; // cost to reach 1 step back

  for (let i = 2; i <= cost.length; i++) {
    const current = Math.min(
      prev1 + cost[i - 1], // come from 1 step back
      prev2 + cost[i - 2]  // come from 2 steps back
    );
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

module.exports = minCostClimbingStairs;

/* Python Solution:

def minCostClimbingStairs(cost):
    prev2, prev1 = 0, 0
    
    for i in range(2, len(cost) + 1):
        current = min(prev1 + cost[i-1], prev2 + cost[i-2])
        prev2, prev1 = prev1, current
    
    return prev1

*/
