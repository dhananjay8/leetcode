/**
 * Problem: Minimum Window Substring
 * Link: https://leetcode.com/problems/minimum-window-substring/
 * Difficulty: Hard
 *
 * Given two strings s and t, return the minimum window substring of s such that
 * every character in t (including duplicates) is included in the window.
 * If there is no such substring, return the empty string "".
 *
 * Example:
 * Input: s = "ADOBECODEBANC", t = "ABC"
 * Output: "BANC"
 *
 * Time Complexity: O(m + n) where m=len(s), n=len(t)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Sliding Window
function minWindow(s, t) {
  if (s.length === 0 || t.length === 0) return "";

  // Count characters in t
  const tCount = new Map();
  for (const char of t) {
    tCount.set(char, (tCount.get(char) || 0) + 1);
  }

  let required = tCount.size;
  let formed = 0;
  const windowCounts = new Map();

  let left = 0;
  let minLen = Infinity;
  let minLeft = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

    // Check if frequency of current char matches required
    if (tCount.has(char) && windowCounts.get(char) === tCount.get(char)) {
      formed++;
    }

    // Try to shrink window
    while (formed === required && left <= right) {
      // Update result
      if (right - left + 1 < minLen) {
        minLen = right - left + 1;
        minLeft = left;
      }

      const leftChar = s[left];
      windowCounts.set(leftChar, windowCounts.get(leftChar) - 1);

      if (
        tCount.has(leftChar) &&
        windowCounts.get(leftChar) < tCount.get(leftChar)
      ) {
        formed--;
      }

      left++;
    }
  }

  return minLen === Infinity ? "" : s.substring(minLeft, minLeft + minLen);
}

// Test cases
console.log(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
console.log(minWindow("a", "a")); // "a"
console.log(minWindow("a", "aa")); // ""

module.exports = minWindow;

/* Python Solution (commented):

from collections import Counter

def min_window(s: str, t: str) -> str:
    """
    Find minimum window substring containing all characters of t
    
    Args:
        s: Source string
        t: Target string
    
    Returns:
        Minimum window substring
    
    Time Complexity: O(m + n)
    Space Complexity: O(n)
    """
    if not s or not t:
        return ""
    
    # Count characters in t
    t_count = Counter(t)
    required = len(t_count)
    formed = 0
    window_counts = {}
    
    left = 0
    min_len = float('inf')
    min_left = 0
    
    for right in range(len(s)):
        char = s[right]
        window_counts[char] = window_counts.get(char, 0) + 1
        
        # Check if current char frequency matches
        if char in t_count and window_counts[char] == t_count[char]:
            formed += 1
        
        # Shrink window
        while formed == required and left <= right:
            # Update result
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_left = left
            
            left_char = s[left]
            window_counts[left_char] -= 1
            
            if left_char in t_count and window_counts[left_char] < t_count[left_char]:
                formed -= 1
            
            left += 1
    
    return "" if min_len == float('inf') else s[min_left:min_left + min_len]

# Test cases
print(min_window("ADOBECODEBANC", "ABC"))  # "BANC"
print(min_window("a", "a"))  # "a"
print(min_window("a", "aa"))  # ""

*/
