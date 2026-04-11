/**
 * Problem: Single Number II
 * Link: https://leetcode.com/problems/single-number-ii/
 * Difficulty: Medium
 *
 * Every element appears three times except one. Find the single one.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Bit manipulation with ones/twos
function singleNumber(nums) {
  let ones = 0, twos = 0;

  for (const num of nums) {
    // 'ones' holds bits that appeared exactly 1 time
    // 'twos' holds bits that appeared exactly 2 times
    ones = (ones ^ num) & ~twos;
    twos = (twos ^ num) & ~ones;
  }

  return ones; // bits that appeared exactly once
}

module.exports = singleNumber;

/* Python Solution:

def singleNumber(nums):
    ones, twos = 0, 0
    for num in nums:
        ones = (ones ^ num) & ~twos
        twos = (twos ^ num) & ~ones
    return ones

*/
