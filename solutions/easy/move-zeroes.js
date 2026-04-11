/**
 * Problem: Move Zeroes
 * Link: https://leetcode.com/problems/move-zeroes/
 * Difficulty: Easy
 *
 * Move all 0's to end while maintaining relative order of non-zero elements. In-place.
 * Example: [0,1,0,3,12] => [1,3,12,0,0]
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Two pointers
function moveZeroes(nums) {
  let insertPos = 0; // position to place next non-zero element

  // Move all non-zero elements to the front
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[insertPos], nums[i]] = [nums[i], nums[insertPos]];
      insertPos++;
    }
  }
}

module.exports = moveZeroes;

/* Python Solution:

def moveZeroes(nums):
    insert_pos = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[insert_pos], nums[i] = nums[i], nums[insert_pos]
            insert_pos += 1

*/
