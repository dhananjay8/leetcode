// Determine if a point lies inside a given polygon
var isPointInPolygon = function (polygon, x, y) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0],
      yi = polygon[i][1];
    let xj = polygon[j][0],
      yj = polygon[j][1];
    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Check if a given number can be expressed as the sum of two squares
var isSumOfTwoSquares = function (num) {
  for (let i = 0; i * i <= num; i++) {
    let remainder = num - i * i;
    let sqrt = Math.floor(Math.sqrt(remainder));
    if (sqrt * sqrt === remainder) return true;
  }
  return false;
};

// Find the number of unique paths in an m x n grid
var uniquePaths = function (m, n) {
  let dp = Array(m)
    .fill(0)
    .map(() => Array(n).fill(1));
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }
  return dp[m - 1][n - 1];
};

// Check if a number is a magic number (sum of digits recursively equals 1)
var isMagicNumber = function (num) {
  let sumOfDigits = function (n) {
    let sum = 0;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    return sum;
  };
  while (num >= 10) num = sumOfDigits(num);
  return num === 1;
};

// Find the digital root of a number
var digitalRoot = function (num) {
  return num === 0 ? 0 : 1 + ((num - 1) % 9);
};

// Generate the next lexicographical permutation of a number
var nextPermutation = function (nums) {
  let i = nums.length - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  if (i >= 0) {
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  let left = i + 1,
    right = nums.length - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
  return nums;
};

// Calculate binomial coefficients using Pascal’s Triangle
var binomialCoefficient = function (n, k) {
  let pascal = Array(n + 1)
    .fill(0)
    .map(() => Array(k + 1).fill(0));
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= Math.min(i, k); j++) {
      if (j === 0 || j === i) pascal[i][j] = 1;
      else pascal[i][j] = pascal[i - 1][j - 1] + pascal[i - 1][j];
    }
  }
  return pascal[n][k];
};

// Check if a number is a power of three
var isPowerOfThree = function (num) {
  if (num < 1) return false;
  while (num % 3 === 0) num /= 3;
  return num === 1;
};

// Find the largest contiguous subarray sum (Kadane’s algorithm)
var maxSubArray = function (nums) {
  let maxSum = nums[0],
    currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
};

// Generate all prime factors of a number
var primeFactors = function (num) {
  let factors = [];
  while (num % 2 === 0) {
    factors.push(2);
    num /= 2;
  }
  for (let i = 3; i * i <= num; i += 2) {
    while (num % i === 0) {
      factors.push(i);
      num /= i;
    }
  }
  if (num > 2) factors.push(num);
  return factors;
};
