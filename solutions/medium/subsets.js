/**
 * Problem: Subsets
 * Link: https://leetcode.com/problems/subsets/
 * Difficulty: Medium
 *
 * Return all possible subsets (power set). No duplicates.
 *
 * Example: nums = [1,2,3] => [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
 *
 * Time Complexity: O(n * 2^n)
 * Space Complexity: O(n * 2^n)
 */

// JavaScript Solution - Backtracking
function subsets(nums) {
  const result = [];

  function backtrack(start, current) {
    result.push([...current]); // add current subset (including empty)

    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current); // move to next index
      current.pop(); // backtrack
    }
  }

  backtrack(0, []);
  return result;
}

module.exports = subsets;

/* Python Solution:

def subsets(nums):
    result = []
    
    def backtrack(start, current):
        result.append(list(current))
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1, current)
            current.pop()
    
    backtrack(0, [])
    return result

*/
