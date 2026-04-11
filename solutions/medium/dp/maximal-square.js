/**
 * Problem: Maximal Square
 * Link: https://leetcode.com/problems/maximal-square/
 * Difficulty: Medium
 *
 * Find the largest square containing only 1's and return its area.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - DP
function maximalSquare(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const dp = new Array(n + 1).fill(0);
  let maxSide = 0, prev = 0;

  for (let r = 1; r <= m; r++) {
    for (let c = 1; c <= n; c++) {
      const temp = dp[c];
      if (matrix[r-1][c-1] === '1') {
        // min of top, left, top-left diagonal + 1
        dp[c] = Math.min(dp[c], dp[c-1], prev) + 1;
        maxSide = Math.max(maxSide, dp[c]);
      } else {
        dp[c] = 0;
      }
      prev = temp;
    }
    prev = 0; // reset for new row
  }

  return maxSide * maxSide;
}

module.exports = maximalSquare;

/* Python Solution:

def maximalSquare(matrix):
    m, n = len(matrix), len(matrix[0])
    dp = [0] * (n + 1)
    max_side = 0
    prev = 0
    
    for r in range(1, m + 1):
        for c in range(1, n + 1):
            temp = dp[c]
            if matrix[r-1][c-1] == '1':
                dp[c] = min(dp[c], dp[c-1], prev) + 1
                max_side = max(max_side, dp[c])
            else:
                dp[c] = 0
            prev = temp
        prev = 0
    
    return max_side ** 2

*/
