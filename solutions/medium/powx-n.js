/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function(x, n) {
    // Handle edge case where n is 0
    if (n === 0) return 1;
    
    // Handle negative exponent
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    
    // Fast exponentiation using divide and conquer
    function fastPow(x, n) {
        // Base case
        if (n === 0) return 1;
        
        // Recursive case: compute x^(n/2)
        const half = fastPow(x, Math.floor(n / 2));
        
        // If n is even: x^n = (x^(n/2))^2
        // If n is odd: x^n = x * (x^((n-1)/2))^2
        if (n % 2 === 0) {
            return half * half;
        } else {
            return half * half * x;
        }
    }
    
    return fastPow(x, n);
};

// Test cases
console.log(myPow(2.00000, 10)); // 1024.00000
console.log(myPow(2.10000, 3)); // 9.26100
console.log(myPow(2.00000, -2)); // 0.25000
console.log(myPow(1.00000, 2147483647)); // 1.00000
