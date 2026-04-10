/**
 * Problem: Basic Calculator II
 * Link: https://leetcode.com/problems/basic-calculator-ii/
 * Difficulty: Medium
 *
 * Evaluate expression with +, -, *, / (integer division). No parentheses.
 *
 * Example: "3+2*2" => 7, " 3/2 " => 1
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - Stack
function calculate(s) {
  const stack = [];
  let num = 0;
  let sign = '+'; // previous operator

  for (let i = 0; i <= s.length; i++) {
    const ch = s[i];

    if (ch >= '0' && ch <= '9') {
      num = num * 10 + parseInt(ch); // build multi-digit number
    }

    // When we hit an operator or end of string, process previous number
    if ((ch === '+' || ch === '-' || ch === '*' || ch === '/') || i === s.length) {
      if (sign === '+') stack.push(num);
      else if (sign === '-') stack.push(-num);
      else if (sign === '*') stack.push(stack.pop() * num);
      else if (sign === '/') stack.push(Math.trunc(stack.pop() / num)); // truncate toward zero
      
      sign = ch;
      num = 0;
    }
  }

  return stack.reduce((a, b) => a + b, 0); // sum all values in stack
}

module.exports = calculate;

// Python Solution:
//
// def calculate(s):
//     stack = []
//     num = 0
//     sign = '+'
//
//     for i, ch in enumerate(s + '+'):  # append '+' to process last number
//         if ch.isdigit():
//             num = num * 10 + int(ch)
//         elif ch in '+-*/':
//             if sign == '+': stack.append(num)
//             elif sign == '-': stack.append(-num)
//             elif sign == '*': stack.append(stack.pop() * num)
//             elif sign == '/': stack.append(int(stack.pop() / num))  # truncate toward zero
//             sign = ch
//             num = 0
//
//     return sum(stack)
