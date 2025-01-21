/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var numSubarrayProductLessThanK = function (nums, k) {
  if (k <= 1) return 0; // If k is 0 or 1, no product can be less than k
  let leftPointer = 0;
  let count = 0;
  let currProduct = 1;
  for (let rightPointer = 0; rightPointer < nums.length; rightPointer++) {
    currProduct *= nums[rightPointer];
    // Shrink the window while the product is >= k
    while (currProduct >= k) {
      // Remove left most number from window
      currProduct /= nums[leftPointer];
      leftPointer++;
    }
    // •	All subarrays ending at rightPointer are:
    // •	[nums[rightPointer]]
    // •	[nums[rightPointer-1], nums[rightPointer]]
    // •	[nums[rightPointer-2], nums[rightPointer-1], nums[rightPointer]]
    // •	…
    // •	[nums[leftPointer], ..., nums[rightPointer]]
    // •	The total number of such subarrays is exactly rightPointer - leftPointer + 1.
    // The number of valid subarrays ending at `right` is `right - left + 1`
    count += rightPointer - leftPointer + 1;
  }
  return count;
};
