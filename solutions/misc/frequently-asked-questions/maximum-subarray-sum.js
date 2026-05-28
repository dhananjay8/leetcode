/**
 * Maximum Subarray Sum (LC 53) — Medium
 * Pattern: Kadane's Algorithm (Greedy / DP)
 *
 * Time:  O(n)
 * Space: O(1)
 *
 * Also covers: subarray with indices, circular variant (LC 918)
 */

/**
 * Basic Kadane's — returns max sum
 * @param {number[]} nums
 * @returns {number}
 */
function maxSubArray(nums) {
  let maxSum = nums[0];
  let cur = nums[0];

  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // extend or restart
    maxSum = Math.max(maxSum, cur);
  }
  return maxSum;
}

/**
 * Kadane's with subarray indices
 * @param {number[]} nums
 * @returns {{maxSum: number, start: number, end: number}}
 */
function maxSubArrayWithIndices(nums) {
  let maxSum = nums[0], cur = nums[0];
  let start = 0, end = 0, tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (cur + nums[i] < nums[i]) {
      cur = nums[i];
      tempStart = i;
    } else {
      cur += nums[i];
    }
    if (cur > maxSum) {
      maxSum = cur;
      start = tempStart;
      end = i;
    }
  }
  return { maxSum, start, end };
}

/**
 * Maximum Sum Circular Subarray (LC 918)
 * Key insight: max circular = total - min subarray (Kadane's on negated)
 * @param {number[]} nums
 * @returns {number}
 */
function maxSubarraySumCircular(nums) {
  let totalSum = 0;
  let maxSum = nums[0], curMax = nums[0];
  let minSum = nums[0], curMin = nums[0];

  for (let i = 1; i < nums.length; i++) {
    curMax = Math.max(nums[i], curMax + nums[i]);
    maxSum = Math.max(maxSum, curMax);

    curMin = Math.min(nums[i], curMin + nums[i]);
    minSum = Math.min(minSum, curMin);

    totalSum += nums[i];
  }
  totalSum += nums[0];

  // If all negative, maxSum is the answer (avoid empty subarray for circular)
  return maxSum > 0 ? Math.max(maxSum, totalSum - minSum) : maxSum;
}

// ─── Tests ───────────────────────────────────────────────────────────────────
console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));             // 6 ([4,-1,2,1])
console.log(maxSubArrayWithIndices([-2,1,-3,4,-1,2,1,-5,4]));  // {maxSum:6, start:3, end:6}
console.log(maxSubarraySumCircular([1,-2,3,-2]));               // 3
console.log(maxSubarraySumCircular([5,-3,5]));                  // 10

module.exports = { maxSubArray, maxSubArrayWithIndices, maxSubarraySumCircular };
