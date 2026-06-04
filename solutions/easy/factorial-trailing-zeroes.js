/**
 * @param {number} n
 * @return {number}
 */
var trailingZeroes = function(n) {
    let count = 0;
    
    // Count the number of factors of 5 in n!
    // Each factor of 5 pairs with a factor of 2 to make a trailing zero
    // There are always more factors of 2 than 5, so we just count 5s
    while (n > 0) {
        n = Math.floor(n / 5);
        count += n;
    }
    
    return count;
};

// Test cases
console.log(trailingZeroes(3)); // 0
console.log(trailingZeroes(5)); // 1
console.log(trailingZeroes(10)); // 2
console.log(trailingZeroes(25)); // 6
console.log(trailingZeroes(100)); // 24
