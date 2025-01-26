/**
 * @param {number[]} nums
 * @return {number[]}
 */
var findDuplicates = function (nums) {
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    const index = Math.abs(nums[i]) - 1; // Get the index based on the current value

    // If the number at the index is negative, it means we've seen it before
    if (nums[index] < 0) {
      result.push(Math.abs(nums[i]));
    } else {
      // Otherwise, mark the number at the index as visited by negating it
      nums[index] = -nums[index];
    }
  }

  return result;
};
