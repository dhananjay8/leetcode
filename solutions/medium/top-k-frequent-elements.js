/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function (nums, k) {
  // Step 1: Create a frequency map
  const map = new Map();
  for (const num of nums) {
    map.set(num, (map.get(num) || 0) + 1); // Increment count for each number
  }

  // Step 2: Create an array of buckets, where index represents frequency
  // For exmaple, if 4 is there in given array for 5 times, then 5th index of buckets will contain 4.
  const buckets = Array.from({ length: nums.length + 1 }, () => []);

  map.forEach((frequency, num) => {
    buckets[frequency].push(num);
  });
  console.log("buckets---", buckets);

  // Step 4: Gather the top-k frequent elements from the buckets
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    // Traverse from the highest frequency bucket
    for (const num of buckets[i]) {
      result.push(num); // Add elements to the result
      if (result.length === k) break; // Stop if we have found k elements
    }
  }

  return result; // Return the top-k frequent elements
};
