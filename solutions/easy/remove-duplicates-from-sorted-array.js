/**
 * Problem: Remove Duplicates from Sorted Array
 * Link: https://leetcode.com/problems/remove-duplicates-from-sorted-array/
 * Difficulty: Easy
 *
 * Given an integer array nums sorted in non-decreasing order, remove duplicates in-place
 * such that each unique element appears only once. Return the number of unique elements.
 *
 * Example:
 * Input: nums = [1,1,2]
 * Output: 2, nums = [1,2,_]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  let k = 1; // Slow pointer for unique elements

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }

  return k;
}

// Test cases
let nums = [1, 1, 2];
console.log(removeDuplicates(nums)); // 2
console.log(nums.slice(0, 2)); // [1,2]

nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
console.log(removeDuplicates(nums)); // 5
console.log(nums.slice(0, 5)); // [0,1,2,3,4]

module.exports = removeDuplicates;

/* Python Solution (commented):

def remove_duplicates(nums: list[int]) -> int:
    """
    Remove duplicates from sorted array in-place
    
    Args:
        nums: Sorted array of integers
    
    Returns:
        Number of unique elements
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not nums:
        return 0
    
    k = 1  # Slow pointer
    
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1]:
            nums[k] = nums[i]
            k += 1
    
    return k

# Test cases
nums = [1,1,2]
k = remove_duplicates(nums)
print(k, nums[:k])  # 2 [1, 2]

nums = [0,0,1,1,1,2,2,3,3,4]
k = remove_duplicates(nums)
print(k, nums[:k])  # 5 [0, 1, 2, 3, 4]

*/
