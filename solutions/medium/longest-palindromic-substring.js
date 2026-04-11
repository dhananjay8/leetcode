/**
 * Problem: Longest Palindromic Substring
 * Link: https://leetcode.com/problems/longest-palindromic-substring/
 * Difficulty: Medium
 *
 * Return the longest palindromic substring.
 *
 * Example: "babad" => "bab" or "aba"
 *
 * Time Complexity: O(n^2)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Expand Around Center
function longestPalindrome(s) {
  let start = 0, maxLen = 0;

  function expand(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      if (right - left + 1 > maxLen) {
        start = left;
        maxLen = right - left + 1;
      }
      left--; right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // odd-length palindromes
    expand(i, i + 1); // even-length palindromes
  }

  return s.substring(start, start + maxLen);
}

module.exports = longestPalindrome;

/* Python Solution:

def longestPalindrome(s):
    start, max_len = 0, 0
    
    def expand(left, right):
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left + 1 > max_len:
                start, max_len = left, right - left + 1
            left -= 1; right += 1
    
    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)
    
    return s[start:start + max_len]

*/
