/**
 * Problem: Palindrome Partitioning
 * Link: https://leetcode.com/problems/palindrome-partitioning/
 * Difficulty: Medium
 *
 * Partition string so every substring is a palindrome.
 *
 * Example: "aab" => [["a","a","b"],["aa","b"]]
 *
 * Time Complexity: O(n * 2^n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Backtracking
function partition(s) {
  const result = [];

  function backtrack(start, current) {
    if (start === s.length) { result.push([...current]); return; }

    for (let end = start; end < s.length; end++) {
      if (isPalindrome(s, start, end)) {
        current.push(s.substring(start, end + 1));
        backtrack(end + 1, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return result;
}

function isPalindrome(s, l, r) {
  while (l < r) {
    if (s[l++] !== s[r--]) return false;
  }
  return true;
}

module.exports = partition;

/* Python Solution:

def partition(s):
    result = []
    
    def is_palindrome(sub):
        return sub == sub[::-1]
    
    def backtrack(start, current):
        if start == len(s):
            result.append(list(current))
            return
        for end in range(start, len(s)):
            sub = s[start:end+1]
            if is_palindrome(sub):
                current.append(sub)
                backtrack(end + 1, current)
                current.pop()
    
    backtrack(0, [])
    return result

*/
