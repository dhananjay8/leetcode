/**
 * Problem: Wildcard Matching
 * Link: https://leetcode.com/problems/wildcard-matching/
 * Difficulty: Hard
 *
 * '?' matches any single char, '*' matches any sequence (including empty).
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - DP
function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;

  // Initialize: pattern of all '*' matches empty string
  for (let j = 1; j <= n; j++) {
    if (p[j-1] === '*') dp[j] = dp[j-1];
    else break;
  }

  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; // dp[i-1][0]
    dp[0] = false;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (p[j-1] === '*') {
        dp[j] = dp[j-1] || dp[j]; // '*' matches empty or extends
      } else if (p[j-1] === '?' || s[i-1] === p[j-1]) {
        dp[j] = prev; // char match or '?'
      } else {
        dp[j] = false;
      }
      prev = temp;
    }
  }

  return dp[n];
}

module.exports = isMatch;

/* Python Solution:

def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [False] * (n + 1)
    dp[0] = True
    for j in range(1, n + 1):
        if p[j-1] == '*': dp[j] = dp[j-1]
        else: break
    
    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = False
        for j in range(1, n + 1):
            temp = dp[j]
            if p[j-1] == '*':
                dp[j] = dp[j-1] or dp[j]
            elif p[j-1] == '?' or s[i-1] == p[j-1]:
                dp[j] = prev
            else:
                dp[j] = False
            prev = temp
    
    return dp[n]

*/
