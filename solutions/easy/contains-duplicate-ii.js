/**
 * Problem: Contains Duplicate II
 * Link: https://leetcode.com/problems/contains-duplicate-ii/
 * Difficulty: Easy
 *
 * Given an integer array nums and an integer k, return true if there are two distinct
 * indices i and j such that nums[i] == nums[j] and abs(i - j) <= k.
 *
 * Example:
 * Input: nums = [1,2,3,1], k = 3
 * Output: true
 *
 * Input: nums = [1,2,3,1,2,3], k = 2
 * Output: false
 *
 * Time Complexity: O(n)
 * Space Complexity: O(min(n,k))
 */

// JavaScript Solution - HashMap
function containsNearbyDuplicate(nums, k) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    if (map.has(nums[i])) {
      if (i - map.get(nums[i]) <= k) {
        return true;
      }
    }
    map.set(nums[i], i);
  }

  return false;
}

// Alternative: Sliding Window with Set
function containsNearbyDuplicateSet(nums, k) {
  const set = new Set();

  for (let i = 0; i < nums.length; i++) {
    if (set.has(nums[i])) {
      return true;
    }

    set.add(nums[i]);

    // Maintain window size of k
    if (set.size > k) {
      set.delete(nums[i - k]);
    }
  }

  return false;
}

// Test cases
console.log(containsNearbyDuplicate([1, 2, 3, 1], 3)); // true
console.log(containsNearbyDuplicate([1, 0, 1, 1], 1)); // true
console.log(containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)); // false

module.exports = containsNearbyDuplicate;

/* Python Solution (commented):

def contains_nearby_duplicate(nums: list[int], k: int) -> bool:
    """
    Check if duplicate exists within k distance
    
    Args:
        nums: Array of integers
        k: Maximum distance
    
    Returns:
        True if nearby duplicate exists
    
    Time Complexity: O(n)
    Space Complexity: O(min(n,k))
    """
    num_map = {}
    
    for i, num in enumerate(nums):
        if num in num_map:
            if i - num_map[num] <= k:
                return True
        num_map[num] = i
    
    return False

# Alternative: Sliding Window with Set
def contains_nearby_duplicate_set(nums: list[int], k: int) -> bool:
    num_set = set()
    
    for i, num in enumerate(nums):
        if num in num_set:
            return True
        
        num_set.add(num)
        
        # Maintain window size
        if len(num_set) > k:
            num_set.remove(nums[i - k])
    
    return False

# Test cases
print(contains_nearby_duplicate([1,2,3,1], 3))  # True
print(contains_nearby_duplicate([1,0,1,1], 1))  # True
print(contains_nearby_duplicate([1,2,3,1,2,3], 2))  # False

*/
