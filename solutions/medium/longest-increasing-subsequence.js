/**
 * Problem: Longest Increasing Subsequence
 * Link: https://leetcode.com/problems/longest-increasing-subsequence/
 * Difficulty: Medium
 *
 * Find the length of the longest strictly increasing subsequence.
 *
 * Example: nums = [10,9,2,5,3,7,101,18] => 4 (subsequence: [2,3,7,101])
 *
 * Time Complexity: O(n log n) with binary search, O(n^2) with DP
 * Space Complexity: O(n)
 */

// JavaScript Solution 1 - DP O(n^2)
function lengthOfLIS_DP(nums) {
  const dp = new Array(nums.length).fill(1); // each element is a subsequence of length 1

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

// JavaScript Solution 2 - Binary Search O(n log n) (optimal)
function lengthOfLIS(nums) {
  const tails = []; // tails[i] = smallest tail element for increasing subseq of length i+1

  for (const num of nums) {
    let lo = 0, hi = tails.length;
    // Binary search for position to insert/replace
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < num) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = num;
  }

  return tails.length;
}

module.exports = lengthOfLIS;

/* Python Solution:

import bisect

def lengthOfLIS(nums):
    # O(n log n) using patience sorting
    tails = []
    
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)   # extend longest subsequence
        else:
            tails[pos] = num    # replace to keep smallest possible tail
    
    return len(tails)

# DP approach O(n^2)
def lengthOfLIS_dp(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

*/
