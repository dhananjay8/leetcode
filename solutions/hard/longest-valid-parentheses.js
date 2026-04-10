/**
 * Problem: Longest Valid Parentheses
 * Link: https://leetcode.com/problems/longest-valid-parentheses/
 * Difficulty: Hard
 *
 * Find the length of the longest valid (well-formed) parentheses substring.
 *
 * Example: "(()" => 2, ")()())" => 4
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n) stack, O(1) two-pass
 */

// JavaScript Solution - Stack
function longestValidParentheses(s) {
  const stack = [-1]; // initialize with -1 as base index
  let maxLen = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i); // push index of '('
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i); // new base for future valid substrings
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }

  return maxLen;
}

module.exports = longestValidParentheses;

/* Python Solution:

def longestValidParentheses(s):
    stack = [-1]  # base index
    max_len = 0
    
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)  # new base
            else:
                max_len = max(max_len, i - stack[-1])
    
    return max_len

*/
