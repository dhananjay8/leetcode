/**
 * Problem: Interleaving String
 * Link: https://leetcode.com/problems/interleaving-string/
 * Difficulty: Medium
 *
 * Check if s3 is formed by interleaving s1 and s2.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution — DP
function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;

  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  // Base: match s2 only
  for (let j = 1; j <= n; j++) dp[j] = dp[j-1] && s2[j-1] === s3[j-1];

  for (let i = 1; i <= m; i++) {
    dp[0] = dp[0] && s1[i-1] === s3[i-1]; // match s1 only
    for (let j = 1; j <= n; j++) {
      dp[j] = (dp[j] && s1[i-1] === s3[i+j-1]) ||   // take from s1
              (dp[j-1] && s2[j-1] === s3[i+j-1]);     // take from s2
    }
  }

  return dp[n];
}

module.exports = isInterleave;

/* Python Solution:

def isInterleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3): return False
    
    dp = [False] * (n + 1)
    dp[0] = True
    for j in range(1, n+1): dp[j] = dp[j-1] and s2[j-1] == s3[j-1]
    
    for i in range(1, m+1):
        dp[0] = dp[0] and s1[i-1] == s3[i-1]
        for j in range(1, n+1):
            dp[j] = (dp[j] and s1[i-1] == s3[i+j-1]) or \
                    (dp[j-1] and s2[j-1] == s3[i+j-1])
    return dp[n]

*/
