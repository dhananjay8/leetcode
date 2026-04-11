/**
 * Problem: Palindromic Substrings
 * Link: https://leetcode.com/problems/palindromic-substrings/
 * Difficulty: Medium
 *
 * Count the number of palindromic substrings.
 *
 * Example: "aaa" => 6 ("a","a","a","aa","aa","aaa")
 *
 * Time Complexity: O(n^2)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Expand Around Center
function countSubstrings(s) {
  let count = 0;

  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++;
      left--; right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);     // odd-length palindromes
    expandAroundCenter(i, i + 1); // even-length palindromes
  }

  return count;
}

module.exports = countSubstrings;

/* Python Solution:

def countSubstrings(s):
    count = 0
    
    def expand(left, right):
        nonlocal count
        while left >= 0 and right < len(s) and s[left] == s[right]:
            count += 1
            left -= 1; right += 1
    
    for i in range(len(s)):
        expand(i, i)      # odd
        expand(i, i + 1)  # even
    
    return count

*/
