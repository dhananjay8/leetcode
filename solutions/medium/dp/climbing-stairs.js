/**
 * @param {number} n
 * @return {number}
 */
// This formula is derived from the fact that to reach the current step, you can either:
// Take a single step from the previous step (prev1), or
// Take a double step from the step before the previous step (prev2).
var climbStairs = function (n) {
  return n <= 3 ? n : 2 * climbStairs(n - 2) + climbStairs(n - 3);
};

// class Solution:
//     def climbStairs(self, n: int) -> int:
//         if n == 0 or n == 1:
//             return 1

//         dp = [0] * (n+1)
//         dp[0] = dp[1] = 1

//         for i in range(2, n+1):
//             dp[i] = dp[i-1] + dp[i-2]
//         return dp[n]
