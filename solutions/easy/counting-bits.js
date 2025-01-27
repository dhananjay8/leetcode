/**
 * @param {number} n
 * @return {number[]}
 */
var countBits = function (n) {
  let ans = new Array(n + 1).fill(0); // Initialize an array of size n+1 with zeros

  for (let i = 1; i <= n; i++) {
    //  1.	i >> 1 (Right Shift by 1):
    // 	•	This removes the least significant bit (LSB) of i.
    // 	•	For example:
    // 	•	i = 5 (binary: 101) becomes i >> 1 = 2 (binary: 10).
    // The value ans[i >> 1] gives the count of set bits for i without considering the LSB.
    // 	2.	i & 1 (Check LSB):
    // 	•	This extracts the LSB of i.
    // 	•	If i & 1 is 1, the LSB is set (there’s an additional 1 in i); otherwise, it’s 0.
    // 	3.	Combining the Two:
    // 	•	ans[i >> 1] gives the count of set bits in i excluding the LSB.
    // 	•	(i & 1) adds 1 to the count if the LSB is set.
    // 	•	Adding these together gives the total count of set bits in i.
    ans[i] = ans[i >> 1] + (i & 1); // Use previously computed values and bit manipulation
  }

  return ans; // Return the final array
};