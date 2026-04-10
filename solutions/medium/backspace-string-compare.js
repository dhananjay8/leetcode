/**
 * Problem: Backspace String Compare
 * Link: https://leetcode.com/problems/backspace-string-compare/
 * Difficulty: Easy
 *
 * '#' means a backspace. Return true if both strings are equal after backspaces.
 *
 * Example: s = "ab#c", t = "ad#c" => true (both become "ac")
 *
 * Time Complexity: O(n + m)
 * Space Complexity: O(1) with two-pointer approach
 */

// JavaScript Solution - Stack approach
function backspaceCompare(s, t) {
  return processString(s) === processString(t);
}

function processString(str) {
  const stack = [];
  for (const ch of str) {
    if (ch === '#') stack.pop(); // backspace: remove last char
    else stack.push(ch);
  }
  return stack.join('');
}

// O(1) space - Two pointer approach (traverse from end)
function backspaceCompareOptimal(s, t) {
  let i = s.length - 1, j = t.length - 1;

  while (i >= 0 || j >= 0) {
    i = getNextValidIndex(s, i);
    j = getNextValidIndex(t, j);

    if (i >= 0 && j >= 0 && s[i] !== t[j]) return false;
    if ((i >= 0) !== (j >= 0)) return false; // one string exhausted

    i--; j--;
  }
  return true;
}

function getNextValidIndex(str, idx) {
  let skip = 0;
  while (idx >= 0) {
    if (str[idx] === '#') { skip++; idx--; }
    else if (skip > 0) { skip--; idx--; }
    else break;
  }
  return idx;
}

module.exports = backspaceCompare;

/* Python Solution:

def backspaceCompare(s, t):
    def process(string):
        stack = []
        for ch in string:
            if ch == '#':
                if stack: stack.pop()
            else:
                stack.append(ch)
        return ''.join(stack)
    
    return process(s) == process(t)

*/
