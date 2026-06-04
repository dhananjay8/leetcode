/**
 * @param {number} k
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(k, prices) {
    if (!prices || prices.length <= 1 || k === 0) return 0;
    
    const n = prices.length;
    
    // If k >= n/2, we can make as many transactions as we want
    // This reduces to the unlimited transactions problem
    if (k >= n / 2) {
        let profit = 0;
        for (let i = 1; i < n; i++) {
            if (prices[i] > prices[i - 1]) {
                profit += prices[i] - prices[i - 1];
            }
        }
        return profit;
    }
    
    // DP approach for limited transactions
    // dp[i][j][0/1] = max profit up to day i, with j transactions, holding (1) or not holding (0) stock
    const dp = new Array(n);
    for (let i = 0; i < n; i++) {
        dp[i] = new Array(k + 1);
        for (let j = 0; j <= k; j++) {
            dp[i][j] = new Array(2).fill(0);
        }
    }
    
    // Initialize: on day 0, holding stock means we bought it
    for (let j = 1; j <= k; j++) {
        dp[0][j][1] = -prices[0];
    }
    
    for (let i = 1; i < n; i++) {
        for (let j = 1; j <= k; j++) {
            // Not holding stock on day i: either didn't hold yesterday, or sold today
            dp[i][j][0] = Math.max(dp[i - 1][j][0], dp[i - 1][j][1] + prices[i]);
            
            // Holding stock on day i: either held yesterday, or bought today
            dp[i][j][1] = Math.max(dp[i - 1][j][1], dp[i - 1][j - 1][0] - prices[i]);
        }
    }
    
    // Result: maximum profit on last day, with k transactions, not holding stock
    return dp[n - 1][k][0];
};

// Test cases
console.log(maxProfit(2, [2,4,1])); // 2
console.log(maxProfit(2, [3,2,6,5,0,3])); // 7
console.log(maxProfit(2, [3,3,5,0,0,3,1,4])); // 6
