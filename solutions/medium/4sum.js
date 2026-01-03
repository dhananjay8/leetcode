/**
 * Problem: 4Sum
 * Link: https://leetcode.com/problems/4sum/
 * Difficulty: Medium
 * 
 * Given an array nums and an integer target, return all unique quadruplets 
 * [nums[a], nums[b], nums[c], nums[d]] such that nums[a] + nums[b] + nums[c] + nums[d] == target.
 * 
 * Example:
 * Input: nums = [1,0,-1,0,-2,2], target = 0
 * Output: [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
 * 
 * Time Complexity: O(n^3)
 * Space Complexity: O(1) excluding output
 */

// JavaScript Solution
function fourSum(nums, target) {
    const result = [];
    if (nums.length < 4) return result;
    
    nums.sort((a, b) => a - b);
    const n = nums.length;
    
    for (let i = 0; i < n - 3; i++) {
        // Skip duplicates for first number
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        for (let j = i + 1; j < n - 2; j++) {
            // Skip duplicates for second number
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            let left = j + 1;
            let right = n - 1;
            
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                
                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);
                    
                    // Skip duplicates for third number
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    // Skip duplicates for fourth number
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    
    return result;
}

// Test cases
console.log(fourSum([1,0,-1,0,-2,2], 0));
// [[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]

console.log(fourSum([2,2,2,2,2], 8));
// [[2,2,2,2]]

module.exports = fourSum;

/* Python Solution (commented):

def four_sum(nums: list[int], target: int) -> list[list[int]]:
    """
    Find all unique quadruplets that sum to target
    
    Args:
        nums: Array of integers
        target: Target sum
    
    Returns:
        List of unique quadruplets
    
    Time Complexity: O(n^3)
    Space Complexity: O(1) excluding output
    """
    result = []
    if len(nums) < 4:
        return result
    
    nums.sort()
    n = len(nums)
    
    for i in range(n - 3):
        # Skip duplicates for first number
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        for j in range(i + 1, n - 2):
            # Skip duplicates for second number
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            
            left = j + 1
            right = n - 1
            
            while left < right:
                total = nums[i] + nums[j] + nums[left] + nums[right]
                
                if total == target:
                    result.append([nums[i], nums[j], nums[left], nums[right]])
                    
                    # Skip duplicates
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    
                    left += 1
                    right -= 1
                elif total < target:
                    left += 1
                else:
                    right -= 1
    
    return result

# Test cases
print(four_sum([1,0,-1,0,-2,2], 0))
print(four_sum([2,2,2,2,2], 8))

*/
