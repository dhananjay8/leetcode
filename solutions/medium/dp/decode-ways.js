/**
 * Problem: Decode Ways
 * Link: https://leetcode.com/problems/decode-ways/
 * Difficulty: Medium
 *
 * '1'->'A', '2'->'B', ..., '26'->'Z'. Count ways to decode a digit string.
 *
 * Example: "226" => 3 ("BZ", "VF", "BBF")
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - DP
function numDecodings(s) {
  if (s[0] === '0') return 0;

  let prev2 = 1; // ways to decode empty string
  let prev1 = 1; // ways to decode first char

  for (let i = 1; i < s.length; i++) {
    let curr = 0;
    // Single digit decode (1-9)
    if (s[i] !== '0') curr += prev1;
    // Two digit decode (10-26)
    const twoDigit = parseInt(s.substring(i - 1, i + 1));
    if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;

    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

module.exports = numDecodings;

/* Python Solution:

def numDecodings(s):
    if s[0] == '0': return 0
    prev2, prev1 = 1, 1
    
    for i in range(1, len(s)):
        curr = 0
        if s[i] != '0': curr += prev1          # single digit
        two = int(s[i-1:i+1])
        if 10 <= two <= 26: curr += prev2       # two digits
        prev2, prev1 = prev1, curr
    
    return prev1

*/
