/**
 * Problem: Remove Duplicates from Sorted Array II
 * Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/
 * Difficulty: Medium
 *
 * Given an integer array nums sorted in non-decreasing order, remove some duplicates in-place
 * such that each unique element appears at most twice. Return the number of elements after removal.
 *
 * Example:
 * Input: nums = [1,1,1,2,2,3]
 * Output: 5, nums = [1,1,2,2,3,_]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers with Count
function removeDuplicates(nums) {
  if (nums.length <= 2) return nums.length;

  let k = 2; // Start from index 2 since first two are always valid

  for (let i = 2; i < nums.length; i++) {
    // Compare with element 2 positions back
    if (nums[i] !== nums[k - 2]) {
      nums[k] = nums[i];
      k++;
    }
  }

  return k;
}

// Alternative approach with explicit counting
function removeDuplicatesWithCount(nums) {
  if (nums.length === 0) return 0;

  let k = 1;
  let count = 1;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      count++;
    } else {
      count = 1;
    }

    if (count <= 2) {
      nums[k] = nums[i];
      k++;
    }
  }

  return k;
}

// Test cases
let nums = [1, 1, 1, 2, 2, 3];
console.log(removeDuplicates(nums)); // 5
console.log(nums.slice(0, 5)); // [1,1,2,2,3]

nums = [0, 0, 1, 1, 1, 1, 2, 3, 3];
console.log(removeDuplicates(nums)); // 7
console.log(nums.slice(0, 7)); // [0,0,1,1,2,3,3]

module.exports = removeDuplicates;

/* Python Solution (commented):

def remove_duplicates(nums: list[int]) -> int:
    """
    Remove duplicates allowing at most 2 occurrences
    
    Args:
        nums: Sorted array of integers
    
    Returns:
        Number of elements after removal
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if len(nums) <= 2:
        return len(nums)
    
    k = 2  # Start from index 2
    
    for i in range(2, len(nums)):
        # Compare with element 2 positions back
        if nums[i] != nums[k - 2]:
            nums[k] = nums[i]
            k += 1
    
    return k

# Alternative with explicit counting
def remove_duplicates_with_count(nums: list[int]) -> int:
    if not nums:
        return 0
    
    k = 1
    count = 1
    
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            count += 1
        else:
            count = 1
        
        if count <= 2:
            nums[k] = nums[i]
            k += 1
    
    return k

# Test cases
nums = [1,1,1,2,2,3]
k = remove_duplicates(nums)
print(k, nums[:k])  # 5 [1, 1, 2, 2, 3]

nums = [0,0,1,1,1,1,2,3,3]
k = remove_duplicates(nums)
print(k, nums[:k])  # 7 [0, 0, 1, 1, 2, 3, 3]

*/
