/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function (nums) {
  let result;
  for (let num of nums) {
    result ^= num;
  }
  return result;
};
