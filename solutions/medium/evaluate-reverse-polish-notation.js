/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  let stack = [];
  const operators = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => ~~(a / b),
  };
  for (let token of tokens) {
    if (operators[token]) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(operators[token](a, b));
    } else {
      stack.push(Number(token));
    }
  }
  return stack[0];
};

// def evalRPN(tokens):
//     stack = []
//     operators = {
//         "+": lambda a, b: a + b,
//         "-": lambda a, b: a - b,
//         "*": lambda a, b: a * b,
//         "/": lambda a, b: int(a / b),  # Truncate towards zero
//     }

//     for token in tokens:
//         if token in operators:
//             b = stack.pop()
//             a = stack.pop()
//             stack.append(operators[token](a, b))
//         else:
//             stack.append(int(token))

//     return stack[0]
