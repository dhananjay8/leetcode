/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  let stack = [];
  let opB = { "(": 1, "{": 1, "[": 1 };
  let clB = { "}": 1, ")": 1, "]": 1 };
  let pair = { "(": ")", "{": "}", "[": "]" };
  for (let char of s) {
    if (opB[char]) stack.push(char);
    if (clB[char]) {
      let curr = stack.pop();
      if (char != pair[curr]) return false;
    }
  }

  return stack.length === 0;
};
