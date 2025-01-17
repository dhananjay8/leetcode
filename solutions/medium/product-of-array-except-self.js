/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function (nums) {
  let left = 1,
    right = 1;
  let res = [];

  for (let i = 0; i < nums.length; i++) {
    res[i] = left;
    left *= Number(nums[i]);
  }

  for (let i = nums.length - 1; i >= 0; i--) {
    res[i] *= right;
    right *= Number(nums[i]);
  }

  return res;
};
