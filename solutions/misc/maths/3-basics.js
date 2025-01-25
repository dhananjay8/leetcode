// Calculate the square root of a number using the binary search method
var squareRoot = function (x) {
  let low = 0,
    high = x,
    epsilon = 1e-6; // Tolerance for approximation
  while (high - low > epsilon) {
    let mid = (low + high) / 2;
    if (mid * mid < x) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
};

// Implement Euclid’s algorithm for finding the GCD of two numbers
var gcd = function (a, b) {
  while (b !== 0) {
    let temp = b; // Store the value of b
    b = a % b; // Update b to the remainder of a divided by b
    a = temp; // Update a to the previous value of b
  }
  return a; // When b becomes 0, a is the GCD
};

// Find the sum of squares of the first n natural numbers
var sumOfSquares = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i * i;
  }
  return sum;
};

// Check if a number is a Kaprekar number
// A Kaprekar number is one whose square can be split into two parts that add up to the original number.
var isKaprekar = function (num) {
  if (num === 1) return true;
  let square = num * num;
  let str = square.toString();
  let len = str.length;
  let left = parseInt(str.slice(0, Math.floor(len / 2))) || 0;
  let right = parseInt(str.slice(Math.floor(len / 2))) || 0;
  return left + right === num;
};

// Find all divisors of a number
var findDivisors = function (num) {
  let divisors = [];
  for (let i = 1; i * i <= num; i++) {
    if (num % i === 0) {
      divisors.push(i);
      if (i !== num / i) divisors.push(num / i);
    }
  }
  return divisors.sort((a, b) => a - b);
};

// Solve the Josephus problem
// The Josephus problem determines the survivor's position in a circle where every k-th person is eliminated.
var josephus = function (n, k) {
  if (n === 1) return 0;
  return (josephus(n - 1, k) + k) % n;
};

// Find the count of integers in a range divisible by k
var countDivisible = function (start, end, k) {
  return Math.floor(end / k) - Math.floor((start - 1) / k);
};

// Find the nth term of an arithmetic progression (AP) or geometric progression (GP)
var nthTermAP = function (a, d, n) {
  return a + (n - 1) * d; // AP formula
};

var nthTermGP = function (a, r, n) {
  return a * Math.pow(r, n - 1); // GP formula
};

// Determine the number of unique ways to climb n stairs, taking 1 or 2 steps at a time
var climbStairs = function (n) {
  if (n <= 1) return 1;
  let prev1 = 1,
    prev2 = 1;
  for (let i = 2; i <= n; i++) {
    let current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
};

// Check if a number is a happy number
// A happy number is one that eventually reaches 1 when replaced by the sum of the squares of its digits repeatedly.
var isHappy = function (num) {
  let seen = new Set(); // Keep track of numbers we've seen to avoid infinite loops
  var sumOfSquares = function (n) {
    let sum = 0;
    while (n > 0) {
      let digit = n % 10;
      sum += digit * digit; // Add square of the digit
      n = Math.floor(n / 10);
    }
    return sum;
  };
  while (num !== 1 && !seen.has(num)) {
    // Continue until we reach 1 or detect a cycle
    seen.add(num); // Mark the number as seen
    num = sumOfSquares(num); // Replace num with the sum of the squares of its digits
  }
  return num === 1; // Return true if num is 1 (happy), false otherwise
};
