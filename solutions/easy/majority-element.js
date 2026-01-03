/**
 * Problem: Majority Element
 * Link: https://leetcode.com/problems/majority-element/
 * Difficulty: Easy
 *
 * Given an array nums of size n, return the majority element.
 * The majority element is the element that appears more than ⌊n / 2⌋ times.
 *
 * Example:
 * Input: nums = [3,2,3]
 * Output: 3
 *
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */

// JavaScript Solution - Boyer-Moore Voting Algorithm
function majorityElement(nums) {
  let candidate = null;
  let count = 0;

  // Find candidate
  for (const num of nums) {
    if (count === 0) {
      candidate = num;
    }
    count += num === candidate ? 1 : -1;
  }

  return candidate;
}

// Alternative: HashMap approach
function majorityElementHashMap(nums) {
  const counts = new Map();
  const majority = Math.floor(nums.length / 2);

  for (const num of nums) {
    counts.set(num, (counts.get(num) || 0) + 1);
    if (counts.get(num) > majority) {
      return num;
    }
  }
}

// Test cases
console.log(majorityElement([3, 2, 3])); // 3
console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2
console.log(majorityElement([1])); // 1

module.exports = majorityElement;

/* Python Solution (commented):

def majority_element(nums: list[int]) -> int:
    """
    Find majority element using Boyer-Moore Voting Algorithm
    
    Args:
        nums: Array of integers
    
    Returns:
        The majority element
    
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    candidate = None
    count = 0
    
    # Find candidate
    for num in nums:
        if count == 0:
            candidate = num
        count += 1 if num == candidate else -1
    
    return candidate

# Alternative: HashMap approach
def majority_element_hashmap(nums: list[int]) -> int:
    from collections import Counter
    
    counts = Counter(nums)
    return max(counts.keys(), key=counts.get)

# Test cases
print(majority_element([3,2,3]))  # 3
print(majority_element([2,2,1,1,1,2,2]))  # 2
print(majority_element([1]))  # 1

*/
