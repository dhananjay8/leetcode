/**
 * Find First Non-Repeating Character
 *
 * Problem: Find the first character in a string that doesn't repeat
 *
 * Approaches:
 * 1. Hash map with two passes
 * 2. Hash map with single pass (track index)
 * Time Complexity: O(n), Space Complexity: O(1) - limited by alphabet size
 */

// JavaScript Solution

// Approach 1: Two pass with frequency map
function firstNonRepeatingChar(s) {
  // First pass: count frequencies
  const freq = new Map();

  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  // Second pass: find first char with frequency 1
  for (const char of s) {
    if (freq.get(char) === 1) {
      return char;
    }
  }

  return null; // No non-repeating character found
}

// Return index instead of character
function firstNonRepeatingIndex(s) {
  const freq = new Map();

  // Count frequencies
  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  // Find first non-repeating character index
  for (let i = 0; i < s.length; i++) {
    if (freq.get(s[i]) === 1) {
      return i;
    }
  }

  return -1;
}

// Using array for lowercase letters only (more efficient)
function firstNonRepeatingCharArray(s) {
  const freq = new Array(26).fill(0);

  // Count frequencies
  for (const char of s) {
    const index = char.charCodeAt(0) - "a".charCodeAt(0);
    freq[index]++;
  }

  // Find first non-repeating
  for (const char of s) {
    const index = char.charCodeAt(0) - "a".charCodeAt(0);
    if (freq[index] === 1) {
      return char;
    }
  }

  return null;
}

// Find all non-repeating characters
function allNonRepeatingChars(s) {
  const freq = new Map();

  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  const result = [];
  for (const char of s) {
    if (freq.get(char) === 1) {
      result.push(char);
    }
  }

  return result;
}

// Using object instead of Map
function firstNonRepeatingCharObject(s) {
  const freq = {};

  // Count frequencies
  for (const char of s) {
    freq[char] = (freq[char] || 0) + 1;
  }

  // Find first non-repeating
  for (const char of s) {
    if (freq[char] === 1) {
      return char;
    }
  }

  return null;
}

// Example usage
console.log(firstNonRepeatingChar("leetcode")); // "l"
console.log(firstNonRepeatingChar("loveleetcode")); // "v"
console.log(firstNonRepeatingChar("aabb")); // null
console.log(firstNonRepeatingIndex("leetcode")); // 0
console.log(allNonRepeatingChars("aabbcde")); // ["c", "d", "e"]

/*
Python Solution:

def first_non_repeating_char(s):
    """
    Find first non-repeating character using hash map
    
    Args:
        s: Input string
    Returns:
        First non-repeating character or None
    """
    # Count frequencies
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    
    # Find first non-repeating
    for char in s:
        if freq[char] == 1:
            return char
    
    return None

def first_non_repeating_index(s):
    """Return index of first non-repeating character"""
    freq = {}
    
    # Count frequencies
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    
    # Find index
    for i, char in enumerate(s):
        if freq[char] == 1:
            return i
    
    return -1

def first_non_repeating_char_array(s):
    """Using array for lowercase letters only"""
    freq = [0] * 26
    
    # Count frequencies
    for char in s:
        index = ord(char) - ord('a')
        freq[index] += 1
    
    # Find first non-repeating
    for char in s:
        index = ord(char) - ord('a')
        if freq[index] == 1:
            return char
    
    return None

def all_non_repeating_chars(s):
    """Find all non-repeating characters"""
    freq = {}
    
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    
    result = []
    for char in s:
        if freq[char] == 1:
            result.append(char)
    
    return result

# Using Counter from collections
from collections import Counter

def first_non_repeating_counter(s):
    """Using Counter for cleaner code"""
    freq = Counter(s)
    
    for char in s:
        if freq[char] == 1:
            return char
    
    return None

# Example usage
print(first_non_repeating_char("leetcode"))  # "l"
print(first_non_repeating_char("loveleetcode"))  # "v"
print(first_non_repeating_char("aabb"))  # None
print(first_non_repeating_index("leetcode"))  # 0
print(all_non_repeating_chars("aabbcde"))  # ['c', 'd', 'e']
print(first_non_repeating_counter("aabbcc"))  # None
*/

module.exports = {
  firstNonRepeatingChar,
  firstNonRepeatingIndex,
  firstNonRepeatingCharArray,
  allNonRepeatingChars,
  firstNonRepeatingCharObject,
};
