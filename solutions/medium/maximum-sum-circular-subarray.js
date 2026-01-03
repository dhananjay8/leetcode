/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubarraySumCircular = function (nums) {
  let currMin = 0;
  let currMax = 0;
  let total = 0;
  let globalMax = nums[0];
  let globalMin = nums[0];

  for (let i = 0; i < nums.length; i++) {
    currMax = Math.max(currMax + nums[i], nums[i]);
    currMin = Math.min(currMin + nums[i], nums[i]);

    total += nums[i];

    globalMax = Math.max(globalMax, currMax);
    globalMin = Math.min(globalMin, currMin);
  }

  if (globalMax < 0) return globalMax;

  return Math.max(globalMax, total - globalMin);
};
