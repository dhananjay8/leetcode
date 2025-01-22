/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const wordSet = new Set(wordDict); // Use a set for O(1) lookups
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // Base case: empty string

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break; // No need to check further if we found a valid segmentation
      }
    }
  }

  return dp[s.length];
};

var wordBreak = function (s, wordDict) {
  const wordSet = new Set(wordDict); // Use a set for O(1) lookups
  const memo = new Map(); // Cache to store intermediate results

  const canBreak = (start) => {
    if (start === s.length) return true; // Base case
    if (memo.has(start)) return memo.get(start); // Return cached result

    for (let end = start + 1; end <= s.length; end++) {
      if (wordSet.has(s.substring(start, end)) && canBreak(end)) {
        memo.set(start, true);
        return true;
      }
    }

    memo.set(start, false);
    return false;
  };

  return canBreak(0); // Start recursion from index 0
};
