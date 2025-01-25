// Determine if a given number is an automorphic number
// A number is automorphic if its square ends with the same digits as the number.
var isAutomorphic = function (num) {
  let square = num * num;
  return square.toString().endsWith(num.toString());
};

// Find the nth Catalan number
// Catalan numbers: C(n) = (2n)! / ((n+1)! * n!)
var nthCatalan = function (n) {
  let factorial = function (x) {
    let result = 1;
    for (let i = 2; i <= x; i++) result *= i;
    return result;
  };
  return factorial(2 * n) / (factorial(n + 1) * factorial(n));
};

// Calculate the determinant of a matrix
var determinant = function (matrix) {
  let size = matrix.length;
  if (size === 1) return matrix[0][0]; // Base case for 1x1 matrix
  if (size === 2)
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]; // 2x2 matrix
  let det = 0;
  for (let i = 0; i < size; i++) {
    let subMatrix = matrix.slice(1).map((row) => row.filter((_, j) => j !== i));
    det += matrix[0][i] * determinant(subMatrix) * (i % 2 === 0 ? 1 : -1);
  }
  return det;
};

// Solve a system of linear equations (using Gaussian elimination)
var solveLinearEquations = function (matrix, constants) {
  let n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let factor = matrix[j][i] / matrix[i][i];
      for (let k = 0; k < n; k++) {
        matrix[j][k] -= factor * matrix[i][k];
      }
      constants[j] -= factor * constants[i];
    }
  }
  let solution = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = constants[i];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= matrix[i][j] * solution[j];
    }
    solution[i] /= matrix[i][i];
  }
  return solution;
};

// Find the area of a triangle given its three sides (Heron’s formula)
var triangleArea = function (a, b, c) {
  let s = (a + b + c) / 2; // Semi-perimeter
  return Math.sqrt(s * (s - a) * (s - b) * (s - c)); // Heron’s formula
};

// Check if three given points form a straight line
var areCollinear = function (x1, y1, x2, y2, x3, y3) {
  return (y2 - y1) * (x3 - x2) === (y3 - y2) * (x2 - x1); // Check slope equality
};

// Calculate the power of a number modulo m (x^y % m) efficiently
var modPower = function (x, y, m) {
  let result = 1;
  x = x % m;
  while (y > 0) {
    if (y % 2 === 1) result = (result * x) % m; // If y is odd
    y = Math.floor(y / 2); // Halve y
    x = (x * x) % m; // Square x
  }
  return result;
};

// Generate all subsets (power set) of a given set
var powerSet = function (arr) {
  let result = [];
  let n = arr.length;
  for (let i = 0; i < 1 << n; i++) {
    // Iterate through all 2^n subsets
    let subset = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) subset.push(arr[j]); // Check if jth element is in the subset
    }
    result.push(subset);
  }
  return result;
};

// Count the number of set bits (1s) in the binary representation of a number
var countSetBits = function (num) {
  let count = 0;
  while (num > 0) {
    count += num & 1; // Check the last bit
    num >>= 1; // Shift right
  }
  return count;
};

// Find the median of two sorted arrays
var findMedianSortedArrays = function (arr1, arr2) {
  let merged = [];
  let i = 0,
    j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) merged.push(arr1[i++]);
    else merged.push(arr2[j++]);
  }
  while (i < arr1.length) merged.push(arr1[i++]);
  while (j < arr2.length) merged.push(arr2[j++]);
  let mid = Math.floor(merged.length / 2);
  return merged.length % 2 === 0
    ? (merged[mid - 1] + merged[mid]) / 2
    : merged[mid];
};
