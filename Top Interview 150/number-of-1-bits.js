/**
 * @param {number} n - a positive integer
 * @return {number}
 */
var hammingWeight = function (n) {
  let count = 0;
  for (let i = 0; i < 32; i++) {
    // prettier-ignore
    if (n &1 === 1) count++;
    // Shift number to left by 1 i.e. devide by 2
    n = n >> 1;
  }
  return count;
};
