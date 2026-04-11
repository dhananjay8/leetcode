/**
 * Problem: Edit Distance
 * Link: https://leetcode.com/problems/edit-distance/
 * Difficulty: Hard
 *
 * Min operations (insert, delete, replace) to convert word1 to word2.
 *
 * Example: "horse", "ros" => 3
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - DP
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array.from({ length: n + 1 }, (_, j) => j); // base: convert "" to word2[0..j]

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i; // converting word1[0..i] to ""
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (word1[i-1] === word2[j-1]) {
        dp[j] = prev; // characters match, no operation needed
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j-1]); // replace, delete, insert
      }
      prev = temp;
    }
  }

  return dp[n];
}

module.exports = minDistance;

/* Python Solution:

def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    dp = list(range(n + 1))
    
    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, n + 1):
            temp = dp[j]
            if word1[i-1] == word2[j-1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j-1])
            prev = temp
    
    return dp[n]

*/
