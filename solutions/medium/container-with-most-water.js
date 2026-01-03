/**
 * Problem: Container With Most Water
 * Link: https://leetcode.com/problems/container-with-most-water/
 * Difficulty: Medium
 *
 * Given n non-negative integers height[i] representing height of vertical lines,
 * find two lines that together with x-axis form a container that holds the most water.
 *
 * Example:
 * Input: height = [1,8,6,2,5,4,8,3,7]
 * Output: 49 (lines at index 1 and 8)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two Pointers
function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    // Calculate current area
    const width = right - left;
    const minHeight = Math.min(height[left], height[right]);
    const area = width * minHeight;

    maxWater = Math.max(maxWater, area);

    // Move pointer with smaller height
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
}

// Test cases
console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxArea([1, 1])); // 1
console.log(maxArea([4, 3, 2, 1, 4])); // 16
console.log(maxArea([1, 2, 1])); // 2

module.exports = maxArea;

/* Python Solution (commented):

def max_area(height: list[int]) -> int:
    """
    Find maximum water container can hold
    
    Args:
        height: Array of heights
    
    Returns:
        Maximum area
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left = 0
    right = len(height) - 1
    max_water = 0
    
    while left < right:
        # Calculate area
        width = right - left
        min_height = min(height[left], height[right])
        area = width * min_height
        
        max_water = max(max_water, area)
        
        # Move pointer with smaller height
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    
    return max_water

# Test cases
print(max_area([1,8,6,2,5,4,8,3,7]))  # 49
print(max_area([1,1]))  # 1
print(max_area([4,3,2,1,4]))  # 16
print(max_area([1,2,1]))  # 2

*/
