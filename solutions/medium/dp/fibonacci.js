//Bottom-Up (Tabulation)
var fib = function (n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
};

// Top-Down (Memoization)
var fib = function (n) {
  const memo = {};

  const dp = (k) => {
    if (k <= 1) return k;
    if (k in memo) return memo[k];
    memo[k] = dp(k - 1) + dp(k - 2);
    return memo[k];
  };

  return dp(n);
};
