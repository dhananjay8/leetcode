/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function (nums, val) {
  return moveNumber(nums, val, "-");
};

var moveNumber = function (nums, numberToMove, replacement) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== numberToMove) {
      nums[count++] = nums[i];
    }
  }
  const ans = count;
  while (count < nums.length) {
    nums[count++] = replacement;
  }
  return ans;
};
