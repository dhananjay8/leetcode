/**
 * Problem: Longest Repeating Character Replacement
 * Link: https://leetcode.com/problems/longest-repeating-character-replacement/
 * Difficulty: Medium
 *
 * You can replace at most k characters. Find longest substring with all same characters.
 * Example: s = "AABABBA", k = 1 => 4 ("AABA" → replace B → "AAAA")
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1) — 26 letters
 */

// JavaScript Solution — Sliding Window
function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, result = 0;

  for (let right = 0; right < s.length; right++) {
    count[s[right]] = (count[s[right]] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[s[right]]); // most frequent char in window

    // Window size - most frequent char count = chars to replace
    // If replacements needed > k, shrink window
    while ((right - left + 1) - maxFreq > k) {
      count[s[left]]--;
      left++;
    }

    result = Math.max(result, right - left + 1);
  }

  return result;
}

module.exports = characterReplacement;

/* Python Solution:

def characterReplacement(s, k):
    count = {}
    left = max_freq = result = 0
    
    for right in range(len(s)):
        count[s[right]] = count.get(s[right], 0) + 1
        max_freq = max(max_freq, count[s[right]])
        
        while (right - left + 1) - max_freq > k:
            count[s[left]] -= 1
            left += 1
        
        result = max(result, right - left + 1)
    
    return result

*/
