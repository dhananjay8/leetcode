/**
 * Problem: Longest Common Subsequence
 * Link: https://leetcode.com/problems/longest-common-subsequence/
 * Difficulty: Medium
 *
 * Find the length of the longest subsequence common to both strings.
 *
 * Example: "abcde", "ace" => 3 ("ace")
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n) optimized
 */

// JavaScript Solution - DP
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    let prev = 0; // dp[i-1][j-1]
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (text1[i-1] === text2[j-1]) {
        dp[j] = prev + 1; // characters match
      } else {
        dp[j] = Math.max(dp[j], dp[j-1]); // skip one char from either string
      }
      prev = temp;
    }
  }

  return dp[n];
}

module.exports = longestCommonSubsequence;

/* Python Solution:

def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [0] * (n + 1)
    
    for i in range(1, m + 1):
        prev = 0
        for j in range(1, n + 1):
            temp = dp[j]
            if text1[i-1] == text2[j-1]:
                dp[j] = prev + 1
            else:
                dp[j] = max(dp[j], dp[j-1])
            prev = temp
    
    return dp[n]

*/
