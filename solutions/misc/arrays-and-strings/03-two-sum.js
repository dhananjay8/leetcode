/**
 * Two Sum Problem
 * 
 * Problem: Find two numbers that add up to a specific target
 * 
 * Approach:
 * - Use hash map to store complements
 * - For each number, check if its complement exists in map
 * - Time Complexity: O(n), Space Complexity: O(n)
 */

// JavaScript Solution
function twoSum(nums, target) {
    // Map to store number and its index
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        // Check if complement exists in map
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        // Store current number and its index
        map.set(nums[i], i);
    }
    
    return []; // No solution found
}

// Return values instead of indices
function twoSumValues(nums, target) {
    const seen = new Set();
    
    for (const num of nums) {
        const complement = target - num;
        if (seen.has(complement)) {
            return [complement, num];
        }
        seen.add(num);
    }
    
    return [];
}

// Example usage
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
console.log(twoSum([3, 3], 6)); // [0, 1]
console.log(twoSumValues([2, 7, 11, 15], 9)); // [2, 7]

/*
Python Solution:

def two_sum(nums, target):
    """
    Find indices of two numbers that add up to target
    
    Args:
        nums: List of integers
        target: Target sum
    Returns:
        List of two indices
    """
    # Dictionary to store number and its index
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in map
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number and its index
        num_map[num] = i
    
    return []  # No solution found

def two_sum_values(nums, target):
    """Return values instead of indices"""
    seen = set()
    
    for num in nums:
        complement = target - num
        if complement in seen:
            return [complement, num]
        seen.add(num)
    
    return []

# Example usage
print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))  # [1, 2]
print(two_sum([3, 3], 6))  # [0, 1]
print(two_sum_values([2, 7, 11, 15], 9))  # [2, 7]
*/

module.exports = { twoSum, twoSumValues };
