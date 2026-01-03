/**
 * Problem: Find the Index of the First Occurrence in a String
 * Link: https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/
 * Difficulty: Easy
 *
 * Given two strings needle and haystack, return the index of the first occurrence
 * of needle in haystack, or -1 if needle is not part of haystack.
 *
 * Example:
 * Input: haystack = "sadbutsad", needle = "sad"
 * Output: 0
 *
 * Time Complexity: O(n*m) for naive, O(n) for KMP
 * Space Complexity: O(1) for naive, O(m) for KMP
 */

// JavaScript Solution - Built-in
function strStr(haystack, needle) {
  return haystack.indexOf(needle);
}

// Manual implementation
function strStrManual(haystack, needle) {
  if (needle.length === 0) return 0;
  if (needle.length > haystack.length) return -1;

  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let j = 0;
    while (j < needle.length && haystack[i + j] === needle[j]) {
      j++;
    }
    if (j === needle.length) {
      return i;
    }
  }

  return -1;
}

// KMP Algorithm implementation
function strStrKMP(haystack, needle) {
  if (needle.length === 0) return 0;

  // Build LPS (Longest Proper Prefix which is also Suffix) array
  const lps = new Array(needle.length).fill(0);
  let prevLPS = 0;
  let i = 1;

  while (i < needle.length) {
    if (needle[i] === needle[prevLPS]) {
      lps[i] = prevLPS + 1;
      prevLPS++;
      i++;
    } else if (prevLPS === 0) {
      lps[i] = 0;
      i++;
    } else {
      prevLPS = lps[prevLPS - 1];
    }
  }

  // Search using LPS
  i = 0; // haystack pointer
  let j = 0; // needle pointer

  while (i < haystack.length) {
    if (haystack[i] === needle[j]) {
      i++;
      j++;
    } else {
      if (j === 0) {
        i++;
      } else {
        j = lps[j - 1];
      }
    }

    if (j === needle.length) {
      return i - needle.length;
    }
  }

  return -1;
}

// Test cases
console.log(strStr("sadbutsad", "sad")); // 0
console.log(strStr("leetcode", "leeto")); // -1
console.log(strStr("hello", "ll")); // 2

module.exports = strStr;

/* Python Solution (commented):

def str_str(haystack: str, needle: str) -> int:
    """
    Find first occurrence of substring
    
    Args:
        haystack: String to search in
        needle: String to search for
    
    Returns:
        Index of first occurrence or -1
    
    Time Complexity: O(n*m)
    Space Complexity: O(1)
    """
    # Built-in
    return haystack.find(needle)

# Manual implementation
def str_str_manual(haystack: str, needle: str) -> int:
    if not needle:
        return 0
    if len(needle) > len(haystack):
        return -1
    
    for i in range(len(haystack) - len(needle) + 1):
        j = 0
        while j < len(needle) and haystack[i + j] == needle[j]:
            j += 1
        if j == len(needle):
            return i
    
    return -1

# KMP Algorithm
def str_str_kmp(haystack: str, needle: str) -> int:
    if not needle:
        return 0
    
    # Build LPS array
    lps = [0] * len(needle)
    prev_lps = 0
    i = 1
    
    while i < len(needle):
        if needle[i] == needle[prev_lps]:
            lps[i] = prev_lps + 1
            prev_lps += 1
            i += 1
        elif prev_lps == 0:
            lps[i] = 0
            i += 1
        else:
            prev_lps = lps[prev_lps - 1]
    
    # Search
    i = 0
    j = 0
    
    while i < len(haystack):
        if haystack[i] == needle[j]:
            i += 1
            j += 1
        else:
            if j == 0:
                i += 1
            else:
                j = lps[j - 1]
        
        if j == len(needle):
            return i - len(needle)
    
    return -1

# Test cases
print(str_str("sadbutsad", "sad"))  # 0
print(str_str("leetcode", "leeto"))  # -1
print(str_str("hello", "ll"))  # 2

*/
