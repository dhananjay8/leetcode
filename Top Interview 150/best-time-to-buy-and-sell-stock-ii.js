/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function (prices) {
  if (prices.length == 1) return 0;
  let currProf = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      currProf += prices[i] - prices[i - 1];
    }
  }
  return currProf;
};
