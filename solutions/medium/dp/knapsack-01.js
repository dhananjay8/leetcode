/**
 * Problem: 0/1 Knapsack Problem
 * Classic DP problem (not on LeetCode directly, but fundamental)
 *
 * Given weights and values of n items, find max value in a knapsack of capacity W.
 * Each item can be included at most once.
 *
 * Time Complexity: O(n * W)
 * Space Complexity: O(W)
 */

// JavaScript Solution - DP
function knapsack(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // Iterate backwards so each item is used at most once
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}

// Test
console.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9

module.exports = knapsack;

/* Python Solution:

def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    
    for i in range(len(weights)):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

# Test
print(knapsack([1,3,4,5], [1,4,5,7], 7))  # 9

*/
