/**
 * Problem: Best Time to Buy and Sell Stock
 * Link: https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
 * Difficulty: Easy
 *
 * You are given an array prices where prices[i] is the price of a stock on the ith day.
 * Find the maximum profit you can achieve. You may only buy once and sell once.
 *
 * Example:
 * Input: prices = [7,1,5,3,6,4]
 * Output: 5 (buy at 1, sell at 6)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - One Pass
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    // Update minimum price seen so far
    minPrice = Math.min(minPrice, price);
    // Calculate profit if we sell at current price
    maxProfit = Math.max(maxProfit, price - minPrice);
  }

  return maxProfit;
}

// Test cases
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
console.log(maxProfit([7, 6, 4, 3, 1])); // 0
console.log(maxProfit([2, 4, 1])); // 2

module.exports = maxProfit;

/* Python Solution (commented):

def max_profit(prices: list[int]) -> int:
    """
    Find maximum profit from single buy/sell transaction
    
    Args:
        prices: Array of stock prices
    
    Returns:
        Maximum profit
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    min_price = float('inf')
    max_profit = 0
    
    for price in prices:
        # Update minimum price
        min_price = min(min_price, price)
        # Update max profit
        max_profit = max(max_profit, price - min_price)
    
    return max_profit

# Test cases
print(max_profit([7,1,5,3,6,4]))  # 5
print(max_profit([7,6,4,3,1]))  # 0
print(max_profit([2,4,1]))  # 2

*/
