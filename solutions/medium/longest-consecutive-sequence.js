/**
 * Problem: Longest Consecutive Sequence
 * Link: https://leetcode.com/problems/longest-consecutive-sequence/
 * Difficulty: Medium
 *
 * Given an unsorted array of integers nums, return the length of the longest
 * consecutive elements sequence. Must run in O(n) time.
 *
 * Example:
 * Input: nums = [100,4,200,1,3,2]
 * Output: 4 (sequence: [1,2,3,4])
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution - HashSet
function longestConsecutive(nums) {
  if (nums.length === 0) return 0;

  const numSet = new Set(nums);
  let maxLength = 0;

  for (const num of numSet) {
    // Only start counting if this is the start of a sequence
    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentLength = 1;

      // Count consecutive numbers
      while (numSet.has(currentNum + 1)) {
        currentNum++;
        currentLength++;
      }

      maxLength = Math.max(maxLength, currentLength);
    }
  }

  return maxLength;
}

// Test cases
console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4
console.log(longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1])); // 9
console.log(longestConsecutive([9, 1, 4, 7, 3, -1, 0, 5, 8, -2, 6, 2])); // 12

module.exports = longestConsecutive;

/* Python Solution (commented):

def longest_consecutive(nums: list[int]) -> int:
    """
    Find longest consecutive sequence
    
    Args:
        nums: Array of integers
    
    Returns:
        Length of longest consecutive sequence
    
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if not nums:
        return 0
    
    num_set = set(nums)
    max_length = 0
    
    for num in num_set:
        # Start of sequence
        if num - 1 not in num_set:
            current_num = num
            current_length = 1
            
            # Count consecutive
            while current_num + 1 in num_set:
                current_num += 1
                current_length += 1
            
            max_length = max(max_length, current_length)
    
    return max_length

# Test cases
print(longest_consecutive([100,4,200,1,3,2]))  # 4
print(longest_consecutive([0,3,7,2,5,8,4,6,0,1]))  # 9
print(longest_consecutive([9,1,4,7,3,-1,0,5,8,-2,6,2]))  # 12

*/
