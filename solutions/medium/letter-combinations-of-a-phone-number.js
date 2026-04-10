/**
 * Problem: Letter Combinations of a Phone Number
 * Link: https://leetcode.com/problems/letter-combinations-of-a-phone-number/
 * Difficulty: Medium
 *
 * Given digits 2-9, return all possible letter combinations (phone keypad).
 *
 * Example: "23" => ["ad","ae","af","bd","be","bf","cd","ce","cf"]
 *
 * Time Complexity: O(4^n * n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Backtracking
function letterCombinations(digits) {
  if (!digits.length) return [];

  const phoneMap = {
    '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
    '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
  };
  const result = [];

  function backtrack(idx, current) {
    if (idx === digits.length) { result.push(current); return; }

    for (const letter of phoneMap[digits[idx]]) {
      backtrack(idx + 1, current + letter);
    }
  }

  backtrack(0, '');
  return result;
}

module.exports = letterCombinations;

/* Python Solution:

def letterCombinations(digits):
    if not digits: return []
    
    phone = {'2':'abc','3':'def','4':'ghi','5':'jkl',
             '6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
    result = []
    
    def backtrack(idx, current):
        if idx == len(digits):
            result.append(current)
            return
        for letter in phone[digits[idx]]:
            backtrack(idx + 1, current + letter)
    
    backtrack(0, '')
    return result

*/
