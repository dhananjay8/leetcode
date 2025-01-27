// 1. Check if a number is a perfect square
var isPerfectSquare = function (num) {
  if (num < 0) return false;
  let left = 0,
    right = num;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    let square = mid * mid;
    if (square === num) return true;
    if (square < num) left = mid + 1;
    else right = mid - 1;
  }
  return false;
};

// 2. Find the greatest common divisor (GCD) and least common multiple (LCM) of two numbers
var gcd = function (a, b) {
  while (b !== 0) {
    let temp = b; // Store the value of b
    b = a % b; // Update b to the remainder of a divided by b
    a = temp; // Update a to the previous value of b
  }
  return a; // When b becomes 0, a is the GCD
};

var findLCM = function (a, b) {
  return (a * b) / findGCD(a, b);
};

// 3. Count the number of digits in an integer
var countDigits = function (num) {
  let count = 0;
  if (num === 0) return 1;
  if (num < 0) num = -num;
  while (num > 0) {
    num = Math.floor(num / 10);
    count++;
  }
  return count;
};

// 4. Reverse the digits of an integer
var reverseInteger = function (num) {
  let reversed = 0;
  let isNegative = num < 0;
  if (isNegative) num = -num;
  while (num > 0) {
    reversed = reversed * 10 + (num % 10);
    num = Math.floor(num / 10);
  }
  return isNegative ? -reversed : reversed;
};

// 5. Check if a number is a palindrome
var isPalindrome = function (num) {
  if (num < 0) return false;
  let original = num;
  let reversed = 0;
  while (num > 0) {
    reversed = reversed * 10 + (num % 10);
    num = Math.floor(num / 10);
  }
  return original === reversed;
};

// 6. Find the nth Fibonacci number (recursive method)
var fibonacciRecursive = function (n) {
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
};

// 6. Find the nth Fibonacci number (iterative method)
var fibonacciIterative = function (n) {
  if (n <= 1) return n;
  let a = 0,
    b = 1,
    result = 0;
  for (let i = 2; i <= n; i++) {
    result = a + b;
    a = b;
    b = result;
  }
  return result;
};

// 7. Generate Pascal’s Triangle up to a given number of rows
var generatePascalTriangle = function (numRows) {
  let triangle = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j <= i; j++) {
      if (j === 0 || j === i) row.push(1);
      else row.push(triangle[i - 1][j - 1] + triangle[i - 1][j]);
    }
    triangle.push(row);
  }
  return triangle;
};

// 8. Check if a number is an Armstrong number
var isArmstrong = function (num) {
  let sum = 0,
    original = num,
    digits = 0;
  while (num > 0) {
    digits++;
    num = Math.floor(num / 10);
  }
  num = original;
  while (num > 0) {
    sum += Math.pow(num % 10, digits);
    num = Math.floor(num / 10);
  }
  return sum === original;
};

// 9. Find the sum of digits of a number until it becomes a single digit
var singleDigitSum = function (num) {
  while (num >= 10) {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    num = sum;
  }
  return num;
};

// 10. Check if a number is a power of two
var isPowerOfTwo = function (num) {
  if (num <= 0) return false;
  while (num % 2 === 0) {
    num /= 2;
  }
  return num === 1;
};

var isPowerOfTwo = function (n) {
  return n > 0 && (n & (n - 1)) === 0;
};