/**
 * Problem: Contains Duplicate
 * Link: https://leetcode.com/problems/contains-duplicate/
 * Difficulty: Easy
 *
 * Return true if any value appears at least twice in the array.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */

// JavaScript Solution
function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}

module.exports = containsDuplicate;

/* Python Solution:

def containsDuplicate(nums):
    return len(nums) != len(set(nums))

*/
