/**
 * Problem: Two Sum II - Input Array Is Sorted
 * Link: https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/
 * Difficulty: Medium
 *
 * Given a 1-indexed array of integers numbers sorted in non-decreasing order,
 * find two numbers such that they add up to a specific target number.
 * Return the indices of the two numbers (1-indexed).
 *
 * Example:
 * Input: numbers = [2,7,11,15], target = 9
 * Output: [1,2]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers
function twoSum(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];

    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return []; // No solution found
}

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [1,2]
console.log(twoSum([2, 3, 4], 6)); // [1,3]
console.log(twoSum([-1, 0], -1)); // [1,2]

module.exports = twoSum;

/* Python Solution (commented):

def two_sum(numbers: list[int], target: int) -> list[int]:
    """
    Find two numbers that add up to target
    
    Args:
        numbers: Sorted array of integers
        target: Target sum
    
    Returns:
        1-indexed positions of two numbers
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left = 0
    right = len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []  # No solution

# Test cases
print(two_sum([2,7,11,15], 9))  # [1, 2]
print(two_sum([2,3,4], 6))  # [1, 3]
print(two_sum([-1,0], -1))  # [1, 2]

*/
