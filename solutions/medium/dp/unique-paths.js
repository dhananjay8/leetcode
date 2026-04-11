/**
 * Problem: Unique Paths
 * Link: https://leetcode.com/problems/unique-paths/
 * Difficulty: Medium
 *
 * Robot at top-left, can only move right or down. Count paths to bottom-right.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n) optimized
 */

// JavaScript Solution - DP
function uniquePaths(m, n) {
  const dp = new Array(n).fill(1); // first row is all 1s

  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      dp[c] += dp[c - 1]; // dp[c] = from_above + from_left
    }
  }

  return dp[n - 1];
}

module.exports = uniquePaths;

/* Python Solution:

def uniquePaths(m, n):
    dp = [1] * n
    for r in range(1, m):
        for c in range(1, n):
            dp[c] += dp[c-1]
    return dp[-1]

*/
