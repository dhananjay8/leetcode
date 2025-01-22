/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function (nums) {
  let memo = new Array(nums.length).fill(-1);

  const dp = (i) => {
    if (i >= nums.length) return 0; // No more houses to rob
    if (memo[i] !== -1) return memo[i]; // Return cached result

    // Recurrence relation
    memo[i] = Math.max(dp(i + 1), nums[i] + dp(i + 2));
    return memo[i];
  };

  return dp(0);
};

var rob = function (nums) {
  if (nums.length === 0) return 0; // No houses to rob
  if (nums.length === 1) return nums[0]; // Only one house

  let prev2 = 0; // dp[i-2]
  let prev1 = 0; // dp[i-1]

  for (let i = 0; i < nums.length; i++) {
    let curr = Math.max(prev1, prev2 + nums[i]); // Max of robbing or skipping
    prev2 = prev1; // Update dp[i-2]
    prev1 = curr; // Update dp[i-1]
  }

  return prev1; // Maximum amount robbed
};
