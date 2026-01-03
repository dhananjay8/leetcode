/**
 * Problem: Remove Element
 * Link: https://leetcode.com/problems/remove-element/
 * Difficulty: Easy
 *
 * Given an integer array nums and an integer val, remove all occurrences of val in nums in-place.
 * Return k after placing the final result in the first k slots of nums.
 *
 * Example:
 * Input: nums = [3,2,2,3], val = 3
 * Output: 2, nums = [2,2,_,_]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers
function removeElement(nums, val) {
  let k = 0; // Slow pointer for non-val elements

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[k] = nums[i];
      k++;
    }
  }

  return k;
}

// Test cases
let nums = [3, 2, 2, 3];
console.log(removeElement(nums, 3)); // 2
console.log(nums.slice(0, 2)); // [2,2]

nums = [0, 1, 2, 2, 3, 0, 4, 2];
console.log(removeElement(nums, 2)); // 5
console.log(nums.slice(0, 5)); // [0,1,3,0,4]

module.exports = removeElement;

/* Python Solution (commented):

def remove_element(nums: list[int], val: int) -> int:
    """
    Remove all occurrences of val in-place
    
    Args:
        nums: Array of integers
        val: Value to remove
    
    Returns:
        Number of elements not equal to val
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    k = 0  # Slow pointer
    
    for i in range(len(nums)):
        if nums[i] != val:
            nums[k] = nums[i]
            k += 1
    
    return k

# Test cases
nums = [3,2,2,3]
k = remove_element(nums, 3)
print(k, nums[:k])  # 2 [2, 2]

nums = [0,1,2,2,3,0,4,2]
k = remove_element(nums, 2)
print(k, nums[:k])  # 5 [0, 1, 3, 0, 4]

*/
