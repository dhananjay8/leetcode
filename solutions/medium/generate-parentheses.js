/**
 * Problem: Generate Parentheses
 * Link: https://leetcode.com/problems/generate-parentheses/
 * Difficulty: Medium
 *
 * Generate all combinations of well-formed parentheses for n pairs.
 *
 * Example: n = 3 => ["((()))","(()())","(())()","()(())","()()()"]
 *
 * Time Complexity: O(4^n / sqrt(n)) — Catalan number
 * Space Complexity: O(n)
 */

// JavaScript Solution - Backtracking
function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    // Base case: used all parentheses
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }

    // Can add '(' if we haven't used all n
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }

    // Can add ')' only if it won't exceed open count
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }

  backtrack('', 0, 0);
  return result;
}

module.exports = generateParenthesis;

/* Python Solution:

def generateParenthesis(n):
    result = []
    
    def backtrack(current, open_count, close_count):
        if len(current) == 2 * n:
            result.append(current)
            return
        
        if open_count < n:
            backtrack(current + '(', open_count + 1, close_count)
        if close_count < open_count:
            backtrack(current + ')', open_count, close_count + 1)
    
    backtrack('', 0, 0)
    return result

*/
