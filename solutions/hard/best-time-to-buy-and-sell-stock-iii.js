/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    if (!prices || prices.length <= 1) return 0;
    
    const n = prices.length;
    
    // Arrays to store maximum profit up to day i (left to right)
    const leftProfit = new Array(n).fill(0);
    // Arrays to store maximum profit from day i to end (right to left)
    const rightProfit = new Array(n).fill(0);
    
    // Forward pass: calculate max profit with one transaction up to each day
    let minPrice = prices[0];
    for (let i = 1; i < n; i++) {
        minPrice = Math.min(minPrice, prices[i]);
        leftProfit[i] = Math.max(leftProfit[i - 1], prices[i] - minPrice);
    }
    
    // Backward pass: calculate max profit with one transaction from each day to end
    let maxPrice = prices[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        maxPrice = Math.max(maxPrice, prices[i]);
        rightProfit[i] = Math.max(rightProfit[i + 1], maxPrice - prices[i]);
    }
    
    // Combine: maximum of left[i] + right[i] for all i
    let maxTotalProfit = 0;
    for (let i = 0; i < n; i++) {
        maxTotalProfit = Math.max(maxTotalProfit, leftProfit[i] + rightProfit[i]);
    }
    
    return maxTotalProfit;
};

// Test cases
console.log(maxProfit([3,3,5,0,0,3,1,4])); // 6
console.log(maxProfit([1,2,3,4,5])); // 4
console.log(maxProfit([7,6,4,3,1])); // 0
