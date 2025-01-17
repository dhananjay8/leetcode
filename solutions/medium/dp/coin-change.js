/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */

// 1.	Initialization:
    // •	Create a dp array of size amount + 1 initialized with Infinity.
    // •	dp[0] is set to 0 because no coins are needed to make an amount of 0.
// 2.	Dynamic Programming Transition:
    // •	For each coin, iterate over possible values starting from the coin’s value to amount.
    // •	Update dp[value] as the minimum of its current value or dp[value - coin] + 1.
// 3.	Result:
    // •	If dp[amount] is still Infinity, it means it’s not possible to make that amount, so return -1.
    // •	Otherwise, return the value at dp[amount], which represents the minimum number of coins needed.
    
var coinChange = function (coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; // Base case: 0 coins needed for amount 0

  for (const coin of coins) {
    for (let value = coin; value <= amount; value++) {
      dp[value] = Math.min(dp[value], dp[value - coin] + 1);
    }
  }

  console.log(dp);
  return dp[amount] === Infinity ? -1 : dp[amount];
};

// class Solution:
//     def coinChange(self, coins: List[int], amount: int) -> int:
//         dp = [float('inf')] * (amount+1)
//         dp[0] = 0
//         for coin in coins:
//             for value in range(coin, amount+1):
//                 dp[value] = min(dp[value], dp[value-coin]+1)
//         print(dp)
//         return dp[amount] if dp[amount] != float('inf') else -1
