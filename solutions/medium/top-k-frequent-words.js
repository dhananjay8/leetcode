/**
 * Problem: Top K Frequent Words
 * Link: https://leetcode.com/problems/top-k-frequent-words/
 * Difficulty: Medium
 *
 * Return k most frequent words sorted by frequency (ties: alphabetical).
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// JavaScript Solution
function topKFrequent(words, k) {
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

  // Sort: by frequency desc, then alphabetically for ties
  return [...freq.keys()]
    .sort((a, b) => {
      if (freq.get(b) !== freq.get(a)) return freq.get(b) - freq.get(a);
      return a.localeCompare(b); // alphabetical for ties
    })
    .slice(0, k);
}

module.exports = topKFrequent;

/* Python Solution:

from collections import Counter

def topKFrequent(words, k):
    freq = Counter(words)
    # Sort by (-frequency, word) so higher freq comes first, ties alphabetical
    return sorted(freq.keys(), key=lambda w: (-freq[w], w))[:k]

*/
