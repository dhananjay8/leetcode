/**
 * Problem: Best Time to Buy and Sell Stock II
 * Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/
 * Difficulty: Medium
 *
 * You are given an array prices where prices[i] is the price of a stock on the ith day.
 * Find the maximum profit you can achieve. You may complete as many transactions as you like.
 *
 * Example:
 * Input: prices = [7,1,5,3,6,4]
 * Output: 7 (buy at 1, sell at 5, buy at 3, sell at 6)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Peak Valley Approach
function maxProfit(prices) {
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    // Add profit whenever there's an increase
    if (prices[i] > prices[i - 1]) {
      maxProfit += prices[i] - prices[i - 1];
    }
  }

  return maxProfit;
}

// Alternative: Peak and Valley approach (more explicit)
function maxProfitPeakValley(prices) {
  let i = 0;
  let maxProfit = 0;
  const n = prices.length;

  while (i < n - 1) {
    // Find valley (local minimum)
    while (i < n - 1 && prices[i] >= prices[i + 1]) {
      i++;
    }
    const valley = prices[i];

    // Find peak (local maximum)
    while (i < n - 1 && prices[i] <= prices[i + 1]) {
      i++;
    }
    const peak = prices[i];

    maxProfit += peak - valley;
  }

  return maxProfit;
}

// Test cases
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 7
console.log(maxProfit([1, 2, 3, 4, 5])); // 4
console.log(maxProfit([7, 6, 4, 3, 1])); // 0

module.exports = maxProfit;

/* Python Solution (commented):

def max_profit(prices: list[int]) -> int:
    """
    Find maximum profit with unlimited transactions
    
    Args:
        prices: Array of stock prices
    
    Returns:
        Maximum profit
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    max_profit = 0
    
    for i in range(1, len(prices)):
        # Add profit for every upward movement
        if prices[i] > prices[i - 1]:
            max_profit += prices[i] - prices[i - 1]
    
    return max_profit

# Alternative: Peak and Valley
def max_profit_peak_valley(prices: list[int]) -> int:
    i = 0
    max_profit = 0
    n = len(prices)
    
    while i < n - 1:
        # Find valley
        while i < n - 1 and prices[i] >= prices[i + 1]:
            i += 1
        valley = prices[i]
        
        # Find peak
        while i < n - 1 and prices[i] <= prices[i + 1]:
            i += 1
        peak = prices[i]
        
        max_profit += peak - valley
    
    return max_profit

# Test cases
print(max_profit([7,1,5,3,6,4]))  # 7
print(max_profit([1,2,3,4,5]))  # 4
print(max_profit([7,6,4,3,1]))  # 0

*/
