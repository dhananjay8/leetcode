/**
 * Problem: Divide Two Integers
 * Link: https://leetcode.com/problems/divide-two-integers/
 * Difficulty: Medium
 *
 * Divide without multiplication, division, or mod operator.
 *
 * Time Complexity: O(log^2 n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Bit shifting (repeated doubling)
function divide(dividend, divisor) {
  const MAX = 2147483647, MIN = -2147483648;
  if (dividend === MIN && divisor === -1) return MAX; // overflow case

  const negative = (dividend > 0) !== (divisor > 0);
  let a = Math.abs(dividend), b = Math.abs(divisor);
  let result = 0;

  while (a >= b) {
    let temp = b, multiple = 1;
    // Double the divisor until it exceeds dividend
    while (a >= (temp << 1) && (temp << 1) > 0) {
      temp <<= 1;
      multiple <<= 1;
    }
    a -= temp;
    result += multiple;
  }

  return negative ? -result : result;
}

module.exports = divide;

/* Python Solution:

def divide(dividend, divisor):
    MAX = 2**31 - 1
    MIN = -2**31
    if dividend == MIN and divisor == -1: return MAX
    
    negative = (dividend > 0) != (divisor > 0)
    a, b = abs(dividend), abs(divisor)
    result = 0
    
    while a >= b:
        temp, multiple = b, 1
        while a >= (temp << 1):
            temp <<= 1
            multiple <<= 1
        a -= temp
        result += multiple
    
    return -result if negative else result

*/
