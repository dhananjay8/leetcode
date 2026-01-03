/**
 * Maximum Sum Subarray (Kadane's Algorithm)
 *
 * Problem: Find the contiguous subarray with the maximum sum
 *
 * Approach:
 * - Use Kadane's algorithm to track current sum and maximum sum
 * - At each position, decide whether to extend current subarray or start new one
 * - Time Complexity: O(n), Space Complexity: O(1)
 */

// JavaScript Solution
function maxSubArray(nums) {
  // Initialize with first element
  let maxSum = nums[0];
  let currentSum = nums[0];

  // Iterate through array starting from second element
  for (let i = 1; i < nums.length; i++) {
    // Either extend current subarray or start new one
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    // Update maximum sum found so far
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Example usage
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // Output: 6 ([4,-1,2,1])
console.log(maxSubArray([1])); // Output: 1
console.log(maxSubArray([5, 4, -1, 7, 8])); // Output: 23

/*
Python Solution:

def max_sub_array(nums):
    """
    Find maximum sum of contiguous subarray using Kadane's algorithm
    
    Args:
        nums: List of integers
    Returns:
        Maximum sum of contiguous subarray
    """
    # Initialize with first element
    max_sum = nums[0]
    current_sum = nums[0]
    
    # Iterate through array starting from second element
    for i in range(1, len(nums)):
        # Either extend current subarray or start new one
        current_sum = max(nums[i], current_sum + nums[i])
        # Update maximum sum found so far
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Example usage
print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # Output: 6
print(max_sub_array([1]))  # Output: 1
print(max_sub_array([5, 4, -1, 7, 8]))  # Output: 23
*/

module.exports = { maxSubArray };
