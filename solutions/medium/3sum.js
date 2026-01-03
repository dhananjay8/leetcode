/**
 * Problem: 3Sum
 * Link: https://leetcode.com/problems/3sum/
 * Difficulty: Medium
 *
 * Given an integer array nums, return all unique triplets [nums[i], nums[j], nums[k]]
 * such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.
 *
 * Example:
 * Input: nums = [-1,0,1,2,-1,-4]
 * Output: [[-1,-1,2],[-1,0,1]]
 *
 * Time Complexity: O(n^2)
 * Space Complexity: O(1) excluding output
 */

// JavaScript Solution - Sorting + Two Pointers
function threeSum(nums) {
  const result = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length - 2; i++) {
    // Skip duplicates for first number
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1;
    let right = nums.length - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);

        // Skip duplicates for second number
        while (left < right && nums[left] === nums[left + 1]) left++;
        // Skip duplicates for third number
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// Test cases
console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0, 1, 1])); // []
console.log(threeSum([0, 0, 0])); // [[0,0,0]]

module.exports = threeSum;

/* Python Solution (commented):

def three_sum(nums: list[int]) -> list[list[int]]:
    """
    Find all unique triplets that sum to zero
    
    Args:
        nums: Array of integers
    
    Returns:
        List of triplets
    
    Time Complexity: O(n^2)
    Space Complexity: O(1)
    """
    result = []
    nums.sort()
    
    for i in range(len(nums) - 2):
        # Skip duplicates
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        left = i + 1
        right = len(nums) - 1
        
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                
                # Skip duplicates
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    
    return result

# Test cases
print(three_sum([-1,0,1,2,-1,-4]))  # [[-1,-1,2],[-1,0,1]]
print(three_sum([0,1,1]))  # []
print(three_sum([0,0,0]))  # [[0,0,0]]

*/
