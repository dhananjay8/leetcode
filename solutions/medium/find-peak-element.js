/**
 * @param {number[]} nums
 * @return {number}
 */
var findPeakElement = function (nums) {
  // Initialize the left and right pointers for the binary search
  let left = 0;
  let right = nums.length - 1;

  // Perform binary search
  while (left < right) {
    // Calculate the middle index
    let mid = Math.floor((left + right) / 2);

    // Check if the middle element is greater than the next element
    if (nums[mid] > nums[mid + 1]) {
      // If nums[mid] > nums[mid + 1], the peak is on the left side (including mid)
      // Move the right pointer to mid
      right = mid;
    } else {
      // If nums[mid] <= nums[mid + 1], the peak is on the right side
      // Move the left pointer to mid + 1
      left = mid + 1;
    }
  }

  // When the loop ends, left and right converge to the peak element
  return left;
};
