/**
 * @param {number} n
 * @return {number}
 */
var hammingWeight = function (n) {
  let count = 0; // Initialize a counter to keep track of set bits (1s)

  // Loop until all bits are processed
  while (n !== 0) {
    count += n & 1; // Add 1 to count if the least significant bit (LSB) is set (n & 1 checks LSB)
    n = n >>> 1; // Perform an unsigned right shift to process the next bit
  }

  return count; // Return the total count of set bits
};