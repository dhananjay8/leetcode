// Find the factorial of a number
var factorial = function (n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i; // Multiply numbers from 2 to n
  }
  return result;
};

// Determine if a number is a palindrome without converting it to a string
var isPalindromeNumber = function (num) {
  if (num < 0) return false; // Negative numbers are not palindromes
  let original = num,
    reversed = 0;
  while (num > 0) {
    reversed = reversed * 10 + (num % 10); // Reverse the digits
    num = Math.floor(num / 10); // Remove the last digit
  }
  return original === reversed;
};

// Find the largest prime factor of a number
var largestPrimeFactor = function (num) {
  let factor = 2,
    maxFactor = 0;
  while (num > 1) {
    while (num % factor === 0) {
      maxFactor = factor;
      num /= factor; // Divide by the prime factor
    }
    factor++;
  }
  return maxFactor;
};

// Calculate the number of permutations (nPr) and combinations (nCr)
var nPr = function (n, r) {
  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i; // Multiply n terms for permutations
  }
  return result;
};
var nCr = function (n, r) {
  return nPr(n, r) / factorial(r); // Divide permutations by r!
};

// Check if two numbers are anagrams of each other
var areAnagrams = function (a, b) {
  let countDigits = function (num) {
    let count = Array(10).fill(0);
    while (num > 0) {
      count[num % 10]++;
      num = Math.floor(num / 10);
    }
    return count;
  };
  return countDigits(a).join() === countDigits(b).join(); // Compare digit frequencies
};

// Find the missing number in an array of size n containing numbers from 1 to n
var findMissingNumber = function (arr, n) {
  let expectedSum = (n * (n + 1)) / 2; // Sum of first n numbers
  let actualSum = arr.reduce((sum, num) => sum + num, 0); // Sum of array elements
  return expectedSum - actualSum; // Difference is the missing number
};

// Find the smallest number divisible by all numbers in a given range
var smallestMultiple = function (start, end) {
  let gcd = function (a, b) {
    while (b !== 0) {
      let temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };
  let lcm = function (a, b) {
    return (a * b) / gcd(a, b); // LCM formula
  };
  let result = start;
  for (let i = start + 1; i <= end; i++) {
    result = lcm(result, i);
  }
  return result;
};

// Check if a number is a perfect cube
var isPerfectCube = function (num) {
  let root = Math.round(Math.pow(num, 1 / 3)); // Approximate cube root
  return root * root * root === num; // Check if it matches the number
};

// Check if a number is a Fibonacci number
var isFibonacci = function (num) {
  let isPerfectSquare = function (x) {
    let s = Math.sqrt(x);
    return s * s === x;
  };
  // A number is Fibonacci if 5*n^2 + 4 or 5*n^2 - 4 is a perfect square
  return (
    isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4)
  );
};

// Find the length of the longest arithmetic progression in a given array
var longestArithmeticProgression = function (arr) {
  if (arr.length <= 2) return arr.length;
  let maxLen = 2;
  let dp = Array(arr.length)
    .fill(null)
    .map(() => ({}));
  for (let i = 1; i < arr.length; i++) {
    for (let j = 0; j < i; j++) {
      let diff = arr[i] - arr[j]; // Common difference
      dp[i][diff] = (dp[j][diff] || 1) + 1; // Extend previous sequence
      maxLen = Math.max(maxLen, dp[i][diff]); // Update max length
    }
  }
  return maxLen;
};
