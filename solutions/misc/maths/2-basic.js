// Find all pairs in an array that sum up to a given number
var findPairs = function (arr, target) {
  let pairs = [];
  // Iterate through the array to find all unique pairs
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        pairs.push([arr[i], arr[j]]);
      }
    }
  }
  return pairs;
};

var findPairs = function (arr, target) {
  let pairs = [];
  let seen = new Map(); // To store elements we've seen

  for (let num of arr) {
    let complement = target - num; // Find the required pair value
    if (seen.has(complement)) {
      pairs.push([complement, num]); // Add the pair
    }
    seen.set(num, true); // Mark the current number as seen
  }

  return pairs;
};

// Check if a number is a perfect number
var isPerfectNumber = function (num) {
  if (num <= 1) return false; // Numbers <= 1 are not perfect numbers
  let sum = 1; // Start with 1 as it is always a divisor
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) {
      sum += i;
      if (i !== num / i) sum += num / i; // Add both divisors
    }
  }
  return sum === num; // Check if the sum equals the original number
};

// Find the nth root of a number without using built-in functions
var findNthRoot = function (x, n) {
  let low = 0,
    high = x,
    epsilon = 1e-6; // Tolerance for approximation
  while (high - low > epsilon) {
    let mid = (low + high) / 2;
    if (Math.pow(mid, n) < x) low = mid; // Adjust lower bound
    else high = mid; // Adjust upper bound
  }
  return (low + high) / 2; // Return the approximated root
};

var printPrimes = function (n) {
  if (n < 2) {
    return false;
  }

  for (let i = 2; i <= n; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      // Use `j * j <= i` instead of `Math.sqrt(i)`
      if (i % j === 0) {
        isPrime = false; // Not a prime number
        break;
      }
    }
    if (isPrime) {
      console.log(i); // Print the prime number
    }
  }
};

// Find the sum of all prime numbers below a given number
var sumOfPrimes = function (n) {
  // Helper function to check if a number is prime
  let isPrime = function (num) {
    if (num < 2) return false; // Numbers < 2 are not prime
    for (let i = 2; i * i <= num; i++) {
      if (num % i === 0) return false; // Found a divisor
    }
    return true;
  };
  let sum = 0;
  for (let i = 2; i < n; i++) {
    if (isPrime(i)) sum += i; // Add primes to the sum
  }
  return sum;
};

// Determine if two numbers are co-prime
var areCoPrime = function (a, b) {
  // Helper function to calculate the greatest common divisor (GCD)
  var gcd = function (x, y) {
    while (y !== 0) {
      let temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  };
  return gcd(a, b) === 1; // Numbers are co-prime if GCD is 1
};

// Solve the Tower of Hanoi problem for n disks
var towerOfHanoi = function (n, from, to, aux) {
  if (n === 1) {
    console.log(`Move disk 1 from ${from} to ${to}`); // Base case
    return;
  }
  // Move n-1 disks from 'from' to 'aux' using 'to' as auxiliary
  towerOfHanoi(n - 1, from, aux, to);
  console.log(`Move disk ${n} from ${from} to ${to}`); // Move nth disk
  // Move n-1 disks from 'aux' to 'to' using 'from' as auxiliary
  towerOfHanoi(n - 1, aux, to, from);
};

// Find all permutations of a given integer
var findPermutations = function (num) {
  let digits = num.toString().split(""); // Split number into digits
  let results = [];
  // Recursive function to generate permutations
  var permute = function (arr, m = []) {
    if (arr.length === 0) {
      results.push(parseInt(m.join(""))); // Add permutation as a number
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next)); // Recursive call
      }
    }
  };
  permute(digits);
  return results;
};

// Find all permutations of a given integer
var findPermutations = function (num) {
  let digits = num.toString().split(""); // Split number into digits
  let results = [];

  // Helper function to swap elements in an array
  var swap = function (arr, i, j) {
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  };

  // Recursive function to generate permutations
  var generate = function (arr, start) {
    if (start === arr.length - 1) {
      results.push(parseInt(arr.join(""))); // Add permutation as a number
      return;
    }
    for (let i = start; i < arr.length; i++) {
      swap(arr, start, i); // Swap to create a new permutation
      generate(arr, start + 1); // Recurse for the next position
      swap(arr, start, i); // Swap back to backtrack
    }
  };

  generate(digits, 0);
  return results;
};

// Calculate the power of a number (x^y) without using the built-in power function
var power = function (x, y) {
  let result = 1;
  let isNegative = y < 0; // Check if the exponent is negative
  y = Math.abs(y); // Work with absolute value of exponent
  for (let i = 0; i < y; i++) {
    result *= x; // Multiply x y times
  }
  return isNegative ? 1 / result : result; // Return reciprocal if negative
};

// Check if a number is a Harshad (Niven) number
var isHarshad = function (num) {
  let sum = 0,
    original = num;
  while (num > 0) {
    sum += num % 10; // Add the digits
    num = Math.floor(num / 10); // Remove the last digit
  }
  return original % sum === 0; // Check divisibility
};

// Find the number of trailing zeroes in a factorial of a number
var trailingZeroes = function (n) {
  let count = 0;
  // Count factors of 5 in n!
  for (let i = 5; Math.floor(n / i) > 0; i *= 5) {
    count += Math.floor(n / i);
  }
  return count;
};
