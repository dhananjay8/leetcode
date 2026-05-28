/**
 * Dynamic Programming — 6 Core Problems
 *
 * Template (Bottom-up):
 *   dp = base cases
 *   for i in range(...):
 *     dp[i] = f(dp[i-1], dp[i-2], ...)
 *   return dp[n]
 *
 * Problems:
 *   LC 70  — Climbing Stairs (Easy)
 *   LC 198 — House Robber (Medium)
 *   LC 300 — Longest Increasing Subsequence (Medium)
 *   LC 322 — Coin Change (Medium)
 *   LC 1143 — Longest Common Subsequence (Medium)
 *   LC 416 — Partition Equal Subset Sum (Medium)
 */

// LC 70 — Climbing Stairs — O(n) time O(1) space
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const cur = prev1 + prev2;
    prev2 = prev1; prev1 = cur;
  }
  return prev1;
}

// LC 198 — House Robber — O(n) time O(1) space
function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n);
    prev2 = prev1; prev1 = cur;
  }
  return prev1;
}

// LC 300 — Longest Increasing Subsequence — O(n log n) with patience sort
function lengthOfLIS(nums) {
  const tails = []; // tails[i] = smallest tail of IS of length i+1
  for (const n of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < n) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = n; // replace or extend
  }
  return tails.length;
}

// LC 322 — Coin Change — O(amount * coins) time O(amount) space
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// LC 1143 — Longest Common Subsequence — O(m*n) time O(m*n) space
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = text1[i-1] === text2[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

// LC 416 — Partition Equal Subset Sum — O(n * sum/2) time/space
function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;

  // dp[j] = can we form sum j
  const dp = new Array(target + 1).fill(false);
  dp[0] = true;

  for (const n of nums) {
    for (let j = target; j >= n; j--) { // iterate backwards to avoid reuse
      dp[j] = dp[j] || dp[j - n];
    }
  }
  return dp[target];
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(climbStairs(10));                             // 89
console.log(rob([2,7,9,3,1]));                            // 12
console.log(lengthOfLIS([10,9,2,5,3,7,101,18]));         // 4
console.log(coinChange([1,5,11], 15));                    // 3
console.log(longestCommonSubsequence("abcde", "ace"));    // 3
console.log(canPartition([1,5,11,5]));                    // true
console.log(canPartition([1,2,3,5]));                     // false

module.exports = { climbStairs, rob, lengthOfLIS, coinChange, longestCommonSubsequence, canPartition };
