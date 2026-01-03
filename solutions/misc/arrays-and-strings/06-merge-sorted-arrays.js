/**
 * Merge Two Sorted Arrays
 *
 * Problem: Merge two sorted arrays into one sorted array
 *
 * Approaches:
 * 1. Two pointers (most efficient)
 * 2. In-place merge (for leetcode style with extra space)
 * Time Complexity: O(m + n), Space Complexity: O(m + n) or O(1)
 */

// JavaScript Solution

// Approach 1: Two pointers - create new array
function mergeSortedArrays(nums1, nums2) {
  const merged = [];
  let i = 0,
    j = 0;

  // Compare elements from both arrays and add smaller one
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i]);
      i++;
    } else {
      merged.push(nums2[j]);
      j++;
    }
  }

  // Add remaining elements from nums1
  while (i < nums1.length) {
    merged.push(nums1[i]);
    i++;
  }

  // Add remaining elements from nums2
  while (j < nums2.length) {
    merged.push(nums2[j]);
    j++;
  }

  return merged;
}

// Approach 2: In-place merge (LeetCode style)
// nums1 has enough space to hold both arrays
function mergeInPlace(nums1, m, nums2, n) {
  // Start from the end to avoid overwriting
  let i = m - 1; // Last element in nums1
  let j = n - 1; // Last element in nums2
  let k = m + n - 1; // Last position in merged array

  // Merge from back to front
  while (i >= 0 && j >= 0) {
    if (nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }

  // Copy remaining elements from nums2 if any
  while (j >= 0) {
    nums1[k] = nums2[j];
    j--;
    k--;
  }

  // No need to copy remaining from nums1 as they're already in place
  return nums1;
}

// Merge multiple sorted arrays
function mergeKSortedArrays(arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];

  let result = arrays[0];

  for (let i = 1; i < arrays.length; i++) {
    result = mergeSortedArrays(result, arrays[i]);
  }

  return result;
}

// Example usage
console.log(mergeSortedArrays([1, 3, 5, 7], [2, 4, 6, 8]));
// [1, 2, 3, 4, 5, 6, 7, 8]

const nums1 = [1, 2, 3, 0, 0, 0];
console.log(mergeInPlace(nums1, 3, [2, 5, 6], 3));
// [1, 2, 2, 3, 5, 6]

console.log(
  mergeKSortedArrays([
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
  ])
);
// [1, 2, 3, 4, 5, 6, 7, 8, 9]

/*
Python Solution:

def merge_sorted_arrays(nums1, nums2):
    """
    Merge two sorted arrays using two pointers
    
    Args:
        nums1: First sorted array
        nums2: Second sorted array
    Returns:
        Merged sorted array
    """
    merged = []
    i = j = 0
    
    # Compare elements from both arrays
    while i < len(nums1) and j < len(nums2):
        if nums1[i] <= nums2[j]:
            merged.append(nums1[i])
            i += 1
        else:
            merged.append(nums2[j])
            j += 1
    
    # Add remaining elements
    merged.extend(nums1[i:])
    merged.extend(nums2[j:])
    
    return merged

def merge_in_place(nums1, m, nums2, n):
    """Merge in-place (LeetCode style)"""
    # Start from the end
    i = m - 1
    j = n - 1
    k = m + n - 1
    
    # Merge from back to front
    while i >= 0 and j >= 0:
        if nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
    
    # Copy remaining elements from nums2
    while j >= 0:
        nums1[k] = nums2[j]
        j -= 1
        k -= 1
    
    return nums1

def merge_k_sorted_arrays(arrays):
    """Merge multiple sorted arrays"""
    if not arrays:
        return []
    if len(arrays) == 1:
        return arrays[0]
    
    result = arrays[0]
    for i in range(1, len(arrays)):
        result = merge_sorted_arrays(result, arrays[i])
    
    return result

# Example usage
print(merge_sorted_arrays([1, 3, 5, 7], [2, 4, 6, 8]))
# [1, 2, 3, 4, 5, 6, 7, 8]

nums1 = [1, 2, 3, 0, 0, 0]
print(merge_in_place(nums1, 3, [2, 5, 6], 3))
# [1, 2, 2, 3, 5, 6]

print(merge_k_sorted_arrays([[1, 4, 7], [2, 5, 8], [3, 6, 9]]))
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
*/

module.exports = { mergeSortedArrays, mergeInPlace, mergeKSortedArrays };
