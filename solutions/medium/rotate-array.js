/**
 * Problem: Rotate Array
 * Link: https://leetcode.com/problems/rotate-array/
 * Difficulty: Medium
 *
 * Given an integer array nums, rotate the array to the right by k steps.
 *
 * Example:
 * Input: nums = [1,2,3,4,5,6,7], k = 3
 * Output: [5,6,7,1,2,3,4]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Optimal using array reversal
function rotate(nums, k) {
  k = k % nums.length; // Handle k > nums.length

  // Helper function to reverse array in place
  function reverse(arr, start, end) {
    while (start < end) {
      [arr[start], arr[end]] = [arr[end], arr[start]];
      start++;
      end--;
    }
  }

  // Reverse entire array
  reverse(nums, 0, nums.length - 1);
  // Reverse first k elements
  reverse(nums, 0, k - 1);
  // Reverse remaining elements
  reverse(nums, k, nums.length - 1);

  return nums;
}

// Alternative solution using extra space
function rotateWithSpace(nums, k) {
  k = k % nums.length;
  const rotated = [...nums.slice(-k), ...nums.slice(0, nums.length - k)];

  for (let i = 0; i < nums.length; i++) {
    nums[i] = rotated[i];
  }

  return nums;
}

// Test cases
console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3)); // [5,6,7,1,2,3,4]
console.log(rotate([-1, -100, 3, 99], 2)); // [3,99,-1,-100]

module.exports = rotate;

/* Python Solution (commented):

def rotate(nums: list[int], k: int) -> None:
    """
    Rotate array to the right by k steps in-place
    
    Args:
        nums: Array to rotate
        k: Number of steps to rotate
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    k = k % len(nums)
    
    def reverse(arr, start, end):
        """Helper function to reverse array in place"""
        while start < end:
            arr[start], arr[end] = arr[end], arr[start]
            start += 1
            end -= 1
    
    # Reverse entire array
    reverse(nums, 0, len(nums) - 1)
    # Reverse first k elements
    reverse(nums, 0, k - 1)
    # Reverse remaining elements
    reverse(nums, k, len(nums) - 1)

# Test cases
nums1 = [1,2,3,4,5,6,7]
rotate(nums1, 3)
print(nums1)  # [5,6,7,1,2,3,4]

nums2 = [-1,-100,3,99]
rotate(nums2, 2)
print(nums2)  # [3,99,-1,-100]

*/
