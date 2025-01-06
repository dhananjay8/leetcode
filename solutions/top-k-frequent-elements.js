/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function (nums, k) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const curr = nums[i];
    if (map.has(curr)) {
      map.set(curr, map.get(curr) + 1);
    } else {
      map.set(curr, 1);
    }
  }
  const buckets = Array.from({ length: nums.length + 1 }, () => []);

  map.forEach((frequency, num) => {
    buckets[frequency].push(num);
  });

  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    if (buckets[i].length > 0) {
      for (let j = 0; j < buckets[i].length && result.length < k; j++) {
        result.push(buckets[i][j]);
      }
    }
  }
  return result;
};
