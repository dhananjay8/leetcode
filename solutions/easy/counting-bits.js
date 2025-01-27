/**
 * @param {number} n
 * @return {number[]}
 */
var countBits = function (n) {
  let ans = new Array(n + 1).fill(0); // Initialize an array of size n+1 with zeros

  for (let i = 1; i <= n; i++) {
    ans[i] = ans[i >> 1] + (i & 1); // Use previously computed values and bit manipulation
  }

  return ans; // Return the final array
};
