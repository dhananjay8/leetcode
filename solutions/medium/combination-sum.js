/**
 * Problem: Combination Sum
 * Link: https://leetcode.com/problems/combination-sum/
 * Difficulty: Medium
 *
 * Find all unique combinations where candidate numbers sum to target.
 * Same number may be used unlimited times.
 *
 * Example: candidates = [2,3,6,7], target = 7 => [[2,2,3],[7]]
 *
 * Time Complexity: O(n^(target/min))
 * Space Complexity: O(target/min)
 */

// JavaScript Solution - Backtracking
function combinationSum(candidates, target) {
  const result = [];

  function backtrack(start, remaining, current) {
    if (remaining === 0) { result.push([...current]); return; }
    if (remaining < 0) return;

    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(i, remaining - candidates[i], current); // i (not i+1) — reuse allowed
      current.pop();
    }
  }

  backtrack(0, target, []);
  return result;
}

module.exports = combinationSum;

/* Python Solution:

def combinationSum(candidates, target):
    result = []
    
    def backtrack(start, remaining, current):
        if remaining == 0:
            result.append(list(current))
            return
        if remaining < 0:
            return
        for i in range(start, len(candidates)):
            current.append(candidates[i])
            backtrack(i, remaining - candidates[i], current)  # same i: reuse allowed
            current.pop()
    
    backtrack(0, target, [])
    return result

*/
