/**
 * Problem: Bitwise AND of Numbers Range
 * Link: https://leetcode.com/problems/bitwise-and-of-numbers-range/
 * Difficulty: Medium
 *
 * Return bitwise AND of all numbers in [left, right].
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Find common prefix of binary representations
function rangeBitwiseAnd(left, right) {
  let shift = 0;
  // Right shift until both numbers are equal (find common prefix)
  while (left < right) {
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left << shift; // shift back to get the result
}

module.exports = rangeBitwiseAnd;

/* Python Solution:

def rangeBitwiseAnd(left, right):
    shift = 0
    while left < right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift

*/
