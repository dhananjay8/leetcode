/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  if (!prices || prices.length <= 1) return 0;
  let currentMaxProfit = 0;
  let currentMinBuy = prices[0];
  for (const price of prices) {
    currentMinBuy = Math.min(currentMinBuy, price);
    currentMaxProfit = Math.max(currentMaxProfit, price - currentMinBuy);
  }
  return currentMaxProfit;
};
