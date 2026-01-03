/**
 * Problem: Is Subsequence
 * Link: https://leetcode.com/problems/is-subsequence/
 * Difficulty: Easy
 *
 * Given two strings s and t, return true if s is a subsequence of t, or false otherwise.
 * A subsequence is a new string formed from the original string by deleting some (can be none)
 * characters without disturbing the relative positions of the remaining characters.
 *
 * Example:
 * Input: s = "abc", t = "ahbgdc"
 * Output: true
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers
function isSubsequence(s, t) {
  let i = 0; // Pointer for s
  let j = 0; // Pointer for t

  while (i < s.length && j < t.length) {
    if (s[i] === t[j]) {
      i++;
    }
    j++;
  }

  return i === s.length;
}

// Alternative: Single pointer approach
function isSubsequenceSinglePointer(s, t) {
  let sIndex = 0;

  for (const char of t) {
    if (sIndex < s.length && char === s[sIndex]) {
      sIndex++;
    }
  }

  return sIndex === s.length;
}

// Test cases
console.log(isSubsequence("abc", "ahbgdc")); // true
console.log(isSubsequence("axc", "ahbgdc")); // false
console.log(isSubsequence("", "ahbgdc")); // true
console.log(isSubsequence("abc", "")); // false

module.exports = isSubsequence;

/* Python Solution (commented):

def is_subsequence(s: str, t: str) -> bool:
    """
    Check if s is subsequence of t
    
    Args:
        s: Potential subsequence
        t: Main string
    
    Returns:
        True if s is subsequence of t
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    i = 0  # Pointer for s
    j = 0  # Pointer for t
    
    while i < len(s) and j < len(t):
        if s[i] == t[j]:
            i += 1
        j += 1
    
    return i == len(s)

# Alternative: Using iterator
def is_subsequence_iter(s: str, t: str) -> bool:
    t_iter = iter(t)
    return all(char in t_iter for char in s)

# Alternative: Single pointer
def is_subsequence_single(s: str, t: str) -> bool:
    s_index = 0
    
    for char in t:
        if s_index < len(s) and char == s[s_index]:
            s_index += 1
    
    return s_index == len(s)

# Test cases
print(is_subsequence("abc", "ahbgdc"))  # True
print(is_subsequence("axc", "ahbgdc"))  # False
print(is_subsequence("", "ahbgdc"))  # True
print(is_subsequence("abc", ""))  # False

*/
