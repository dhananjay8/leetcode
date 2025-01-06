/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  let maxLen = 0;
  if (nums.length === 0) return maxLen;

  const uniqueNums = new Set(nums);

  for (let num of uniqueNums) {
    // If curr's before num does not exists in set, then check if next all consecutive numbers are in the set or not
    if (!uniqueNums.has(num - 1)) {
      let currNumToCheck = num;
      let currMaxLen = 1;

      while (uniqueNums.has(currNumToCheck + 1)) {
        currNumToCheck += 1;
        currMaxLen += 1;
      }
      maxLen = Math.max(maxLen, currMaxLen);
    }
  }
  return maxLen;
};
