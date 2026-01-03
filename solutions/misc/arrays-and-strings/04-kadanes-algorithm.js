/**
 * Kadane's Algorithm - Maximum Subarray Sum
 *
 * Problem: Find the maximum sum of a contiguous subarray
 *
 * Approach:
 * - Track current sum and maximum sum
 * - At each position, decide to extend or restart subarray
 * - Time Complexity: O(n), Space Complexity: O(1)
 */

// JavaScript Solution
function kadanesAlgorithm(nums) {
  if (nums.length === 0) return 0;

  let maxSum = nums[0];
  let currentSum = nums[0];
  let start = 0,
    end = 0,
    tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    // If current sum becomes negative, start new subarray
    if (currentSum < 0) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum += nums[i];
    }

    // Update maximum sum and track indices
    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return {
    maxSum,
    subarray: nums.slice(start, end + 1),
    startIndex: start,
    endIndex: end,
  };
}

// Simple version - just return max sum
function maxSubarraySum(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Handle all negative numbers
function kadanesWithAllNegative(nums) {
  if (nums.length === 0) return 0;

  let maxSum = -Infinity;
  let currentSum = 0;

  for (const num of nums) {
    currentSum = Math.max(num, currentSum + num);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Example usage
console.log(kadanesAlgorithm([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
// { maxSum: 6, subarray: [4, -1, 2, 1], startIndex: 3, endIndex: 6 }

console.log(maxSubarraySum([1, -3, 2, -1, 3])); // 4
console.log(kadanesWithAllNegative([-2, -3, -1, -4])); // -1

/*
Python Solution:

def kadanes_algorithm(nums):
    """
    Kadane's algorithm with subarray tracking
    
    Args:
        nums: List of integers
    Returns:
        Dictionary with max sum, subarray, and indices
    """
    if not nums:
        return None
    
    max_sum = nums[0]
    current_sum = nums[0]
    start = end = temp_start = 0
    
    for i in range(1, len(nums)):
        # If current sum becomes negative, start new subarray
        if current_sum < 0:
            current_sum = nums[i]
            temp_start = i
        else:
            current_sum += nums[i]
        
        # Update maximum sum and track indices
        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i
    
    return {
        'max_sum': max_sum,
        'subarray': nums[start:end + 1],
        'start_index': start,
        'end_index': end
    }

def max_subarray_sum(nums):
    """Simple version - just return max sum"""
    max_sum = nums[0]
    current_sum = nums[0]
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum

def kadanes_with_all_negative(nums):
    """Handle all negative numbers"""
    if not nums:
        return 0
    
    max_sum = float('-inf')
    current_sum = 0
    
    for num in nums:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Example usage
print(kadanes_algorithm([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
# {'max_sum': 6, 'subarray': [4, -1, 2, 1], 'start_index': 3, 'end_index': 6}

print(max_subarray_sum([1, -3, 2, -1, 3]))  # 4
print(kadanes_with_all_negative([-2, -3, -1, -4]))  # -1
*/

module.exports = { kadanesAlgorithm, maxSubarraySum, kadanesWithAllNegative };
