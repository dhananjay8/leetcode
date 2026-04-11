/**
 * Problem: Partition Labels
 * Link: https://leetcode.com/problems/partition-labels/
 * Difficulty: Medium
 *
 * Partition string so each letter appears in at most one part. Return part sizes.
 *
 * Example: "ababcbacadefegdehijhklij" => [9,7,8]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Greedy
function partitionLabels(s) {
  // Record last occurrence of each character
  const lastIndex = {};
  for (let i = 0; i < s.length; i++) lastIndex[s[i]] = i;

  const result = [];
  let start = 0, end = 0;

  for (let i = 0; i < s.length; i++) {
    end = Math.max(end, lastIndex[s[i]]); // extend partition end
    if (i === end) {
      result.push(end - start + 1); // partition complete
      start = i + 1;
    }
  }

  return result;
}

module.exports = partitionLabels;

/* Python Solution:

def partitionLabels(s):
    last = {ch: i for i, ch in enumerate(s)}
    result = []
    start = end = 0
    
    for i, ch in enumerate(s):
        end = max(end, last[ch])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    
    return result

*/
