/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var containsNearbyDuplicate = function (nums, k) {
  if ([...new Set(nums)].length === nums.length) return false;
  const indexMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (Math.abs(indexMap.get(nums[i]) - i) <= k) {
      return true;
    }
    indexMap.set(nums[i], i);
  }
  return false;
};
