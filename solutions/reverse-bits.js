/**
 * @param {number} n - a positive integer
 * @return {number} - a positive integer
 */
var reverseBits = function (n) {
  let res = 0;
  for (let i = 0; i < 32; i++) {
    let lsb = n & 1;
    let reverseLsb = lsb << (31 - i);
    res = res | reverseLsb;
    n = n >> 1;
  }
  return res >>> 0; // converts to unsigned int
};

/**
 * @param {number} n - a positive integer
 * @return {number} - a positive integer
 */
var reverseBitsAnotherApproach = function (n) {
  let ans = 0;
  for (let i = 0; i < 32; i++) {
    console.log(n, n % 2);
    ans = ans * 2 + (n % 2);
    n >>>= 1;
  }
  return ans;
};
