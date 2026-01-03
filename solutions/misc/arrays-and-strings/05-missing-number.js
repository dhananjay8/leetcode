/**
 * Find Missing Number in Array
 *
 * Problem: Find the missing number in an array containing n distinct numbers from 0 to n
 *
 * Multiple Approaches:
 * 1. Math formula (sum of n numbers)
 * 2. XOR bit manipulation
 * 3. Hash set
 * Time Complexity: O(n), Space Complexity: O(1) for approaches 1 & 2
 */

// JavaScript Solution

// Approach 1: Using mathematical formula
function missingNumberMath(nums) {
  const n = nums.length;
  // Sum of first n natural numbers: n * (n + 1) / 2
  const expectedSum = (n * (n + 1)) / 2;
  const actualSum = nums.reduce((sum, num) => sum + num, 0);

  return expectedSum - actualSum;
}

// Approach 2: Using XOR (most efficient, no overflow issues)
function missingNumberXOR(nums) {
  let xor = nums.length; // Start with n

  // XOR all indices and values
  for (let i = 0; i < nums.length; i++) {
    xor ^= i ^ nums[i];
  }

  return xor;
}

// Approach 3: Using Set
function missingNumberSet(nums) {
  const numSet = new Set(nums);

  for (let i = 0; i <= nums.length; i++) {
    if (!numSet.has(i)) {
      return i;
    }
  }

  return -1;
}

// For range with missing number (not starting from 0)
function findMissingInRange(nums, start, end) {
  const expectedSum = ((end - start + 1) * (start + end)) / 2;
  const actualSum = nums.reduce((sum, num) => sum + num, 0);

  return expectedSum - actualSum;
}

// Example usage
console.log(missingNumberMath([3, 0, 1])); // 2
console.log(missingNumberXOR([0, 1])); // 2
console.log(missingNumberSet([9, 6, 4, 2, 3, 5, 7, 0, 1])); // 8
console.log(findMissingInRange([5, 6, 8, 9], 5, 9)); // 7

/*
Python Solution:

def missing_number_math(nums):
    """
    Find missing number using mathematical formula
    
    Args:
        nums: List of distinct numbers from 0 to n
    Returns:
        Missing number
    """
    n = len(nums)
    # Sum of first n natural numbers
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    
    return expected_sum - actual_sum

def missing_number_xor(nums):
    """Find missing number using XOR (most efficient)"""
    xor = len(nums)  # Start with n
    
    # XOR all indices and values
    for i, num in enumerate(nums):
        xor ^= i ^ num
    
    return xor

def missing_number_set(nums):
    """Find missing number using Set"""
    num_set = set(nums)
    
    for i in range(len(nums) + 1):
        if i not in num_set:
            return i
    
    return -1

def find_missing_in_range(nums, start, end):
    """Find missing number in a range"""
    expected_sum = ((end - start + 1) * (start + end)) // 2
    actual_sum = sum(nums)
    
    return expected_sum - actual_sum

# Example usage
print(missing_number_math([3, 0, 1]))  # 2
print(missing_number_xor([0, 1]))  # 2
print(missing_number_set([9, 6, 4, 2, 3, 5, 7, 0, 1]))  # 8
print(find_missing_in_range([5, 6, 8, 9], 5, 9))  # 7
*/

module.exports = {
  missingNumberMath,
  missingNumberXOR,
  missingNumberSet,
  findMissingInRange,
};
