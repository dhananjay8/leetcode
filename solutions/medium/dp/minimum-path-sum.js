/**
 * Problem: Minimum Path Sum
 * Link: https://leetcode.com/problems/minimum-path-sum/
 * Difficulty: Medium
 *
 * Find path from top-left to bottom-right with minimum sum (move right or down).
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - DP
function minPathSum(grid) {
  const m = grid.length, n = grid[0].length;
  const dp = [...grid[0]]; // copy first row

  // Fill first row: can only come from left
  for (let c = 1; c < n; c++) dp[c] += dp[c - 1];

  for (let r = 1; r < m; r++) {
    dp[0] += grid[r][0]; // first col: can only come from above
    for (let c = 1; c < n; c++) {
      dp[c] = grid[r][c] + Math.min(dp[c], dp[c - 1]); // min(above, left)
    }
  }

  return dp[n - 1];
}

module.exports = minPathSum;

/* Python Solution:

def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    dp = list(grid[0])
    for c in range(1, n): dp[c] += dp[c-1]
    
    for r in range(1, m):
        dp[0] += grid[r][0]
        for c in range(1, n):
            dp[c] = grid[r][c] + min(dp[c], dp[c-1])
    
    return dp[-1]

*/
