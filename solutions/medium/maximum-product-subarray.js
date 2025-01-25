/**
 * @param {number[]} nums
 * @return {number}
 */
var maxProduct = function (nums) {
  if (nums.length === 0) return 0;

  let maxProduct = nums[0]; // Stores the maximum product found so far
  let currentMax = nums[0]; // Current maximum product ending at the current position
  let currentMin = nums[0]; // Current minimum product ending at the current position

  for (let i = 1; i < nums.length; i++) {
    const num = nums[i];

    // If the current number is negative, swapping max and min helps manage the sign flip
    if (num < 0) {
      [currentMax, currentMin] = [currentMin, currentMax];
    }

    // Update currentMax and currentMin
    currentMax = Math.max(num, currentMax * num);
    currentMin = Math.min(num, currentMin * num);

    // Update the overall maxProduct
    maxProduct = Math.max(maxProduct, currentMax);
  }

  return maxProduct;
};
