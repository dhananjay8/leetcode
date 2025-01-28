/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var subarraySum = function (nums, k) {
  let sum = 0;
  let count = 0;
  let map = new Map();
  for (let num of nums) {
    if (!map.has(sum)) {
      map.set(sum, 1);
    } else {
      map.set(sum, map.get(sum) + 1);
    }
    sum += num;
    // If (sum - k) exists in the map, it means there is a subarray ending at the current position that adds up to k. The value of map.get(sum - k) (frequency of (sum - k)) is added to count.
    if (map.has(sum - k)) {
      count += map.get(sum - k);
    }
  }

  return count;
};
