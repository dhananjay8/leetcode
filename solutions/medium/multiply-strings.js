/**
 * Problem: Multiply Strings
 * Link: https://leetcode.com/problems/multiply-strings/
 * Difficulty: Medium
 *
 * Multiply two non-negative integers represented as strings.
 *
 * Time Complexity: O(m * n)
 * Space Complexity: O(m + n)
 */

// JavaScript Solution - Grade school multiplication
function multiply(num1, num2) {
  if (num1 === '0' || num2 === '0') return '0';

  const m = num1.length, n = num2.length;
  const result = new Array(m + n).fill(0);

  // Multiply each digit pair and accumulate
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const prod = (num1[i] - '0') * (num2[j] - '0');
      const pos = i + j + 1; // position in result array
      const sum = prod + result[pos];
      result[pos] = sum % 10;         // current digit
      result[pos - 1] += Math.floor(sum / 10); // carry
    }
  }

  // Remove leading zeros and join
  let str = result.join('');
  while (str[0] === '0' && str.length > 1) str = str.slice(1);
  return str;
}

module.exports = multiply;

/* Python Solution:

def multiply(num1, num2):
    if num1 == '0' or num2 == '0': return '0'
    m, n = len(num1), len(num2)
    result = [0] * (m + n)
    
    for i in range(m-1, -1, -1):
        for j in range(n-1, -1, -1):
            prod = int(num1[i]) * int(num2[j])
            pos = i + j + 1
            total = prod + result[pos]
            result[pos] = total % 10
            result[pos-1] += total // 10
    
    res = ''.join(map(str, result)).lstrip('0')
    return res or '0'

*/
