/**
 * Problem: String to Integer (atoi)
 * Link: https://leetcode.com/problems/string-to-integer-atoi/
 * Difficulty: Medium
 *
 * Implement atoi: parse string to 32-bit signed integer.
 * Handle: whitespace, sign, non-digit chars, overflow.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution
function myAtoi(s) {
  const INT_MAX = 2147483647, INT_MIN = -2147483648;
  let i = 0, sign = 1, result = 0;

  // Step 1: Skip whitespace
  while (i < s.length && s[i] === ' ') i++;

  // Step 2: Handle sign
  if (i < s.length && (s[i] === '+' || s[i] === '-')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }

  // Step 3: Parse digits
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    const digit = s[i] - '0';
    // Step 4: Overflow check
    if (result > Math.floor((INT_MAX - digit) / 10)) {
      return sign === 1 ? INT_MAX : INT_MIN;
    }
    result = result * 10 + digit;
    i++;
  }

  return sign * result;
}

module.exports = myAtoi;

/* Python Solution:

def myAtoi(s):
    INT_MAX, INT_MIN = 2**31 - 1, -(2**31)
    s = s.lstrip()
    if not s: return 0
    
    sign, i = 1, 0
    if s[0] in ('+', '-'):
        sign = -1 if s[0] == '-' else 1
        i = 1
    
    result = 0
    while i < len(s) and s[i].isdigit():
        result = result * 10 + int(s[i])
        i += 1
    
    result *= sign
    return max(INT_MIN, min(INT_MAX, result))

*/
