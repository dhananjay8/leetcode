/**
 * Problem: Jump Game
 * Link: https://leetcode.com/problems/jump-game/
 * Difficulty: Medium
 *
 * You are given an integer array nums. You are initially positioned at the array's first index,
 * and each element represents your maximum jump length at that position.
 * Return true if you can reach the last index, or false otherwise.
 *
 * Example:
 * Input: nums = [2,3,1,1,4]
 * Output: true (jump 1 step to index 1, then 3 steps to last index)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Greedy Approach
function canJump(nums) {
  let maxReach = 0;

  for (let i = 0; i < nums.length; i++) {
    // If current position is beyond max reach, can't proceed
    if (i > maxReach) {
      return false;
    }

    // Update max reachable position
    maxReach = Math.max(maxReach, i + nums[i]);

    // Early exit if we can reach the end
    if (maxReach >= nums.length - 1) {
      return true;
    }
  }

  return true;
}

// Alternative: Backwards approach
function canJumpBackwards(nums) {
  let lastPos = nums.length - 1;

  for (let i = nums.length - 2; i >= 0; i--) {
    if (i + nums[i] >= lastPos) {
      lastPos = i;
    }
  }

  return lastPos === 0;
}

// Test cases
console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
console.log(canJump([0])); // true
console.log(canJump([2, 0, 0])); // true

module.exports = canJump;

/* Python Solution (commented):

def can_jump(nums: list[int]) -> bool:
    """
    Determine if you can reach the last index
    
    Args:
        nums: Array of maximum jump lengths
    
    Returns:
        True if can reach last index, False otherwise
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    max_reach = 0
    
    for i in range(len(nums)):
        # Can't reach current position
        if i > max_reach:
            return False
        
        # Update max reachable position
        max_reach = max(max_reach, i + nums[i])
        
        # Early exit
        if max_reach >= len(nums) - 1:
            return True
    
    return True

# Alternative: Backwards approach
def can_jump_backwards(nums: list[int]) -> bool:
    last_pos = len(nums) - 1
    
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= last_pos:
            last_pos = i
    
    return last_pos == 0

# Test cases
print(can_jump([2,3,1,1,4]))  # True
print(can_jump([3,2,1,0,4]))  # False
print(can_jump([0]))  # True
print(can_jump([2,0,0]))  # True

*/
