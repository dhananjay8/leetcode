/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
  if (nums.length < 3) return nums.length;
  let currIndex = 2;
  for (let i = 2; i < nums.length; i++) {
    if (nums[i] !== nums[currIndex - 2]) {
      nums[currIndex] = nums[i];
      currIndex++;
    }
  }
  return currIndex;
};
