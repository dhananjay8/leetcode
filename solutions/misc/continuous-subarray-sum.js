/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var checkSubarraySum = function (nums, k) {
  if (nums.length < 2) return false;

  const remainderMap = new Map(); // key: remainder, value: index
  remainderMap.set(0, -1); // for subarray that starts at index 0.
  let cumSum = 0;

  for (let i = 0; i < nums.length; i++) {
    cumSum += nums[i];

    const remainder = cumSum % k;
    if (remainderMap.has(remainder)) {
      // Check if the subarray length is at least 2
      const len = i - remainderMap.get(remainder);
      if (len >= 2) return true;
    } else {
      remainderMap.set(remainder, i);
    }
  }

  return false;
};
