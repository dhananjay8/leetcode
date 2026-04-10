/**
 * Problem: Decode String
 * Link: https://leetcode.com/problems/decode-string/
 * Difficulty: Medium
 *
 * Decode encoded string: k[encoded_string] means repeat encoded_string k times.
 *
 * Example: "3[a]2[bc]" => "aaabcbc", "3[a2[c]]" => "accaccacc"
 *
 * Time Complexity: O(n * maxK) where maxK is max repeat count
 * Space Complexity: O(n)
 */

// JavaScript Solution - Stack
function decodeString(s) {
  const countStack = [];
  const stringStack = [];
  let currentStr = '';
  let currentNum = 0;

  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      currentNum = currentNum * 10 + parseInt(ch); // handle multi-digit numbers
    } else if (ch === '[') {
      // Save current state and start fresh
      countStack.push(currentNum);
      stringStack.push(currentStr);
      currentStr = '';
      currentNum = 0;
    } else if (ch === ']') {
      // Pop and repeat: previous string + current string * count
      const count = countStack.pop();
      const prevStr = stringStack.pop();
      currentStr = prevStr + currentStr.repeat(count);
    } else {
      currentStr += ch; // regular character
    }
  }

  return currentStr;
}

module.exports = decodeString;

/* Python Solution:

def decodeString(s):
    count_stack = []
    string_stack = []
    current_str = ''
    current_num = 0
    
    for ch in s:
        if ch.isdigit():
            current_num = current_num * 10 + int(ch)
        elif ch == '[':
            count_stack.append(current_num)
            string_stack.append(current_str)
            current_str = ''
            current_num = 0
        elif ch == ']':
            count = count_stack.pop()
            prev_str = string_stack.pop()
            current_str = prev_str + current_str * count
        else:
            current_str += ch
    
    return current_str

*/
