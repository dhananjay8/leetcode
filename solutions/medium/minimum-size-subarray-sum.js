/**
 * @param {number} target
 * @param {number[]} nums
 * @return {number}
 */
var minSubArrayLen = function (target, nums) {
  let l = 0;
  let res = Infinity;
  let currSum = 0;
  for (let i = 0; i < nums.length; i++) {
    currSum += nums[i];
    while (currSum >= target) {
      res = Math.min(res, i + 1 - l);
      currSum -= nums[l++];
    }
  }
  return res === Infinity ? 0 : res;
};
