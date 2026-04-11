/**
 * Problem: Reorganize String
 * Link: https://leetcode.com/problems/reorganize-string/
 * Difficulty: Medium
 *
 * Rearrange so no two adjacent chars are the same. Return "" if impossible.
 *
 * Time Complexity: O(n log 26) ≈ O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Greedy with frequency sort
function reorganizeString(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;

  // Sort characters by frequency (descending)
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

  // If most frequent char > (n+1)/2, impossible
  if (sorted[0][1] > Math.ceil(s.length / 2)) return "";

  // Place characters in even indices first, then odd
  const result = new Array(s.length);
  let idx = 0;

  for (const [ch, count] of sorted) {
    for (let i = 0; i < count; i++) {
      result[idx] = ch;
      idx += 2;
      if (idx >= s.length) idx = 1; // switch to odd indices
    }
  }

  return result.join('');
}

module.exports = reorganizeString;

/* Python Solution:

from collections import Counter

def reorganizeString(s):
    freq = Counter(s)
    if max(freq.values()) > (len(s) + 1) // 2: return ""
    
    sorted_chars = sorted(freq.items(), key=lambda x: -x[1])
    result = [''] * len(s)
    idx = 0
    
    for ch, count in sorted_chars:
        for _ in range(count):
            result[idx] = ch
            idx += 2
            if idx >= len(s): idx = 1
    
    return ''.join(result)

*/
