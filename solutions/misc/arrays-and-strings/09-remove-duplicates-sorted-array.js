/**
 * Remove Duplicates from Sorted Array
 *
 * Problem: Remove duplicates in-place from a sorted array
 *
 * Approach:
 * - Two pointers: slow and fast
 * - Slow pointer tracks unique elements
 * - Fast pointer scans the array
 * Time Complexity: O(n), Space Complexity: O(1)
 */

// JavaScript Solution

// In-place removal (modify original array)
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;

  // Slow pointer for unique elements
  let slow = 0;

  // Fast pointer to scan array
  for (let fast = 1; fast < nums.length; fast++) {
    // Found a new unique element
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  // Return count of unique elements
  return slow + 1;
}

// Return new array with duplicates removed
function removeDuplicatesNewArray(nums) {
  if (nums.length === 0) return [];

  const result = [nums[0]];

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      result.push(nums[i]);
    }
  }

  return result;
}

// Remove duplicates allowing up to k duplicates
function removeDuplicatesK(nums, k = 2) {
  if (nums.length <= k) return nums.length;

  let slow = k;

  for (let fast = k; fast < nums.length; fast++) {
    // Compare with element k positions back
    if (nums[fast] !== nums[slow - k]) {
      nums[slow] = nums[fast];
      slow++;
    }
  }

  return slow;
}

// Using Set (works for unsorted too, but loses order for sorted)
function removeDuplicatesSet(nums) {
  return [...new Set(nums)];
}

// Count total duplicates removed
function countDuplicates(nums) {
  if (nums.length === 0) return 0;

  let count = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      count++;
    }
  }

  return count;
}

// Example usage
const arr1 = [1, 1, 2, 2, 3, 4, 4, 5];
console.log(removeDuplicates(arr1)); // 5
console.log(arr1.slice(0, 5)); // [1, 2, 3, 4, 5]

console.log(removeDuplicatesNewArray([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]));
// [0, 1, 2, 3, 4]

const arr2 = [1, 1, 1, 2, 2, 3];
console.log(removeDuplicatesK(arr2, 2)); // 5
console.log(arr2.slice(0, 5)); // [1, 1, 2, 2, 3]

console.log(countDuplicates([1, 1, 2, 2, 2, 3])); // 3

/*
Python Solution:

def remove_duplicates(nums):
    """
    Remove duplicates from sorted array in-place
    
    Args:
        nums: Sorted array
    Returns:
        Length of array after removing duplicates
    """
    if not nums:
        return 0
    
    # Slow pointer for unique elements
    slow = 0
    
    # Fast pointer to scan array
    for fast in range(1, len(nums)):
        # Found a new unique element
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast]
    
    # Return count of unique elements
    return slow + 1

def remove_duplicates_new_array(nums):
    """Return new array with duplicates removed"""
    if not nums:
        return []
    
    result = [nums[0]]
    
    for i in range(1, len(nums)):
        if nums[i] != nums[i - 1]:
            result.append(nums[i])
    
    return result

def remove_duplicates_k(nums, k=2):
    """Remove duplicates allowing up to k duplicates"""
    if len(nums) <= k:
        return len(nums)
    
    slow = k
    
    for fast in range(k, len(nums)):
        # Compare with element k positions back
        if nums[fast] != nums[slow - k]:
            nums[slow] = nums[fast]
            slow += 1
    
    return slow

def remove_duplicates_set(nums):
    """Using set (works for unsorted too)"""
    return list(set(nums))

def count_duplicates(nums):
    """Count total duplicates removed"""
    if not nums:
        return 0
    
    count = 0
    
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            count += 1
    
    return count

# Example usage
arr1 = [1, 1, 2, 2, 3, 4, 4, 5]
print(remove_duplicates(arr1))  # 5
print(arr1[:5])  # [1, 2, 3, 4, 5]

print(remove_duplicates_new_array([0, 0, 1, 1, 1, 2, 2, 3, 3, 4]))
# [0, 1, 2, 3, 4]

arr2 = [1, 1, 1, 2, 2, 3]
print(remove_duplicates_k(arr2, 2))  # 5
print(arr2[:5])  # [1, 1, 2, 2, 3]

print(count_duplicates([1, 1, 2, 2, 2, 3]))  # 3
*/

module.exports = {
  removeDuplicates,
  removeDuplicatesNewArray,
  removeDuplicatesK,
  removeDuplicatesSet,
  countDuplicates,
};
