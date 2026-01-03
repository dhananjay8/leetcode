/**
 * Problem: Two Sum
 * Link: https://leetcode.com/problems/two-sum/
 * Difficulty: Easy
 *
 * Given an array of integers nums and an integer target, return indices of the
 * two numbers such that they add up to target.
 *
 * Example:
 * Input: nums = [2,7,11,15], target = 9
 * Output: [0,1]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - HashMap
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [0,1]
console.log(twoSum([3, 2, 4], 6)); // [1,2]
console.log(twoSum([3, 3], 6)); // [0,1]

module.exports = twoSum;

/* Python Solution (commented):

def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Find two numbers that add up to target
    
    Args:
        nums: Array of integers
        target: Target sum
    
    Returns:
        Indices of two numbers
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in num_map:
            return [num_map[complement], i]
        
        num_map[num] = i
    
    return []

# Test cases
print(two_sum([2,7,11,15], 9))  # [0, 1]
print(two_sum([3,2,4], 6))  # [1, 2]
print(two_sum([3,3], 6))  # [0, 1]

*/
