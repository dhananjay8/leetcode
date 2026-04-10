/**
 * Problem: Permutations
 * Link: https://leetcode.com/problems/permutations/
 * Difficulty: Medium
 *
 * Return all possible permutations of distinct integers.
 *
 * Example: [1,2,3] => [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
 *
 * Time Complexity: O(n * n!)
 * Space Complexity: O(n * n!)
 */

// JavaScript Solution - Backtracking
function permute(nums) {
  const result = [];

  function backtrack(current, remaining) {
    if (remaining.length === 0) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      // Remove chosen element, recurse with rest
      backtrack(current, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      current.pop(); // backtrack
    }
  }

  backtrack([], nums);
  return result;
}

module.exports = permute;

/* Python Solution:

def permute(nums):
    result = []
    
    def backtrack(current, remaining):
        if not remaining:
            result.append(list(current))
            return
        for i in range(len(remaining)):
            current.append(remaining[i])
            backtrack(current, remaining[:i] + remaining[i+1:])
            current.pop()
    
    backtrack([], nums)
    return result

*/
