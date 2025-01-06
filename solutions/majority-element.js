/**
 * @param {number[]} nums
 * @return {number}
 */
var majorityElement = function (nums) {
  let majorityEle;
  let count = 0;
  for (const currEle of nums) {
    if (count === 0) {
      majorityEle = currEle;
      count++;
    } else if (majorityEle === currEle) {
      count++;
    } else count--;
  }
  return majorityEle;
};
