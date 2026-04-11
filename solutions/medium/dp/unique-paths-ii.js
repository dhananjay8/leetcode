/**
 * Problem: Unique Paths II
 * Link: https://leetcode.com/problems/unique-paths-ii/
 * Difficulty: Medium
 *
 * Same as Unique Paths but with obstacles (1 = obstacle).
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - DP
function uniquePathsWithObstacles(obstacleGrid) {
  const n = obstacleGrid[0].length;
  const dp = new Array(n).fill(0);
  dp[0] = 1; // start position

  for (let r = 0; r < obstacleGrid.length; r++) {
    for (let c = 0; c < n; c++) {
      if (obstacleGrid[r][c] === 1) {
        dp[c] = 0; // obstacle, no paths through here
      } else if (c > 0) {
        dp[c] += dp[c - 1]; // paths from above + from left
      }
    }
  }

  return dp[n - 1];
}

module.exports = uniquePathsWithObstacles;

/* Python Solution:

def uniquePathsWithObstacles(obstacleGrid):
    n = len(obstacleGrid[0])
    dp = [0] * n
    dp[0] = 1
    
    for row in obstacleGrid:
        for c in range(n):
            if row[c] == 1:
                dp[c] = 0
            elif c > 0:
                dp[c] += dp[c-1]
    
    return dp[-1]

*/
