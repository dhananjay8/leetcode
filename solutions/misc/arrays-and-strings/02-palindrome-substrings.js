/**
 * Find All Palindrome Substrings
 *
 * Problem: Find all substrings that are palindromes
 *
 * Approach:
 * - Expand around center for each possible center
 * - Consider both odd and even length palindromes
 * - Time Complexity: O(n²), Space Complexity: O(n²) for storing results
 */

// JavaScript Solution
function findAllPalindromes(s) {
  const palindromes = new Set();

  // Helper function to expand around center
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      // Add palindrome to set
      palindromes.add(s.substring(left, right + 1));
      left--;
      right++;
    }
  }

  // Check for palindromes centered at each position
  for (let i = 0; i < s.length; i++) {
    // Odd length palindromes (center is single character)
    expandAroundCenter(i, i);
    // Even length palindromes (center is between two characters)
    expandAroundCenter(i, i + 1);
  }

  return Array.from(palindromes);
}

// Count palindromic substrings
function countPalindromes(s) {
  let count = 0;

  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      count++;
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i); // Odd length
    expandAroundCenter(i, i + 1); // Even length
  }

  return count;
}

// Example usage
console.log(findAllPalindromes("abc")); // ["a", "b", "c"]
console.log(findAllPalindromes("aaa")); // ["a", "aa", "aaa"]
console.log(countPalindromes("abc")); // 3
console.log(countPalindromes("aaa")); // 6

/*
Python Solution:

def find_all_palindromes(s):
    """
    Find all palindromic substrings in a string
    
    Args:
        s: Input string
    Returns:
        List of all palindromic substrings
    """
    palindromes = set()
    
    def expand_around_center(left, right):
        """Expand around center to find palindromes"""
        while left >= 0 and right < len(s) and s[left] == s[right]:
            # Add palindrome to set
            palindromes.add(s[left:right + 1])
            left -= 1
            right += 1
    
    # Check for palindromes centered at each position
    for i in range(len(s)):
        # Odd length palindromes
        expand_around_center(i, i)
        # Even length palindromes
        expand_around_center(i, i + 1)
    
    return list(palindromes)

def count_palindromes(s):
    """Count all palindromic substrings"""
    count = 0
    
    def expand_around_center(left, right):
        nonlocal count
        while left >= 0 and right < len(s) and s[left] == s[right]:
            count += 1
            left -= 1
            right += 1
    
    for i in range(len(s)):
        expand_around_center(i, i)
        expand_around_center(i, i + 1)
    
    return count

# Example usage
print(find_all_palindromes("abc"))  # ['a', 'b', 'c']
print(find_all_palindromes("aaa"))  # ['a', 'aa', 'aaa']
print(count_palindromes("abc"))  # 3
print(count_palindromes("aaa"))  # 6
*/

module.exports = { findAllPalindromes, countPalindromes };
