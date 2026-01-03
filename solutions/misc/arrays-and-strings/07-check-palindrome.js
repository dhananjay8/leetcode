/**
 * Check if String is Palindrome
 *
 * Problem: Determine if a string reads the same forwards and backwards
 *
 * Approaches:
 * 1. Two pointers
 * 2. Reverse and compare
 * 3. Recursive approach
 * Time Complexity: O(n), Space Complexity: O(1) for two pointers
 */

// JavaScript Solution

// Approach 1: Two pointers (most efficient)
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// Approach 2: With alphanumeric filtering (ignore non-alphanumeric)
function isPalindromeAlphanumeric(s) {
  // Convert to lowercase and remove non-alphanumeric characters
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, "");

  let left = 0;
  let right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// Approach 3: Reverse and compare
function isPalindromeReverse(s) {
  const reversed = s.split("").reverse().join("");
  return s === reversed;
}

// Approach 4: Recursive
function isPalindromeRecursive(s, left = 0, right = s.length - 1) {
  // Base case: pointers meet or cross
  if (left >= right) {
    return true;
  }

  // Check if characters match
  if (s[left] !== s[right]) {
    return false;
  }

  // Recurse with updated pointers
  return isPalindromeRecursive(s, left + 1, right - 1);
}

// Check if number is palindrome
function isPalindromeNumber(num) {
  if (num < 0) return false;

  const str = num.toString();
  return isPalindrome(str);
}

// Find longest palindrome substring
function longestPalindrome(s) {
  if (s.length < 2) return s;

  let start = 0;
  let maxLen = 1;

  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const len = right - left + 1;
      if (len > maxLen) {
        start = left;
        maxLen = len;
      }
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i); // Odd length
    expandAroundCenter(i, i + 1); // Even length
  }

  return s.substring(start, start + maxLen);
}

// Example usage
console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello")); // false
console.log(isPalindromeAlphanumeric("A man, a plan, a canal: Panama")); // true
console.log(isPalindromeRecursive("madam")); // true
console.log(isPalindromeNumber(12321)); // true
console.log(longestPalindrome("babad")); // "bab" or "aba"

/*
Python Solution:

def is_palindrome(s):
    """
    Check if string is palindrome using two pointers
    
    Args:
        s: Input string
    Returns:
        Boolean indicating if string is palindrome
    """
    left = 0
    right = len(s) - 1
    
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    
    return True

def is_palindrome_alphanumeric(s):
    """Check palindrome ignoring non-alphanumeric characters"""
    # Clean string: lowercase and alphanumeric only
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    
    left = 0
    right = len(cleaned) - 1
    
    while left < right:
        if cleaned[left] != cleaned[right]:
            return False
        left += 1
        right -= 1
    
    return True

def is_palindrome_reverse(s):
    """Check palindrome by reversing string"""
    return s == s[::-1]

def is_palindrome_recursive(s, left=0, right=None):
    """Check palindrome recursively"""
    if right is None:
        right = len(s) - 1
    
    # Base case
    if left >= right:
        return True
    
    # Check if characters match
    if s[left] != s[right]:
        return False
    
    # Recurse
    return is_palindrome_recursive(s, left + 1, right - 1)

def is_palindrome_number(num):
    """Check if number is palindrome"""
    if num < 0:
        return False
    
    return is_palindrome(str(num))

def longest_palindrome(s):
    """Find longest palindromic substring"""
    if len(s) < 2:
        return s
    
    start = 0
    max_len = 1
    
    def expand_around_center(left, right):
        nonlocal start, max_len
        while left >= 0 and right < len(s) and s[left] == s[right]:
            length = right - left + 1
            if length > max_len:
                start = left
                max_len = length
            left -= 1
            right += 1
    
    for i in range(len(s)):
        expand_around_center(i, i)      # Odd length
        expand_around_center(i, i + 1)  # Even length
    
    return s[start:start + max_len]

# Example usage
print(is_palindrome("racecar"))  # True
print(is_palindrome("hello"))  # False
print(is_palindrome_alphanumeric("A man, a plan, a canal: Panama"))  # True
print(is_palindrome_recursive("madam"))  # True
print(is_palindrome_number(12321))  # True
print(longest_palindrome("babad"))  # "bab" or "aba"
*/

module.exports = {
  isPalindrome,
  isPalindromeAlphanumeric,
  isPalindromeReverse,
  isPalindromeRecursive,
  isPalindromeNumber,
  longestPalindrome,
};
