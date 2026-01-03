var addBinary = function (a, b) {
  let i = a.length - 1,
    j = b.length - 1,
    carry = 0,
    result = [];

  while (i >= 0 || j >= 0 || carry > 0) {
    let sum = (i >= 0 ? +a[i--] : 0) + (j >= 0 ? +b[j--] : 0) + carry;
    result.push(sum % 2); // Append the binary digit to the result
    carry = Math.floor(sum / 2); // Calculate the carry
  }

  return result.reverse().join(""); // Reverse and join the result to get the binary string
};

/**
 * @param {string} a
 * @param {string} b
 * @return {string}
 */
var addBinary = function (a, b) {
  let sum = "";
  let carry = "";

  const paddedInput = padZeroes(a, b);
  a = paddedInput[0];
  b = paddedInput[1];

  for (let i = a.length - 1; i >= 0; i--) {
    if (i == a.length - 1) {
      // half add the first pair
      const halfAdd1 = halfAdder(a[i], b[i]);
      sum = halfAdd1[0] + sum;
      carry = halfAdd1[1];
    } else {
      // full add the rest
      const fullAdd = fullAdder(a[i], b[i], carry);
      sum = fullAdd[0] + sum;
      carry = fullAdd[1];
    }
  }
  return carry ? carry + sum : sum;
};

// logic gates
function xor(a, b) {
  return a === b ? 0 : 1;
}

function and(a, b) {
  return a == 1 && b == 1 ? 1 : 0;
}

function or(a, b) {
  return a || b;
}

function halfAdder(a, b) {
  const sum = xor(a, b);
  const carry = and(a, b);
  return [sum, carry];
}

function fullAdder(a, b, carry) {
  halfAdd = halfAdder(a, b);
  const sum = xor(carry, halfAdd[0]);
  carry = and(carry, halfAdd[0]);
  carry = or(carry, halfAdd[1]);
  return [sum, carry];
}

function padZeroes(a, b) {
  const lengthDifference = a.length - b.length;
  switch (lengthDifference) {
    case 0:
      break;
    default:
      const zeroes = Array.from(Array(Math.abs(lengthDifference)), () =>
        String(0)
      );
      if (lengthDifference > 0) {
        // if a is longer than b
        // then we pad b with zeroes
        b = `${zeroes.join("")}${b}`;
      } else {
        // if b is longer than a
        // then we pad a with zeroes
        a = `${zeroes.join("")}${a}`;
      }
  }
  return [a, b];
}

//Python
// class Solution:
//     def addBinary(self, a: str, b: str) -> str:
//         carry = 0
//         result = ''

//         a = list(a)
//         b = list(b)

//         while a or b or carry:
//             if a:
//                 carry += int(a.pop())
//             if b:
//                 carry += int(b.pop())
//             result += str(carry%2)
//             carry //= 2

//         return result[::-1]
