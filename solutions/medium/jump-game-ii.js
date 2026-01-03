/**
 * Problem: Jump Game II
 * Link: https://leetcode.com/problems/jump-game-ii/
 * Difficulty: Medium
 *
 * You are given a 0-indexed array nums of length n. You are initially positioned at nums[0].
 * Each element nums[i] represents the maximum jump length from that position.
 * Return the minimum number of jumps to reach nums[n - 1].
 *
 * Example:
 * Input: nums = [2,3,1,1,4]
 * Output: 2 (jump from index 0 to 1, then to last index)
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Greedy BFS
function jump(nums) {
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  // Don't need to jump from last position
  for (let i = 0; i < nums.length - 1; i++) {
    // Update farthest reachable position
    farthest = Math.max(farthest, i + nums[i]);

    // Reached end of current jump range
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;

      // Early exit if we can reach the end
      if (currentEnd >= nums.length - 1) {
        break;
      }
    }
  }

  return jumps;
}

// Test cases
console.log(jump([2, 3, 1, 1, 4])); // 2
console.log(jump([2, 3, 0, 1, 4])); // 2
console.log(jump([1, 2, 3])); // 2
console.log(jump([1, 1, 1, 1])); // 3

module.exports = jump;

/* Python Solution (commented):

def jump(nums: list[int]) -> int:
    """
    Find minimum number of jumps to reach end
    
    Args:
        nums: Array of maximum jump lengths
    
    Returns:
        Minimum number of jumps
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    jumps = 0
    current_end = 0
    farthest = 0
    
    # Don't need to jump from last position
    for i in range(len(nums) - 1):
        # Update farthest reachable
        farthest = max(farthest, i + nums[i])
        
        # Reached end of current jump
        if i == current_end:
            jumps += 1
            current_end = farthest
            
            # Early exit
            if current_end >= len(nums) - 1:
                break
    
    return jumps

# Test cases
print(jump([2,3,1,1,4]))  # 2
print(jump([2,3,0,1,4]))  # 2
print(jump([1,2,3]))  # 2
print(jump([1,1,1,1]))  # 3

*/
